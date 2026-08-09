import { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const {
    login,
    signup,
    googleLogin,
    user,
    authLoading,
    error,
  } = useContext(AuthContext);

  const navigate = useNavigate();

  // 🔥 Redirect if user already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Handle form change
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Email login/signup
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && !form.name.trim()) {
      alert("Please enter your name");
      return;
    }

    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await signup(form.email, form.password, form.name);

        // Reset form after signup
        setForm({
          name: "",
          email: "",
          password: "",
        });
      }
    } catch (err) {
      console.error("Auth error:", err.message);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
    } catch (err) {
      console.error("Google login error:", err.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center
      bg-gradient-to-br
      from-gray-100 via-white to-gray-200
      dark:from-black dark:via-gray-900 dark:to-gray-800
      text-black dark:text-white transition-all duration-300"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-2xl
        bg-white dark:bg-white/10
        backdrop-blur-lg shadow-xl"
      >
        {/* TITLE */}
        <h2 className="text-3xl font-bold text-center mb-6">
          {isLogin ? "Welcome Back 🔐" : "Create Account 🚀"}
        </h2>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 text-sm text-red-500 text-center">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-xl
              bg-gray-200 dark:bg-gray-800
              outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-xl
            bg-gray-200 dark:bg-gray-800
            outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-xl
            bg-gray-200 dark:bg-gray-800
            outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* EMAIL AUTH BUTTON */}
          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl
            hover:bg-blue-700 transition
            disabled:opacity-60"
          >
            {authLoading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Create Account"}
          </button>
        </form>

        {/* DIVIDER */}
        <div className="flex items-center gap-3 my-4 text-gray-400">
          <hr className="flex-1 border-gray-300 dark:border-gray-700" />
          <span>OR</span>
          <hr className="flex-1 border-gray-300 dark:border-gray-700" />
        </div>

        {/* GOOGLE LOGIN */}
        <button
          onClick={handleGoogleLogin}
          disabled={authLoading}
          className="w-full py-3 bg-red-500 text-white rounded-xl
          hover:bg-red-600 transition disabled:opacity-60"
        >
          Continue with Google
        </button>

        {/* TOGGLE LOGIN / SIGNUP */}
        <p className="text-center mt-5 text-gray-600 dark:text-gray-400">
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <span
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-blue-500 cursor-pointer hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>

        {/* FOOTER */}
        <div className="mt-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          AI-powered personalized learning 🚀
        </div>
      </motion.div>
    </div>
  );
}
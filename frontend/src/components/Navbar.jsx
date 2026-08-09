import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon, User, LogOut, Edit } from "lucide-react";
import { useContext, useState, useRef, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { updateUserProfile } from "../services/api";

export default function Navbar() {

  const location = useLocation();
  const navigate = useNavigate();

  const { dark, setDark } = useContext(ThemeContext);
  const { user, logout, profile, setProfile } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const dropdownRef = useRef();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
  ];

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setEditMode(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const handleSave = async () => {

    await updateUserProfile(user.uid, profile);

    setProfile(profile);

    alert("Profile Updated ✅");

    setEditMode(false);

  };

  return (

    <div className="w-full px-6 py-4 flex justify-between items-center 
    bg-white/10 dark:bg-black/30 backdrop-blur-lg 
    border-b border-gray-300 dark:border-gray-700 
    sticky top-0 z-50">

      {/* LOGO */}
      <motion.h1 className="text-xl font-bold">
        JK NeuroPlan 🚀
      </motion.h1>

      {/* NAV LINKS */}
      <div className="flex gap-6 items-center">
        {navItems.map((item, index) => (
          <Link key={index} to={item.path}>
            <span
              className={`cursor-pointer ${
                location.pathname === item.path
                  ? "text-blue-500"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {item.name}
            </span>
          </Link>
        ))}
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">

        {/* THEME */}
        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded-xl bg-gray-200 dark:bg-gray-800"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* PROFILE */}
        {user && profile && (

          <div className="relative" ref={dropdownRef}>

            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 p-2 rounded-xl 
              bg-gray-200 dark:bg-gray-800"
            >

              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt="profile"
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <User size={18} />
              )}

              <span className="text-sm hidden md:block">
                {profile?.name || user?.name || "User"}
              </span>

            </button>

            {open && (

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-3 w-72 
                bg-white dark:bg-gray-900 
                rounded-xl shadow-xl p-4 z-50"
              >

                {!editMode ? (
                  <>

                    <div className="flex items-center gap-3 mb-4">
                      {profile.photo ? (
                        <img
                          src={profile.photo}
                          alt="profile"
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <User />
                      )}

                      <div>
                        <p className="font-semibold">{profile.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>

                    <div className="text-sm mb-3">
                      🎯 Goal: {profile.goal || "Not Set"}
                    </div>

                    <button
                      onClick={() => setEditMode(true)}
                      className="w-full flex items-center justify-center gap-2 
                      bg-blue-600 text-white py-2 rounded-lg mb-2"
                    >
                      <Edit size={16} />
                      Edit Profile
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 
                      bg-red-500 text-white py-2 rounded-lg"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>

                  </>
                ) : (
                  <>

                    <input
                      type="text"
                      placeholder="Name"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                      className="w-full mb-2 p-2 rounded bg-gray-200 dark:bg-gray-800"
                    />

                    <input
                      type="text"
                      placeholder="Goal"
                      value={profile.goal}
                      onChange={(e) =>
                        setProfile({ ...profile, goal: e.target.value })
                      }
                      className="w-full mb-2 p-2 rounded bg-gray-200 dark:bg-gray-800"
                    />

                    <input
                      type="text"
                      placeholder="Image URL"
                      value={profile.photo}
                      onChange={(e) =>
                        setProfile({ ...profile, photo: e.target.value })
                      }
                      className="w-full mb-2 p-2 rounded bg-gray-200 dark:bg-gray-800"
                    />

                    <button
                      onClick={handleSave}
                      className="w-full bg-green-600 text-white py-2 rounded-lg"
                    >
                      Save
                    </button>

                  </>
                )}

              </motion.div>

            )}

          </div>

        )}

      </div>

    </div>
  );

}
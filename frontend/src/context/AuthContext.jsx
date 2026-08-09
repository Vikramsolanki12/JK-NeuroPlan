import { createContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";

import { auth } from "../services/firebase";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  const googleProvider = new GoogleAuthProvider();

  /* ================= SESSION PERSIST ================= */

  useEffect(() => {

    setPersistence(auth, browserLocalPersistence);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {

      if (currentUser) {

        const userData = {
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName,
          photo: currentUser.photoURL,
        };

        setUser(userData);

        // 🔥 GLOBAL PROFILE
        setProfile({
          name: userData.name || "",
          goal: "",
          photo: userData.photo || "",
        });

      } else {
        setUser(null);
        setProfile(null);
      }

      setLoading(false);
      setError(null);

    });

    return () => unsubscribe();

  }, []);

  /* ================= EMAIL SIGNUP ================= */

  const signup = async (email, password, name) => {

    try {

      setAuthLoading(true);
      setError(null);

      const res = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(res.user, {
        displayName: name,
      });

      return res.user;

    } catch (err) {

      if (err.code === "auth/email-already-in-use") {
        setError("Email already exists. Please login.");
      } else {
        setError(err.message);
      }

      throw err;

    } finally {
      setAuthLoading(false);
    }

  };

  /* ================= EMAIL LOGIN ================= */

  const login = async (email, password) => {

    try {

      setAuthLoading(true);
      setError(null);

      const res = await signInWithEmailAndPassword(auth, email, password);

      return res.user;

    } catch (err) {

      if (err.code === "auth/user-not-found") {
        setError("User not found. Please sign up.");
      }

      else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      }

      else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      }

      else {
        setError(err.message);
      }

      throw err;

    } finally {
      setAuthLoading(false);
    }

  };

  /* ================= GOOGLE LOGIN ================= */

  const googleLogin = async () => {

    try {

      setAuthLoading(true);
      setError(null);

      const res = await signInWithPopup(auth, googleProvider);

      return res.user;

    } catch (err) {

      setError(err.message);
      throw err;

    } finally {
      setAuthLoading(false);
    }

  };

  /* ================= LOGOUT ================= */

  const logout = async () => {

    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (err) {
      setError(err.message);
    }

  };

  return (

    <AuthContext.Provider
      value={{
        user,
        profile,
        setProfile,
        signup,
        login,
        googleLogin,
        logout,
        loading,
        authLoading,
        error,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>

  );

}
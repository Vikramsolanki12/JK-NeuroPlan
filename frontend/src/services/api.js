// src/services/api.js

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from "firebase/auth";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";

import { auth, db } from "./firebase";

/* =========================================================
   ====================== AUTH =============================
   ========================================================= */

const googleProvider = new GoogleAuthProvider();

export const signup = async (email, password, name) => {
  try {

    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", userCred.user.uid), {
      name,
      email,
      goal: "",
      photo: "",
      createdAt: serverTimestamp()
    });

    await updateProfile(userCred.user, {
      displayName: name
    });

    return userCred.user;

  } catch (error) {
    console.error("Signup Error:", error);
    throw new Error(error.message);
  }
};

export const login = async (email, password) => {

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    return userCred.user;
  } catch (error) {
    console.error("Login Error:", error);
    throw new Error(error.message);
  }

};

export const googleLogin = async () => {

  try {

    const result = await signInWithPopup(auth, googleProvider);

    await setDoc(
      doc(db, "users", result.user.uid),
      {
        name: result.user.displayName,
        email: result.user.email,
        photo: result.user.photoURL,
        goal: "",
        createdAt: serverTimestamp()
      },
      { merge: true }
    );

    return result.user;

  } catch (error) {
    console.error("Google Login Error:", error);
    throw new Error(error.message);
  }

};

export const logout = async () => {
  await signOut(auth);
};


/* =========================================================
   ================= DAILY TASKS ===========================
   ========================================================= */

export const addTask = async (userId, taskText) => {

  const todayKey = new Date().toISOString().split("T")[0];

  const docRef = await addDoc(
    collection(db, "users", userId, "tasks"),
    {
      text: taskText,
      done: false,
      date: todayKey,
      createdAt: serverTimestamp()
    }
  );

  return docRef.id;

};

export const getTasks = async (userId) => {

  const snapshot = await getDocs(
    collection(db, "users", userId, "tasks")
  );

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

};

/* Toggle task completion */
export const toggleTaskStatus = async (userId, taskId, done) => {

  const ref = doc(db, "users", userId, "tasks", taskId);

  await updateDoc(ref, {
    done
  });

};

export const updateTask = async (userId, taskId, data) => {

  const ref = doc(db, "users", userId, "tasks", taskId);
  await updateDoc(ref, data);

};

export const deleteTask = async (userId, taskId) => {

  const ref = doc(db, "users", userId, "tasks", taskId);
  await deleteDoc(ref);

};


/* =========================================================
   ================= TIMETABLE =============================
   ========================================================= */

export const saveTimetable = async (userId, timetable) => {

  await setDoc(
    doc(db, "users", userId, "timetable", "main"),
    {
      timetable,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

};

export const getTimetable = async (userId) => {

  const ref = doc(db, "users", userId, "timetable", "main");
  const snap = await getDoc(ref);

  return snap.exists()
    ? snap.data().timetable
    : { daily: [], weekly: { days: {} }, monthly: {} };

};

/* Update timetable session completion */
export const toggleTimetableSession = async (userId, timetable) => {

  await setDoc(
    doc(db, "users", userId, "timetable", "main"),
    {
      timetable,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

};


/* =========================================================
   ================= STUDY STATS ===========================
   ========================================================= */

export const updateStudyStats = async (userId, date) => {

  const ref = doc(db, "users", userId, "stats", "activity");

  const snap = await getDoc(ref);

  let data = snap.exists() ? snap.data() : {};

  data[date] = (data[date] || 0) + 1;

  await setDoc(ref, data, { merge: true });

};

export const getStudyStats = async (userId) => {

  const ref = doc(db, "users", userId, "stats", "activity");

  const snap = await getDoc(ref);

  return snap.exists() ? snap.data() : {};

};


/* =========================================================
   ================= PROFILE ===============================
   ========================================================= */

export const updateUserProfile = async (userId, profileData) => {

  await setDoc(
    doc(db, "users", userId),
    {
      name: profileData.name,
      goal: profileData.goal,
      photo: profileData.photo,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  if (auth.currentUser) {

    await updateProfile(auth.currentUser, {
      displayName: profileData.name,
      photoURL: profileData.photo
    });

  }

};


/* =========================================================
   ================= AI MOCK ===============================
   ========================================================= */

export const getAISuggestions = async () => {

  return [
    "📉 You are less productive on Sundays",
    "📈 Increase time for DSA",
    "⚡ Best focus time: 9 PM - 11 PM",
    "🎯 Add 1 more revision slot"
  ];

};


/* =========================================================
   ================= UTIL =================================
   ========================================================= */

export const getTodayKey = () =>
  new Date().toISOString().split("T")[0];
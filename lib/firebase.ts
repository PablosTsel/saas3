// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  connectAuthEmulator
} from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkIag00HQANMU0iB_u1nDiARogD-s5YDI",
  authDomain: "makeportfolio-2bd67.firebaseapp.com",
  projectId: "makeportfolio-2bd67",
  storageBucket: "makeportfolio-2bd67.firebasestorage.app",
  messagingSenderId: "480588264480",
  appId: "1:480588264480:web:7fa57d1e6a1e22f84bf845",
  measurementId: "G-9NRDMGH57J"
};

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

// If in development, connect to Firebase emulator if available
// if (process.env.NODE_ENV === 'development') {
//   try {
//     connectAuthEmulator(auth, 'http://localhost:9099');
//     console.log('Connected to Firebase emulator');
//   } catch (error) {
//     console.error('Failed to connect to Firebase emulator:', error);
//   }
// }

// Helper function to format Firebase errors
const formatFirebaseError = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already in use. Please try a different email or log in.';
    case 'auth/invalid-email':
      return 'Invalid email address. Please check your email and try again.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please check your password and try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return errorCode || 'An error occurred. Please try again.';
  }
};

// Authentication functions
export const registerUser = async (email: string, password: string, name: string) => {
  try {
    console.log("Starting user registration:", { email, name });
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("User created:", user.uid);
    
    // Update the user's display name
    if (user) {
      await updateProfile(user, {
        displayName: name
      });
      console.log("User profile updated with name:", name);
    }

    return { user, error: null };
  } catch (error: any) {
    console.error("Registration error:", error);
    const errorMessage = formatFirebaseError(error.code);
    return { user: null, error: errorMessage };
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    console.log("Attempting login:", email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Login successful:", user.uid);
    return { user, error: null };
  } catch (error: any) {
    console.error("Login error:", error);
    const errorMessage = formatFirebaseError(error.code);
    return { user: null, error: errorMessage };
  }
};

export const logoutUser = async () => {
  try {
    console.log("Logging out user");
    await signOut(auth);
    console.log("Logout successful");
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Logout error:", error);
    return { success: false, error: error.message };
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  console.log("Setting up auth state listener");
  return onAuthStateChanged(auth, (user) => {
    console.log("Auth state changed:", user ? `User: ${user.uid}` : "No user");
    callback(user);
  });
};

export { auth }; 
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
  connectAuthEmulator,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  DocumentData,
  setDoc
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  UploadResult
} from "firebase/storage";

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
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

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
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing the sign in.';
    case 'auth/cancelled-popup-request':
      return 'The authentication request was cancelled.';
    case 'auth/popup-blocked':
      return 'The authentication popup was blocked by the browser. Please allow popups for this site.';
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

export const signInWithGoogle = async () => {
  try {
    console.log("Attempting Google sign-in");
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("Google sign-in successful:", user.uid);
    return { user, error: null };
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    const errorMessage = formatFirebaseError(error.code);
    return { user: null, error: errorMessage };
  }
};

export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      console.log("Google sign-in redirect successful:", user.uid);
      return { user, error: null };
    }
    return { user: null, error: null };
  } catch (error: any) {
    console.error("Google sign-in redirect error:", error);
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

// Firebase Storage functions
export const uploadFile = async (
  file: File,
  path: string,
  metadata?: { [key: string]: string }
): Promise<{ url: string; error?: string }> => {
  if (!file) {
    return { url: "", error: "No file provided" };
  }

  // Set file size limit to 2MB for better performance
  const MAX_FILE_SIZE = 2 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    console.warn(`File ${file.name} is ${(file.size / (1024 * 1024)).toFixed(2)}MB, which exceeds recommended size of 2MB.`);
  }

  // Set up metadata with original filename and content type
  const customMetadata = {
    ...metadata,
    originalFilename: file.name,
    contentType: file.type,
    uploadTimestamp: Date.now().toString(),
  };

  // Get storage reference
  const storageRef = ref(storage, path);

  // Implement retry logic
  let attempts = 0;
  const MAX_ATTEMPTS = 2;
  let lastError = null;

  while (attempts < MAX_ATTEMPTS) {
    attempts++;
    
    try {
      // Improve the uploadWithTimeout implementation
      const uploadWithTimeout = () => {
        // Use AbortController for better timeout management
        const controller = new AbortController();
        const signal = controller.signal;
        
        // Create a promise that aborts the upload after 45 seconds
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 45000); // Reduced from 60 seconds to 45 seconds
        
        // Create the upload promise
        const uploadPromise = uploadBytes(storageRef, file, { 
          customMetadata,
          // Pass the signal to make it abortable
          ...(typeof signal !== 'undefined' ? { signal } : {})
        }).then(snapshot => {
          // Clear the timeout as upload completed successfully
          clearTimeout(timeoutId);
          return snapshot;
        }).catch(error => {
          clearTimeout(timeoutId);
          
          if (error.name === 'AbortError' || error.code === 'storage/canceled') {
            throw new Error("Upload timed out after 45 seconds");
          }
          
          throw error;
        });
        
        return uploadPromise;
      };

      // Attempt the upload with timeout
      const snapshot = await uploadWithTimeout() as UploadResult;
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return { url: downloadURL };
    } catch (error: any) {
      lastError = error;
      console.error(`Upload attempt ${attempts} failed:`, error);

      // Check for specific errors
      if (error.code === "storage/unauthorized") {
        return { url: "", error: "You are not authorized to upload files" };
      } else if (error.code === "storage/canceled") {
        return { url: "", error: "Upload was canceled" };
      } else if (error.code === "storage/unknown" || error.message?.includes("timed out")) {
        if (attempts < MAX_ATTEMPTS) {
          console.log(`Retrying upload (attempt ${attempts + 1}/${MAX_ATTEMPTS})...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          continue;
        } else {
          return { url: "", error: "Upload failed after multiple attempts" };
        }
      } else {
        return { url: "", error: "Error uploading file: " + error.message };
      }
    }
  }

  return { url: "", error: `Upload failed after ${MAX_ATTEMPTS} attempts: ${lastError?.message}` };
};

export const deleteFile = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    
    console.log("File deleted from:", path);
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error deleting file:", error);
    return { success: false, error: error.message };
  }
};

// Firestore functions for portfolios
export const createPortfolio = async (
  userId: string,
  portfolioData: any
): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    // File upload issues tracking
    let hasFileUploadIssues = false;
    let fileErrorMessages: string[] = [];

    // Create portfolio document first, before attempting file uploads
    const portfolioRef = doc(collection(db, "portfolios"));
    const portfolioId = portfolioRef.id;
    
    // Default placeholder image for failed uploads
    const DEFAULT_PLACEHOLDER = "https://firebasestorage.googleapis.com/v0/b/makeportfolio-2bd67.appspot.com/o/placeholders%2Fproject-placeholder.png?alt=media";

    // Portfolio data without files
    const portfolioDataForFirestore = {
      id: portfolioId,
      userId: userId,
      name: portfolioData.name,
      title: portfolioData.title,
      about: portfolioData.about,
      skills: portfolioData.skills || [],
      experience: portfolioData.experience || [],
      education: portfolioData.education || [],
      hasCv: portfolioData.hasCv,
      cvUrl: "", // Will update after upload if successful
      projects: portfolioData.projects.map((project: any) => ({
        name: project.name,
        description: project.description,
        imageUrl: DEFAULT_PLACEHOLDER // Default placeholder until upload succeeds
      })),
      templateId: portfolioData.templateId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // First save the portfolio with placeholder images
    await setDoc(portfolioRef, portfolioDataForFirestore);
    console.log(`Created portfolio document with ID: ${portfolioId}`);

    // Since all uploads are optional, we'll just try them in the background
    // but return success even if they fail
    
    // CV upload (if exists)
    if (portfolioData.hasCv && portfolioData.cv) {
      try {
        const uploadResult = await uploadFile(
          portfolioData.cv,
          `users/${userId}/portfolios/${portfolioId}/cv/${Date.now()}-${portfolioData.cv.name}`
        );

        if (uploadResult.url) {
          // Update the portfolio with CV URL
          await updateDoc(portfolioRef, { cvUrl: uploadResult.url });
          console.log("CV uploaded successfully");
        } else {
          hasFileUploadIssues = true;
          fileErrorMessages.push("CV upload failed: " + (uploadResult.error || "Unknown error"));
          console.error("CV upload failed:", uploadResult.error);
        }
      } catch (err) {
        hasFileUploadIssues = true;
        fileErrorMessages.push("CV upload error: " + (err instanceof Error ? err.message : "Unknown error"));
        console.error("Error uploading CV:", err);
      }
    }

    // Try to upload project images, but don't wait for them all
    if (portfolioData.projects?.length > 0) {
      for (let i = 0; i < portfolioData.projects.length; i++) {
        const project = portfolioData.projects[i];
        if (!project.image) continue;
        
        try {
          const uploadResult = await uploadFile(
            project.image,
            `users/${userId}/portfolios/${portfolioId}/projects/${i}/${Date.now()}-${project.image.name}`
          );

          if (uploadResult.url) {
            // Update this specific project's imageUrl in the projects array
            const portfolioDoc = await getDoc(portfolioRef);
            if (portfolioDoc.exists()) {
              const currentData = portfolioDoc.data();
              const updatedProjects = [...(currentData.projects || [])];
              
              // Make sure the project index exists
              if (updatedProjects[i]) {
                updatedProjects[i].imageUrl = uploadResult.url;
                
                // Only update the projects array
                await updateDoc(portfolioRef, { projects: updatedProjects });
                console.log(`Project ${i} image uploaded successfully`);
              }
            }
          } else {
            hasFileUploadIssues = true;
            fileErrorMessages.push(
              `Project "${project.name}" image upload failed: ${uploadResult.error || "Unknown error"}`
            );
            console.error(`Project ${i} image upload failed:`, uploadResult.error);
          }
        } catch (err) {
          hasFileUploadIssues = true;
          fileErrorMessages.push(
            `Project "${project.name}" image error: ${err instanceof Error ? err.message : "Unknown error"}`
          );
          console.error(`Error uploading project ${i} image:`, err);
        }
      }
    }

    // Always return success since the portfolio document was created
    return {
      success: true,
      id: portfolioId,
      error: hasFileUploadIssues
        ? `Portfolio created successfully, but some file uploads failed. Default images will be used.`
        : undefined,
    };
  } catch (error: any) {
    console.error("Error creating portfolio:", error);
    return {
      success: false,
      error: `Error creating portfolio: ${error.message}`,
    };
  }
};

export const getUserPortfolios = async (userId: string) => {
  try {
    const portfolioRef = collection(db, "portfolios");
    const q = query(portfolioRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const portfolios: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      portfolios.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Retrieved ${portfolios.length} portfolios for user:`, userId);
    return { portfolios, error: null };
  } catch (error: any) {
    console.error("Error getting user portfolios:", error);
    return { portfolios: [], error: error.message };
  }
};

export const getPortfolioById = async (portfolioId: string) => {
  try {
    const docRef = doc(db, "portfolios", portfolioId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const portfolioData = {
        id: docSnap.id,
        ...docSnap.data()
      };
      console.log("Retrieved portfolio:", portfolioId);
      return { portfolio: portfolioData, error: null };
    } else {
      console.log("Portfolio not found:", portfolioId);
      return { portfolio: null, error: "Portfolio not found" };
    }
  } catch (error: any) {
    console.error("Error getting portfolio:", error);
    return { portfolio: null, error: error.message };
  }
};

export const updatePortfolio = async (portfolioId: string, portfolioData: any) => {
  try {
    const docRef = doc(db, "portfolios", portfolioId);
    
    // Clean portfolio data for Firestore
    const cleanedPortfolio = {
      ...portfolioData,
      updatedAt: serverTimestamp(),
      // Remove actual File objects as they can't be stored directly in Firestore
      cv: portfolioData.cv && portfolioData.cv instanceof File 
        ? { name: portfolioData.cv.name, type: portfolioData.cv.type } 
        : portfolioData.cv,
      projects: portfolioData.projects.map((project: any) => ({
        ...project,
        image: project.image && project.image instanceof File 
          ? { name: project.image.name, type: project.image.type } 
          : project.image,
        report: project.report && project.report instanceof File 
          ? { name: project.report.name, type: project.report.type } 
          : project.report
      }))
    };
    
    await updateDoc(docRef, cleanedPortfolio);
    console.log("Portfolio updated:", portfolioId);
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error updating portfolio:", error);
    return { success: false, error: error.message };
  }
};

export const deletePortfolio = async (portfolioId: string) => {
  try {
    const docRef = doc(db, "portfolios", portfolioId);
    await deleteDoc(docRef);
    console.log("Portfolio deleted:", portfolioId);
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error deleting portfolio:", error);
    return { success: false, error: error.message };
  }
};

export { auth, googleProvider, db, storage }; 
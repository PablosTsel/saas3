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
  getRedirectResult,
  browserLocalPersistence,
  setPersistence
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
// Set persistence to LOCAL (browser will remember user between sessions)
setPersistence(auth, browserLocalPersistence).catch(error => {
  console.error("Error setting auth persistence:", error);
});

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
    case 'auth/invalid-credential':
      return 'Invalid login credentials. Please check your email and password and try again.';
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

// Function to force refresh auth token
export const refreshAuthToken = async () => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await currentUser.getIdToken(true);
      console.log("Auth token refreshed successfully");
      return { success: true, error: null };
    }
    return { success: false, error: "No user is currently logged in" };
  } catch (error: any) {
    console.error("Error refreshing auth token:", error);
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    console.log("Attempting login:", email);
    
    // Validate inputs before attempting login
    if (!email || !email.trim()) {
      console.error("Login error: Empty email provided");
      return { user: null, error: "Please enter your email address" };
    }
    
    if (!password || !password.trim()) {
      console.error("Login error: Empty password provided");
      return { user: null, error: "Please enter your password" };
    }
    
    // Attempt login with validated credentials
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;
    console.log("Login successful:", user.uid);
    
    // Force refresh the token to ensure it's valid
    await user.getIdToken(true);
    
    return { user, error: null };
  } catch (error: any) {
    console.error("Login error:", error);
    
    // Check for network errors first
    if (!navigator.onLine) {
      return { user: null, error: "Network error. Please check your internet connection and try again." };
    }
    
    // Handle known Firebase error codes
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

  try {
    // Determine file type for custom handling
    const isPNG = file.type === 'image/png';
    const isPDF = file.type === 'application/pdf';

    // Size limits based on file type
    const MAX_PNG_SIZE = 5 * 1024 * 1024; // 5MB for PNGs (they can be larger)
    const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB for PDFs
    const MAX_OTHER_SIZE = 3 * 1024 * 1024; // 3MB for other files

    let maxAllowedSize = MAX_OTHER_SIZE;
    if (isPNG) maxAllowedSize = MAX_PNG_SIZE;
    if (isPDF) maxAllowedSize = MAX_PDF_SIZE;
    
    // Warn if file is large
    if (file.size > maxAllowedSize) {
      console.warn(`File ${file.name} is ${(file.size / (1024 * 1024)).toFixed(2)}MB, which exceeds the recommended size of ${(maxAllowedSize / (1024 * 1024))}MB and may upload slowly.`);
    }

    // Enhanced metadata with content type explicitly set
    const customMetadata = {
      ...metadata,
      originalFilename: file.name,
      uploadTimestamp: Date.now().toString(),
      fileSize: file.size.toString(),
      contentType: file.type,
    };

    // Get storage reference
    const storageRef = ref(storage, path);
    
    console.log(`Starting upload of ${file.name} (${file.type}) to ${path}...`);

    // Upload with progress tracking
    const uploadTask = uploadBytes(storageRef, file, { 
      contentType: file.type, // Explicitly set content type
      customMetadata 
    });
    
    // Wait for upload to complete
    const snapshot = await uploadTask;
    console.log(`Upload completed for ${file.name}: ${snapshot.metadata.fullPath}`);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`File URL available at: ${downloadURL}`);
    
    return { url: downloadURL };
  } catch (error: any) {
    console.error(`Upload failed for ${file.name}:`, error);

    // Detailed error messages based on error code
    if (error.code === "storage/unauthorized") {
      return { url: "", error: "You are not authorized to upload files. Please check your Firebase permissions." };
    } else if (error.code === "storage/canceled") {
      return { url: "", error: "Upload was canceled" };
    } else if (error.code === "storage/quota-exceeded") {
      return { url: "", error: "Storage quota exceeded. Please contact the administrator." };
    } else if (error.code === "storage/retry-limit-exceeded") {
      return { url: "", error: "Upload failed after multiple attempts. Please check your connection and try again." };
    } else if (error.code === "storage/invalid-checksum") {
      return { url: "", error: "File upload failed due to data corruption. Please try again with the original file." };
    } else {
      return { url: "", error: `Error uploading file: ${error.message}` };
    }
  }
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
      smallIntro: portfolioData.smallIntro || "",
      fullName: portfolioData.fullName || portfolioData.name,
      email: portfolioData.email || "",
      phone: portfolioData.phone || "",
      githubProfile: portfolioData.githubProfile || "", // GitHub profile link
      profilePictureUrl: "", // Will update after upload if successful
      skills: portfolioData.skills || [],
      experience: portfolioData.experience || [],
      education: portfolioData.education || [],
      hasCv: portfolioData.hasCv,
      cvUrl: "", // Will update after upload if successful
      projects: portfolioData.projects.map((project: any) => ({
        name: project.name,
        description: project.description,
        imageUrl: DEFAULT_PLACEHOLDER, // Default placeholder until upload succeeds
        technologies: project.technologies || [], // Include technologies array if available
        githubUrl: project.githubUrl || "", // Include GitHub URL if available
        reportUrl: "" // Will update after upload if successful
      })),
      templateId: portfolioData.templateId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Payment related fields
      isPreviewPaid: false,
      paymentSessionId: null,
      paymentStatus: "unpaid"
    };

    // First save the portfolio with placeholder images
    await setDoc(portfolioRef, portfolioDataForFirestore);
    console.log(`Created portfolio document with ID: ${portfolioId}`);

    // Create an array to store all upload promises
    const uploadPromises = [];
    
    // Profile Picture upload (if exists)
    if (portfolioData.profilePicture) {
      const profilePictureUploadPromise = (async () => {
        try {
          console.log(`Starting profile picture upload for portfolio ${portfolioId}`);
          const uploadPath = `users/${userId}/portfolios/${portfolioId}/profile/${Date.now()}-${portfolioData.profilePicture.name}`;
          
          const uploadResult = await uploadFile(
            portfolioData.profilePicture,
            uploadPath,
            { portfolioId, fileType: 'profilePicture' }
          );

          if (uploadResult.url) {
            // Update the portfolio with profile picture URL
            await updateDoc(portfolioRef, { profilePictureUrl: uploadResult.url });
            console.log("Profile picture uploaded successfully:", uploadResult.url);
            return { success: true, type: 'profilePicture' };
          } else {
            hasFileUploadIssues = true;
            const errorMsg = `Profile picture upload failed: ${uploadResult.error || "Unknown error"}`;
            fileErrorMessages.push(errorMsg);
            console.error(errorMsg);
            return { success: false, type: 'profilePicture', error: errorMsg };
          }
        } catch (err) {
          hasFileUploadIssues = true;
          const errorMsg = `Profile picture upload error: ${err instanceof Error ? err.message : "Unknown error"}`;
          fileErrorMessages.push(errorMsg);
          console.error(errorMsg);
          return { success: false, type: 'profilePicture', error: errorMsg };
        }
      })();
      
      uploadPromises.push(profilePictureUploadPromise);
    }
    
    // CV upload (if exists)
    if (portfolioData.hasCv && portfolioData.cv) {
      const cvUploadPromise = (async () => {
        try {
          console.log(`Starting CV upload for portfolio ${portfolioId}`);
          const uploadPath = `users/${userId}/portfolios/${portfolioId}/cv/${Date.now()}-${portfolioData.cv.name}`;
          
          const uploadResult = await uploadFile(
            portfolioData.cv,
            uploadPath,
            { portfolioId, fileType: 'cv' }
          );

          if (uploadResult.url) {
            // Update the portfolio with CV URL
            await updateDoc(portfolioRef, { cvUrl: uploadResult.url });
            console.log("CV uploaded successfully:", uploadResult.url);
            return { success: true, type: 'cv' };
          } else {
            hasFileUploadIssues = true;
            const errorMsg = `CV upload failed: ${uploadResult.error || "Unknown error"}`;
            fileErrorMessages.push(errorMsg);
            console.error(errorMsg);
            return { success: false, type: 'cv', error: errorMsg };
          }
        } catch (err) {
          hasFileUploadIssues = true;
          const errorMsg = `CV upload error: ${err instanceof Error ? err.message : "Unknown error"}`;
          fileErrorMessages.push(errorMsg);
          console.error(errorMsg);
          return { success: false, type: 'cv', error: errorMsg };
        }
      })();
      
      uploadPromises.push(cvUploadPromise);
    }

    // Project image uploads - ADD A BATCH MECHANISM
    const projectImageResults: Array<{
      index: number;
      url: string;
      success: boolean;
    }> = [];
    
    // Project report uploads
    const projectReportResults: Array<{
      index: number;
      url: string;
      success: boolean;
    }> = [];
    
    const projectUpdates = [];
    
    if (portfolioData.projects?.length > 0) {
      for (let i = 0; i < portfolioData.projects.length; i++) {
        const project = portfolioData.projects[i];
        
        // Handle project image upload
        if (project.image) {
          const projectUploadPromise = (async () => {
            try {
              console.log(`Starting project ${i} image upload for portfolio ${portfolioId}`);
              const uploadPath = `users/${userId}/portfolios/${portfolioId}/projects/${i}/${Date.now()}-${project.image.name}`;
              
              const uploadResult = await uploadFile(
                project.image,
                uploadPath,
                { portfolioId, projectIndex: i.toString(), fileType: 'projectImage' }
              );

              if (uploadResult.url) {
                // Store the result for batch update later
                projectImageResults.push({
                  index: i,
                  url: uploadResult.url,
                  success: true
                });
                
                console.log(`Project ${i} image uploaded successfully: ${uploadResult.url}`);
                return { success: true, type: 'project', index: i, url: uploadResult.url };
              } else {
                hasFileUploadIssues = true;
                const errorMsg = `Project "${project.name}" image upload failed: ${uploadResult.error || "Unknown error"}`;
                fileErrorMessages.push(errorMsg);
                console.error(errorMsg);
                return { success: false, type: 'project', index: i, error: errorMsg };
              }
            } catch (err) {
              hasFileUploadIssues = true;
              const errorMsg = `Project "${project.name}" image error: ${err instanceof Error ? err.message : "Unknown error"}`;
              fileErrorMessages.push(errorMsg);
              console.error(errorMsg);
              return { success: false, type: 'project', index: i, error: errorMsg };
            }
          })();
          
          uploadPromises.push(projectUploadPromise);
        }
        
        // Handle project report upload
        if (project.reportFile) {
          const reportUploadPromise = (async () => {
            try {
              console.log(`Starting project ${i} report upload for portfolio ${portfolioId}`);
              const uploadPath = `users/${userId}/portfolios/${portfolioId}/projects/${i}/reports/${Date.now()}-${project.reportFile.name}`;
              
              const uploadResult = await uploadFile(
                project.reportFile,
                uploadPath,
                { portfolioId, projectIndex: i.toString(), fileType: 'projectReport' }
              );

              if (uploadResult.url) {
                // Store the result for batch update later
                projectReportResults.push({
                  index: i,
                  url: uploadResult.url,
                  success: true
                });
                
                console.log(`Project ${i} report uploaded successfully: ${uploadResult.url}`);
                return { success: true, type: 'projectReport', index: i, url: uploadResult.url };
              } else {
                hasFileUploadIssues = true;
                const errorMsg = `Project "${project.name}" report upload failed: ${uploadResult.error || "Unknown error"}`;
                fileErrorMessages.push(errorMsg);
                console.error(errorMsg);
                return { success: false, type: 'projectReport', index: i, error: errorMsg };
              }
            } catch (err) {
              hasFileUploadIssues = true;
              const errorMsg = `Project "${project.name}" report error: ${err instanceof Error ? err.message : "Unknown error"}`;
              fileErrorMessages.push(errorMsg);
              console.error(errorMsg);
              return { success: false, type: 'projectReport', index: i, error: errorMsg };
            }
          })();
          
          uploadPromises.push(reportUploadPromise);
        }
      }
    }

    // Wait for all uploads to complete or fail
    if (uploadPromises.length > 0) {
      console.log(`Waiting for ${uploadPromises.length} file uploads to complete...`);
      const results = await Promise.all(uploadPromises);
      console.log(`Upload results:`, results);
      
      // Now batch update all project images at once
      const portfolioDoc = await getDoc(portfolioRef);
      if (portfolioDoc.exists()) {
        const currentData = portfolioDoc.data();
        const updatedProjects = [...(currentData.projects || [])];
        
        // Update all project images in one batch
        for (const result of projectImageResults) {
          if (result.success && updatedProjects[result.index]) {
            updatedProjects[result.index].imageUrl = result.url;
          }
        }
        
        // Update all project report URLs in one batch
        for (const result of projectReportResults) {
          if (result.success && updatedProjects[result.index]) {
            updatedProjects[result.index].reportUrl = result.url;
          }
        }
        
        // Save the updated projects back to Firestore
        await updateDoc(portfolioRef, { projects: updatedProjects });
      }
    }

    // Always return success since the portfolio document was created
    return {
      success: true,
      id: portfolioId,
      error: hasFileUploadIssues
        ? `Portfolio created successfully, but some file uploads failed. Default images will be used for failed uploads.${fileErrorMessages.length > 0 ? ' Errors: ' + fileErrorMessages.join('; ') : ''}`
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
    const portfolioDoc = await getDoc(docRef);
    
    if (!portfolioDoc.exists()) {
      return { success: false, error: "Portfolio not found" };
    }
    
    const currentData = portfolioDoc.data();
    
    // Track file uploads
    const uploadPromises = [];
    let hasFileUploadIssues = false;
    let fileErrorMessages: string[] = [];
    
    // Handle CV file if it exists and is a File object
    if (portfolioData.hasCv && portfolioData.cv instanceof File) {
      const cvUploadPromise = (async () => {
        try {
          console.log(`Updating CV for portfolio ${portfolioId}`);
          const uploadPath = `users/${currentData.userId}/portfolios/${portfolioId}/cv/${Date.now()}-${portfolioData.cv.name}`;
          
          const uploadResult = await uploadFile(
            portfolioData.cv,
            uploadPath,
            { portfolioId, fileType: 'cv' }
          );

          if (uploadResult.url) {
            // We'll update this at the end
            console.log("CV uploaded successfully:", uploadResult.url);
            return { success: true, type: 'cv', url: uploadResult.url };
          } else {
            hasFileUploadIssues = true;
            const errorMsg = `CV upload failed: ${uploadResult.error || "Unknown error"}`;
            fileErrorMessages.push(errorMsg);
            console.error(errorMsg);
            return { success: false, type: 'cv', error: errorMsg };
          }
        } catch (err) {
          hasFileUploadIssues = true;
          const errorMsg = `CV upload error: ${err instanceof Error ? err.message : "Unknown error"}`;
          fileErrorMessages.push(errorMsg);
          console.error(errorMsg);
          return { success: false, type: 'cv', error: errorMsg };
        }
      })();
      
      uploadPromises.push(cvUploadPromise);
    }
    
    // Process project image uploads
    const projectImageResults: Array<{
      index: number;
      url: string;
      success: boolean;
    }> = [];
    
    if (portfolioData.projects?.length > 0) {
      for (let i = 0; i < portfolioData.projects.length; i++) {
        const project = portfolioData.projects[i];
        if (!(project.image instanceof File)) continue;
        
        const projectUploadPromise = (async () => {
          try {
            console.log(`Updating project ${i} image for portfolio ${portfolioId}`);
            const uploadPath = `users/${currentData.userId}/portfolios/${portfolioId}/projects/${i}/${Date.now()}-${project.image.name}`;
            
            const uploadResult = await uploadFile(
              project.image,
              uploadPath,
              { portfolioId, projectIndex: i.toString(), fileType: 'projectImage' }
            );

            if (uploadResult.url) {
              // Store the result for batch update later
              projectImageResults.push({
                index: i,
                url: uploadResult.url,
                success: true
              });
              
              console.log(`Project ${i} image uploaded successfully: ${uploadResult.url}`);
              return { success: true, type: 'project', index: i, url: uploadResult.url };
            } else {
              hasFileUploadIssues = true;
              const errorMsg = `Project "${project.name}" image upload failed: ${uploadResult.error || "Unknown error"}`;
              fileErrorMessages.push(errorMsg);
              console.error(errorMsg);
              return { success: false, type: 'project', index: i, error: errorMsg };
            }
          } catch (err) {
            hasFileUploadIssues = true;
            const errorMsg = `Project "${project.name}" image error: ${err instanceof Error ? err.message : "Unknown error"}`;
            fileErrorMessages.push(errorMsg);
            console.error(errorMsg);
            return { success: false, type: 'project', index: i, error: errorMsg };
          }
        })();
        
        uploadPromises.push(projectUploadPromise);
      }
    }
    
    // Wait for all uploads to complete
    let cvUrl = portfolioData.cvUrl || "";
    if (uploadPromises.length > 0) {
      console.log(`Waiting for ${uploadPromises.length} file uploads to complete...`);
      const results = await Promise.all(uploadPromises);
      console.log(`Upload results:`, results);
      
      // Extract CV URL if it was uploaded
      const cvResult = results.find(r => r.type === 'cv' && r.success);
      if (cvResult && 'url' in cvResult) {
        cvUrl = cvResult.url;
      }
    }
    
    // Prepare clean portfolio data for Firestore
    const cleanedPortfolio = {
      ...portfolioData,
      updatedAt: serverTimestamp(),
      // Set the CV URL if it was uploaded
      cvUrl: cvUrl,
      // Remove actual File objects as they can't be stored directly in Firestore
      cv: null,
      projects: portfolioData.projects.map((project: any, index: number) => {
        // Find if this project has a newly uploaded image
        const uploadedImage = projectImageResults.find(r => r.index === index);
        
        return {
          name: project.name,
          description: project.description,
          // Use the new image URL if uploaded, or keep the existing one
          imageUrl: uploadedImage ? uploadedImage.url : (project.imageUrl || ""),
          // Remove the file objects
          image: null,
          report: null
        };
      })
    };
    
    // Update the portfolio document
    await updateDoc(docRef, cleanedPortfolio);
    console.log("Portfolio updated:", portfolioId);
    
    return { 
      success: true, 
      error: hasFileUploadIssues 
        ? `Portfolio updated, but some file uploads failed: ${fileErrorMessages.join('; ')}` 
        : null 
    };
  } catch (error: any) {
    console.error("Error updating portfolio:", error);
    return { success: false, error: error.message };
  }
};

export const deletePortfolio = async (portfolioId: string) => {
  try {
    // First, get the portfolio data to get the userId
    const docRef = doc(db, "portfolios", portfolioId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.log("Portfolio not found:", portfolioId);
      return { success: false, error: "Portfolio not found" };
    }
    
    const portfolioData = docSnap.data();
    const userId = portfolioData.userId;
    
    if (!userId) {
      console.error("Portfolio has no userId:", portfolioId);
      return { success: false, error: "Portfolio data is corrupted" };
    }
    
    console.log(`Deleting portfolio ${portfolioId} for user ${userId}`);
    
    // Delete files in storage - we can't list files directly from client SDK
    // But we know the structure: users/{userId}/portfolios/{portfolioId}/
    
    try {
      // 1. Delete CV if it exists
      if (portfolioData.cvUrl) {
        // Extract the path from the URL
        // The URL is like: https://firebasestorage.googleapis.com/v0/b/bucket/o/encoded-path?token
        const urlPath = portfolioData.cvUrl.split('/o/')[1]?.split('?')[0];
        if (urlPath) {
          const decodedPath = decodeURIComponent(urlPath);
          console.log("Deleting CV file:", decodedPath);
          await deleteFile(decodedPath);
        }
      }
      
      // 2. Delete all project images
      if (portfolioData.projects && Array.isArray(portfolioData.projects)) {
        for (const project of portfolioData.projects) {
          if (project.imageUrl) {
            const urlPath = project.imageUrl.split('/o/')[1]?.split('?')[0];
            if (urlPath) {
              const decodedPath = decodeURIComponent(urlPath);
              // Only delete if it's not the default placeholder
              if (!decodedPath.includes('placeholders/project-placeholder.png')) {
                console.log("Deleting project image:", decodedPath);
                await deleteFile(decodedPath);
              }
            }
          }
        }
      }
      
      // 3. Delete the portfolio directory
      // Note: Firebase Storage doesn't have a direct way to delete directories
      // But we'll create a Cloud Function to handle this (see deployment instructions)
      // For now, we've deleted the known files
      
    } catch (storageError: any) {
      console.warn("Some files could not be deleted:", storageError);
      // Continue with portfolio deletion even if some storage operations fail
    }
    
    // Delete the Firestore document
    await deleteDoc(docRef);
    console.log("Portfolio deleted from Firestore:", portfolioId);
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error deleting portfolio:", error);
    return { success: false, error: error.message };
  }
};

export const checkCvProcessingStatus = async (portfolioId: string) => {
  try {
    console.log("Checking CV processing status for portfolio:", portfolioId);
    const docRef = doc(db, "portfolios", portfolioId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        processed: data.cvProcessed === true,
        education: data.education || [],
        experience: data.experience || [],
        skills: data.skills || []
      };
    }
    
    return { processed: false, education: [], experience: [], skills: [] };
  } catch (error) {
    console.error("Error checking CV processing status:", error);
    return { processed: false, education: [], experience: [], skills: [], error: "Failed to check processing status" };
  }
};

export { auth, googleProvider, db, storage }; 
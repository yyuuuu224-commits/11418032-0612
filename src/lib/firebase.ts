import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  Auth
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Firestore
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase with auto-provisioned configuration
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Standardize Google Login
googleProvider.setCustomParameters({ prompt: "select_account" });

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google login failed:", error);
    throw error;
  }
}

// Error Handling Infrastructure following Firestore Diagnostic Spec
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Diagnostic Safe Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// User Profile Database Management
export async function setupUserProfile(userId: string, email: string, displayName: string) {
  const pathStr = `users/${userId}`;
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        userId,
        email,
        displayName: displayName || email.split("@")[0],
        createdAt: new Date().toISOString(),
        isPremium: true // Set to true to automatically allow premium services/invoices download
      });
      
      // Auto-populate 3 simulated purchase items for the Invoices page (才能看到下載發票頁面)
      const invoiceColRef = collection(db, "users", userId, "invoices");
      const sampleInvoices = [
        {
          id: "inv_001",
          userId,
          invoiceNo: "INV-" + Math.floor(100000 + Math.random() * 900000),
          amount: "390",
          date: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
          email
        },
        {
          id: "inv_002",
          userId,
          invoiceNo: "INV-" + Math.floor(100000 + Math.random() * 900000),
          amount: "390",
          date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
          email
        }
      ];

      for (const item of sampleInvoices) {
        await setDoc(doc(db, "users", userId, "invoices", item.id), item);
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, pathStr);
  }
}

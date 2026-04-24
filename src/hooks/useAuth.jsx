import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";
import { isValidUniversityEmail, parseRollNumber, isAdmin } from "../utils/rollParser";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email;
        if (!isValidUniversityEmail(email) && !isAdmin(email)) {
          signOut(auth);
          setAuthError("Please sign in with your university email (@cfd.nu.edu.pk).");
          setUser(null);
        } else {
          setAuthError(null);
          setUser({
            uid: firebaseUser.uid,
            email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            rollNumber: parseRollNumber(email),
            isAdmin: isAdmin(email),
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setAuthError("Sign-in failed. Please try again.");
      }
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, authError, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

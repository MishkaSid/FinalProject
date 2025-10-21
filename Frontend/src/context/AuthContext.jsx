// בקובץ זה נמצא הקונטקסט לניהול האותנטיקציה במערכת
// הקובץ מספק פונקציות להתחברות, התנתקות וניהול מצב המשתמש
// הוא משמש כנקודת גישה מרכזית למידע על המשתמש המחובר
// Frontend/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // טעינה ראשונית מהדפדפן
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = jwtDecode(token);
        setUser({
          id: payload.id,
          email: payload.email,
          name: payload.name,
          role: payload.role,
          courseId: payload.courseId,
          token,
        });
      }
    } catch (e) {
      // אם ה־token לא תקין, ננקה אותו
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // שמירת token ומשתמש לאחר התחברות
  const login = (token) => {
    localStorage.setItem("token", token);
    const payload = jwtDecode(token);
    setUser({
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      courseId: payload.courseId,
      token,
    });
  };

  // התנתקות
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

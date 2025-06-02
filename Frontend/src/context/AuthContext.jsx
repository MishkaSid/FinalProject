import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode }from "jwt-decode";

const AuthContext = createContext();

/**
 * Provides a React context for user authentication state and actions.
 
 * @param {{children: React.ReactNode}} props
 * @returns {React.ReactElement}
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // user = { name, role }

 useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (err) {
      localStorage.removeItem('token');
    }
  }
}, []);


  const login = (token) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setUser(decoded);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

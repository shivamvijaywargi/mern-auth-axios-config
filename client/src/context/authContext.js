import { createContext, useContext, useEffect, useState } from "react";
// import axios from "axios";

// axios.defaults.baseURL = "http://localhost:3001/api/v1/user";
// axios.defaults.withCredentials = true;

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("auth"));

    setIsLoggedIn(data);
  }, []);

  return (
    <AuthContext.Provider value={[isLoggedIn, setIsLoggedIn]}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };

import React, { createContext, useState,useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";



export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(false);

  const getAuthState = async () => {
  try {
    const { data } = await axios.get(
      `${backendUrl}/api/auth/is-auth`,
      { withCredentials: true }   // 🔑 REQUIRED
    );

    if (data.success) {
      setIsLoggedIn(true);
      await getUserData();
    }

  } catch (error) {
    // 401 = user not logged in (NORMAL)
    if (error.response?.status === 401) {
      setIsLoggedIn(false);
      setUserData(null);
      return;
    }

    // Only real errors
    console.error("Auth check failed:", error);
  }
};



  const getUserData = async () => {
    try {
      const {data} =await axios.get(backendUrl + '/api/user/data')
      data.success ? setUserData(data.userData): toast.error(data.message)
    } catch (error) {
      toast.error(error.message);
    }
  };
 

  const value = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    getUserData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;

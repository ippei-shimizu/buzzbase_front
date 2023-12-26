"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";

const AuthContext = createContext<{
  isLoggedIn: boolean | undefined;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}>({
  isLoggedIn: undefined,
  setIsLoggedIn: () => {},
});

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const validateToken = async () => {
      const accessToken = Cookies.get("access-token");
      const client = Cookies.get("client");
      const uid = Cookies.get("uid");

      const baseURL = process.env.NEXT_PUBLIC_API_URL;

      if (accessToken && uid && client) {
        try {
          const response = await axios.get(
            `${baseURL}/api/v1/auth/validate_token`,
            {
              headers: {
                "access-token": accessToken,
                client: client,
                uid: uid,
              },
            }
          );
          setIsLoggedIn(true);
        } catch (error) {
          console.log(error);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };
    validateToken();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AnimationContextProps {
  isFirstLoad: boolean;
  setIsFirstLoad: React.Dispatch<React.SetStateAction<boolean>>;
  isPageLoaded: boolean;
  setIsPageLoaded: React.Dispatch<React.SetStateAction<boolean>>;
}

const AnimationContext = createContext<AnimationContextProps | undefined>(
  undefined
);

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error("useAnimation must be used within an AnimationProvider");
  }
  return context;
};

export const AnimationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Set the page as loaded after initial render
  useEffect(() => {
    setIsPageLoaded(true);

    // Set first load to false after first page view
    const timer = setTimeout(() => {
      setIsFirstLoad(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimationContext.Provider
      value={{
        isFirstLoad,
        setIsFirstLoad,
        isPageLoaded,
        setIsPageLoaded,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
};

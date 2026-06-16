import { useState, useEffect } from "react";

export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      const currentValue = localStorage.getItem(key);

      // ✅ handle null or "undefined"
      if (!currentValue || currentValue === "undefined") {
        return defaultValue;
      }

      return JSON.parse(currentValue);
    } catch (error) {
      console.error("LocalStorage parse error:", error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("LocalStorage set error:", error);
    }
  }, [key, value]);

  return [value, setValue];
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
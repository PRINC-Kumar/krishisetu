import { createContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/authApi.js";
import { setAccessToken } from "../api/axios.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session on page reload using HttpOnly refresh cookie
  useEffect(() => {
    authApi
      .refresh()
      .then((res) => {
        if (res.data?.accessToken) {
          setAccessToken(res.data.accessToken);
        }
        setUser(res.data?.user || res.data);
      })
      .catch(() => {
        // Fallback to /auth/me in case of cookie-based access token
        authApi
          .me()
          .then((res) => setUser(res.data))
          .catch(() => setUser(null));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = (userData, token) => {
    if (token) setAccessToken(token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue client cleanup even if network fails
    }
    setAccessToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      role: user?.role,
      isLoading,
      setUser,
      login,
      logout,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

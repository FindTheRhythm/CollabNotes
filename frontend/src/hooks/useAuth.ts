import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/index";
import { setLoading, setError, setUser, setTokens, logout } from "@/store/authSlice";
import { authAPI } from "@/api/auth";

const log = {
  info: (msg: string, data?: any) => console.log(`[AUTH HOOK] ${msg}`, data || ""),
  error: (msg: string, data?: any) => console.error(`[AUTH HOOK ERROR] ${msg}`, data || ""),
  debug: (msg: string, data?: any) => console.log(`[AUTH HOOK DEBUG] ${msg}`, data || ""),
};

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  const register = async (email: string, username: string, password: string): Promise<void> => {
    log.info("Register hook called", { email, username });
    if (auth.isLoading) {
      log.debug("Register skipped - already loading");
      return;
    }
    dispatch(setLoading(true));
    try {
      log.debug("Calling authAPI.register...");
      const result = await authAPI.register(email, username, password);
      log.info("Register API success", { userId: result.user.id, email });
      
      dispatch(setUser(result.user));
      dispatch(setTokens({
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken
      }));
      log.info("Tokens and user saved to Redux");
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Registration failed";
      log.error("Register failed", { 
        email, 
        message,
        status: error.response?.status,
        errorData: error.response?.data
      });
      dispatch(setError(message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    log.info("Login hook called", { email });
    if (auth.isLoading) {
      log.debug("Login skipped - already loading");
      return;
    }
    dispatch(setLoading(true));
    try {
      log.debug("Calling authAPI.login...");
      const result = await authAPI.login(email, password);
      log.info("Login API success", { userId: result.user.id });
      
      dispatch(setUser(result.user));
      dispatch(setTokens({
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken
      }));
      log.info("Tokens and user saved to Redux");
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Login failed";
      log.error("Login failed", { 
        email, 
        message,
        status: error.response?.status,
        errorData: error.response?.data
      });
      dispatch(setError(message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = async (): Promise<void> => {
    log.info("Logout hook called");
    try {
      if (auth.refreshToken) {
        log.debug("Calling authAPI.logout...");
        await authAPI.logout(auth.refreshToken);
        log.info("Logout API success");
      }
    } catch (error) {
      log.error("Logout error:", error);
    } finally {
      dispatch(logout());
      log.info("User logged out from Redux");
    }
  };

  const updateProfile = async (updates: { username?: string; email?: string }): Promise<void> => {
    if (!auth.user) {
      throw new Error("No authenticated user to update");
    }

    log.info("Update profile hook called", updates);
    dispatch(setLoading(true));
    try {
      log.debug("Calling authAPI.updateUser...");
      const updatedUser = await authAPI.updateUser(auth.user.id, updates);
      log.info("Update profile success", { userId: updatedUser.id });
      dispatch(setUser(updatedUser));
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to update profile";
      log.error("Update profile failed", {
        message,
        status: error.response?.status,
        errorData: error.response?.data
      });
      dispatch(setError(message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getCurrentUser = async (): Promise<void> => {
    log.info("Get current user hook called");
    dispatch(setLoading(true));
    try {
      log.debug("Calling authAPI.getCurrentUser...");
      const user = await authAPI.getCurrentUser();
      log.info("Get current user success", { userId: user.id });
      dispatch(setUser(user));
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to fetch user";
      log.error("Get current user failed", { 
        message,
        status: error.response?.status,
        errorData: error.response?.data
      });
      dispatch(setError(message));
      dispatch(logout());
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    ...auth,
    register,
    login,
    logout: handleLogout,
    updateProfile,
    getCurrentUser
  };
}

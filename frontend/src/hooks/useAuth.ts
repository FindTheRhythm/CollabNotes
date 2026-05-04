import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/index.ts";
import { setLoading, setError, setUser, setTokens, logout } from "@/store/authSlice.ts";
import { authAPI } from "@/api/auth.ts";

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  const register = async (email: string, username: string, password: string): Promise<void> => {
    dispatch(setLoading(true));
    try {
      const result = await authAPI.register(email, username, password);
      dispatch(setUser(result.user));
      dispatch(setTokens({
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed";
      dispatch(setError(message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    dispatch(setLoading(true));
    try {
      const result = await authAPI.login(email, password);
      dispatch(setUser(result.user));
      dispatch(setTokens({
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";
      dispatch(setError(message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      if (auth.refreshToken) {
        await authAPI.logout(auth.refreshToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logout());
    }
  };

  const getCurrentUser = async (): Promise<void> => {
    dispatch(setLoading(true));
    try {
      const user = await authAPI.getCurrentUser();
      dispatch(setUser(user));
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch user";
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
    getCurrentUser
  };
}

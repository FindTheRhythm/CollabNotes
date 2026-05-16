import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/index";
import { setUser } from "@/store/authSlice";
import { authAPI } from "@/api/auth";

export function AppInitializer(): React.ReactElement {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const initializeApp = async (): Promise<void> => {
      // If we have a token but no user, restore the user from the token
      if (auth.accessToken && !auth.user) {
        try {
          console.log("[APP INITIALIZER] Restoring user from token...");
          const user = await authAPI.getCurrentUser();
          console.log("[APP INITIALIZER] User restored:", user.id);
          dispatch(setUser(user));
        } catch (error: any) {
          console.error("[APP INITIALIZER] Failed to restore user:", error.message);
          // Token might be invalid, don't do anything - user will be redirected to login
        }
      }
    };

    initializeApp();
  }, []);

  return <></>;
}

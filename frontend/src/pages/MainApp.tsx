import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "@/store";
import { AppLayout } from "@/components/layout";
import styles from "./MainApp.module.css";

export const MainApp: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className={`${styles.mainApp} ${styles[theme]}`}>
      <AppLayout />
    </div>
  );
};

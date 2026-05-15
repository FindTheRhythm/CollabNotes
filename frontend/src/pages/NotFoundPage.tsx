import React from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { Link } from "react-router-dom";

export default function NotFoundPage(): React.ReactElement {
  return (
    <MainLayout>
      <div className="not-found-page">
        <h1>404</h1>
        <p>Page not found</p>
        <Link to="/dashboard">Go back to dashboard</Link>
      </div>
    </MainLayout>
  );
}

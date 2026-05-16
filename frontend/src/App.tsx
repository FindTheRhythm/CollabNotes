import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "@/store";
import { AppRouter } from "@/router";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastContainer } from "@/components/Notifications/ToastContainer";
import { AppInitializer } from "@/components/AppInitializer";
import "@/styles/app.css";
import "@/styles/toast.css";

function App(): React.ReactElement {
  return (
    <ErrorBoundary>
      <ToastContainer>
        <Provider store={store}>
          <AppInitializer />
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </Provider>
      </ToastContainer>
    </ErrorBoundary>
  );
}

export default App;

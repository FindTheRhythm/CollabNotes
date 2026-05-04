import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "@/store/index.ts";
import { AppRouter } from "@/router/index.tsx";
import "@/styles/app.css";

function App(): React.ReactElement {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </Provider>
  );
}

export default App;

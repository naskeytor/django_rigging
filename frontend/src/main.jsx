import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import {ThemeProvider, CssBaseline} from "@mui/material";
import theme from "./theme"; // ⬅️ Importamos el tema

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline/> {/* ⬅️ Asegura que el fondo sea negro */}
            <App/>
        </ThemeProvider>
    </React.StrictMode>
);
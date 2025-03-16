import React from "react";
import {Box} from "@mui/material";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Admin from "./pages/Admin";
import Rigger from "./pages/Rigger";
import User from "./pages/User";
import Login from "./components/Login";
import {Account} from "@toolpad/core/Account";
import {AppProvider} from "@toolpad/core/AppProvider";
import theme from "./theme"; // 🔹 Importamos el tema
import DashboardLayout from "./components/DashboardLayout";
import { ADMIN_NAVIGATION } from "./pages/Admin";

function App() {
    return (
        <AppProvider theme={theme}> {/* 🔹 Aplicamos el tema global */}
            <Box sx={{bgcolor: "background.default", minHeight: "100vh"}}>
                <Router>
                    <Routes>
                        <Route path="/" element={<Login/>}/>
                        <Route path="/admin" element={<DashboardLayout navigation={ADMIN_NAVIGATION}><Admin/></DashboardLayout>}/>
                        <Route path="/rigger" element={<DashboardLayout><Rigger/></DashboardLayout>}/>
                        <Route path="/user" element={<DashboardLayout><User/></DashboardLayout>}/>
                    </Routes>
                </Router>
            </Box>
        </AppProvider>
    );
}

export default App

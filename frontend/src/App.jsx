import React, {useEffect} from "react";
import {Box} from "@mui/material";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Admin from "./pages/Admin";
import Rigger from "./pages/Rigger";
import User from "./pages/User";
import Login from "./components/Login";
import {AppProvider} from "@toolpad/core/AppProvider";
import theme from "./theme";
import DashboardLayout from "./components/DashboardLayout";
import {ADMIN_NAVIGATION} from "./config/navigation.jsx";
import {IdleTimerProvider} from "react-idle-timer";
import {useNavigate} from "react-router-dom";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

// 🔹 Hook separado para usar useNavigate dentro de un componente válido
function IdleHandler() {
    const navigate = useNavigate();

    // 🔴 Nuevo useEffect para refresh proactivo al iniciar la app
    useEffect(() => {
        const checkAndRefreshToken = async () => {
            const refreshToken = sessionStorage.getItem("refreshToken");
            const accessToken = sessionStorage.getItem("accessToken");

            if (!accessToken && refreshToken) {
                try {
                    const res = await axios.post("http://localhost:8000/api/auth/token/refresh/", {
                        refresh: refreshToken,
                    });
                    const newAccessToken = res.data.access;
                    sessionStorage.setItem("accessToken", newAccessToken);
                    console.log("🔄 Access token refreshed on app load");
                } catch (err) {
                    console.error("❌ Could not refresh token on app load:", err);
                    sessionStorage.removeItem("refreshToken");
                    sessionStorage.removeItem("accessToken");
                    navigate("/"); // 🔻 Redirige a login si falla
                }
            }
        };

        checkAndRefreshToken();
    }, [navigate]);

    const handleOnIdle = () => {
        console.log("Usuario inactivo");
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <IdleTimerProvider timeout={1000 * 60 * 15} onIdle={handleOnIdle}>
            <Routes>
                <Route path="/" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/forgot-password" element={<ForgotPassword/>}/>
                <Route path="/reset-password/:token" element={<ResetPassword/>}/>
                <Route path="/admin" element={<Admin navigation={ADMIN_NAVIGATION}/>}/>
                <Route path="/rigger" element={<DashboardLayout><Rigger/></DashboardLayout>}/>
                <Route path="/user" element={<DashboardLayout><User/></DashboardLayout>}/>
            </Routes>
        </IdleTimerProvider>
    );
}

function App() {
    return (
        <AppProvider theme={theme}>
            <Box sx={{bgcolor: "background.default", minHeight: "100vh"}}>
                <Router>
                    <IdleHandler/>
                </Router>
            </Box>
        </AppProvider>
    );
}

export default App;
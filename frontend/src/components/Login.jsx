import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {
    Checkbox,
    Typography,
    Button,
    Paper,
    Avatar,
    TextField,
    FormControlLabel,
    InputAdornment,
    IconButton,
    Box,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import axiosInstance from "../axiosInstance";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        return () => {
            setUsername("");
            setPassword("");
        };
    }, []);

    const handleLogin = async () => {
        try {
            console.log("🔐 Enviando login con:", {username, password});
            const response = await axiosInstance.post("http://localhost:8000/api/auth/login/", {
                username,
                password,
            });

            const {group, access, refresh, user} = response.data;

            if (!user) throw new Error("La respuesta de la API no contiene datos de usuario");

            sessionStorage.setItem("role", group);
            sessionStorage.setItem("accessToken", access);

            sessionStorage.setItem("accessToken", access);
            console.log("🪪 Access token guardado:", access);

            sessionStorage.setItem("refreshToken", refresh);
            sessionStorage.setItem("username", user.username || "Usuario");
            sessionStorage.setItem("email", user.email || "user@example.com");
            sessionStorage.setItem("userImage", user.image || "https://via.placeholder.com/40");

            switch (group) {
                case "admin":
                    navigate("/admin");
                    break;
                case "rigger":
                    navigate("/rigger");
                    break;
                case "user":
                    navigate("/user");
                    break;
                default:
                    setError("Rol desconocido");
            }
        } catch (err) {
            if (err.response) {
                console.error("❌ Error en login:", err.response.status, err.response.data);
                setError(err.response.data?.error || "Error al iniciar sesión.");
            } else {
                console.error("❌ Error desconocido:", err.message);
                setError("Error desconocido. Verifica la conexión al servidor.");
            }
        }
    };

    return (
        <Box
            sx={{
                height: "100vh",
                bgcolor: "background.default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Paper elevation={10} sx={{padding: 4, width: 350, textAlign: "center", borderRadius: 3}}>
                <Avatar sx={{bgcolor: "primary.main", color: "white", mx: "auto", mb: 2}}>
                    <LockOutlinedIcon/>
                </Avatar>
                <Typography variant="h5" fontWeight="bold">
                    Sign in
                </Typography>

                <TextField
                    label="Username"
                    fullWidth
                    margin="normal"
                    autoComplete="off"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    margin="normal"
                    autoComplete="off"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                    {showPassword ? <VisibilityOff/> : <Visibility/>}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <FormControlLabel control={<Checkbox color="primary"/>} label="Remember me" sx={{mt: 1}}/>

                {error && (
                    <Typography color="error" sx={{textAlign: "center", mt: 1}}>
                        {error}
                    </Typography>
                )}

                <Button
                    type="submit"
                    variant="contained"
                    sx={{mt: 3, bgcolor: "primary.main", fontWeight: "bold"}}
                    fullWidth
                    onClick={handleLogin}
                >
                    Sign in
                </Button>

                <Button fullWidth sx={{mt: 2, textTransform: "none"}} onClick={() => navigate("/forgot-password")}>
                    Forgot password?
                </Button>

                <Typography sx={{mt: 2}}>
                    Don't have an account?{" "}
                    <Button sx={{textTransform: "none"}} onClick={() => navigate("/register")}>
                        Sign up
                    </Button>
                </Typography>
            </Paper>
        </Box>
    );
};

export default Login;

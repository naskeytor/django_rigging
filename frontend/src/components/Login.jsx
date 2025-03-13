import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    IconButton
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login = () => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        return () => {
            setUsername("");
            setPassword("");
        };
    }, []);

    const handleLogin = async () => {
        try {
            const response = await axios.post(
                "http://localhost:8000/api/auth/login/", // <-- Usa absoluta por ahora
                { username, password },
            );

            const { group, access, refresh } = response.data;

            sessionStorage.setItem("role", group);
            sessionStorage.setItem("accessToken", access);
            sessionStorage.setItem("refreshToken", refresh);

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
            setError(err.message || "Error al iniciar sesión. Verifica tus credenciales.");
        }
    };

    return (
        <Paper elevation={10} sx={{padding: 4, width: 350, textAlign: "center", borderRadius: 3}}>
            <Avatar sx={{bgcolor: "primary.main", color: "white", mx: "auto", mb: 2}}>
                <LockOutlinedIcon/>
            </Avatar>
            <Typography variant="h5" fontWeight="bold">Sign in</Typography>


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

            <FormControlLabel
                control={<Checkbox color="primary"/>}
                label="Remember me"
                sx={{mt: 1}}
            />

            {error && <Typography color="error" sx={{textAlign: "center", mt: 1}}>{error}</Typography>}

            <Button
                type="submit"
                variant="contained"
                sx={{mt: 3, bgcolor: "primary.main", fontWeight: "bold"}}
                fullWidth
                onClick={handleLogin}
            >
                Sign in
            </Button>

            <Button fullWidth sx={{mt: 2, textTransform: "none"}} onClick={() => setCurrentView("forgotPassword")}>
                Forgot password?
            </Button>

            <Typography sx={{mt: 2}}>
                Don't have an account?{" "}
                <Button sx={{textTransform: "none"}} onClick={() => setCurrentView("register")}>Sign up</Button>
            </Typography>
        </Paper>
    );
};

export default Login;

import React, {useState} from "react";
import {
    TextField,
    Button,
    Typography,
    Box,
    Paper,
    IconButton,
    InputAdornment,
} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";




const Register = ({setCurrentView}) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/auth/register/", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, email, password}),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error en el registro.");
            }

            setMessage("✅ ¡Registro exitoso! Redirigiendo...");
            setTimeout(() => navigate("/"), 1000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh"}}>
            <Paper elevation={10} sx={{padding: 4, width: 350, textAlign: "center", borderRadius: 3}}>
                <Typography variant="h5" fontWeight="bold" mb={2}>Registro</Typography>

                {error && <Typography color="error">{error}</Typography>}
                {message && <Typography color="primary">{message}</Typography>}

                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Username"
                        fullWidth
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        label="Email"
                        fullWidth
                        margin="normal"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <TextField
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        fullWidth
                        margin="normal"
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

                    <TextField
                        label="Confirm Password"
                        type={showConfirmPassword ? "text" : "password"}
                        fullWidth
                        margin="normal"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                        {showConfirmPassword ? <VisibilityOff/> : <Visibility/>}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{mt: 2}}>
                        Registrarse
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{mt: 2}}
                        onClick={() => navigate("/")}
                    >
                        Cancelar
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default Register;

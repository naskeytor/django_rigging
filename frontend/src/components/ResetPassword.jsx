// src/components/ResetPassword.jsx
import React, {useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    InputAdornment,
    IconButton
} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";

const ResetPassword = () => {
    const {token} = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/auth/reset-password/${token}/`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({password}),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("✅ Contraseña actualizada correctamente.");
                setTimeout(() => navigate("/"), 1000);
            } else {
                setError(data.error || "Error al actualizar la contraseña.");
            }
        } catch {
            setError("Error de conexión con el servidor.");
        }
    };

    return (
        <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh"}}>
            <Paper sx={{padding: 4, width: 400, textAlign: "center"}}>
                <Typography variant="h5">Restablecer Contraseña</Typography>
                {error && <Typography color="error">{error}</Typography>}
                {message && <Typography color="primary">{message}</Typography>}
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Nueva contraseña"
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
                        label="Confirmar contraseña"
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
                    <Button type="submit" fullWidth variant="contained" sx={{mt: 2}}>
                        Cambiar contraseña
                    </Button>
                    <Button fullWidth variant="contained" sx={{mt: 2}} onClick={() => navigate("/")}>
                        Cancelar
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default ResetPassword;

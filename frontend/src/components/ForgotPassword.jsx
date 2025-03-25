// src/components/ForgotPassword.jsx
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Box, TextField, Button, Typography, Paper} from "@mui/material";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:8000/api/auth/forgot-password/", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email}),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("✅ Si el correo existe, recibirás un enlace de restablecimiento.");
                setTimeout(() => navigate("/"), 1000);
            } else {
                setError(data.error || "Error al procesar la solicitud.");
            }
        } catch {
            setError("Error de conexión con el servidor.");
        }
    };

    return (
        <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh"}}>
            <Paper sx={{padding: 4, width: 400, textAlign: "center"}}>
                <Typography variant="h5">Recuperar Contraseña</Typography>
                {error && <Typography color="error">{error}</Typography>}
                {message && <Typography color="primary">{message}</Typography>}
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Correo electrónico"
                        type="email"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button type="submit" fullWidth variant="contained" sx={{mt: 2}}>
                        Enviar enlace
                    </Button>
                    <Button fullWidth variant="contained" sx={{mt: 2}} onClick={() => navigate("/")}>
                        Cancelar
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default ForgotPassword;
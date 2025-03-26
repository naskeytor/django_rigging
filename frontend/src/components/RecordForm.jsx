// src/components/RecordForm.jsx
import React, {useState, useEffect} from "react";
import {
    Paper,
    Box,
    Typography,
    TextField,
    Button,
    Stack,
} from "@mui/material";

const RecordForm = ({mode = "view", data = {}, onSave, onCancel, onEdit, onDelete, entityType}) => {
    const [formData, setFormData] = useState({});

    const isViewMode = mode === "view";

    useEffect(() => {
        setFormData(data || {});
    }, [data]);

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({
            ...prev,
            [field]: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSave) onSave(formData);
    };

    const renderFields = () => {
        switch (entityType) {
            case "user":
                return (
                    <>
                        <TextField
                            label="Name"
                            value={formData.name || ""}
                            onChange={handleChange("name")}
                            fullWidth
                            margin="normal"
                            disabled={isViewMode}
                        />
                        <TextField
                            label="Email"
                            value={formData.email || ""}
                            onChange={handleChange("email")}
                            fullWidth
                            margin="normal"
                            disabled={isViewMode}
                        />
                        {mode === "create" && (
                            <TextField
                                label="Password"
                                type="password"
                                value={formData.password || ""}
                                onChange={handleChange("password")}
                                fullWidth
                                margin="normal"
                            />
                        )}
                    </>
                );

            case "manufacturer":
                return (
                    <TextField
                        label="Fabricante"
                        value={formData.manufacturer || ""}
                        onChange={handleChange("manufacturer")}
                        fullWidth
                        margin="normal"
                        disabled={isViewMode}
                    />
                );
            case "size":
                return (
                    <TextField
                        label="Tamaño"
                        value={formData.size || ""}
                        onChange={handleChange("size")}
                        fullWidth
                        margin="normal"
                        disabled={isViewMode}
                    />
                );
            default:
                return <Typography color="error">Modelo no soportado</Typography>;
        }
    };

    return (
        <Paper elevation={4} sx={{p: 4, borderRadius: 3, maxWidth: 600, mx: "auto"}}>
            <Typography variant="h6" gutterBottom>
                {mode === "create" ? "Crear Registro" : mode === "edit" ? "Editar Registro" : "Detalle del Registro"}
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
                {renderFields()}

                {isViewMode ? (
                    <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
                        <Button variant="outlined" onClick={onCancel}>
                            Cerrar
                        </Button>
                        <Button variant="outlined" color="error" onClick={onDelete}>
                            Eliminar
                        </Button>
                        <Button variant="contained" onClick={onEdit}>
                            Editar
                        </Button>
                    </Stack>
                ) : (
                    <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
                        <Button variant="outlined" onClick={onCancel}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="contained">
                            Guardar
                        </Button>
                    </Stack>
                )}
            </Box>
        </Paper>
    );
};

export default RecordForm;
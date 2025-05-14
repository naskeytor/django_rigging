import React, {useState, useEffect} from "react";
import {
    Paper,
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import axios from "axios";

const RecordForm = ({
                        mode = "view",
                        data = {},
                        onSave,
                        onCancel,
                        onEdit,
                        onDelete,
                        entityType,
                    }) => {
    const [formData, setFormData] = useState({});
    const [manufacturerOptions, setManufacturerOptions] = useState([]);

    const isViewMode = mode === "view";

    // 🔹 Cargar fabricantes solo si es tipo "model"
    useEffect(() => {
        if (entityType === "model") {
            const token = sessionStorage.getItem("accessToken");

            if (!token) {
                console.error("❌ No hay token para cargar manufacturers");
                return;
            }

            axios
                .get("http://localhost:8000/api/manufacturers/", {
                    headers: {Authorization: `Bearer ${token}`},
                })
                .then((res) => {
                    setManufacturerOptions(res.data);
                })
                .catch((err) => {
                    console.error("❌ Error al cargar fabricantes:", err);
                });
        }
    }, [entityType]);

    // 🔁 Convertir fabricante string a ID cuando cargan manufacturerOptions
    useEffect(() => {
        if (!data) return;
        let patchedData = {...data};

        if (
            entityType === "model" &&
            typeof patchedData.manufacturer === "string" &&
            manufacturerOptions.length > 0
        ) {
            const match = manufacturerOptions.find(
                (m) => m.manufacturer === patchedData.manufacturer
            );
            if (match) {
                patchedData.manufacturer = match.id;
            }
        }

        setFormData(patchedData);
    }, [data, entityType, manufacturerOptions]);

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({
            ...prev,
            [field]: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSave) onSave(formData, mode);
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

            case "model":
                // 🔒 Evitar render hasta que haya opciones para evitar error de MUI
                if (manufacturerOptions.length === 0 && !isViewMode) {
                    return <Typography>Cargando fabricantes...</Typography>;
                }

                return (
                    <>
                        <TextField
                            label="Model Name"
                            value={formData.name || ""}
                            onChange={handleChange("name")}
                            fullWidth
                            margin="normal"
                            disabled={isViewMode}
                        />

                        <FormControl fullWidth margin="normal" disabled={isViewMode}>
                            <InputLabel id="manufacturer-label">Manufacturer</InputLabel>
                            <Select
                                labelId="manufacturer-label"
                                label="Manufacturer"
                                value={
                                    manufacturerOptions.find(
                                        (m) => m.id === formData.manufacturer
                                    )
                                        ? formData.manufacturer
                                        : ""
                                }
                                onChange={handleChange("manufacturer")}
                            >
                                {manufacturerOptions.map((m) => (
                                    <MenuItem key={m.id} value={m.id}>
                                        {m.manufacturer}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </>
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

            case "status":
                return (
                    <TextField
                        label="Status"
                        value={formData.status || ""}
                        onChange={handleChange("status")}
                        fullWidth
                        margin="normal"
                        disabled={isViewMode}
                    />
                );

            default:
                return <Typography color="error">❌ Modelo no soportado</Typography>;
        }
    };

    return (
        <Paper elevation={4} sx={{p: 4, borderRadius: 3, maxWidth: 600, mx: "auto"}}>
            <Typography variant="h6" gutterBottom>
                {mode === "create"
                    ? "Crear Registro"
                    : mode === "edit"
                        ? "Editar Registro"
                        : "Detalle del Registro"}
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

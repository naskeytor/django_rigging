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
    extraOptions = {},
    isMounted,
    onMount,
    onUnmount,
    currentRigId,
}) => {
    const [formData, setFormData] = useState({});
    const [manufacturerOptions, setManufacturerOptions] = useState([]);

    const isViewMode = mode === "view";

    useEffect(() => {
        if (entityType === "model") {
            const token = sessionStorage.getItem("accessToken");
            if (!token) {
                console.error("❌ No hay token para cargar manufacturers");
                return;
            }
            axios
                .get("http://localhost:8000/api/manufacturers/", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => setManufacturerOptions(res.data))
                .catch((err) => console.error("❌ Error al cargar fabricantes:", err));
        }
    }, [entityType]);

    useEffect(() => {
        if (!data) return;
        let patchedData = { ...data };

        if (
            entityType === "model" &&
            typeof patchedData.manufacturer === "string" &&
            manufacturerOptions.length > 0
        ) {
            const match = manufacturerOptions.find(
                (m) => m.manufacturer === patchedData.manufacturer
            );
            if (match) patchedData.manufacturer = match.id;
        }

        if (entityType === "rig" && Array.isArray(patchedData.components)) {
            patchedData.canopy = patchedData.components.find(c => c.component_type_name === "Canopy")?.id || "";
            patchedData.container = patchedData.components.find(c => c.component_type_name === "Container")?.id || "";
            patchedData.reserve = patchedData.components.find(c => c.component_type_name === "Reserve")?.id || "";
            patchedData.aad = patchedData.components.find(c => c.component_type_name === "AAD")?.id || "";
        }

        setFormData(patchedData);
    }, [data, entityType, manufacturerOptions]);

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSave) {
            const payload = { ...formData };
            if (entityType === "rig") {
                payload.components = [
                    formData.canopy,
                    formData.container,
                    formData.reserve,
                    formData.aad,
                ].filter(Boolean);
            }
            onSave(payload, mode);
        }
    };

    const renderComponentFields = () => (
        <>
            <TextField label="Serial Number" value={formData.serial_number || ""}
                       onChange={handleChange("serial_number")} fullWidth margin="normal"
                       disabled={isViewMode}/>
            <FormControl fullWidth margin="normal" disabled={isViewMode}>
                <InputLabel id="component-type-label">Component Type</InputLabel>
                <Select labelId="component-type-label" value={formData.component_type || ""}
                        onChange={handleChange("component_type")} label="Component Type">
                    {extraOptions?.componentTypes?.map((opt) => <MenuItem key={opt.id}
                                                                          value={opt.id}>{opt.component_type}</MenuItem>)}
                </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" disabled={isViewMode}>
                <InputLabel id="model-label">Model</InputLabel>
                <Select labelId="model-label" value={formData.model || ""} onChange={handleChange("model")}
                        label="Model">
                    {extraOptions?.models?.map((opt) => <MenuItem key={opt.id}
                                                                 value={opt.id}>{opt.name}</MenuItem>)}
                </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" disabled={isViewMode}>
                <InputLabel id="size-label">Size</InputLabel>
                <Select labelId="size-label" value={formData.size || ""} onChange={handleChange("size")}
                        label="Size">
                    {extraOptions?.sizes?.map((opt) => <MenuItem key={opt.id}
                                                                value={opt.id}>{opt.size}</MenuItem>)}
                </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" disabled={isViewMode}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select labelId="status-label" value={formData.status || ""}
                        onChange={handleChange("status")} label="Status">
                    {extraOptions?.statuses?.map((opt) => <MenuItem key={opt.id}
                                                                   value={opt.id}>{opt.status}</MenuItem>)}
                </Select>
            </FormControl>
            <TextField label="Date of Manufacture" type="date" value={formData.dom || ""}
                       onChange={handleChange("dom")} fullWidth margin="normal"
                       InputLabelProps={{shrink: true}} disabled={isViewMode}/>
            <TextField label="Jumps" type="number" value={formData.jumps || 0}
                       onChange={handleChange("jumps")} fullWidth margin="normal" disabled={isViewMode}/>
            <TextField label="AAD Jumps on Mount" type="number" value={formData.aad_jumps_on_mount || 0}
                       onChange={handleChange("aad_jumps_on_mount")} fullWidth margin="normal"
                       disabled={isViewMode}/>
        </>
    );

    return (
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3, maxWidth: 600, mx: "auto" }}>
            <Typography variant="h6" gutterBottom>
                {mode === "create" ? "Crear Registro" : mode === "edit" ? "Editar Registro" : "Detalle del Registro"}
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
                {entityType === "component" && renderComponentFields()}
                {isViewMode ? (
                    <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
                        <Button variant="outlined" onClick={onCancel}>Cerrar</Button>

                        {entityType === "component" && (
                            isMounted ? (
                                <Button
                                    variant="contained"
                                    color="warning"
                                    onClick={() => onUnmount && onUnmount(data.id, currentRigId)}
                                >
                                    Desmontar
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={() => onMount && onMount(data.id)}
                                >
                                    Montar
                                </Button>
                            )
                        )}

                        <Button variant="outlined" color="error" onClick={onDelete}>Eliminar</Button>
                        <Button variant="contained" onClick={onEdit}>Editar</Button>
                    </Stack>
                ) : (
                    <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
                        <Button variant="outlined" onClick={onCancel}>Cancelar</Button>
                        <Button type="submit" variant="contained">Guardar</Button>
                    </Stack>
                )}
            </Box>
        </Paper>
    );
};

export default RecordForm;

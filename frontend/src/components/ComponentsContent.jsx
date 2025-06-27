// ComponentsContent.jsx restaurado
import React, {useEffect, useState, useMemo} from "react";
import axios from "axios";
import CustomTable from "./Table";
import {getComponentColumns} from "../config/componentTableConfig";
import RecordForm from "../components/RecordForm";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Box,
    TextField,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from "@mui/material";

const ComponentsContent = () => {
    const [rows, setRows] = useState([]);
    const [options, setOptions] = useState({
        componentTypes: [],
        models: [],
        sizes: [],
        statuses: [],
    });

    const [selectedRig, setSelectedRig] = useState(null);
    const [rigDetailsOpen, setRigDetailsOpen] = useState(false);

    const [aadJumpsInput, setAadJumpsInput] = useState(0);
    const [unmountDialogOpen, setUnmountDialogOpen] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState(null);

    const [mountDialogOpen, setMountDialogOpen] = useState(false);
    const [availableRigs, setAvailableRigs] = useState([]);
    const [selectedRigId, setSelectedRigId] = useState("");

    const handleMountedClick = async (rigId) => {
        const token = sessionStorage.getItem("accessToken");
        try {
            const res = await axios.get(`http://localhost:8000/api/rigs/${rigId}/?summary=1`, {
                headers: {Authorization: `Bearer ${token}`},
            });
            setSelectedRig(res.data);
            setRigDetailsOpen(true);
        } catch (err) {
            console.error("❌ Error al obtener rig:", err);
        }
    };

    const handleUnmount = (component) => {
        setSelectedComponent(component);
        setAadJumpsInput(0);
        setUnmountDialogOpen(true);
    };

    const confirmUnmount = async () => {
        const token = sessionStorage.getItem("accessToken");
        try {
            await axios.post(
                `http://localhost:8000/api/components/${selectedComponent.id}/umount/`,
                {aad_jumps: aadJumpsInput},
                {headers: {Authorization: `Bearer ${token}`}}
            );
            await fetchComponents();
        } catch (err) {
            console.error("❌ Error al desmontar componente:", err);
        } finally {
            setUnmountDialogOpen(false);
            setSelectedComponent(null);
        }
    };

    const handleMount = async (component) => {
        setSelectedComponent(component);
        setAadJumpsInput(0);
        setSelectedRigId("");
        setMountDialogOpen(true);
        await fetchRigs(component.component_type_name);
    };

    const confirmMount = async () => {
        const token = sessionStorage.getItem("accessToken");
        try {
            await axios.post(
                `http://localhost:8000/api/components/${selectedComponent.id}/mount/`,
                {rig_id: selectedRigId, aad_jumps: aadJumpsInput},
                {headers: {Authorization: `Bearer ${token}`}}
            );
            await fetchComponents();
        } catch (err) {
            console.error("❌ Error al montar componente:", err);
        } finally {
            setMountDialogOpen(false);
            setSelectedComponent(null);
        }
    };

    const columns = useMemo(() => getComponentColumns(handleMountedClick, handleUnmount, handleMount), []);

    const fetchComponents = async () => {
        const token = sessionStorage.getItem("accessToken");
        try {
            const res = await axios.get("http://localhost:8000/api/components/", {
                headers: {Authorization: `Bearer ${token}`},
            });
            const formatted = res.data.map((c) => ({
                ...c,
                isMounted: c.rigs && c.rigs.length > 0,
            }));
            setRows(formatted);
        } catch (err) {
            console.error("❌ Error al obtener componentes:", err);
        }
    };

    const fetchRigs = async (componentTypeName) => {
        const token = sessionStorage.getItem("accessToken");
        try {
            const res = await axios.get("http://localhost:8000/api/rigs/", {
                headers: {Authorization: `Bearer ${token}`},
            });

            const filtered = res.data.filter((rig) => {
                const mountedTypes = rig.components?.map(
                    (c) => c.component_type_name
                ) || [];
                return !mountedTypes.includes(componentTypeName);
            });

            setAvailableRigs(filtered);
        } catch (err) {
            console.error("❌ Error al obtener rigs:", err);
        }
    };

    const fetchOptions = async () => {
        const token = sessionStorage.getItem("accessToken");
        if (!token) return;
        try {
            const [types, models, sizes, statuses] = await Promise.all([
                axios.get("http://localhost:8000/api/component_types/", {
                    headers: {Authorization: `Bearer ${token}`},
                }),
                axios.get("http://localhost:8000/api/models/", {
                    headers: {Authorization: `Bearer ${token}`},
                }),
                axios.get("http://localhost:8000/api/sizes/", {
                    headers: {Authorization: `Bearer ${token}`},
                }),
                axios.get("http://localhost:8000/api/statuses/", {
                    headers: {Authorization: `Bearer ${token}`},
                }),
            ]);
            setOptions({
                componentTypes: types.data,
                models: models.data,
                sizes: sizes.data,
                statuses: statuses.data,
            });
        } catch (err) {
            console.error("❌ Error al cargar opciones:", err);
        }
    };

    useEffect(() => {
        fetchComponents();
        fetchOptions();
    }, []);

    const handleSave = async (data, mode) => {
        const token = sessionStorage.getItem("accessToken");
        const payload = {
            serial_number: data.serial_number,
            component_type: data.component_type,
            model: data.model,
            size: data.size,
            status: data.status,
            dom: data.dom,
            jumps: data.jumps,
            aad_jumps_on_mount: data.aad_jumps_on_mount,
        };
        try {
            if (mode === "edit") {
                await axios.put(`http://localhost:8000/api/components/${data.id}/`, payload, {
                    headers: {Authorization: `Bearer ${token}`},
                });
            } else {
                await axios.post("http://localhost:8000/api/components/", payload, {
                    headers: {Authorization: `Bearer ${token}`},
                });
            }
            await fetchComponents();
        } catch (err) {
            console.error("❌ Error al guardar componente:", err);
        }
    };

    const handleDelete = async (record) => {
        const token = sessionStorage.getItem("accessToken");
        if (!window.confirm(`¿Eliminar componente "${record.serial_number}"?`)) return;
        try {
            await axios.delete(`http://localhost:8000/api/components/${record.id}/`, {
                headers: {Authorization: `Bearer ${token}`},
            });
            setRows((prev) => prev.filter((r) => r.id !== record.id));
        } catch (err) {
            console.error("❌ Error al eliminar componente:", err);
        }
    };


    return (
        <div style={{color: "white", padding: "20px"}}>
            <h2>Lista de Componentes</h2>
            <CustomTable
                title="Components"
                columns={columns}
                rows={rows}
                entityType="component"
                onSave={handleSave}
                onDelete={handleDelete}
                extraOptions={options}
                componentProps={{onMount: handleMount, onUnmount: handleUnmount}}
                hideMountActions={true} // 👈 AQUÍ
            />

            <Dialog open={rigDetailsOpen} onClose={() => setRigDetailsOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Rig Details</DialogTitle>
                <DialogContent dividers sx={{backgroundColor: "#222", color: "white"}}>
                    {selectedRig ? (
                        <Box>
                            <Typography><strong>Rig Number:</strong> {selectedRig.rig_number}</Typography>
                            <Typography><strong>Canopy:</strong> {selectedRig.canopy_name}</Typography>
                            <Typography><strong>Container:</strong> {selectedRig.container_name}</Typography>
                            <Typography><strong>Reserve:</strong> {selectedRig.reserve_name}</Typography>
                            <Typography><strong>AAD:</strong> {selectedRig.aad_name}</Typography>
                        </Box>
                    ) : (
                        <Typography>Loading...</Typography>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={unmountDialogOpen} onClose={() => setUnmountDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Desmontar componente</DialogTitle>
                <DialogContent>
                    <Typography>Introduce el número actual de saltos del AAD:</Typography>
                    <TextField
                        type="number"
                        fullWidth
                        margin="normal"
                        value={aadJumpsInput}
                        onChange={(e) => setAadJumpsInput(e.target.value)}
                    />
                    <Box mt={2} display="flex" justifyContent="flex-end">
                        <Button onClick={() => setUnmountDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={confirmUnmount} variant="contained" style={{marginLeft: 8}}>
                            Confirmar
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

            <Dialog open={mountDialogOpen} onClose={() => setMountDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Montar componente</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="rig-select-label">Selecciona Rig</InputLabel>
                        <Select value={selectedRigId} onChange={(e) => setSelectedRigId(e.target.value)}>
                            {availableRigs.map((rig) => (
                                <MenuItem key={rig.id} value={rig.id}>
                                    {rig.rig_number}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="AAD Jumps"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={aadJumpsInput}
                        onChange={(e) => setAadJumpsInput(e.target.value)}
                    />
                    <Box mt={2} display="flex" justifyContent="flex-end">
                        <Button onClick={() => setMountDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={confirmMount} variant="contained" style={{marginLeft: 8}}>
                            Montar
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

            <Dialog
                open={Boolean(selectedComponent)}
                onClose={() => setSelectedComponent(null)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Detalle del Componente</DialogTitle>
                <DialogContent>
                    <RecordForm
                        data={selectedComponent}
                        mode="view"
                        entityType="component"
                        extraOptions={options}
                        onCancel={() => setSelectedComponent(null)}
                        hideMountActions={true} // 👈 aquí ocultas los botones
                    />
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default ComponentsContent;

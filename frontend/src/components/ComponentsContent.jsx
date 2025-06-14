import React, {useEffect, useState, useMemo} from "react";
import axios from "axios";
import CustomTable from "./Table";
import {getComponentColumns} from "../config/componentTableConfig";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Box,
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

    const handleMountedClick = async (rigId) => {
        console.log("📦 handleMountedClick llamado con rigId:", rigId);

        const token = sessionStorage.getItem("accessToken");
        try {
            const res = await axios.get(`http://localhost:8000/api/rigs/${rigId}/?summary=1`, {
                headers: {Authorization: `Bearer ${token}`},
            });

            console.log("📋 Rig recibido:", res.data);

            setSelectedRig(res.data);
            setRigDetailsOpen(true);
        } catch (err) {
            console.error("❌ Error al obtener rig:", err);
        }
    };

    const columns = useMemo(() => getComponentColumns(handleMountedClick), []);

    const fetchComponents = async () => {
        const token = sessionStorage.getItem("accessToken");

        try {
            const res = await axios.get("http://localhost:8000/api/components/", {
                headers: {Authorization: `Bearer ${token}`},
            });

            const formatted = res.data.map((c) => ({
                id: c.id,
                serial_number: c.serial_number,
                component_type: c.component_type,
                component_type_name: c.component_type_name,
                model: c.model,
                model_name: c.model_name,
                size: c.size,
                size_name: c.size_name,
                status: c.status,
                status_name: c.status_name,
                dom: c.dom,
                jumps: c.jumps,
                aad_jumps_on_mount: c.aad_jumps_on_mount,
                rigs: c.rigs || [],
                isMounted: c.rigs && c.rigs.length > 0, // 🔹 nuevo
            }));

            setRows(formatted);
        } catch (err) {
            console.error("❌ Error al obtener componentes:", err);
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
        </div>
    );
};

export default ComponentsContent;
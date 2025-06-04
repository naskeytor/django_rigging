import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import CustomTable from "../components/Table";
import RecordForm from "../components/RecordForm";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
} from "@mui/material";

const RigsContent = () => {
    const [rows, setRows] = useState([]);
    const [components, setComponents] = useState([]);
    const [options, setOptions] = useState({
        componentTypes: [],
        models: [],
        sizes: [],
        statuses: [],
    });

    const [selectedComponent, setSelectedComponent] = useState(null);
    const [componentMode, setComponentMode] = useState("view");

    const fetchRigs = async () => {
        const token = sessionStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const res = await axios.get("http://localhost:8000/api/rigs/", { headers });
            setRows(res.data);
        } catch (err) {
            console.error("❌ Error al recargar rigs:", err);
        }
    };

    useEffect(() => {
        const token = sessionStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };

        const fetchData = async () => {
            try {
                const [
                    rigsRes,
                    componentsRes,
                    typesRes,
                    modelsRes,
                    sizesRes,
                    statusesRes,
                ] = await Promise.all([
                    axios.get("http://localhost:8000/api/rigs/", { headers }),
                    axios.get("http://localhost:8000/api/components/", { headers }),
                    axios.get("http://localhost:8000/api/component_types/", { headers }),
                    axios.get("http://localhost:8000/api/models/", { headers }),
                    axios.get("http://localhost:8000/api/sizes/", { headers }),
                    axios.get("http://localhost:8000/api/statuses/", { headers }),
                ]);

                setRows(rigsRes.data);
                setComponents(componentsRes.data);
                setOptions({
                    componentTypes: typesRes.data,
                    models: modelsRes.data,
                    sizes: sizesRes.data,
                    statuses: statusesRes.data,
                });
            } catch (err) {
                console.error("❌ Error al cargar datos:", err);
            }
        };

        fetchData();
    }, []);

    const handleSave = async (data, mode) => {
        const token = sessionStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };

        const payload = {
            rig_number: data.rig_number,
            current_aad_jumps: data.current_aad_jumps,
            components: [data.canopy, data.container, data.reserve, data.aad].filter(Boolean),
        };

        if (mode === "create") {
            await axios.post("http://localhost:8000/api/rigs/", payload, { headers });
        } else {
            await axios.put(`http://localhost:8000/api/rigs/${data.id}/`, payload, { headers });
        }

        await fetchRigs();
    };

    const handleDelete = async (row) => {
        const token = sessionStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };

        await axios.delete(`http://localhost:8000/api/rigs/${row.id}/`, { headers });
        setRows((prev) => prev.filter((r) => r.id !== row.id));
    };

    const handleComponentClick = async (componentId) => {
        const token = sessionStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const res = await axios.get(`http://localhost:8000/api/components/${componentId}/`, { headers });
            setSelectedComponent(res.data);
            setComponentMode("view");
        } catch (err) {
            console.error("❌ Error al cargar componente:", err);
        }
    };

    const processedRows = useMemo(() => {
        return rows.map((rig) => {
            const getComponent = (type) => rig.components?.find(c => c.component_type_name === type);

            const canopy = getComponent("Canopy");
            const container = getComponent("Container");
            const reserve = getComponent("Reserve");
            const aad = getComponent("AAD");

            return {
                ...rig,
                canopy_serial: canopy?.serial_number || "—",
                canopy_id: canopy?.id || null,

                container_serial: container?.serial_number || "—",
                container_id: container?.id || null,

                reserve_serial: reserve?.serial_number || "—",
                reserve_id: reserve?.id || null,

                aad_serial: aad?.serial_number || "—",
                aad_id: aad?.id || null,
            };
        });
    }, [rows]);

    const renderComponentCell = (serialField, idField) => (params) => {
        const row = params.row;
        if (!row[idField]) return row[serialField];
        return (
            <Button
                variant="text"
                onClick={(e) => {
                    e.stopPropagation();
                    handleComponentClick(row[idField]);
                }}
            >
                {row[serialField]}
            </Button>
        );
    };

    const columns = [
        { field: "id", headerName: "ID", width: 70 },
        { field: "rig_number", headerName: "Rig Number", width: 150 },
        { field: "current_aad_jumps", headerName: "AAD Jumps", width: 150 },
        {
            field: "canopy_serial",
            headerName: "Canopy",
            width: 150,
            renderCell: renderComponentCell("canopy_serial", "canopy_id"),
        },
        {
            field: "container_serial",
            headerName: "Container",
            width: 150,
            renderCell: renderComponentCell("container_serial", "container_id"),
        },
        {
            field: "reserve_serial",
            headerName: "Reserve",
            width: 150,
            renderCell: renderComponentCell("reserve_serial", "reserve_id"),
        },
        {
            field: "aad_serial",
            headerName: "AAD",
            width: 150,
            renderCell: renderComponentCell("aad_serial", "aad_id"),
        },
    ];

    return (
        <>
            <CustomTable
                title="Rigs"
                entityType="rig"
                columns={columns}
                rows={processedRows}
                onSave={handleSave}
                onDelete={handleDelete}
                extraOptions={{ components }}
            />

            <Dialog open={Boolean(selectedComponent)} onClose={() => setSelectedComponent(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Detalle del Componente</DialogTitle>
                <DialogContent>
                    <RecordForm
                        data={selectedComponent}
                        mode={componentMode}
                        entityType="component"
                        extraOptions={options}
                        onCancel={() => setSelectedComponent(null)}
                        onEdit={() => setComponentMode("edit")}
                        onDelete={async () => {
                            const token = sessionStorage.getItem("accessToken");
                            const headers = { Authorization: `Bearer ${token}` };
                            try {
                                await axios.delete(`http://localhost:8000/api/components/${selectedComponent.id}/`, { headers });
                                await fetchRigs();
                            } catch (err) {
                                console.error("❌ Error al eliminar componente:", err);
                            }
                            setSelectedComponent(null);
                        }}
                        onSave={async (formData, mode) => {
                            const token = sessionStorage.getItem("accessToken");
                            const headers = { Authorization: `Bearer ${token}` };
                            if (mode === "edit") {
                                await axios.put(`http://localhost:8000/api/components/${formData.id}/`, formData, { headers });
                            }
                            await fetchRigs();
                            setSelectedComponent(null);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};

export default RigsContent;

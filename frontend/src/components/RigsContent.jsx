import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import CustomTable from "../components/Table";
import RecordForm from "../components/RecordForm";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
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
    const [rigInfo, setRigInfo] = useState(null);

    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [assignTarget, setAssignTarget] = useState(null);
    const [selectedAvailableComponentId, setSelectedAvailableComponentId] = useState("");

    const fetchRigs = async () => {
        const token = sessionStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const res = await axios.get("http://localhost:8000/api/rigs/?summary=1", { headers });
            setRows(res.data);
        } catch (err) {
            console.error("❌ Error al recargar rigs:", err);
        }
    };

    useEffect(() => {
        const token = sessionStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };

        const fetchAllComponents = async () => {
            const res = await axios.get("http://localhost:8000/api/components/", { headers });
            return res.data;
        };

        const fetchData = async () => {
            try {
                const [
                    rigsRes,
                    allComponents,
                    typesRes,
                    modelsRes,
                    sizesRes,
                    statusesRes,
                ] = await Promise.all([
                    axios.get("http://localhost:8000/api/rigs/", { headers }),
                    fetchAllComponents(),
                    axios.get("http://localhost:8000/api/component_types/", { headers }),
                    axios.get("http://localhost:8000/api/models/", { headers }),
                    axios.get("http://localhost:8000/api/sizes/", { headers }),
                    axios.get("http://localhost:8000/api/statuses/", { headers }),
                ]);

                setRows(rigsRes.data);
                setComponents(allComponents);

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

    const handleAssignClick = (rigId, componentType) => {
        setAssignTarget({ rigId, componentType });
        setSelectedAvailableComponentId("");
        setAssignDialogOpen(true);
    };

    const handleAssignConfirm = async () => {
        const token = sessionStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const rig = rows.find(r => r.id === assignTarget.rigId);
            const updatedComponents = [
                rig.components.find(c => c.component_type_name === "Canopy")?.id,
                rig.components.find(c => c.component_type_name === "Container")?.id,
                rig.components.find(c => c.component_type_name === "Reserve")?.id,
                rig.components.find(c => c.component_type_name === "AAD")?.id,
                selectedAvailableComponentId,
            ].filter(Boolean);

            await axios.put(`http://localhost:8000/api/rigs/${assignTarget.rigId}/`, {
                rig_number: rig.rig_number,
                current_aad_jumps: rig.current_aad_jumps,
                components: updatedComponents,
            }, { headers });

            await fetchRigs();
        } catch (err) {
            console.error("❌ Error al asignar componente:", err);
        } finally {
            setAssignDialogOpen(false);
        }
    };

    const renderComponentCell = (labelField, idField, typeName) => (params) => {
        const row = params.row;
        const label = row[labelField];
        const componentId = row[idField];

        if (!componentId) {
            return (
                <Button variant="text" onClick={() => handleAssignClick(row.id, typeName)}>
                    —
                </Button>
            );
        }

        const component = components.find(c => c.id === componentId);

        return (
            <Box>
                <Button
                    variant="text"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleComponentClick(componentId);
                    }}
                >
                    {label}
                </Button>
            </Box>
        );
    };

    const columns = [
        { field: "id", headerName: "ID", width: 70, sortable: false },
        {
            field: "rig_number",
            headerName: "Rig Number",
            width: 150,
            renderCell: (params) => (
                <Button
                    variant="text"
                    onClick={(e) => {
                        e.stopPropagation();
                        const rigId = params.row.id;
                        const token = sessionStorage.getItem("accessToken");
                        const headers = { Authorization: `Bearer ${token}` };
                        axios.get(`http://localhost:8000/api/rigs/${rigId}/`, { headers })
                            .then((res) => setRigInfo(res.data))
                            .catch((err) => console.error("❌ Error al cargar rig:", err));
                    }}
                >
                    {params.value}
                </Button>
            ),
        },
        { field: "current_aad_jumps", headerName: "AAD Jumps", width: 150 },
        {
            field: "canopy_label",
            headerName: "Canopy",
            width: 200,
            renderCell: renderComponentCell("canopy_label", "canopy_id", "Canopy"),
        },
        {
            field: "container_label",
            headerName: "Container",
            width: 180,
            renderCell: renderComponentCell("container_label", "container_id", "Container"),
        },
        {
            field: "reserve_label",
            headerName: "Reserve",
            width: 200,
            renderCell: renderComponentCell("reserve_label", "reserve_id", "Reserve"),
        },
        {
            field: "aad_label",
            headerName: "AAD",
            width: 180,
            renderCell: renderComponentCell("aad_label", "aad_id", "AAD"),
        },
    ];

    const availableComponents = components.filter(c =>
        c.component_type_name === assignTarget?.componentType && (!c.rigs || c.rigs.length === 0)
    );

    return (
        <>
            <CustomTable
                title="Rigs"
                entityType="rig"
                columns={columns}
                rows={useMemo(() => rows.map((rig) => {
                    const getComponent = (type) => rig.components?.find(c => c.component_type_name === type);

                    const canopy = getComponent("Canopy");
                    const container = getComponent("Container");
                    const reserve = getComponent("Reserve");
                    const aad = getComponent("AAD");

                    const formatLabel = (comp, includeSize = false) => {
                        if (!comp) return "—";
                        const model = comp.model_name || "";
                        const size = includeSize && comp.size_name ? ` - ${comp.size_name}` : "";
                        return `${model}${size}`;
                    };

                    return {
                        ...rig,
                        canopy_label: formatLabel(canopy, true),
                        canopy_id: canopy?.id || null,
                        container_label: formatLabel(container, false),
                        container_id: container?.id || null,
                        reserve_label: formatLabel(reserve, true),
                        reserve_id: reserve?.id || null,
                        aad_label: formatLabel(aad, false),
                        aad_id: aad?.id || null,
                    };
                }), [rows])}
                onSave={async (data, mode) => {
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
                }}
                onDelete={async (row) => {
                    const token = sessionStorage.getItem("accessToken");
                    const headers = { Authorization: `Bearer ${token}` };
                    await axios.delete(`http://localhost:8000/api/rigs/${row.id}/`, { headers });
                    setRows((prev) => prev.filter((r) => r.id !== row.id));
                }}
                extraOptions={{ components }}
                disableRowClick={true}
            />

            <Dialog open={Boolean(selectedComponent)} onClose={() => setSelectedComponent(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Detalle del Componente</DialogTitle>
                <DialogContent>
                    <RecordForm
                        data={selectedComponent}
                        mode={componentMode}
                        entityType="component"
                        extraOptions={options}
                        isMounted={selectedComponent?.rigs?.length > 0}
                        currentRigId={rigInfo?.id || null}
                        onCancel={() => setSelectedComponent(null)}
                        onEdit={() => setComponentMode("edit")}
                        onDelete={async () => {
                            const token = sessionStorage.getItem("accessToken");
                            const headers = { Authorization: `Bearer ${token}` };
                            await axios.delete(`http://localhost:8000/api/components/${selectedComponent.id}/`, { headers });
                            await fetchRigs();
                            setSelectedComponent(null);
                        }}
                        onSave={async (formData, mode) => {
                            const token = sessionStorage.getItem("accessToken");
                            const headers = { Authorization: `Bearer ${token}` };
                            await axios.put(`http://localhost:8000/api/components/${formData.id}/`, formData, { headers });
                            await fetchRigs();
                            setSelectedComponent(null);
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(assignDialogOpen)} onClose={() => setAssignDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Seleccionar {assignTarget?.componentType}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Componente Disponible</InputLabel>
                        <Select
                            value={selectedAvailableComponentId}
                            onChange={(e) => setSelectedAvailableComponentId(e.target.value)}
                        >
                            {availableComponents.map((comp) => (
                                <MenuItem key={comp.id} value={comp.id}>
                                    {comp.model_name} ({comp.serial_number})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Box mt={2} textAlign="right">
                        <Button onClick={() => setAssignDialogOpen(false)} style={{ marginRight: 8 }}>
                            Cancelar
                        </Button>
                        <Button variant="contained" onClick={handleAssignConfirm} disabled={!selectedAvailableComponentId}>
                            Confirmar
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(rigInfo)} onClose={() => setRigInfo(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Rig Details</DialogTitle>
                <DialogContent>
                    {rigInfo && (
                        <Box px={2} py={1}>
                            <Typography variant="body1"><strong>Rig Number:</strong> {rigInfo.rig_number}</Typography>
                            <Typography variant="body1"><strong>Canopy:</strong> {rigInfo.components?.find(c => c.component_type_name === "Canopy")?.model_name || "—"}</Typography>
                            <Typography variant="body1"><strong>Container:</strong> {rigInfo.components?.find(c => c.component_type_name === "Container")?.model_name || "—"}</Typography>
                            <Typography variant="body1"><strong>Reserve:</strong> {rigInfo.components?.find(c => c.component_type_name === "Reserve")?.model_name || "—"}</Typography>
                            <Typography variant="body1"><strong>AAD:</strong> {rigInfo.components?.find(c => c.component_type_name === "AAD")?.model_name || "—"}</Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default RigsContent;

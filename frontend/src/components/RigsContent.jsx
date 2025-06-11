import React, {useEffect, useState, useMemo} from "react";
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

    const fetchRigs = async () => {
        const token = sessionStorage.getItem("accessToken");
        const headers = {Authorization: `Bearer ${token}`};

        try {
            const res = await axios.get("http://localhost:8000/api/rigs/", {headers});
            setRows(res.data);
        } catch (err) {
            console.error("❌ Error al recargar rigs:", err);
        }
    };

    useEffect(() => {
        const token = sessionStorage.getItem("accessToken");
        const headers = {Authorization: `Bearer ${token}`};

        const fetchComponentsByType = async (type) => {
            const res = await axios.get(`http://localhost:8000/api/components/available/?type=${type}`, {headers});
            return res.data;
        };

        const fetchData = async () => {
            try {
                const [
                    rigsRes,
                    canopies,
                    containers,
                    reserves,
                    aads,
                    typesRes,
                    modelsRes,
                    sizesRes,
                    statusesRes,
                ] = await Promise.all([
                    axios.get("http://localhost:8000/api/rigs/", {headers}),
                    fetchComponentsByType("Canopy"),
                    fetchComponentsByType("Container"),
                    fetchComponentsByType("Reserve"),
                    fetchComponentsByType("AAD"),
                    axios.get("http://localhost:8000/api/component_types/", {headers}),
                    axios.get("http://localhost:8000/api/models/", {headers}),
                    axios.get("http://localhost:8000/api/sizes/", {headers}),
                    axios.get("http://localhost:8000/api/statuses/", {headers}),
                ]);

                setRows(rigsRes.data);

                const currentRigIds = rigsRes.data.map(r => r.id);

                const enrichWithMountData = (component) => {
                    const rigIds = component.rigs?.map(r => r.id) || [];
                    return currentRigIds.map(rigId => ({
                        ...component,
                        currentRigId: rigId,
                        isMounted: rigIds.includes(rigId)
                    }));
                };

                const enrichedComponents = [
                    ...canopies.flatMap(enrichWithMountData),
                    ...containers.flatMap(enrichWithMountData),
                    ...reserves.flatMap(enrichWithMountData),
                    ...aads.flatMap(enrichWithMountData),
                ];

                setComponents(enrichedComponents);

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
        const headers = {Authorization: `Bearer ${token}`};

        const payload = {
            rig_number: data.rig_number,
            current_aad_jumps: data.current_aad_jumps,
            components: [data.canopy, data.container, data.reserve, data.aad].filter(Boolean),
        };

        if (mode === "create") {
            await axios.post("http://localhost:8000/api/rigs/", payload, {headers});
        } else {
            await axios.put(`http://localhost:8000/api/rigs/${data.id}/`, payload, {headers});
        }

        await fetchRigs();
    };

    const handleDelete = async (row) => {
        const token = sessionStorage.getItem("accessToken");
        const headers = {Authorization: `Bearer ${token}`};

        await axios.delete(`http://localhost:8000/api/rigs/${row.id}/`, {headers});
        setRows((prev) => prev.filter((r) => r.id !== row.id));
    };

    const handleComponentClick = async (componentId) => {
        const token = sessionStorage.getItem("accessToken");
        const headers = {Authorization: `Bearer ${token}`};

        try {
            const res = await axios.get(`http://localhost:8000/api/components/${componentId}/`, {headers});
            setSelectedComponent(res.data);
            setComponentMode("view");
        } catch (err) {
            console.error("❌ Error al cargar componente:", err);
        }
    };

    const handleRigInfoClick = async (rigId) => {
        const token = sessionStorage.getItem("accessToken");
        const headers = {Authorization: `Bearer ${token}`};
        try {
            const res = await axios.get(`http://localhost:8000/api/rigs/${rigId}/`, {headers});
            setRigInfo(res.data);
        } catch (err) {
            console.error("❌ Error al cargar rig:", err);
        }
    };

    const processedRows = useMemo(() => {
        return rows.map((rig) => {
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
        });
    }, [rows]);

    const renderComponentCell = (labelField, idField) => (params) => {
        const row = params.row;
        const label = row[labelField];
        const componentId = row[idField];

        if (!componentId) return label;

        const component = components.find(c => c.id === componentId);
        const isMounted = component?.rigs?.length > 0;

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
                {component && (
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                            e.stopPropagation();
                            isMounted
                                ? console.log("Desmontar", componentId)
                                : console.log("Montar", componentId);
                        }}
                    >
                        {isMounted ? "Desmontar" : "Montar"}
                    </Button>
                )}
            </Box>
        );
    };


    const columns = [
        {field: "id", headerName: "ID", width: 70, sortable: false},
        {
            field: "rig_number",
            headerName: "Rig Number",
            width: 150,
            renderCell: (params) => (
                <Button
                    variant="text"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRigInfoClick(params.row.id);
                    }}
                >
                    {params.value}
                </Button>
            ),
        },
        {field: "current_aad_jumps", headerName: "AAD Jumps", width: 150},
        {
            field: "canopy_label",
            headerName: "Canopy",
            width: 200,
            renderCell: renderComponentCell("canopy_label", "canopy_id"),
        },
        {
            field: "container_label",
            headerName: "Container",
            width: 180,
            renderCell: renderComponentCell("container_label", "container_id"),
        },
        {
            field: "reserve_label",
            headerName: "Reserve",
            width: 200,
            renderCell: renderComponentCell("reserve_label", "reserve_id"),
        },
        {
            field: "aad_label",
            headerName: "AAD",
            width: 180,
            renderCell: renderComponentCell("aad_label", "aad_id"),
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
                extraOptions={{components}}
                disableRowClick={true}
            />

            <Dialog open={Boolean(selectedComponent)} onClose={() => setSelectedComponent(null)} maxWidth="sm"
                    fullWidth>
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
                            const headers = {Authorization: `Bearer ${token}`};
                            try {
                                await axios.delete(`http://localhost:8000/api/components/${selectedComponent.id}/`, {headers});
                                await fetchRigs();
                            } catch (err) {
                                console.error("❌ Error al eliminar componente:", err);
                            }
                            setSelectedComponent(null);
                        }}
                        onSave={async (formData, mode) => {
                            const token = sessionStorage.getItem("accessToken");
                            const headers = {Authorization: `Bearer ${token}`};
                            if (mode === "edit") {
                                await axios.put(`http://localhost:8000/api/components/${formData.id}/`, formData, {headers});
                            }
                            await fetchRigs();
                            setSelectedComponent(null);
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(rigInfo)} onClose={() => setRigInfo(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Rig Details</DialogTitle>
                <DialogContent>
                    {rigInfo && (
                        <Box px={2} py={1}>
                            <Typography variant="body1"><strong>Rig Number:</strong> {rigInfo.rig_number}</Typography>
                            <Typography
                                variant="body1"><strong>Canopy:</strong> {rigInfo.components?.find(c => c.component_type_name === "Canopy")?.model_name || "—"}
                            </Typography>
                            <Typography
                                variant="body1"><strong>Container:</strong> {rigInfo.components?.find(c => c.component_type_name === "Container")?.model_name || "—"}
                            </Typography>
                            <Typography
                                variant="body1"><strong>Reserve:</strong> {rigInfo.components?.find(c => c.component_type_name === "Reserve")?.model_name || "—"}
                            </Typography>
                            <Typography
                                variant="body1"><strong>AAD:</strong> {rigInfo.components?.find(c => c.component_type_name === "AAD")?.model_name || "—"}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default RigsContent;

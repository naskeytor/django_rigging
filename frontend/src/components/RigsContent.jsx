import React, {useEffect, useState, useMemo} from "react";
import axios from "axios";
import CustomTable from "../components/Table";

const RigsContent = () => {
    const [rows, setRows] = useState([]);
    const [components, setComponents] = useState([]);

    useEffect(() => {
        const token = sessionStorage.getItem("accessToken");
        const headers = {Authorization: `Bearer ${token}`};

        axios
            .get("http://localhost:8000/api/rigs/", {headers})
            .then((res) => {
                console.log("✅ Datos de rigs recibidos:", res.data);
                setRows(res.data);
            })
            .catch((err) => console.error("❌ Error al cargar rigs:", err));

        axios
            .get("http://localhost:8000/api/components/", {headers})
            .then((res) => setComponents(res.data))
            .catch((err) => console.error("❌ Error al cargar componentes:", err));
    }, []);

    const handleSave = async (data, mode) => {
        const token = sessionStorage.getItem("accessToken");
        const headers = {Authorization: `Bearer ${token}`};

        const payload = {
            rig_number: data.rig_number,
            current_aad_jumps: data.current_aad_jumps,
            components: [data.canopy, data.container, data.reserve, data.aad].filter(Boolean),
        };

        console.log("📦 Payload enviado:", payload);

        if (mode === "create") {
            await axios.post("http://localhost:8000/api/rigs/", payload, {headers});
        } else {
            await axios.put(`http://localhost:8000/api/rigs/${data.id}/`, payload, {headers});
        }

        const res = await axios.get("http://localhost:8000/api/rigs/", {headers});
        setRows(res.data);
    };

    const handleDelete = async (row) => {
        const token = sessionStorage.getItem("accessToken");
        const headers = {Authorization: `Bearer ${token}`};

        await axios.delete(`http://localhost:8000/api/rigs/${row.id}/`, {headers});
        setRows((prev) => prev.filter((r) => r.id !== row.id));
    };

    const processedRows = useMemo(() => {
        return rows.map((rig) => {
            const canopy = rig.components?.find(c => c.component_type_name === "Canopy")?.serial_number || "no-components";
            const container = rig.components?.find(c => c.component_type_name === "Container")?.serial_number || "no-components";
            const reserve = rig.components?.find(c => c.component_type_name === "Reserve")?.serial_number || "no-components";
            const aad = rig.components?.find(c => c.component_type_name === "AAD")?.serial_number || "no-components";

            return {
                ...rig,
                canopy_serial: canopy,
                container_serial: container,
                reserve_serial: reserve,
                aad_serial: aad,
            };
        });
    }, [rows]);

    const columns = [
        {field: "id", headerName: "ID", width: 70},
        {field: "rig_number", headerName: "Rig Number", width: 150},
        {field: "current_aad_jumps", headerName: "AAD Jumps", width: 150},
        {field: "canopy_serial", headerName: "Canopy", width: 150},
        {field: "container_serial", headerName: "Container", width: 150},
        {field: "reserve_serial", headerName: "Reserve", width: 150},
        {field: "aad_serial", headerName: "AAD", width: 150},
    ];

    return (
        <CustomTable
            title="Rigs"
            entityType="rig"
            columns={columns}
            rows={processedRows}
            onSave={handleSave}
            onDelete={handleDelete}
            extraOptions={{components}}
        />
    );
};

export default RigsContent;

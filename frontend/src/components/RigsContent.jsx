import React, {useEffect, useState} from "react";
import axios from "axios";
import CustomTable from "../components/Table";

const RigsContent = () => {
    const [rows, setRows] = useState([]);
    const [components, setComponents] = useState([]);

    useEffect(() => {
        const token = sessionStorage.getItem("accessToken");

        axios
            .get("http://localhost:8000/api/rigs/", {
                headers: {Authorization: `Bearer ${token}`},
            })
            .then((res) => setRows(res.data))
            .catch((err) => console.error("❌ Error al cargar rigs:", err));

        axios
            .get("http://localhost:8000/api/components/", {
                headers: {Authorization: `Bearer ${token}`},
            })
            .then((res) => setComponents(res.data))
            .catch((err) => console.error("❌ Error al cargar componentes:", err));
    }, []);

    const handleSave = async (data, mode) => {
        const token = sessionStorage.getItem("accessToken");

        const payload = {
            rig_number: data.rig_number,
            current_aad_jumps: data.current_aad_jumps,
            components: [
                data.canopy,
                data.container,
                data.reserve,
                data.aad,
            ].filter(Boolean),
        };

        console.log("📦 Payload enviado:", payload);

        if (mode === "create") {
            await axios.post("http://localhost:8000/api/rigs/", payload, {
                headers: {Authorization: `Bearer ${token}`},
            });
        } else {
            await axios.put(`http://localhost:8000/api/rigs/${data.id}/`, payload, {
                headers: {Authorization: `Bearer ${token}`},
            });
        }

        // 🔁 Refrescar tabla después de guardar
        const res = await axios.get("http://localhost:8000/api/rigs/", {
            headers: {Authorization: `Bearer ${token}`},
        });
        setRows(res.data);
    };

    const handleDelete = async (row) => {
        const token = sessionStorage.getItem("accessToken");
        await axios.delete(`http://localhost:8000/api/rigs/${row.id}/`, {
            headers: {Authorization: `Bearer ${token}`},
        });

        setRows((prev) => prev.filter((r) => r.id !== row.id));
    };

    const columns = [
        {field: "id", headerName: "ID", width: 70},
        {field: "rig_number", headerName: "Rig Number", width: 150},
        {field: "current_aad_jumps", headerName: "AAD Jumps", width: 150},
        {
            field: "canopy",
            headerName: "Canopy",
            width: 150,
            valueGetter: (params) =>
                params?.row?.components?.find(c => c.component_type_name === "Canopy")?.serial_number || "",
        },
        {
            field: "container",
            headerName: "Container",
            width: 150,
            valueGetter: (params) =>
                params?.row?.components?.find(c => c.component_type_name === "Container")?.serial_number || "",
        },
        {
            field: "reserve",
            headerName: "Reserve",
            width: 150,
            valueGetter: (params) =>
                params?.row?.components?.find(c => c.component_type_name === "Reserve")?.serial_number || "",
        },
        {
            field: "aad",
            headerName: "AAD",
            width: 150,
            valueGetter: (params) =>
                params?.row?.components?.find(c => c.component_type_name === "AAD")?.serial_number || "",
        },
    ];

    return (
        <CustomTable
            title="Rigs"
            entityType="rig"
            columns={columns}
            rows={rows}
            onSave={handleSave}
            onDelete={handleDelete}
            extraOptions={{components}}
        />
    );
};

export default RigsContent;
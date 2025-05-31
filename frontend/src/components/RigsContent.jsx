// src/components/RigsContent.jsx
import React, {useEffect, useState} from "react";
import axios from "axios";
import CustomTable from "./Table";
import {RIG_TABLE_COLUMNS} from "../config/rigTableConfig";

const RigsContent = () => {
    const [rows, setRows] = useState([]);

    const fetchRigs = async () => {
        const token = sessionStorage.getItem("accessToken");

        try {
            const res = await axios.get("http://localhost:8000/api/rigs/", {
                headers: {Authorization: `Bearer ${token}`},
            });

            const formatted = res.data.map((r) => {
                const canopy = r.components.find(c => c.component_type_name === "Canopy")?.model_name || "";
                const container = r.components.find(c => c.component_type_name === "Container")?.model_name || "";
                const reserve = r.components.find(c => c.component_type_name === "Reserve")?.model_name || "";
                const aad = r.components.find(c => c.component_type_name === "AAD")?.model_name || "";

                return {
                    id: r.id,
                    rig_number: r.rig_number,
                    current_aad_jumps: r.current_aad_jumps,
                    canopy,
                    container,
                    reserve,
                    aad,
                };
            });

            setRows(formatted);
        } catch (err) {
            console.error("❌ Error al obtener rigs:", err);
        }
    };

    useEffect(() => {
        fetchRigs();
    }, []);

    const handleSave = async (data, mode) => {
        const token = sessionStorage.getItem("accessToken");
        const payload = {
            rig_number: data.rig_number,
            current_aad_jumps: data.current_aad_jumps === ""
                ? 0
                : parseInt(data.current_aad_jumps),
        };

        console.log("🧪 Payload a enviar:", payload);

        try {
            if (mode === "edit") {
                await axios.put(`http://localhost:8000/api/rigs/${data.id}/`, payload, {
                    headers: {Authorization: `Bearer ${token}`},
                });
            } else {
                await axios.post("http://localhost:8000/api/rigs/", payload, {
                    headers: {Authorization: `Bearer ${token}`},
                });
            }
            await fetchRigs();
        } catch (err) {
            console.error("❌ Error al guardar rig:", err);
            if (err.response?.data) {
                console.error("🔍 Detalles del error:", err.response.data);
            }
        }
    };

    const handleDelete = async (record) => {
        const token = sessionStorage.getItem("accessToken");

        if (!window.confirm(`¿Eliminar rig "${record.rig_number}"?`)) return;

        try {
            await axios.delete(`http://localhost:8000/api/rigs/${record.id}/`, {
                headers: {Authorization: `Bearer ${token}`},
            });

            setRows((prev) => prev.filter((r) => r.id !== record.id));
        } catch (err) {
            console.error("❌ Error al eliminar rig:", err);
        }
    };

    return (
        <div style={{color: "white", padding: "20px"}}>
            <h2>Lista de Rigs</h2>
            <CustomTable
                title="Rigs"
                columns={RIG_TABLE_COLUMNS}
                rows={rows}
                entityType="rig"
                onSave={handleSave}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default RigsContent;

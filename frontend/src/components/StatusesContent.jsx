// components/StatusesContent.jsx
import React, {useEffect, useState} from "react";
import axios from "axios";
import CustomTable from "./Table";
import {STATUS_TABLE_COLUMNS} from "../config/statusTableConfig";

const StatusesContent = () => {
    const [statusRows, setStatusRows] = useState([]);

    const fetchStatuses = async () => {
        const token = sessionStorage.getItem("accessToken");
        if (!token) return;

        try {
            const response = await axios.get("http://localhost:8000/api/statuses/", {
                headers: {Authorization: `Bearer ${token}`},
            });

            const formatted = response.data.map((s) => ({
                id: s.id,
                status: s.status, // 👈 usa el campo correcto
            }));

            setStatusRows(formatted);
        } catch (err) {
            console.error("❌ Error al obtener estados:", err);
        }
    };

    useEffect(() => {
        fetchStatuses();
    }, []);

    const handleSave = async (data, mode) => {
        const token = sessionStorage.getItem("accessToken");
        if (!token) return;

        try {
            if (mode === "edit") {
                await axios.put(`http://localhost:8000/api/statuses/${data.id}/`, {
                    status: data.status, // 👈 usa "status"
                }, {
                    headers: {Authorization: `Bearer ${token}`},
                });
            } else {
                await axios.post("http://localhost:8000/api/statuses/", {
                    status: data.status, // 👈 usa "status"
                }, {
                    headers: {Authorization: `Bearer ${token}`},
                });
            }

            await fetchStatuses();
        } catch (err) {
            console.error("❌ Error al guardar estado:", err);
        }
    };

    const handleDelete = async (status) => {
        const token = sessionStorage.getItem("accessToken");

        if (!window.confirm(`¿Eliminar estado "${status.status}"?`)) return;

        try {
            await axios.delete(`http://localhost:8000/api/statuses/${status.id}/`, {
                headers: {Authorization: `Bearer ${token}`},
            });

            setStatusRows((prev) => prev.filter((s) => s.id !== status.id));
        } catch (err) {
            console.error("❌ Error al eliminar estado:", err);
        }
    };

    return (
        <div style={{color: "white", padding: "20px"}}>
            <h2>Lista de Estados</h2>

            <CustomTable
                title="Statuses"
                columns={STATUS_TABLE_COLUMNS}
                rows={statusRows}
                entityType="status"
                onSave={handleSave}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default StatusesContent;
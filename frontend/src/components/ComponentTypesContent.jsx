import React, {useEffect, useState} from "react";
import axios from "axios";
import CustomTable from "./Table";
import {COMPONENT_TYPE_TABLE_COLUMNS} from "../config/componentTypeTableConfig";
import axiosInstance from "../axiosInstance";

const ComponentTypesContent = () => {
    const [rows, setRows] = useState([]);

    const fetchComponentTypes = async () => {
        const token = sessionStorage.getItem("accessToken");

        if (!token) return;

        try {
            const res = await axiosInstance.get("api/component_types/", {
                headers: {Authorization: `Bearer ${token}`},
            });

            const formatted = res.data.map((item) => ({
                id: item.id,
                component_type: item.component_type,
            }));

            setRows(formatted);
        } catch (err) {
            console.error("❌ Error al obtener component types:", err);
        }
    };

    useEffect(() => {
        fetchComponentTypes();
    }, []);

    const handleSave = async (data, mode) => {
        const token = sessionStorage.getItem("accessToken");
        if (!token) return;

        try {
            if (mode === "edit") {
                await axiosInstance.put(`api/component_types/${data.id}/`, {
                    component_type: data.component_type,
                }, {headers: {Authorization: `Bearer ${token}`}});
            } else {
                await axiosInstance.post("api/component_types/", {
                    component_type: data.component_type,
                }, {headers: {Authorization: `Bearer ${token}`}});
            }

            await fetchComponentTypes();
        } catch (err) {
            console.error("❌ Error al guardar component type:", err);
        }
    };

    const handleDelete = async (record) => {
        const token = sessionStorage.getItem("accessToken");

        if (!window.confirm(`¿Eliminar tipo "${record.component_type}"?`)) return;

        try {
            await axiosInstance.delete(`api/component_types/${record.id}/`, {
                headers: {Authorization: `Bearer ${token}`},
            });

            setRows((prev) => prev.filter((r) => r.id !== record.id));
        } catch (err) {
            console.error("❌ Error al eliminar:", err);
        }
    };

    return (
        <div style={{color: "white", padding: "20px"}}>
            <h2>Lista de Tipos de Componente</h2>
            <CustomTable
                title="Component Types"
                columns={COMPONENT_TYPE_TABLE_COLUMNS}
                rows={rows}
                entityType="component_type"
                onSave={handleSave}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default ComponentTypesContent;
import React, {useEffect, useState} from "react";
import axiosInstance from "../axiosInstance"; // usa el nuevo axiosInstance
import CustomTable from "./Table";
import {SIZE_TABLE_COLUMNS} from "../config/sizeTableConfig";

const SizesContent = () => {
    const [sizeRows, setSizeRows] = useState([]);

    const fetchSizes = async () => {
        try {
            const response = await axiosInstance.get("/api/sizes/");

            const formatted = response.data.map((s) => ({
                id: s.id,
                size: s.size,
            }));

            setSizeRows(formatted);
        } catch (err) {
            console.error("❌ Error al obtener tamaños:", err);
        }
    };

    useEffect(() => {
        fetchSizes();
    }, []);

    const handleSave = async (data, mode) => {
        try {
            if (mode === "edit") {
                await axiosInstance.put(`/api/sizes/${data.id}/`, {
                    size: data.size,
                });
            } else {
                await axiosInstance.post("/api/sizes/", {
                    size: data.size,
                });
            }

            await fetchSizes();
        } catch (err) {
            console.error("❌ Error al guardar tamaño:", err);
        }
    };

    const handleDelete = async (size) => {
        if (!window.confirm(`¿Eliminar tamaño "${size.size}"?`)) return;

        try {
            await axiosInstance.delete(`/api/sizes/${size.id}/`);

            setSizeRows((prev) => prev.filter((s) => s.id !== size.id));
        } catch (err) {
            console.error("❌ Error al eliminar tamaño:", err);
        }
    };

    return (
        <div style={{color: "white", padding: "20px"}}>
            <h2>Lista de Tamaños</h2>
            <CustomTable
                title="Sizes"
                columns={SIZE_TABLE_COLUMNS}
                rows={sizeRows}
                entityType="size"
                onSave={handleSave}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default SizesContent;
import React, {useEffect, useState} from "react";
import axios from "axios";
import CustomTable from "./Table";
import {SIZE_TABLE_COLUMNS} from "../config/sizeTableConfig";

const SizesContent = () => {
    const [sizeRows, setSizeRows] = useState([]);

    const fetchSizes = async () => {
        const token = sessionStorage.getItem("accessToken");

        if (!token) {
            console.error("❌ No hay token");
            return;
        }

        try {
            const response = await axios.get("http://localhost:8000/api/sizes/", {
                headers: {Authorization: `Bearer ${token}`},
            });

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
        const token = sessionStorage.getItem("accessToken");

        try {
            if (mode === "edit") {
                await axios.put(`http://localhost:8000/api/sizes/${data.id}/`, {
                    size: data.size,
                }, {
                    headers: {Authorization: `Bearer ${token}`},
                });
            } else {
                await axios.post("http://localhost:8000/api/sizes/", {
                    size: data.size,
                }, {
                    headers: {Authorization: `Bearer ${token}`},
                });
            }

            await fetchSizes();
        } catch (err) {
            console.error("❌ Error al guardar tamaño:", err);
        }
    };

    const handleDelete = async (size) => {
        const token = sessionStorage.getItem("accessToken");

        if (!window.confirm(`¿Eliminar tamaño "${size.size}"?`)) return;

        try {
            await axios.delete(`http://localhost:8000/api/sizes/${size.id}/`, {
                headers: {Authorization: `Bearer ${token}`},
            });

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

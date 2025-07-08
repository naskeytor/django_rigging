import React, {useEffect, useState} from "react";
import axios from "axios";
import CustomTable from "./Table";
import {MODEL_TABLE_COLUMNS} from "../config/modelTableConfig";

const ModelsContent = () => {
    const [modelRows, setModelRows] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);

    const fetchModels = async () => {
        const token = sessionStorage.getItem("accessToken");

        if (!token) {
            console.error("❌ No hay token");
            return;
        }

        try {
            const response = await axios.get("http://localhost:8000/api/models/", {
                headers: {Authorization: `Bearer ${token}`},
            });

            console.log("📦 Models response:", response.data);

            const formatted = response.data.map((m) => ({
                id: m.id,
                name: m.name,
                manufacturer: m.manufacturer,           // para el formulario (dropdown)
                manufacturer_name: m.manufacturer_name, // para mostrar en la tabla
            }));

            setModelRows(formatted);
        } catch (err) {
            console.error("❌ Error al obtener modelos:", err);
        }
    };

    // 🔻 Mueve fetchManufacturers aquí, fuera de useEffect
    const fetchManufacturers = async () => {
        const token = sessionStorage.getItem("accessToken");

        if (!token) {
            console.error("❌ No hay token");
            return;
        }

        try {
            const response = await axios.get("http://localhost:8000/api/manufacturers/", {
                headers: {Authorization: `Bearer ${token}`},
            });

            console.log("📦 Manufacturers response:", response.data);
            setManufacturers(response.data);
        } catch (err) {
            console.error("❌ Error al obtener manufacturers:", err);
        }
    };

    useEffect(() => {
        const fetchAll = async () => {
            await fetchManufacturers();
            await fetchModels();
        };

        fetchAll();
    }, []);

    const handleSave = async (data, mode) => {
        const token = sessionStorage.getItem("accessToken");

        try {
            if (mode === "edit") {
                await axios.put(
                    `http://localhost:8000/api/models/${data.id}/`,
                    {
                        name: data.name,
                        manufacturer: data.manufacturer,
                    },
                    {headers: {Authorization: `Bearer ${token}`}}
                );
            } else {
                await axios.post(
                    "http://localhost:8000/api/models/",
                    {
                        name: data.name,
                        manufacturer: data.manufacturer,
                    },
                    {headers: {Authorization: `Bearer ${token}`}}
                );
            }

            await fetchModels();
        } catch (err) {
            console.error("❌ Error al guardar modelo:", err);
            console.log("🔴 Response data:", err.response?.data); // 👈 imprime el mensaje exacto del backend
        }
    };

    const handleDelete = async (model) => {
        const token = sessionStorage.getItem("accessToken");

        if (!window.confirm(`¿Eliminar modelo "${model.name}"?`)) return;

        try {
            await axios.delete(`http://localhost:8000/api/models/${model.id}/`, {
                headers: {Authorization: `Bearer ${token}`},
            });

            setModelRows((prev) => prev.filter((m) => m.id !== model.id));
        } catch (err) {
            console.error("❌ Error al eliminar modelo:", err);
        }
    };

    return (
        <div style={{color: "white", padding: "20px"}}>
            <h2>Lista de Modelos</h2>

            <CustomTable
                title="Models"
                columns={MODEL_TABLE_COLUMNS}
                rows={modelRows}
                entityType="model"
                onSave={handleSave}
                onDelete={handleDelete}
                extraOptions={{manufacturers}} // 👈 ahora manufacturers está definido correctamente
            />
        </div>
    );
};

export default ModelsContent;
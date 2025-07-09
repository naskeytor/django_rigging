import React, {useEffect, useState} from "react";
import axios from "axios";
import CustomTable from "./Table";
import {MANUFACTURER_TABLE_COLUMNS} from "../config/manufacturerTableConfig";
import axiosInstance from "../axiosInstance";

const ManufacturersContent = () => {
    const [manufacturerRows, setManufacturerRows] = useState([]);

    useEffect(() => {
        const token = sessionStorage.getItem("accessToken");

        if (!token) {
            console.error("❌ No hay token, la solicitud será rechazada.");
            return;
        }

        axiosInstance
            .get("api/manufacturers/", {
                headers: {Authorization: `Bearer ${token}`},
            })
            .then((response) => {
                console.log("📦 Datos de manufacturers:", response.data);

                const formatted = response.data.map((m) => ({
                    id: m.id,
                    manufacturer: m.manufacturer,
                }));

                setManufacturerRows(formatted);
            })
            .catch((error) => {
                console.error("❌ Error al obtener fabricantes:", error);
            });
    }, []);

    const handleSave = async (data, mode) => {
        const token = sessionStorage.getItem("accessToken");

        try {
            if (mode === "edit") {
                await axiosInstance.put(
                    `api/manufacturers/${data.id}/`,
                    {manufacturer: data.manufacturer},
                    {
                        headers: {Authorization: `Bearer ${token}`},
                    }
                );
                console.log("✏️ Fabricante actualizado");
            } else {
                await axiosInstance.post(
                    "api/manufacturers/",
                    {manufacturer: data.manufacturer},
                    {
                        headers: {Authorization: `Bearer ${token}`},
                    }
                );
                console.log("🆕 Fabricante creado");
            }

            // Actualiza la tabla después de guardar
            const response = await axiosInstance.get("api/manufacturers/", {
                headers: {Authorization: `Bearer ${token}`},
            });

            const updated = response.data.map((m) => ({
                id: m.id,
                manufacturer: m.manufacturer,
            }));

            setManufacturerRows(updated);
        } catch (err) {
            console.error("❌ Error al guardar fabricante:", err);
        }
    };

    const handleDelete = async (manufacturer) => {
        const token = sessionStorage.getItem("accessToken");

        if (!window.confirm(`¿Eliminar fabricante "${manufacturer.manufacturer}"?`)) return;

        try {
            await axiosInstance.delete(`api/manufacturers/${manufacturer.id}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setManufacturerRows((prev) =>
                prev.filter((m) => m.id !== manufacturer.id)
            );

            console.log("🗑️ Fabricante eliminado");
        } catch (err) {
            console.error("❌ Error al eliminar fabricante:", err);
        }
    };

    return (
        <div style={{color: "white", padding: "20px"}}>
            <h2>Lista de Fabricantes</h2>

            <CustomTable
                title="Manufacturers"
                columns={MANUFACTURER_TABLE_COLUMNS}
                rows={manufacturerRows}
                entityType="manufacturer"
                onSave={handleSave}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default ManufacturersContent;

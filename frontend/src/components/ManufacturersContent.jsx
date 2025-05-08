// src/components/ManufacturersContent.jsx
import React, {useEffect, useState} from "react";
import CustomTable from "./Table";
import {MANUFACTURER_TABLE_COLUMNS} from "../config/manufacturerTableConfig";

const ManufacturersContent = () => {
    const [manufacturerRows, setManufacturerRows] = useState([]);

    useEffect(() => {
        // Simulación: tabla vacía para comenzar
        console.log("📦 ManufacturersContent montado");
        setManufacturerRows([]);
    }, []);

    const handleSave = async (data, mode) => {
        console.log("💾 Guardar manufacturer:", data, mode);
        // Puedes implementar lógica real luego
    };

    const handleDelete = async (manufacturer) => {
        console.log("🗑️ Eliminar manufacturer:", manufacturer);
        // Puedes implementar lógica real luego
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

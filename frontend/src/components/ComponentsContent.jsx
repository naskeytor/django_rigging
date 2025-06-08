// src/components/ComponentsContent.jsx
import React, {useEffect, useState} from "react";
import axios from "axios";
import CustomTable from "./Table";
import {COMPONENT_TABLE_COLUMNS} from "../config/componentTableConfig";

const ComponentsContent = () => {
    const [rows, setRows] = useState([]);
    const [options, setOptions] = useState({
        componentTypes: [],
        models: [],
        sizes: [],
        statuses: [],
    });

    const fetchComponents = async () => {
        const token = sessionStorage.getItem("accessToken");

        try {
            const res = await axios.get("http://localhost:8000/api/components/", {
                headers: {Authorization: `Bearer ${token}`},
            });

            console.log("🧪 Componentes recibidos del backend:", res.data);

            const formatted = res.data.map((c) => ({
                id: c.id,
                serial_number: c.serial_number,
                component_type: c.component_type,
                component_type_name: c.component_type_name,
                model: c.model,
                model_name: c.model_name,
                size: c.size,
                size_name: c.size_name,
                status: c.status,
                status_name: c.status_name,
                dom: c.dom,
                jumps: c.jumps,
                aad_jumps_on_mount: c.aad_jumps_on_mount,
                rigs: c.rigs || [],  // ✅ este es el correcto
                // ❌ NO pongas mounted
            }));

            console.table(formatted);

            setRows(formatted);
        } catch (err) {
            console.error("❌ Error al obtener componentes:", err);
        }
    };

    const fetchOptions = async () => {
        const token = sessionStorage.getItem("accessToken");
        if (!token) return;

        try {
            const [types, models, sizes, statuses] = await Promise.all([
                axios.get("http://localhost:8000/api/component_types/", {headers: {Authorization: `Bearer ${token}`}}),
                axios.get("http://localhost:8000/api/models/", {headers: {Authorization: `Bearer ${token}`}}),
                axios.get("http://localhost:8000/api/sizes/", {headers: {Authorization: `Bearer ${token}`}}),
                axios.get("http://localhost:8000/api/statuses/", {headers: {Authorization: `Bearer ${token}`}}),
            ]);

            setOptions({
                componentTypes: types.data,
                models: models.data,
                sizes: sizes.data,
                statuses: statuses.data,
            });
        } catch (err) {
            console.error("❌ Error al cargar opciones:", err);
        }
    };

    useEffect(() => {
        fetchComponents();
        fetchOptions();
    }, []);

    const handleSave = async (data, mode) => {
        const token = sessionStorage.getItem("accessToken");

        const payload = {
            serial_number: data.serial_number,
            component_type: data.component_type,
            model: data.model,
            size: data.size,
            status: data.status,
            dom: data.dom,
            jumps: data.jumps,
            aad_jumps_on_mount: data.aad_jumps_on_mount,
        };

        try {
            if (mode === "edit") {
                await axios.put(`http://localhost:8000/api/components/${data.id}/`, payload, {
                    headers: {Authorization: `Bearer ${token}`},
                });
            } else {
                await axios.post("http://localhost:8000/api/components/", payload, {
                    headers: {Authorization: `Bearer ${token}`},
                });
            }

            await fetchComponents();
        } catch (err) {
            console.error("❌ Error al guardar componente:", err);
        }
    };

    const handleDelete = async (record) => {
        const token = sessionStorage.getItem("accessToken");

        if (!window.confirm(`¿Eliminar componente "${record.serial_number}"?`)) return;

        try {
            await axios.delete(`http://localhost:8000/api/components/${record.id}/`, {
                headers: {Authorization: `Bearer ${token}`},
            });

            setRows((prev) => prev.filter((r) => r.id !== record.id));
        } catch (err) {
            console.error("❌ Error al eliminar componente:", err);
        }
    };

    return (
        <div style={{color: "white", padding: "20px"}}>
            <h2>Lista de Componentes</h2>
            <CustomTable
                title="Components"
                columns={COMPONENT_TABLE_COLUMNS}
                rows={rows}
                entityType="component"
                onSave={handleSave}
                onDelete={handleDelete}
                extraOptions={options}
            />
        </div>
    );
};

export default ComponentsContent;

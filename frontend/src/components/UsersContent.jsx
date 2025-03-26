import React, {useState, useEffect} from "react";
import axios from "axios";
import CustomTable from "../components/Table";
import {USER_TABLE_COLUMNS} from "../config/userTableConfig";
import RecordForm from "../components/RecordForm";
import {Dialog, DialogContent} from "@mui/material";

const UsersContent = () => {
    const [userRows, setUserRows] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);

    useEffect(() => {
        const token = sessionStorage.getItem("accessToken");

        if (!token) {
            console.error("❌ No hay token, la solicitud será rechazada.");
            return;
        }

        axios
            .get("http://localhost:8000/api/users/", {
                headers: {Authorization: `Bearer ${token}`},
            })
            .then((response) => {
                const formattedUsers = response.data.map((user, index) => ({
                    id: user.id || index + 1,
                    name: user.username,
                    email: user.email,
                    group: user.group_name || "N/A",
                }));

                setUserRows(formattedUsers);
            })
            .catch((error) => {
                console.error("❌ Error al obtener usuarios:", error);
            });
    }, []);

    const handleDelete = async (user) => {
        const token = sessionStorage.getItem("accessToken");

        if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${user.name}?`)) return;

        try {
            await axios.delete(`http://localhost:8000/api/users/${user.id}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("🗑️ Usuario eliminado:", user.id);

            // 🔄 Actualizar la tabla quitando el usuario eliminado
            setUserRows((prev) => prev.filter((u) => u.id !== user.id));
        } catch (err) {
            console.error("❌ Error al eliminar usuario:", err);
        }
    };

    const handleSave = async (data, mode) => {
        const token = sessionStorage.getItem("accessToken");

        try {
            if (mode === "edit") {
                const response = await axios.put(
                    `http://localhost:8000/api/users/${data.id}/`,
                    {
                        username: data.name,
                        email: data.email,
                        password: data.password
                    },
                    {headers: {Authorization: `Bearer ${token}`}}
                );

                setUserRows((prev) =>
                    prev.map((u) => (u.id === data.id ? {...u, ...data} : u))
                );
                console.log("✅ Usuario editado");
            } else {
                const response = await axios.post(
                    "http://localhost:8000/api/users/",
                    {
                        username: data.name,
                        email: data.email,
                        password: "default123", // puedes usar un campo real o autogenerado
                    },
                    {headers: {Authorization: `Bearer ${token}`}}
                );

                const newUser = {
                    id: response.data.id,
                    name: response.data.username,
                    email: response.data.email,
                    group: response.data.group || "N/A",
                };

                setUserRows((prev) => [...prev, newUser]);
                console.log("✅ Usuario creado");
            }
        } catch (err) {
            console.error("❌ Error en guardar:", err);
        }
    };


    return (
        <div style={{color: "white", padding: "20px"}}>
            <h2>Lista de Usuarios</h2>

            <CustomTable
                title="Usuarios"
                columns={USER_TABLE_COLUMNS}
                rows={userRows}
                entityType="user"
                onSave={handleSave}
                onDelete={handleDelete}
            />


        </div>
    );
};

export default UsersContent;

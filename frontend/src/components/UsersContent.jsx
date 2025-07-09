import React, {useState, useEffect} from "react";
import axios from "axios";
import CustomTable from "../components/Table";
import {USER_TABLE_COLUMNS} from "../config/userTableConfig";
import axiosInstance from "../axiosInstance";

const UsersContent = () => {
    const [userRows, setUserRows] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);

    useEffect(() => {
        const token = sessionStorage.getItem("accessToken");

        if (!token) {
            console.error("❌ No hay token, la solicitud será rechazada.");
            return;
        }

        axiosInstance
            .get("api/users/", {
                headers: {Authorization: `Bearer ${token}`},
            })
            .then((response) => {
                const formattedUsers = response.data.map((user, index) => ({
                    id: user.id || index + 1,
                    name: user.username,
                    email: user.email,
                    group: user.group_names && user.group_names.length > 0 ? user.group_names[0] : "",
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
            await axiosInstance.delete(`api/users/${user.id}/`, {
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
                const response = await axiosInstance.put(
                    `api/users/${data.id}/`,
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
                // 🔹 Crear usuario
                const createResponse = await axiosInstance.post(
                    "api/users/",
                    {
                        username: data.name,
                        email: data.email,
                        password: "default123",
                    },
                    {headers: {Authorization: `Bearer ${token}`}}
                );

                const newUserId = createResponse.data.id;
                console.log("🆕 Usuario creado, ID:", newUserId);

                // 🔹 Hacer GET al usuario recién creado para obtener su grupo
                const getResponse = await axiosInstance.get(
                    `api/users/${newUserId}/`,
                    {headers: {Authorization: `Bearer ${token}`}}
                );

                console.log("📦 Usuario obtenido tras crearlo:", getResponse.data);

                const user = getResponse.data;

                const formattedUser = {
                    id: user.id,
                    name: user.username,
                    email: user.email,
                    group: user.group_names?.[0] || "N/A",
                };

                console.log("✅ Formatted user:", formattedUser);

                setUserRows((prev) => [...prev, formattedUser]);
            }
        } catch (err) {
            console.error("❌ Error en guardar usuario:", err);
            console.log("🔴 Response data:", err.response?.data);
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

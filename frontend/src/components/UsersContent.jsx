import React, {useState, useEffect} from "react";
import axios from "axios";
import CustomTable from "../components/Table";
import {USER_TABLE_COLUMNS} from "../config/userTableConfig";

const UsersContent = () => {
    const [userRows, setUserRows] = useState([]);

    useEffect(() => {
        const token = sessionStorage.getItem("accessToken");
        console.log("🔍 Token de sesión:", token);

        if (!token) {
            console.error("❌ No hay token, la solicitud será rechazada.");
            return;
        }

        console.log("⏳ Cargando usuarios desde el backend...");

        axios.get("http://localhost:8000/api/users/", {
            headers: {Authorization: `Bearer ${token}`}
        })
            .then(response => {
                console.log("✅ Usuarios recibidos en frontend:", response.data);

                // 🔹 Verificar la estructura de los datos antes de setearlos
                if (!Array.isArray(response.data)) {
                    console.error("❌ Error: La API no devolvió un array", response.data);
                    return;
                }

                const formattedUsers = response.data.map((user, index) => ({
                    id: user.id || index + 1,  // Si no hay ID, generamos uno
                    name: user.username,
                    email: user.email,
                    group: user.group_name || "N/A"  // Asegurar que el grupo exista
                }));

                console.log("📌 Usuarios formateados para la tabla:", formattedUsers);
                setUserRows(formattedUsers);
            })
            .catch(error => {
                console.error("❌ Error al obtener usuarios:", error);
                if (error.response) {
                    console.error("🔴 Código de estado:", error.response.status);
                    console.error("🔴 Respuesta del servidor:", error.response.data);
                }
            });
    }, []);

    return (
        <div style={{color: "white", padding: "20px"}}>
            <h2>Lista de Usuarios</h2>
            <CustomTable title="Usuarios" columns={USER_TABLE_COLUMNS} rows={userRows}/>
        </div>
    );
};

export default UsersContent;

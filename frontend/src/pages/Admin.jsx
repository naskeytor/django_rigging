import React from "react";
import DashboardLayoutAccount from "../components/DashboardLayout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People"; // ⬅️ Importamos el icono de usuarios

export const ADMIN_NAVIGATION = [
    { segment: "dashboard", title: "Dashboard", icon: <DashboardIcon /> },
    { segment: "users", title: "Users", icon: <PeopleIcon /> }, // ⬅️ Agregamos la pestaña de usuarios
];

const Admin = () => {
    return <DashboardLayoutAccount navigation={ADMIN_NAVIGATION} />; // ⬅️ Pasamos correctamente `navigation`
};

export default Admin;
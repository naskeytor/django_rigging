import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";

// 🔹 Navegación para Admin
export const ADMIN_NAVIGATION = [
    { segment: "dashboard", title: "Dashboard", icon: <DashboardIcon /> },
    { segment: "users", title: "Users", icon: <PeopleIcon /> },
];

// 🔹 Navegación para Rigger
export const RIGGER_NAVIGATION = [
    { segment: "dashboard", title: "Dashboard", icon: <DashboardIcon /> },
    { segment: "tasks", title: "Tasks", icon: <PeopleIcon /> },
];

// 🔹 Navegación para User
export const USER_NAVIGATION = [
    { segment: "dashboard", title: "Dashboard", icon: <DashboardIcon /> },
    { segment: "profile", title: "Profile", icon: <PeopleIcon /> },
];
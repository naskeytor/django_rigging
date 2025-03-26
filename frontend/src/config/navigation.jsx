import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import BuildIcon from "@mui/icons-material/Build";
import InventoryIcon from "@mui/icons-material/Inventory";
import StraightenIcon from "@mui/icons-material/Straighten";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SettingsIcon from "@mui/icons-material/Settings";

// 🔹 Navegación para Admin
export const ADMIN_NAVIGATION = [
    {
        segment: "dashboard",
        title: "Dashboard",
        icon: <BuildIcon/>,
    },
    {
        segment: "users",
        title: "Users",
        icon: <PeopleIcon/>,
    },
    {
        segment: "settings",
        title: "Settings",
        icon: <SettingsIcon/>,
        children: [
            {
                segment: "manufacturers",
                title: "Manufacturers",
                icon: <BuildIcon/>,
            },
            {
                segment: "models",
                title: "Models",
                icon: <InventoryIcon/>,
            },
            {
                segment: "sizes",
                title: "Sizes",
                icon: <StraightenIcon/>,
            },
            {
                segment: "statuses",
                title: "Statuses",
                icon: <CheckCircleIcon/>,
            },
        ],
    },
];

// 🔹 Navegación para Rigger
export const RIGGER_NAVIGATION = [
    {segment: "dashboard", title: "Dashboard", icon: <DashboardIcon/>},
    {segment: "tasks", title: "Tasks", icon: <PeopleIcon/>},
];

// 🔹 Navegación para User
export const USER_NAVIGATION = [
    {segment: "dashboard", title: "Dashboard", icon: <DashboardIcon/>},
];
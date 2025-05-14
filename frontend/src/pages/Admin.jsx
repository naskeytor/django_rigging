import React, {useState} from "react";
import DashboardLayoutAccount from "../components/DashboardLayout";
import {ADMIN_NAVIGATION} from "../config/navigation";
import UsersContent from "../components/UsersContent";
import ManufacturersContent from "../components/ManufacturersContent";
import ModelsContent from "../components/ModelsContent.jsx";
import SizesContent from "../components/SizesContent";
import StatusesContent from "../components/StatusesContent.jsx";

const Admin = () => {
    const [activeTab, setActiveTab] = useState("dashboard");

    console.log("🔍 Active Tab en Admin.jsx:", activeTab);

    return (
        <DashboardLayoutAccount
            navigation={ADMIN_NAVIGATION}
            onTabChange={setActiveTab}
        >
            {activeTab === "users" ? (
                <UsersContent/>
            ) : activeTab === "settings/manufacturers" ? (
                <ManufacturersContent/>
            ) : activeTab === "settings/models" ? (
                <ModelsContent/>
            ) : activeTab === "settings/sizes" ? (
                <SizesContent/>
            ) : activeTab === "settings/statuses" ? (
                <StatusesContent/>
            ) : (
                <h2 style={{color: "white"}}>
                    Bienvenido al Panel de Administración
                </h2>
            )}
        </DashboardLayoutAccount>
    );
};

export default Admin;
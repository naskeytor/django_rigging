import React, { useState } from "react";
import DashboardLayoutAccount from "../components/DashboardLayout";
import { ADMIN_NAVIGATION } from "../config/navigation";
import UsersContent from "../components/UsersContent";

const Admin = () => {
    const [activeTab, setActiveTab] = useState("dashboard");

    console.log("🔍 Active Tab en Admin.jsx:", activeTab);

    return (
        <DashboardLayoutAccount navigation={ADMIN_NAVIGATION} onTabChange={setActiveTab}>
            {activeTab === "users" ? (
                <>
                    <h2 style={{ color: "white" }}>📌 Cargando UsersContent...</h2>
                    <UsersContent />
                </>
            ) : (
                <h2 style={{ color: "white" }}>Bienvenido al Panel de Administración</h2>
            )}
        </DashboardLayoutAccount>
    );
};

export default Admin;

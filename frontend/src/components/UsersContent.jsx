import React from "react";
import CustomTable from "../components/Table";
import { USER_TABLE_COLUMNS, USER_TABLE_ROWS } from "../config/userTableConfig";

const UsersContent = () => {
    console.log("✅ Renderizando UsersContent con la tabla...");

    return (
        <div style={{ color: "white", padding: "20px" }}>
            <h2>Lista de Usuarios</h2>
            <CustomTable title="Usuarios" columns={USER_TABLE_COLUMNS} rows={USER_TABLE_ROWS} />
        </div>
    );
};

export default UsersContent;

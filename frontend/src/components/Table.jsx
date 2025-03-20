import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, Paper } from "@mui/material";

const CustomTable = ({ title, columns, rows }) => {
    console.log("📌 Datos que llegan a la tabla:", rows);
    return (
        <Paper elevation={3} sx={{ padding: 2, bgcolor: "background.default" }}>
            <Typography variant="h6" sx={{ mb: 2, color: "white" }}>
                {title}
            </Typography>
            <Box sx={{ height: 400, width: "100%" }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSizeOptions={[5, 10, 20, 100]} // ✅ Aseguramos que `100` esté aquí
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } }, // ✅ Configura el tamaño inicial
                    }}
                    checkboxSelection
                    disableSelectionOnClick
                    autoHeight
                />
            </Box>
        </Paper>
    );
};

export default CustomTable;
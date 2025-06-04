// src/components/Table.jsx
import * as React from "react";
import {DataGrid} from "@mui/x-data-grid";
import {
    Box,
    Typography,
    Paper,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Button,
} from "@mui/material";
import RecordForm from "./RecordForm";
import CloseIcon from "@mui/icons-material/Close";

const CustomTable = ({title, columns, rows, entityType, onSave, onDelete, extraOptions}) => {
    const [selectedRow, setSelectedRow] = React.useState(null);
    const [mode, setMode] = React.useState("view");

    const handleRowClick = (params) => {
        console.log("🧪 Fila seleccionada:", params.row);
        setSelectedRow(params.row);
        setMode("view");
    };

    const handleClose = () => setSelectedRow(null);
    const handleEdit = () => setMode("edit");

    const handleInternalSave = async (formData) => {
        if (onSave) {
            await onSave(formData, mode);
        }
        setSelectedRow(null);
    };

    const handleInternalDelete = async () => {
        if (onDelete) {
            await onDelete(selectedRow);
        }
        setSelectedRow(null);
    };

    console.log("📋 Filas (rows):", rows);
    console.log("🧱 Columnas (columns):", columns);

    return (
        <Paper elevation={3} sx={{padding: 2, bgcolor: "background.default"}}>
            <Typography variant="h6" sx={{mb: 2, color: "white"}}>
                {title}
            </Typography>

            <Box sx={{height: 400, width: "100%"}}>
                <Button
                    variant="contained"
                    sx={{mb: 2}}
                    onClick={() => {
                        setSelectedRow({});
                        setMode("create");
                    }}
                >
                    ➕ Nuevo
                </Button>

                <DataGrid
                    getRowId={(row) => row.id}
                    rows={rows}
                    columns={columns}
                    pageSizeOptions={[5, 10, 20, 100]}
                    initialState={{pagination: {paginationModel: {pageSize: 10}}}}
                    disableRowSelectionOnClick
                    onRowClick={handleRowClick}
                    autoHeight
                />
            </Box>

            <Dialog open={Boolean(selectedRow)} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Detalle del Registro
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <RecordForm
                        data={selectedRow}
                        mode={mode}
                        onSave={handleInternalSave}
                        onCancel={handleClose}
                        onEdit={handleEdit}
                        onDelete={handleInternalDelete}
                        entityType={entityType}
                        extraOptions={extraOptions} // ✅ Paso extraOptions a RecordForm
                    />
                </DialogContent>
            </Dialog>
        </Paper>
    );
};

export default CustomTable;

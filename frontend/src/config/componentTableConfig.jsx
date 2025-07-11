import {Chip, Button} from "@mui/material";

export const getComponentColumns = (handleMountedClick, handleUnmount, handleMount) => [
    {field: "id", headerName: "ID", width: 70},
    {field: "serial_number", headerName: "Serial Number", width: 150},
    {field: "component_type_name", headerName: "Component Type", width: 150},
    { field: "usage_type", headerName: "Usage Type", width: 150 },
    {field: "model_name", headerName: "Model", width: 150},
    {field: "size_name", headerName: "Size", width: 100},
    {field: "status_name", headerName: "Status", width: 120},
    {field: "dom", headerName: "DOM", width: 120},
    {field: "jumps", headerName: "Jumps", width: 90},
    {field: "aad_jumps_on_mount", headerName: "AAD Jumps", width: 120},
    {
        field: "mounted",
        headerName: "Mounted",
        width: 180,
        renderCell: (params) => {
            const rigs = params.row?.rigs || [];

            return rigs.length > 0 ? (
                <>
                    {rigs.map((r, idx) => (
                        <Chip
                            key={idx}
                            label={`Rig ${r.rig_number}`}
                            clickable
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMountedClick(r.id);
                            }}
                            sx={{mr: 0.5, mb: 0.5}}
                        />
                    ))}
                </>
            ) : (
                ""
            );
        },
    },
    {
        field: "actions",
        headerName: "Actions",
        width: 140,
        renderCell: (params) => {
            const component = params.row;
            const isMounted = component.rigs && component.rigs.length > 0;
            return (
                <Button
                    variant="contained"
                    size="small"
                    color={isMounted ? "warning" : "success"}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                        if (isMounted) {
                            handleUnmount(component);
                        } else {
                            handleMount(component);
                        }
                    }}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                    }}
                >
                    {isMounted ? "Umount" : "Mount"}
                </Button>
            );
        },
    },
];


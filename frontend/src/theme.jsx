import {createTheme} from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "dark", // Modo oscuro
        background: {
            default: "#121212", // Fondo negro para toda la app
            paper: "#1F1F1F", // Color para los componentes de Paper
        },
        text: {
            primary: "#FFFFFF", // Texto en blanco
            secondary: "#B3B3B3", // Texto gris claro
        },
        primary: {
            main: "#BB86FC", // Color principal (puedes cambiarlo)
        },
        secondary: {
            main: "#03DAC6", // Color secundario (puedes cambiarlo)
        },
    },
});

export default theme;
import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme, Avatar, Menu, MenuItem, IconButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import { useNavigate } from "react-router-dom";

const demoTheme = createTheme({
    cssVariables: {
        colorSchemeSelector: 'data-toolpad-color-scheme',
    },
    colorSchemes: { dark: true }, // 🔹 Solo modo oscuro
    breakpoints: {
        values: { xs: 0, sm: 600, md: 600, lg: 1200, xl: 1536 },
    },
    components: {
        DashboardLayout: {
            defaultProps: {
                slots: {
                    // 🔹 Muestra el usuario autenticado y el botón de cerrar sesión
                    toolbarActions: ({ session, authentication }) => {
                        const [anchorEl, setAnchorEl] = React.useState(null);

                        const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
                        const handleMenuClose = () => setAnchorEl(null);

                        return session?.user ? (
                            <>
                                <IconButton onClick={handleMenuOpen} sx={{ ml: 1 }}>
                                    <Avatar src={session.user.image} alt={session.user.name} />
                                </IconButton>
                                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                                    <MenuItem onClick={handleMenuClose}>{session.user.name}</MenuItem>
                                    <MenuItem onClick={() => {
                                        handleMenuClose();
                                        authentication.signOut();
                                    }}>Sign Out</MenuItem>
                                </Menu>
                            </>
                        ) : null;
                    },
                },
            },
        },
    },
});

function DashboardLayoutAccount({ navigation, window }) {
    const navigate = useNavigate();
    const [session, setSession] = React.useState(null); // 🔹 Estado inicial vacío

    // 🔐 Verifica sesión al cargar
    React.useEffect(() => {
        const token = sessionStorage.getItem("accessToken");
        const username = sessionStorage.getItem("username");
        const email = sessionStorage.getItem("email");
        const image = sessionStorage.getItem("userImage") || "https://via.placeholder.com/40";

        if (!token) {
            navigate("/"); // 🔹 Si no hay sesión, redirige al login
        } else {
            setSession({
                user: {
                    name: username || "Usuario",
                    email: email || "user@example.com",
                    image: image,
                },
            });
        }
    }, [navigate]);

    // ✅ Definimos `authentication`
    const authentication = React.useMemo(() => ({
        signIn: (userData) => {
            sessionStorage.setItem("username", userData.name);
            sessionStorage.setItem("email", userData.email);
            sessionStorage.setItem("userImage", userData.image || "https://via.placeholder.com/40");
            sessionStorage.setItem("accessToken", userData.token);
            setSession({ user: userData });
        },
        signOut: () => {
            sessionStorage.clear();
            setSession(null);
            navigate("/");
        },
    }), [navigate]);

    console.log("Navigation data:", navigation); // ⬅️ Verifica que `navigation` tenga datos

    return (
        <AppProvider
            session={session}
            authentication={authentication} // ✅ Ahora `authentication` está definido
            navigation={navigation}
            router={useDemoRouter('/admin')}
            theme={demoTheme}
            window={window}
        >
            <DashboardLayout>
                <Box sx={{ py: 4, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <Typography>Dashboard content for {useDemoRouter('/admin').pathname}</Typography>
                </Box>
            </DashboardLayout>
        </AppProvider>
    );
}

DashboardLayoutAccount.propTypes = {
    navigation: PropTypes.array.isRequired,
    window: PropTypes.func,
};

export default DashboardLayoutAccount;
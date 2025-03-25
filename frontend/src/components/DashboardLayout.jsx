import * as React from "react";
import PropTypes from "prop-types";
import {AppProvider} from "@toolpad/core/AppProvider";
import {DashboardLayout} from "@toolpad/core/DashboardLayout";
import {createTheme} from "@mui/material/styles";
import {useDemoRouter} from "@toolpad/core/internal";

const demoTheme = createTheme({
    cssVariables: {
        colorSchemeSelector: "data-toolpad-color-scheme",
    },
    colorSchemes: {dark: true},
});

function DashboardLayoutAccount({navigation, onTabChange, children}) {
    const router = useDemoRouter("/admin");

    // 🔹 Cargar sesión desde sessionStorage
    const storedUser = {
        name: sessionStorage.getItem("username"),
        email: sessionStorage.getItem("email"),
        image: sessionStorage.getItem("userImage"),
    };

    const [session, setSession] = React.useState(
        storedUser.name ? {user: storedUser} : null
    );

    // 🔐 Lógica para logout
    const authentication = React.useMemo(() => {
        return {
            signIn: () => {
                setSession({
                    user: {
                        name: sessionStorage.getItem("username"),
                        email: sessionStorage.getItem("email"),
                        image: sessionStorage.getItem("userImage"),
                    },
                });
            },
            signOut: () => {
                sessionStorage.clear();
                setSession(null);
                window.location.href = "/";
            },
        };
    }, []);

    React.useEffect(() => {
        const activeSegment =
            router.pathname.replace("/admin/", "").replace("/", "") || "dashboard";

        if (onTabChange) {
            onTabChange(activeSegment);
        }
    }, [router.pathname, onTabChange]);

    return (
        <AppProvider
            theme={demoTheme}
            router={router}
            navigation={navigation}
            session={session}
            authentication={authentication}
        >
            <DashboardLayout>{children}</DashboardLayout>
        </AppProvider>
    );
}

DashboardLayoutAccount.propTypes = {
    navigation: PropTypes.array.isRequired,
    onTabChange: PropTypes.func.isRequired,
    children: PropTypes.node,
};

export default DashboardLayoutAccount;
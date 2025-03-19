import * as React from "react";
import PropTypes from "prop-types";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { createTheme } from "@mui/material/styles";
import { useDemoRouter } from "@toolpad/core/internal";

const demoTheme = createTheme({
    cssVariables: {
        colorSchemeSelector: "data-toolpad-color-scheme",
    },
    colorSchemes: { dark: true },
});

function DashboardLayoutAccount({ navigation, onTabChange, children }) {
    const router = useDemoRouter("/admin"); // 🔹 Usamos el router de Toolpad

    React.useEffect(() => {
        // 🔹 Extraemos solo el segmento después de "/admin/"
        const activeSegment = router.pathname.replace("/admin/", "").replace("/", "") || "dashboard";
        console.log("📌 Active Tab Segment:", activeSegment);

        if (onTabChange) {
            onTabChange(activeSegment);
        }
    }, [router.pathname, onTabChange]);

    return (
        <AppProvider navigation={navigation} router={router} theme={demoTheme}>
            <DashboardLayout>
                {children}
            </DashboardLayout>
        </AppProvider>
    );
}

DashboardLayoutAccount.propTypes = {
    navigation: PropTypes.array.isRequired,
    onTabChange: PropTypes.func.isRequired,
    children: PropTypes.node,
};

export default DashboardLayoutAccount;
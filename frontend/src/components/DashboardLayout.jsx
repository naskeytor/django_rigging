import * as React from "react";
import {extendTheme, styled} from "@mui/material/styles";
import {AppBar, Toolbar, Typography, Button, IconButton, Box, Grid} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import LayersIcon from "@mui/icons-material/Layers";
import {AppProvider} from "@toolpad/core/AppProvider";
import {DashboardLayout} from "@toolpad/core/DashboardLayout";
import {PageContainer} from "@toolpad/core/PageContainer";
import {useNavigate} from "react-router-dom";

const NAVIGATION = [
    {segment: "dashboard", title: "Dashboard", icon: <DashboardIcon/>},
    {segment: "orders", title: "Orders", icon: <ShoppingCartIcon/>},
    {kind: "divider"},
    {segment: "reports", title: "Reports", icon: <BarChartIcon/>},
    {segment: "sales", title: "Sales", icon: <DescriptionIcon/>},
    {segment: "integrations", title: "Integrations", icon: <LayersIcon/>},
];

const demoTheme = extendTheme({
    colorSchemes: {light: true, dark: true},
    colorSchemeSelector: "class",
    breakpoints: {
        values: {xs: 0, sm: 600, md: 600, lg: 1200, xl: 1536},
    },
});

const Skeleton = styled("div")(({theme, height}) => ({
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
    height,
    content: '" "',
}));

/*
const CustomNavbar = ({title}) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/");
    };

    return (
        <AppBar position="static" sx={{bgcolor: "primary.dark", width: "100%"}}>
            <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="menu" sx={{mr: 2}}>
                    <MenuIcon/>
                </IconButton>
                <Typography variant="h6" sx={{flexGrow: 1}}>
                    {title}
                </Typography>
                <Button color="inherit" onClick={handleLogout}>
                    Logout
                </Button>
            </Toolbar>
        </AppBar>
    );
};

 */

export default function DashboardLayoutBasic({title, children}) {
    const [pathname, setPathname] = React.useState("/dashboard");
    const router = React.useMemo(
        () => ({
            pathname,
            searchParams: new URLSearchParams(),
            navigate: (path) => setPathname(String(path)),
        }),
        [pathname]
    );

    return (
        <AppProvider navigation={NAVIGATION} router={router} theme={demoTheme}>

            <DashboardLayout>
                <PageContainer>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Skeleton height={14}/>
                        </Grid>
                        <Grid item xs={4}>
                            <Skeleton height={100}/>
                        </Grid>
                        <Grid item xs={8}>
                            <Skeleton height={100}/>
                        </Grid>
                        <Grid item xs={12}>
                            <Skeleton height={150}/>
                        </Grid>
                        <Grid item xs={12}>
                            <Skeleton height={14}/>
                        </Grid>
                        <Grid item xs={3}>
                            <Skeleton height={100}/>
                        </Grid>
                        <Grid item xs={3}>
                            <Skeleton height={100}/>
                        </Grid>
                        <Grid item xs={3}>
                            <Skeleton height={100}/>
                        </Grid>
                        <Grid item xs={3}>
                            <Skeleton height={100}/>
                        </Grid>
                    </Grid>
                    {children}
                </PageContainer>
            </DashboardLayout>
        </AppProvider>
    );
}

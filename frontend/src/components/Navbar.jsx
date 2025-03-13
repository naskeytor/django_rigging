import React from 'react';
import {AppBar, Toolbar, Typography, Button} from '@mui/material';
import {useNavigate} from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/');
    };

    return (
        <AppBar position="static" sx={{bgcolor: 'primary.dark', width: '100%'}}>
            <Toolbar>
                <Typography variant="h6" sx={{flexGrow: 1}}>
                    Mi Aplicación
                </Typography>
                <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
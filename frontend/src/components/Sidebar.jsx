import React from 'react';
import {Box, List, ListItem, ListItemText} from '@mui/material';
import {Link} from 'react-router-dom';

const Sidebar = () => (
    <Box sx={{width: 220, bgcolor: '#1F1F1F', color: 'white', p: 2, height: 'calc(100vh - 64px)'}}>
        <List>
            <ListItem component={Link} to="/admin">
                <ListItemText primary="Admin Dashboard"/>
            </ListItem>
            <ListItem component={Link} to="/rigger">
                <ListItemText primary="Rigger Dashboard"/>
            </ListItem>
            <ListItem component={Link} to="/user">
                <ListItemText primary="User Dashboard"/>
            </ListItem>
        </List>
    </Box>
);

export default Sidebar;
import React from "react";
import {Box} from "@mui/material";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Admin from "./pages/Admin";
import Rigger from "./pages/Rigger";
import User from "./pages/User";
import Login from "./components/Login";

function App() {
    return (
        <Box sx={{bgcolor: "background.default", minHeight: "100vh"}}>
            <Router>
                <Routes>
                    <Route path="/" element={<Login/>}/>
                    <Route path="/admin" element={<Admin/>}/>
                    <Route path="/rigger" element={<Rigger/>}/>
                    <Route path="/user" element={<User/>}/>
                </Routes>
            </Router>
        </Box>
    );
}

export default App
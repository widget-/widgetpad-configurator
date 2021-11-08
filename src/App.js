import './App.css';
import * as React from 'react';
import {BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";
import Button from '@mui/material/Button';

import Main from "./pages/Main";
import Settings from "./pages/Settings";

function App() {
    return (
        <Router>
            <div>
                <span className="nav_container">
                    <Link to="/">
                        <Button variant="contained">
                            Home
                        </Button>
                    </Link>
                </span>
                <span className="nav_container">
                    <Link to="/settings">
                        <Button variant="contained">
                            Settings
                        </Button>
                    </Link>
                </span>
            </div>
            <Routes>
                <Route path="/" element={<Main/>}/>
                <Route path="/settings" element={<Settings/>}/>
            </Routes>
        </Router>
    );
}

export default App;

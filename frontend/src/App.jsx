import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import FormBuilder from './pages/FormBuilder';
import FormViewer from './pages/FormViewer';
import ResponsesList from './pages/ResponsesList';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/builder" element={<FormBuilder />} />
                <Route path="/viewer/:id" element={<FormViewer />} />
                <Route path="/responses" element={<ResponsesList />} />
            </Routes>
        </Router>
    );
}

export default App;

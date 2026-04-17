import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PatientDetail from './views/PatientDetail';
import Monitoring from './views/Monitoring';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Header />
          <Routes>
            <Route path="/" element={<Navigate to="/paciente/99201" replace />} />
            <Route path="/paciente/:id" element={<PatientDetail />} />
            <Route path="/monitoreo" element={<Monitoring />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

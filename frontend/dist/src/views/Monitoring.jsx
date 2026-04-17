import React, { useState } from 'react';
import { Activity, Settings, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import './Monitoring.css';
import RuleEngineModal from '../components/RuleEngineModal';

const patients = [
  { bed: 'Cama 01', name: 'Miller, A.', hr: 72, spo2: 98, status: 'stable' },
  { bed: 'Cama 04', name: 'Harrison, E.', hr: 134, spo2: 94, status: 'critical', alert: 'Taquicardia' },
  { bed: 'Cama 07', name: 'Chen, W.', hr: 68, spo2: 89, status: 'warning', alert: 'SpO2 Bajo' },
  { bed: 'Cama 12', name: 'Garcia, M.', hr: 80, spo2: 97, status: 'stable' },
  { bed: 'Cama 15', name: 'Smith, J.', hr: 75, spo2: 99, status: 'stable' },
  { bed: 'Cama 18', name: 'Lopez, R.', hr: 110, spo2: 95, status: 'warning', alert: 'Taquicardia Leve' },
];

const Monitoring = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="page-container monitoring-view">
      <div className="monitoring-header">
        <div>
          <h1>Monitoreo</h1>
          <p>Telemetría en tiempo real y monitoreo basado en reglas para 12 camas de pacientes activas.</p>
        </div>
        <div className="monitoring-stats">
          <div className="stat-box">
            <span className="stat-label">PACIENTES ACTIVOS</span>
            <span className="stat-val">12/14</span>
          </div>
          <div className="stat-box dark">
            <span className="stat-label">MOTOR DE REGLAS</span>
            <span className="stat-val"><Activity size={16}/> Activo</span>
          </div>
        </div>
      </div>

      <div className="monitoring-dash-grid">
        <div className="card critical-alert-banner">
          <div className="alert-badge"><AlertTriangle size={14}/> ALERTA CÓDIGO ROJO</div>
          <div className="alert-content-row">
            <div className="alert-text">
              <h2>Taquicardia Crítica</h2>
              <p>Paciente: <b>Harrison, Eleanor (Cama 04)</b>. La frecuencia cardíaca ha superado los 120 LPM. Se requiere intervención inmediata.</p>
              <button className="btn-outline white mt-16">Ver Gráfico</button>
            </div>
            <div className="alert-vital">
              <span className="vital-label">FRECUENCIA CARDÍACA (LPM)</span>
              <div className="vital-num">134</div>
            </div>
          </div>
        </div>

        <div className="card rule-engine-card">
          <div className="rule-header">
            <h3>Motor de Reglas</h3>
            <button className="icon-btn" onClick={() => setShowModal(true)}><Settings size={18} /></button>
          </div>
          <p className="rule-desc">Última actualización de reglas: hace 2 minutos.</p>
          
          <ul className="rule-list">
            <li>
              <span>Monitoreo de Varianza de FC</span>
              <span className="badge badge-green">ÓPTIMO</span>
            </li>
            <li>
              <span>Protocolo de Taquicardia</span>
              <span className="badge badge-red">ACTIVADO</span>
            </li>
            <li>
              <span>Umbral de Desaturación de O2</span>
              <span className="badge badge-orange">ADVERTENCIA</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="telemetry-section">
        <h3 className="section-title">Telemetría de Pacientes en Vivo</h3>
        
        <div className="patient-grid">
          {patients.map((p, idx) => (
            <div key={idx} className={`card patient-card ${p.status}`}>
              <div className="p-card-header">
                <div className="p-info">
                  <div className={`status-indicator ${p.status}`}></div>
                  <div>
                    <div className="p-bed">{p.bed} — {p.name}</div>
                    {p.alert && <div className="p-alert-text">{p.alert}</div>}
                  </div>
                </div>
              </div>
              <div className="p-vitals">
                <div className="p-vital-col">
                  <span className="p-v-label">FC</span>
                  <div className={`p-v-val ${p.status === 'critical' ? 'text-red' : ''}`}>{p.hr}</div>
                </div>
                <div className="p-vital-col">
                  <span className="p-v-label">SpO2</span>
                  <div className={`p-v-val ${p.status === 'warning' ? 'text-orange' : ''}`}>{p.spo2}<span className="percent">%</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && <RuleEngineModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Monitoring;

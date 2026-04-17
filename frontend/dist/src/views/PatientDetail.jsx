import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, FileText, Activity } from 'lucide-react';
import './PatientDetail.css';

const heartRateData = [
  { time: '13:00', value: 75 },
  { time: '13:05', value: 78 },
  { time: '13:10', value: 120 },
  { time: '13:15', value: 134 },
  { time: '13:20', value: 130 },
  { time: '13:25', value: 128 },
  { time: '13:30', value: 134 },
];

const PatientDetail = () => {
  return (
    <div className="page-container patient-detail">
      <div className="header-info">
        <span className="badge badge-red">Alerta Crítica</span>
        <span className="room-info">Cama 204</span>
      </div>

      <div className="patient-header card">
        <div className="patient-name-block">
          <h1>Harrison,<br/>Edward</h1>
          <div className="patient-demographics">
            <span>Edad: 68</span>
            <span>Sexo: Masculino</span>
            <span>ID: 99201</span>
          </div>
        </div>
        <div className="patient-actions">
          <button className="btn-primary">Solicitar Intervención<br/>de Emergencia</button>
        </div>
      </div>

      <div className="profile-grid">
        <div className="card medical-profile">
          <h3 className="section-title">Perfil Médico</h3>
          
          <div className="profile-section">
            <h4 className="subsection-title">Resumen de Historia</h4>
            <div className="profile-item">
              <span className="profile-label">Diagnósticos Primarios</span>
              <p>Diabetes Tipo 2, Hipertensión, Insuficiencia Cardíaca Congestiva (Estadio II)</p>
            </div>
            <div className="profile-item">
              <span className="profile-label">Alergias</span>
              <p className="allergy-text">Penicilina, Látex</p>
            </div>
            
            <div className="doctor-info">
              <div className="doc-avatar"></div>
              <div>
                <div className="doc-role">MÉDICO DE CABECERA</div>
                <div className="doc-name">Dr. Leo Spaceman</div>
              </div>
              <button className="btn-outline">Llamar Médico</button>
            </div>
          </div>
          
          <div className="profile-section">
            <h4 className="subsection-title">Medicamentos Actuales</h4>
            <ul className="med-list">
              <li>Metformina 500mg BID</li>
              <li>Lisinopril 10mg QD</li>
              <li>Furosemida 40mg IV (Actual)</li>
            </ul>
          </div>
        </div>

        <div className="card alert-history">
          <div className="alert-header-row">
            <h3 className="section-title">Historial de Alertas</h3>
            <a href="#" className="link-text">Ver Todo</a>
          </div>
          
          <div className="alert-events">
            <div className="alert-event critical">
              <div className="event-icon"><AlertCircle size={16} /></div>
              <div className="event-content">
                <h4>Taquicardia Severa</h4>
                <p>La frecuencia cardíaca superó los 125 LPM durante 2 min</p>
                <span className="event-time">HACE 5M</span>
              </div>
            </div>
            
            <div className="alert-event warning">
              <div className="event-icon"><AlertCircle size={16} /></div>
              <div className="event-content">
                <h4>SpO2 Bajo</h4>
                <p>La saturación de oxígeno cayó al 89%</p>
                <span className="event-time">HACE 2H</span>
              </div>
            </div>
            
            <div className="alert-event stable">
              <div className="event-icon"><Activity size={16} /></div>
              <div className="event-content">
                <h4>Signos Vitales Estables</h4>
                <p>Control automático de estabilización superado</p>
                <span className="event-time">HACE 12H</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="vitals-dashboard">
        <div className="card chart-card dark-card">
          <div className="chart-header">
            <h4>FRECUENCIA CARDÍACA (LPM)</h4>
            <span className="badge badge-red">TAQUICARDIA</span>
          </div>
          <div className="chart-value">134 <span className="unit">LPM</span></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={heartRateData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#22c55e" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="vitals-side">
          <div className="card vital-card">
            <h4>SPO2 ACTUAL</h4>
            <div className="vital-value dark-text">94 <span className="unit">%</span></div>
          </div>
          <div className="card vital-card">
            <h4>FREC. RESP (RPM)</h4>
            <div className="vital-value orange-text">22 <span className="unit">RPM</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;

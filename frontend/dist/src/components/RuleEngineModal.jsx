import React from 'react';
import { X } from 'lucide-react';
import './RuleEngineModal.css';

const RuleEngineModal = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Configuración del Motor de Reglas</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <p className="modal-subtitle">Define disparadores automáticos para intervención clínica</p>
        
        <form className="rule-form">
          <div className="form-row split">
            <div className="form-group">
              <label>MÉTRICA VITAL</label>
              <select defaultValue="hr">
                <option value="hr">Frecuencia Cardíaca</option>
                <option value="spo2">Saturación de O2</option>
                <option value="rr">Frecuencia Respiratoria</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>CONDICIÓN</label>
              <select defaultValue="gt">
                <option value="gt">Mayor que</option>
                <option value="lt">Menor que</option>
                <option value="eq">Igual a</option>
              </select>
            </div>
          </div>
          
          <div className="form-row split">
            <div className="form-group">
              <label>UMBRAL</label>
              <div className="input-with-end">
                <input type="number" defaultValue="120" />
                <span className="input-end">LPM</span>
              </div>
            </div>
            
            <div className="form-group">
              <label>DURACIÓN SOSTENIDA</label>
              <div className="input-with-end">
                <input type="number" defaultValue="2" />
                <span className="input-end">MIN</span>
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label>ACCIÓN DE DISPARO</label>
            <select defaultValue="rojo">
              <option value="rojo">Alerta Código Rojo y Notificar Pabellón</option>
              <option value="amarillo">Alerta Advertencia</option>
              <option value="notificar">Notificar Médico de Cabecera</option>
            </select>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn-text" onClick={onClose}>Cancelar</button>
            <button type="button" className="btn-primary" onClick={onClose}>Guardar Regla</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RuleEngineModal;

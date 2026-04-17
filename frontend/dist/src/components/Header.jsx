import React from 'react';
import { Search, Bell } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <div className="header">
      <div className="header-search">
        <Search className="search-icon" size={18} />
        <input type="text" placeholder="Buscar pacientes..." className="search-input" />
      </div>
      <div className="header-actions">
        <button className="notification-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
      </div>
    </div>
  );
};

export default Header;

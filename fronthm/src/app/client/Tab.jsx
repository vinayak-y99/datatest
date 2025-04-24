
// src/app/components/shared/Tab.jsx
import React from 'react';

const Tab = ({ active, onClick, icon: Icon, label }) => {
  return (
    <button 
      onClick={onClick} 
      style={{ backgroundColor: active ? 'blue' : 'gray' }}
    >
      {Icon && <Icon />} {label}
    </button>
  );
};

export default Tab;  

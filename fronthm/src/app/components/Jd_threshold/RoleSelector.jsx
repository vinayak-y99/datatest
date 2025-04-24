import React from 'react';

export default function RoleSelector({ roles = [], onRoleChange, selectedRoles }) {
  // Handle nested arrays and objects
  const normalizedRoles = Array.isArray(roles) 
    ? roles.flat().filter(Boolean)
    : [roles].filter(Boolean);

  // Add debugging to track data flow
  console.log('Original roles:', roles);
  console.log('Normalized roles:', normalizedRoles);

  return (
    <div className="flex flex-col gap-2">
      {normalizedRoles.length > 0 && normalizedRoles[0] ? (
        normalizedRoles.map((role) => (
          <label key={role} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
              checked={selectedRoles?.includes(role)}
              onChange={() => onRoleChange(role)}
            />
            <span className="text-sm text-gray-700">{role}</span>
          </label>
        ))
      ) : (
        <p className="text-sm text-gray-500 italic">No roles available</p>
      )}
    </div>
  );
}

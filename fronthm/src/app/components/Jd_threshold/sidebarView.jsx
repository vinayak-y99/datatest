"use client";
import { useState, useEffect } from "react";
import RoleSelector from "./RoleSelector";
import React from 'react';

const Sidebar = ({
    roles,
    skills_data,
    samplePrompts,
    sendRangeValue,
    onCreate,
    sendSelectedRoles,
    onRoleSelect,
    onDashboardUpdate
}) => {
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [rangeValue, setRangeValue] = useState(1);
    const [message, setMessage] = useState("");
    const [customPrompt, setCustomPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [promptsList, setPromptsList] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("Sample prompts received:", samplePrompts);
        
        if (samplePrompts) {
          let processedPrompts = [];
          
          if (Array.isArray(samplePrompts)) {
            processedPrompts = samplePrompts;
          } 
          else if (typeof samplePrompts === 'string' && samplePrompts.includes('\n')) {
            processedPrompts = samplePrompts.split('\n').filter(p => p.trim());
          }
          else if (typeof samplePrompts === 'string' && samplePrompts.includes('.')) {
            processedPrompts = samplePrompts.split(/\.(?=\s|$)/).filter(p => p.trim()).map(p => p + '.');
          }
          else if (typeof samplePrompts === 'string') {
            processedPrompts = [samplePrompts];
          }
          
          console.log("Processed prompts:", processedPrompts);
          setPromptsList(processedPrompts);
        } else {
          setPromptsList([]);
        }
      }, [samplePrompts]);      

    useEffect(() => {
        console.log("Roles received in sidebar:", roles);
        if (roles && roles.length > 0) {
            setSelectedRoles([]);
        }
    }, [roles]);

    useEffect(() => {
        if (selectedRoles.length > 0) {
            sendSelectedRoles(selectedRoles);
        }
    }, [selectedRoles, sendSelectedRoles]);

    // Auto-select first role when roles are loaded
    useEffect(() => {
        if (roles && roles.length > 0 && selectedRoles.length === 0) {
            const firstRole = roles[0];
            setSelectedRoles([firstRole]);
            onRoleSelect([firstRole]);
        }
    }, [roles, selectedRoles.length, onRoleSelect]);

    // Auto-initialize dashboard on component mount
    useEffect(() => {
        if (roles && roles.length > 0 && skills_data) {
            sendRangeValue(rangeValue);
            onCreate({
                roles: selectedRoles.length > 0 ? selectedRoles : [roles[0]],
                skills_data: skills_data
            });
        }
    }, [roles, skills_data, rangeValue, sendRangeValue, onCreate, selectedRoles]);

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="mb-6 border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">Available Roles</h3>
                <div className="space-y-2">
                    {roles && roles.map((role, index) => (
                        <div key={index} className="flex items-center">
                            <span className={`text-sm ${selectedRoles.includes(role) ? 'font-bold text-indigo-600' : 'text-gray-700'}`}>
                                {role}
                            </span>
                            {selectedRoles.includes(role) && (
                                <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                                    Selected
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {promptsList && promptsList.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Available Prompts</h3> 
                    <div className="space-y-3">
                        {promptsList.map((prompt, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-md">
                                <p className="text-sm text-gray-700">{prompt}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}
        </div>
    );
};

export default Sidebar;

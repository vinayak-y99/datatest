"use client"
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Cloud, Rocket, Database, Percent, Star, Trophy, Flag } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import Link from 'next/link';
const RightSidebar = ({ closeSidebar }) => {
  // Change to track multiple expanded sections
  const [expandedSections, setExpandedSections] = useState({});
  const [ratings, setRatings] = useState({});
  const [percentages, setPercentages] = useState({});
  const [useRatings, setUseRatings] = useState(true);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    closeSidebar();
  };

  const handleRatingChange = (sectionId, itemId, value) => {
    const numValue = parseInt(value);
    if (numValue >= 0 && numValue <= 10) {
      setRatings(prev => ({
        ...prev,
        [`${sectionId}-${itemId}`]: numValue
      }));
    }
  };

  const handlePercentageChange = (sectionId, itemId, value) => {
    const numValue = parseInt(value);
    if (numValue >= 0 && numValue <= 100) {
      setPercentages(prev => ({
        ...prev,
        [`${sectionId}-${itemId}`]: numValue
      }));
    }
  };

  const sections = {
    cloudSkills: {
      title: 'Cloud Skills',
      icon: <Cloud className="w-5 h-5" />,
      textColor: 'text-blue-600',
      iconColor: 'text-blue-600',
      data: [
        { id: 'cloud-services', name: 'Cloud Services Understanding', baseValue: 25 },
        { id: 'infrastructure', name: 'Infrastructure Management', baseValue: 20 },
        { id: 'deployment', name: 'Deployment and Automation', baseValue: 20 },
        { id: 'security', name: 'Security and Compliance', baseValue: 15 },
        { id: 'monitoring', name: 'Monitoring and Troubleshooting', baseValue: 20 },
      ]
    },
    database: {
      title: 'Database',
      icon: <Database className="w-5 h-5" />,
      textColor: 'text-emerald-600',
      iconColor: 'text-emerald-600',
      data: [
        { id: 'design', name: 'Database Design', baseValue: 30 },
        { id: 'sql', name: 'SQL Proficiency', baseValue: 30 },
        { id: 'admin', name: 'Database Administration', baseValue: 15 },
        { id: 'backup', name: 'Backup and Recovery', baseValue: 10 },
        { id: 'security', name: 'Security', baseValue: 10 },
        { id: 'nosql', name: 'NoSQL Databases', baseValue: 5 },
      ]
    },
    deployment: {
      title: 'Deployment',
      icon: <Rocket className="w-5 h-5" />,
      textColor: 'text-purple-600',
      iconColor: 'text-purple-600',
      data: [
        { id: 'deployment-strategies', name: 'Deployment Strategies', baseValue: 35 },
        { id: 'infrastructure-provisioning', name: 'Infrastructure Provisioning', baseValue: 20 },
        { id: 'application-deployment', name: 'Application Deployment', baseValue: 20 },
        { id: 'scaling-performance', name: 'Scaling and Performance', baseValue: 10 },
        { id: 'security-compliance', name: 'Security and Compliance', baseValue: 5 },
        { id: 'monitoring-logging', name: 'Monitoring and Logging', baseValue: 10 },
      ]
    },
    achievements: {
      title: 'Achievements',
      icon: <Trophy className="w-5 h-5" />,
      textColor: 'text-amber-600',
      iconColor: 'text-amber-600',
      data: [
        { id: 'certifications', name: 'Professional Certifications', baseValue: 30 },
        { id: 'projects', name: 'Completed Projects', baseValue: 25 },
        { id: 'awards', name: 'Industry Awards', baseValue: 15 },
        { id: 'contributions', name: 'Open Source Contributions', baseValue: 15 },
        { id: 'presentations', name: 'Technical Presentations', baseValue: 15 },
      ]
    },
    implementation: {
      title: 'Implementation',
      icon: <Flag className="w-5 h-5" />,
      textColor: 'text-rose-600',
      iconColor: 'text-rose-600',
      data: [
        { id: 'code-quality', name: 'Code Quality', baseValue: 25 },
        { id: 'testing', name: 'Testing Implementation', baseValue: 20 },
        { id: 'documentation', name: 'Documentation', baseValue: 20 },
        { id: 'best-practices', name: 'Best Practices', baseValue: 20 },
        { id: 'optimization', name: 'Performance Optimization', baseValue: 15 },
      ]
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1'];

  const prepareChartData = (data, sectionKey) => {
    return data.map(item => ({
      name: item.name,
      value: useRatings 
        ? ratings[`${sectionKey}-${item.id}`] || 0
        : percentages[`${sectionKey}-${item.id}`] || item.baseValue
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto pl-2">
        <div className="space-y-2">
          {Object.entries(sections).map(([sectionKey, section]) => (
            <div 
              key={sectionKey} 
              className="border-b border-gray-100 last:border-b-0"
            >
              <div
                className="flex items-center gap-1 cursor-pointer p-1 hover:bg-gray-50 transition-colors duration-200"
                onClick={() => toggleSection(sectionKey)}
              >
                <div className={`${section.iconColor}`}>
                  {section.icon}
                </div>
                <h2 className={`text-base font-medium ${section.textColor}`}>{section.title}</h2>
                {expandedSections[sectionKey] ? 
                  <ChevronDown className={`w-5 h-5 ml-auto ${section.textColor}`} /> :
                  <ChevronRight className={`w-5 h-5 ml-auto ${section.textColor}`} />
                }
              </div>

              {expandedSections[sectionKey] && (
                <div className="p-1">
                  <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-6">
                      <div className="bg-white shadow-sm border-gray-200">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left pt-3 text-gray-600 font-medium">Skills</th>
                              <div className="flex items-center pl-52 gap-4">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 flex items-center">
          <Star className={useRatings ? 'text-blue-600' : 'text-gray-400'} />
        </div>
        <button
          onClick={() => setUseRatings(!useRatings)}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
            useRatings ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <div
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${
              useRatings ? 'translate-x-6' : 'translate-x-0'
            } shadow-md`}
          />
        </button>
        <div className="w-5 h-5 flex items-center">
          <Percent className={!useRatings ? 'text-purple-600' : 'text-gray-400'} />
        </div>
      </div>
      <span className="text-sm font-medium text-gray-600 min-w-[150px]">
        {useRatings ? 'Rating Mode (0-10)' : 'Percentage Mode (0-100%)'}
      </span>
      
    </div>
                              {/* <th className="text-left py-3  text-gray-600 font-medium">Base Value</th> */}
                            </tr>
                          </thead>
                          <tbody>
                            {section.data.map((item) => (
                              <tr key={item.id} className="border-b border-gray-100">
                                <td className="">
                                  <span className="text-gray-800">{item.name}</span>
                                </td>
                                <td className="pl-64">
                                  <input 
                                    type="number" 
                                    min="0"
                                    max={useRatings ? 10 : 100}
                                    className={`w-40 p-2 border rounded-lg focus:ring-2 ${section.textColor} focus:border-transparent`}
                                    value={useRatings 
                                      ? (ratings[`${sectionKey}-${item.id}`] || '')
                                      : (percentages[`${sectionKey}-${item.id}`] || '')}
                                    onChange={(e) => useRatings
                                      ? handleRatingChange(sectionKey, item.id, e.target.value)
                                      : handlePercentageChange(sectionKey, item.id, e.target.value)}
                                  />
                                </td>
                                {/* <td className="">
                                  <span className="text-gray-600">{item.baseValue}%</span>
                                </td> */}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <div className="col-span-5">
                      <div className="grid grid-cols-2 h-full gap-4">
                        <div className="bg-white shadow-sm border-gray-200 flex items-center">
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={prepareChartData(section.data, sectionKey)}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {section.data.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="bg-white shadow-sm border-gray-200 flex items-center">
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={prepareChartData(section.data, sectionKey)}>
                              <XAxis 
                                dataKey="name" 
                                axisLine={true}
                                tickLine={false}
                                tick={false}
                              />
                              <YAxis 
                                domain={[0, useRatings ? 10 : 100]}
                                axisLine={true}
                              />
                              <Tooltip />
                              <Bar dataKey="value" fill={COLORS[Object.keys(sections).indexOf(sectionKey)]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* <div className="mt-4 flex flex-wrap gap-2">
                    {section.data.map((item, index) => (
                      <div 
                        key={item.id} 
                        className="flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm text-gray-600">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div> */}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
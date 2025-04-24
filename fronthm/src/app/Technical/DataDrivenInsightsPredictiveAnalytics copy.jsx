import React, { useState, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

// Custom Components
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-md ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="px-4 py-2">{children}</div>
);

const CardTitle = ({ children }) => (
  <h3 className="text-lg font-semibold">{children}</h3>
);

const CardContent = ({ children }) => (
  <div className="p-4">{children}</div>
);

const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
  const baseStyles = 'px-3 py-1 rounded-md font-medium transition-colors';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };
  
  return (
    <button 
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Select = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={onChange}
    className="block w-full px-3 py-2 bg-white border rounded-md"
  >
    {options.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const HiringAnalyticsDashboard = () => {
  // States for filters and report generation
  const [dateRange, setDateRange] = useState('6m');
  const [department, setDepartment] = useState('all');
  const [reportType, setReportType] = useState('success');
  const [showReport, setShowReport] = useState(false);

  // Sample data
  const monthlyHiringData = [
    { month: 'Jan', applications: 150, interviews: 45, hires: 12, successRate: 78 },
    { month: 'Feb', applications: 180, interviews: 55, hires: 15, successRate: 82 },
    { month: 'Mar', applications: 220, interviews: 65, hires: 18, successRate: 85 },
    { month: 'Apr', applications: 250, interviews: 75, hires: 20, successRate: 80 },
    { month: 'May', applications: 200, interviews: 60, hires: 16, successRate: 75 },
    { month: 'Jun', applications: 280, interviews: 85, hires: 22, successRate: 88 },
  ];

  const successRates = [
    { department: 'Engineering', rate: 85, timeToHire: 25, cost: 8500 },
    { department: 'Sales', rate: 78, timeToHire: 18, cost: 6200 },
    { department: 'Marketing', rate: 82, timeToHire: 20, cost: 7100 },
    { department: 'Product', rate: 80, timeToHire: 22, cost: 7800 },
    { department: 'Design', rate: 88, timeToHire: 19, cost: 6800 },
  ];

  const efficiencyTrends = [
    { month: 'Jan', efficiency: 75, cost: 7500 },
    { month: 'Feb', efficiency: 78, cost: 7200 },
    { month: 'Mar', efficiency: 82, cost: 6900 },
    { month: 'Apr', efficiency: 85, cost: 6700 },
    { month: 'May', efficiency: 83, cost: 6800 },
    { month: 'Jun', efficiency: 88, cost: 6500 },
  ];

  // Report generation function
  const generateReport = useCallback(() => {
    setShowReport(true);
  }, []);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Filters */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-gray-600 font-semibold">Access interactive dashboards for hiring performance metrics.</div>
        <div className="flex gap-4">
          <div className="w-48">
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              options={[
                { value: '3m', label: 'Last 3 months' },
                { value: '6m', label: 'Last 6 months' },
                { value: '1y', label: 'Last year' },
              ]}
            />
          </div>
          <div className="w-48">
            <Select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={[
                { value: 'all', label: 'All Departments' },
                { value: 'eng', label: 'Engineering' },
                { value: 'sales', label: 'Sales' },
                { value: 'marketing', label: 'Marketing' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Trend Analysis Section */}
      <div className="mb-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recruitment Success Trends</CardTitle>
              <div className="flex gap-4">
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  options={[
                    { value: 'success', label: 'Success Rates' },
                    { value: 'efficiency', label: 'Hiring Efficiency' },
                    { value: 'cost', label: 'Cost Analysis' },
                  ]}
                />
                <Button onClick={generateReport}>Generate Report</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={efficiencyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="efficiency" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="cost" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Rates by Department */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Success Rates by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={successRates}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rate" fill="#8884d8" name="Success Rate (%)" />
                  <Bar dataKey="timeToHire" fill="#82ca9d" name="Time to Hire (days)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hiring Efficiency Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyHiringData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="successRate" stroke="#8884d8" name="Success Rate" />
                  <Line type="monotone" dataKey="interviews" stroke="#82ca9d" name="Interviews" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generated Report Section */}
      {showReport && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Generated Report: {reportType === 'success' ? 'Success Rates' : reportType === 'efficiency' ? 'Hiring Efficiency' : 'Cost Analysis'}</CardTitle>
              <Button variant="secondary" onClick={() => setShowReport(false)}>Close Report</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {successRates.map((dept, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-semibold mb-2">{dept.department}</h4>
                    <p>Success Rate: {dept.rate}%</p>
                    <p>Time to Hire: {dept.timeToHire} days</p>
                    <p>Cost per Hire: ${dept.cost}</p>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-semibold mb-4">Key Insights</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Highest performing department: Design ({Math.max(...successRates.map(d => d.rate))}% success rate)</li>
                  <li>Shortest time to hire: Sales ({Math.min(...successRates.map(d => d.timeToHire))} days)</li>
                  <li>Most cost-efficient: Marketing (${Math.min(...successRates.map(d => d.cost))} per hire)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HiringAnalyticsDashboard;

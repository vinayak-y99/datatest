import React, { useState, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ScatterChart, Scatter
} from 'recharts';
import { saveAs } from 'file-saver'; // For exporting reports

// Custom Components defined inline instead of importing
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-md shadow-md ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="p-4 border-b">{children}</div>
);

const CardTitle = ({ children }) => (
  <h3 className="text-xl font-semibold text-gray-800">{children}</h3>
);

const CardContent = ({ children }) => (
  <div className="p-4">{children}</div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseStyles = 'px-4 py-2 rounded-md font-medium transition-colors';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    success: 'bg-green-600 text-white hover:bg-green-700',
  };
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const Select = ({ value, onChange, options, className = '' }) => (
  <select
    value={value}
    onChange={onChange}
    className={`block w-full px-3 py-2 bg-white border rounded-md ${className}`}
  >
    {options.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const HiringAnalyticsDashboard = () => {
  // Enhanced States
  const [dateRange, setDateRange] = useState('6m');
  const [department, setDepartment] = useState('all');
  const [reportType, setReportType] = useState('success');
  const [showReport, setShowReport] = useState(false);
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [predictionPeriod, setPredictionPeriod] = useState(3);
  const [isLoading, setIsLoading] = useState(false);

  // Expanded Sample Data with Predictions
  const monthlyHiringData = [
    { month: 'Jan', applications: 150, interviews: 45, hires: 12, successRate: 78, predictedHires: 13 },
    { month: 'Feb', applications: 180, interviews: 55, hires: 15, successRate: 82, predictedHires: 16 },
    { month: 'Mar', applications: 220, interviews: 65, hires: 18, successRate: 85, predictedHires: 19 },
    { month: 'Apr', applications: 250, interviews: 75, hires: 20, successRate: 80, predictedHires: 21 },
    { month: 'May', applications: 200, interviews: 60, hires: 16, successRate: 75, predictedHires: 17 },
    { month: 'Jun', applications: 280, interviews: 85, hires: 22, successRate: 88, predictedHires: 23 },
  ];

  const successRates = [
    { department: 'Engineering', rate: 85, timeToHire: 25, cost: 8500, qualityScore: 92 },
    { department: 'Sales', rate: 78, timeToHire: 18, cost: 6200, qualityScore: 88 },
    { department: 'Marketing', rate: 82, timeToHire: 20, cost: 7100, qualityScore: 90 },
    { department: 'Product', rate: 80, timeToHire: 22, cost: 7800, qualityScore: 87 },
    { department: 'Design', rate: 88, timeToHire: 19, cost: 6800, qualityScore: 93 },
  ];

  const efficiencyTrends = [
    { month: 'Jan', efficiency: 75, cost: 7500, turnoverRate: 5 },
    { month: 'Feb', efficiency: 78, cost: 7200, turnoverRate: 4.8 },
    { month: 'Mar', efficiency: 82, cost: 6900, turnoverRate: 4.5 },
    { month: 'Apr', efficiency: 85, cost: 6700, turnoverRate: 4.2 },
    { month: 'May', efficiency: 83, cost: 6800, turnoverRate: 4.3 },
    { month: 'Jun', efficiency: 88, cost: 6500, turnoverRate: 4.0 },
  ];

  // Predictive Analytics Calculation (Simple Linear Regression Example)
  const calculatePredictions = useCallback(() => {
    const hires = monthlyHiringData.map(d => d.hires);
    const trend = hires.reduce((acc, val, idx) => acc + (val - hires[0]) / (idx + 1), 0);
    return Array(predictionPeriod).fill().map((_, i) => ({
      month: `Future ${i + 1}`,
      predictedHires: Math.round(hires[hires.length - 1] + trend * (i + 1)),
    }));
  }, [predictionPeriod, monthlyHiringData]);

  // Report Generation with Export
  const generateReport = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setShowReport(true);
      setIsLoading(false);
    }, 1000);
  }, []);

  const exportReport = () => {
    const reportData = JSON.stringify({
      reportType,
      successRates,
      efficiencyTrends,
      monthlyHiringData,
      predictions: calculatePredictions(),
    }, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    saveAs(blob, `hiring_report_${reportType}_${new Date().toISOString()}.json`);
  };

  return (
    <div className="bg-gray-50 min-h-screen w-full">
      {/* Filters Section */}
      <div className="flex justify-between items-center mb-6 border-b bg-white p-4">
        <div className="text-gray-600 font-semibold text-lg">
          Hiring Analytics Dashboard
        </div>
        <div className="flex gap-4 items-center">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={[
              { value: '3m', label: 'Last 3 Months' },
              { value: '6m', label: 'Last 6 Months' },
              { value: '1y', label: 'Last Year' },
              { value: 'custom', label: 'Custom Range' },
            ]}
            className="w-40"
          />
          <Select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={[
              { value: 'all', label: 'All Departments' },
              { value: 'eng', label: 'Engineering' },
              { value: 'sales', label: 'Sales' },
              { value: 'marketing', label: 'Marketing' },
              { value: 'product', label: 'Product' },
              { value: 'design', label: 'Design' },
            ]}
            className="w-40"
          />
          <Select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
            ]}
            className="w-40"
          />
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mx-0">
        {/* Recruitment Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recruitment Trends & Predictions</CardTitle>
              <div className="flex gap-2">
                <Select
                  value={predictionPeriod}
                  onChange={(e) => setPredictionPeriod(Number(e.target.value))}
                  options={[1, 3, 6, 12].map(n => ({ value: n, label: `${n} Months` }))}
                  className="w-32"
                />
                <Button onClick={generateReport} disabled={isLoading}>
                  {isLoading ? 'Generating...' : 'Generate Report'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[...monthlyHiringData, ...calculatePredictions()]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="hires" stroke="#8884d8" name="Actual Hires" />
                  <Line type="monotone" dataKey="predictedHires" stroke="#82ca9d" name="Predicted Hires" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Success Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Department Success Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={successRates}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rate" fill="#8884d8" name="Success Rate (%)" />
                  <Bar dataKey="qualityScore" fill="#82ca9d" name="Quality Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Efficiency & Cost Analysis */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Efficiency & Cost Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={efficiencyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="efficiency" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Efficiency (%)" />
                  <Area type="monotone" dataKey="cost" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="Cost ($)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Turnover Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Turnover Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis dataKey="month" name="Month" />
                  <YAxis dataKey="turnoverRate" name="Turnover Rate (%)" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Turnover Rate" data={efficiencyTrends} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-0">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Detailed Report: {reportType.charAt(0).toUpperCase() + reportType.slice(1)}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="success" onClick={exportReport}>Export JSON</Button>
                  <Button variant="secondary" onClick={() => setShowReport(false)}>Close</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {successRates.map((dept, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-semibold mb-2">{dept.department}</h4>
                      <p>Success Rate: {dept.rate}%</p>
                      <p>Time to Hire: {dept.timeToHire} days</p>
                      <p>Cost per Hire: ${dept.cost}</p>
                      <p>Quality Score: {dept.qualityScore}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Key Insights & Recommendations</h4>
                  <ul className="list-disc pl-6 space-y-3">
                    <li>Highest Success: Design ({Math.max(...successRates.map(d => d.rate))}%)</li>
                    <li>Fastest Hiring: Sales ({Math.min(...successRates.map(d => d.timeToHire))} days)</li>
                    <li>Cost Efficient: Marketing (${Math.min(...successRates.map(d => d.cost))})</li>
                    <li>Recommendation: Focus on Design hiring strategies for other departments</li>
                    <li>Predicted hires next {predictionPeriod} months: {calculatePredictions().reduce((sum, p) => sum + p.predictedHires, 0)}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HiringAnalyticsDashboard;
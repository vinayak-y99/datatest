import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import {
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Label,
  BarChart,
  Bar
} from 'recharts';

const Analytics = () => {
  const hiringFunnelData = [
    { value: 100, name: 'Applications', fill: '#9c27b0' },
    { value: 80, name: 'Screened', fill: '#ba68c8' },
    { value: 45, name: 'Interviewed', fill: '#ce93d8' },
    { value: 20, name: 'Offers Made', fill: '#e1bee7' },
    { value: 15, name: 'Hired', fill: '#f3e5f5' },
  ];

  const timeToHireData = [
    { month: 'Jan', time: 35 },
    { month: 'Feb', time: 32 },
    { month: 'Mar', time: 30 },
    { month: 'Apr', time: 28 },
    { month: 'May', time: 25 },
    { month: 'Jun', time: 23 },
  ];

  const departmentData = [
    { name: 'Engineering', value: 35, fill: '#9c27b0' },
    { name: 'Sales', value: 25, fill: '#ba68c8' },
    { name: 'Marketing', value: 20, fill: '#ce93d8' },
    { name: 'HR', value: 10, fill: '#e1bee7' },
    { name: 'Operations', value: 10, fill: '#f3e5f5' },
  ];

  const interviewSuccessData = [
    { stage: 'Technical', success: 75, total: 100 },
    { stage: 'Cultural', success: 85, total: 100 },
    { stage: 'Leadership', success: 65, total: 100 },
    { stage: 'Final', success: 90, total: 100 },
  ];

  const tooltipStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 6,
    border: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    fontSize: '0.75rem'
  };

  return (
    <Box sx={{ p: 1 }}>
      <Grid container spacing={1}>
        {/* Hiring Funnel */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 1, height: '100%', borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom color="primary" sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
              Hiring Funnel
            </Typography>
            <Box sx={{ height: 250, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <RechartsTooltip 
                    formatter={(value) => [`${value} Candidates`, '']}
                    contentStyle={tooltipStyle}
                  />
                  <Funnel
                    data={hiringFunnelData}
                    dataKey="value"
                    labelStyle={{
                      fill: '#fff',
                      fontSize: 12,
                      fontWeight: 500,
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}
                  >
                    <LabelList position="right" fill="#666" stroke="none" dataKey="name" fontSize={11} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Time to Hire Trend */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 1, height: '100%', borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom color="primary" sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
              Time to Hire Trend
            </Typography>
            <Box sx={{ height: 250, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timeToHireData}
                  margin={{ top: 15, right: 25, left: 15, bottom: 15 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#666', fontSize: 11 }}
                    axisLine={{ stroke: '#ccc' }}
                  />
                  <YAxis
                    tick={{ fill: '#666', fontSize: 11 }}
                    axisLine={{ stroke: '#ccc' }}
                    label={{ value: 'Days', angle: -90, position: 'insideLeft', fill: '#666', fontSize: 11 }}
                  />
                  <RechartsTooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [`${value} days`, 'Time to Hire']}
                  />
                  <Line
                    type="monotone"
                    dataKey="time"
                    stroke="#7b1fa2"
                    strokeWidth={2}
                    dot={{ fill: '#7b1fa2', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 6, fill: '#7b1fa2', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Department Hiring Distribution */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 1, height: '100%', borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom color="primary" sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
              Department Hiring Distribution
            </Typography>
            <Box sx={{ height: 250, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <RechartsTooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [`${value}%`, 'Distribution']}
                  />
                  <Pie
                    data={departmentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      value,
                      name
                    }) => {
                      const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
                      const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                      const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#666"
                          fontSize={11}
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                        >
                          {`${name} (${value}%)`}
                        </text>
                      );
                    }}
                  >
                    <Label value="Total Hires" position="center" fontSize={11} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Interview Success Rate */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 1, height: '100%', borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom color="primary" sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
              Interview Success Rate
            </Typography>
            <Box sx={{ height: 250, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={interviewSuccessData}
                  margin={{ top: 15, right: 25, left: 15, bottom: 15 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="stage"
                    tick={{ fill: '#666', fontSize: 11 }}
                    axisLine={{ stroke: '#ccc' }}
                  />
                  <YAxis
                    tick={{ fill: '#666', fontSize: 11 }}
                    axisLine={{ stroke: '#ccc' }}
                    label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft', fill: '#666', fontSize: 11 }}
                  />
                  <RechartsTooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [`${value}%`, 'Success Rate']}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7b1fa2" stopOpacity={1} />
                      <stop offset="100%" stopColor="#9c27b0" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <Bar
                    dataKey="success"
                    fill="url(#barGradient)"
                    radius={[3, 3, 0, 0]}
                    label={{
                      position: 'top',
                      fill: '#666',
                      fontSize: 11,
                      formatter: (value) => `${value}%`
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
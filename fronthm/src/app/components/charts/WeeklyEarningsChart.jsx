import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const WeeklyEarningsChart = () => {
  const data = [
    { role: 'Manager', earnings: 854 },
    { role: 'Engineer', earnings: 844 },
    { role: 'Entrepreneur', earnings: 649 },
    { role: 'Lawyer', earnings: 563 },
    { role: 'Teacher', earnings: 503 },
    { role: 'Freelancer', earnings: 481 },
    { role: 'Doctor', earnings: 432 }
  ].sort((a, b) => b.earnings - a.earnings);

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
        >
          {/* <CartesianGrid strokeDasharray="3 3" horizontal={false} /> */}
          <XAxis
            type="number"
            // domain={[0, 1000]}
            // tickFormatter={(value) => `£${value}`}
          />
          <YAxis
            type="category"
            // dataKey="role"
            tick={{ fontSize: 14 }}
          />
          {/* <Tooltip 
            formatter={(value) => [`£${value}`, 'Weekly Earnings']}
            cursor={false}
          /> */}
          <Bar
            dataKey="earnings"
            fill="#64B5F6"
            barSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyEarningsChart;
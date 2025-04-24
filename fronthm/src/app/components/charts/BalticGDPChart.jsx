import React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const BalticGDPChart = () => {
  const data = [
    { name: 'Latvia', value: 33.8 },
    { name: 'Lithuania', value: 55.8 },
    { name: 'Estonia', value: 31.8 }
  ];

  const COLORS = ['#3498db', '#f39c12', '#2ecc71'];

  return (
    <div className="w-full h-48">
      {/* <h2 className="text-xl font-semibold text-center mb-4">The GDP of Baltic States</h2> */}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            // label={({ name, value }) => `${name} ($${value}B)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          {/* <Tooltip 
            formatter={(value) => [`$${value}B`, 'GDP']}
          /> */}
          {/* <Legend /> */}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BalticGDPChart;
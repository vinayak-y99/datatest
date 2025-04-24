<div 
  className="bg-white shadow-sm border-gray-200 flex items-center"
  suppressHydrationWarning
>
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={prepareChartData(section.data, sectionKey)}>
      <XAxis 
        dataKey="name" 
        axisLine={true}
        tickLine={false}
        tick={false}
        suppressHydrationWarning
      />
      <YAxis 
        domain={[0, useRatings ? 10 : 100]}
        axisLine={true}
        suppressHydrationWarning
      />
      <Tooltip />
      <Bar dataKey="value" fill={COLORS[Object.keys(sections).indexOf(sectionKey)]} />
    </BarChart>
  </ResponsiveContainer>
</div> 
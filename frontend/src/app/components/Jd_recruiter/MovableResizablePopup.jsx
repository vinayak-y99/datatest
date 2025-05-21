import React, { useState, useRef, useEffect } from 'react';

const ScorePieChart = ({ containerWidth, containerHeight }) => {
  const scoreData = [
    { name: 'Database', color: '#F59E0B', percentage: 30 },
    { name: 'Achievement', color: '#10B981', percentage: 10 },
    { name: 'Deployment', color: '#EF4444', percentage: 10 },
  ];

  const totalScore = scoreData.reduce((sum, item) => sum + item.percentage, 0);

  const calculatePieSlices = (data) => {
    let currentAngle = 0;
    return data.map((item) => {
      const percentage = item.percentage;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      return { ...item, startAngle, angle };
    });
  };

  const pieSlices = calculatePieSlices(scoreData);

  const baseChartSize = 100;
  const chartSize = Math.min(
    Math.max(baseChartSize, containerWidth * 0.35),
    containerHeight * 0.45
  );
  const radius = chartSize * 0.4;

  const renderPieChart = (score, title) => {
    return (
      <div className="relative flex flex-col items-center transition-all duration-300 hover:scale-105 w-full">
        <svg
          viewBox={`0 0 ${chartSize} ${chartSize}`}
          className="mb-1 w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
          style={{ maxWidth: `${chartSize}px`, maxHeight: `${chartSize}px` }}
        >
          <circle
            cx={chartSize / 2}
            cy={chartSize / 2}
            r={radius}
            fill="white"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
          {pieSlices.map((slice, index) => {
            const x1 = chartSize / 2 + radius * Math.cos((Math.PI * slice.startAngle) / 180);
            const y1 = chartSize / 2 + radius * Math.sin((Math.PI * slice.startAngle) / 180);
            const x2 =
              chartSize / 2 +
              radius * Math.cos((Math.PI * (slice.startAngle + slice.angle)) / 180);
            const y2 =
              chartSize / 2 +
              radius * Math.sin((Math.PI * (slice.startAngle + slice.angle)) / 180);

            const largeArcFlag = slice.angle > 180 ? 1 : 0;

            return (
              <path
                key={index}
                d={`M ${chartSize / 2} ${chartSize / 2} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                fill={slice.color}
                className="transition-all duration-300 hover:opacity-90"
              />
            );
          })}
          <text
            x={chartSize / 2}
            y={chartSize / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[clamp(8px,2vw,12px)] font-bold text-gray-900 drop-shadow-sm"
          >
            {score}
          </text>
          <text
            x={chartSize / 2}
            y={chartSize / 2 + radius * 0.3}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[clamp(6px,1.5vw,10px)] font-medium text-gray-600"
          >
            Total Score
          </text>
        </svg>
        <div className="mt-0.5 text-center">
          <h3 className="text-[clamp(6px,1.5vw,10px)] font-semibold text-gray-800 bg-gradient-to-r from-blue-100 to-purple-100 px-1 py-0.5 rounded-full shadow-sm">
            {title}
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-0.5 w-full px-1 mt-0.5">
          {scoreData.map((item, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-1.5 h-1.5 mr-0.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[clamp(6px,1.5vw,10px)] text-gray-700 font-medium truncate">
                {item.name}
              </span>
              <span className="ml-auto text-[clamp(6px,1.5vw,10px)] font-semibold text-gray-600">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-1 border border-gray-100 w-full h-full flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-center items-start space-y-2 sm:space-y-0 sm:space-x-2 w-full h-full">
        <div className="flex flex-col items-center w-full sm:w-1/2">
          <h3 className="text-[clamp(6px,1.5vw,10px)] font-semibold text-gray-700 mb-0.5">
            Selection Score
          </h3>
          {renderPieChart(totalScore, 'Selection Score')}
        </div>
        <div className="flex flex-col items-center w-full sm:w-1/2">
          <h3 className="text-[clamp(6px,1.5vw,10px)] font-semibold text-gray-700 mb-0.5">
            Rejection Score
          </h3>
          {renderPieChart(totalScore, 'Rejection Score')}
        </div>
      </div>
    </div>
  );
};

const MovableResizablePopup = ({ children, onClose }) => {
  const popupRef = useRef(null);
  const [position, setPosition] = useState({ 
    x: window.innerWidth - 300, // Adjusted to match width
    y: (window.innerHeight - 250) / 2 
  });
  const [size, setSize] = useState({ width: 300, height: 250 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDownDrag = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseDownResize = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
    if (isResizing) {
      setSize({
        width: Math.max(250, size.width + (e.clientX - dragStart.x)),
        height: Math.max(200, size.height + (e.clientY - dragStart.y)),
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart]);

  return (
    <div
      ref={popupRef}
      className="fixed rounded-lg shadow-xl border border-gray-100 bg-white overflow-hidden backdrop-blur-sm"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: 1000,
        background: 'linear-gradient(135deg, #ffffff, #f3f4f6)',
      }}
    >
      <div
        onMouseDown={handleMouseDownDrag}
        className="bg-gradient-to-r from-blue-100 to-purple-100 p-1 flex justify-between items-center cursor-move rounded-t-lg"
      >
        <h2 className="text-[clamp(8px,1.5vw,12px)] font-bold text-gray-900">Score Details</h2>
        <button
          onClick={onClose}
          className="bg-red-500 text-white px-0.5 py-0.5 rounded-full hover:bg-red-600 transition-all duration-300 flex items-center shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-2 w-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="w-full h-[calc(100%-2rem)] flex items-center justify-center overflow-hidden">
        <ScorePieChart
          containerWidth={size.width}
          containerHeight={size.height - 32} // Subtract header height (2rem ≈ 32px)
        />
        {children}
      </div>
      <div
        onMouseDown={handleMouseDownResize}
        className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity rounded-full"
      />
    </div>
  );
};

export default MovableResizablePopup;
import React, { useState, useRef, useEffect } from 'react';

const MovableResizablePopup = ({ onClose }) => {
  const popupRef = useRef(null);
  const [position, setPosition] = useState({ 
    x: window.innerWidth - 220, // 180 width + 60px from right
    y: window.innerHeight - 130  // Matches height, 0px from bottom
  });
  const [size, setSize] = useState({ width: 180, height: 120 });
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
        width: Math.max(120, size.width + (e.clientX - dragStart.x)),
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
      <div className="w-full h-[calc(100%-2rem)] flex flex-col items-center justify-center overflow-hidden p-4">
        <div className="flex flex-col items-center w-full space-y-4">
          <div className="text-center">
            <h3 className="text-[clamp(10px,2vw,16px)] font-semibold text-gray-700">
              Selection Score: 50
            </h3>
          </div>
          <div className="text-center">
            <h3 className="text-[clamp(10px,2vw,16px)] font-semibold text-gray-700">
              Rejection Score: 40
            </h3>
          </div>
        </div>
      </div>
      <div
        onMouseDown={handleMouseDownResize}
        className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity rounded-full"
      />
    </div>
  );
};

export default MovableResizablePopup;
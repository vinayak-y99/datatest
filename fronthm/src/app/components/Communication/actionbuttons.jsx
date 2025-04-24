"use client";
import React, { useRef, useState } from "react";
import Coding from './page';

const actions = [
  {
    icon: "📄",
    text: " Job Description",
  },
  {
    icon: "📑",
    text: " Resume",
  },
  {
    icon: "📂",
    text: " HR DB",
  },
  {
    icon: "🤖",
    text: " ATS",
  },
];

const validateFile = (file) => {
  const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!validTypes.includes(file.type)) {
    alert('Please upload PDF or DOCX files only');
    return false;
  }
  return true;
}

export default function ActionButtons() {
  const fileInputRef = useRef(null);
  const [showThreshold, setShowThreshold] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleClick = (action) => {
    if (action === " Job Description" || action === " Resume") {
      fileInputRef.current.click();
    } else if (action === " HR DB") {
      alert("Linking to HR DB...");
    } else if (action === " ATS") {
      alert("Opening ATS System...");
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      const action = fileInputRef.current.getAttribute('data-action');
      
      if (action === ' Job Description') {
        alert(`Job Description uploaded: ${file.name}`);
        setShowThreshold(true);
      } else if (action === ' Resume') {
        alert(`Resume uploaded: ${file.name}`);
        setShowThreshold(true);
      } else {
        alert(`Selected file: ${file.name}`);
      }
    }
  };

  return (
    <>
      <div className="flex gap-2">
        {actions.map((action, index) => (
          <button
            key={index}
            className="flex items-center px-2 py-1 rounded-lg border border-[#8d94e6] text-[#3e48b6] cursor-pointer hover:bg-[#f0f2ff]"
            onClick={() => {
              fileInputRef.current.setAttribute('data-action', action.text);
              handleClick(action.text);
            }}
            suppressHydrationWarning
          >
            <span className="mr-2">{action.icon}</span>
            {action.text}
          </button>
        ))}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.docx"
          suppressHydrationWarning
        />
      </div>
      {showThreshold && <Coding selectedFile={selectedFile} />}
    </>
  );
}

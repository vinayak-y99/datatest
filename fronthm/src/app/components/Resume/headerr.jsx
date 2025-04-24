"use client";
import React, { useState } from 'react';

import ProfileActionV from '../../mainDashboard/profileaa';
import RecruiterDashboard from '../../components/scoring';
import SearchBar from "../../components/searchBar";
import ActionButtons from '../../components/actionbuttons';

export default function Header() {
  // Define state or functions here
  const [viewItems, setViewItems] = useState(false);

  const handleShowThreshold = () => {
    // Your logic here
    console.log('Showing Threshold');
  };

  const handleShowJobDescription = () => {
    console.log('Showing Job Description');
  };

  const handleShowResume = () => {
    console.log('Showing Resume');
  };

  const handleShowCommunicationSkills = () => {
    console.log('Showing Communication Skills');
  };

  const handleShowCoding = () => {
    console.log('Showing Coding');
  };

  const handleShowBehaviouralSkills = () => {
    console.log('Showing Behavioural Skills');
  };

  const handleShowHrSystem = () => {
    console.log('Showing HR System');
  };

  const handleShowCommondashBoard = () => {
    console.log('Showing Common Dashboard');
  };

  return (
    <header className="flex flex-col self-stretch w-full max-md:max-w-full">
      <div className="flex flex-wrap gap-10 justify-between items-center px-8 py-1.5 w-full bg-white border-b border-solid border-b-stone-300 min-h-[48px] max-md:px-5 max-md:max-w-full">
        <h1 className="gap-1 self-stretch my-auto text-2xl font-bold uppercase rotate-[-0.032deg] text-slate-700 w-[181px]">
          <span className="uppercase text-slate-700">FastHire</span>99
        </h1>
        <div className="flex gap-10 items-center self-stretch my-auto text-center w-[58px]">
          <div className="flex gap-9 items-center self-stretch my-auto min-h-[36px] w-[58px]">
            <div className="flex gap-1.5 items-center self-stretch my-auto">
              <div className="flex gap-4 items-center self-stretch my-auto">
                <div className="flex gap-1.5 items-center self-stretch my-auto">
                  <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/9b9d0deb94edbc51529ae070a6c941023ea77dbec1049ebec2996eade67bc489?placeholderIfAbsent=true&apiKey=cc964368bac44d9ca0eed220fa7a4da9" alt="" className="object-contain shrink-0 self-stretch my-auto w-9 aspect-square" />
                  <div className="flex flex-col items-start self-stretch my-auto">
                    <div className="text-sm font-medium text-slate-700">CSR GenAI</div>
                    <div className="mt-1.5 text-xs text-gray-500">Recruiter</div>
                  </div>
                  <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/c88c435fc1fa01526abbdd224bc7a45eff4ba2712a6af5f2a617e6719c192713?placeholderIfAbsent=true&apiKey=cc964368bac44d9ca0eed220fa7a4da9" alt="" className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex items-center mt-4 pl-8 w-full text-base font-bold leading-none whitespace-nowrap">
        <p style={{fontSize:'18px'}}>Dashboard</p>
      </nav>

      <div className="space-y-2 bg-white rounded-lg shadow-md mx-8 mt-4 p-2">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          {/* Left side: SearchBar and ActionButtons */}
          <div className="flex items-center gap-4">
            <SearchBar />
            <ActionButtons />
          </div>

          {/* Right side: ProfileActionV */}
          <ProfileActionV
            onShowThreshold={handleShowThreshold}
            onShowJobDescription={handleShowJobDescription}
            onShowResume={handleShowResume}
            onShowCommunicationSkills={handleShowCommunicationSkills}
            onShowCoding={handleShowCoding}
            onShowBehaviouralSkills={handleShowBehaviouralSkills}
            onShowHrSystem={handleShowHrSystem}
            onShowCommondashBoard={handleShowCommondashBoard}
            ViewItems={viewItems}
          />
        </div>
      </div>

      <div className="space-y-2 bg-white rounded-lg shadow-md mx-8 mt-4 p-2">
        <div className="flex-auto">
          <div className="flex space-x-25">
            <p className="mr-[328px]">Threshold Score</p>
            <p>Interviews</p>
          </div>
          <RecruiterDashboard />
        </div>
      </div>
    </header>
  );
}

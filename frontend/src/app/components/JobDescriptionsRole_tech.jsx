import React, { useState } from 'react';
import ResumeTab from './Resume/ResumeTab';
import JDTab_tech from './JD_tech/JDTab_tech';
import CodingTab from './Coding/CodingTab';
import CommunicationTab from './Communication/CommunicationTab';
import BehaviorTab from './Behavior/BehaviorTab';
import ThresholdTab from './Threshold/ThresholdTab'; 


const Tabs = () => {
  const [activeTab, setActiveTab] = useState('threshold'); // Default tab is 'threshold'
  const [resumeList, setResumeList] = useState([]); // Shared resume list
  const [jdList, setJdList] = useState([]); // JD list remains separate

  return (
    <div className="container mx-auto p-2">
      <div className="flex border-b pb-4 mb-4">
        {['jd', 'resume'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`p-4 ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-500' : 'border-transparent'}`}
          >
            {tab === 'jd' ? 'Job description' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div>

        {activeTab === 'jd' && <JDTab_tech jdList={jdList} setJdList={setJdList} />}
        {activeTab === 'resume' && <ResumeTab resumeList={resumeList} setResumeList={setResumeList} />}
 
      </div>
    </div>
  );
};

export default Tabs;
import React, { useState } from 'react';
import JDTab_thresh from './Jd_threshold/JDTab_thresh';

const Tabs = () => {
  const [jdList, setJdList] = useState([]); // JD list remains separate

  return (
    <div className="container mx-auto p-2 mt-5">
      {/* Removed the tab selection buttons */}
      <div>
        {/* Directly display the JD tab content */}
        <JDTab_thresh jdList={jdList} setJdList={setJdList} />
      </div>
    </div>
  );
};

export default Tabs;

import React, { useState } from 'react';
const PostSelection = () => {
  const [selectedStatus, setSelectedStatus] = useState('selected'); // 'selected' or 'rejected'
  const [feedback, setFeedback] = useState('');
  const [offerDetails, setOfferDetails] = useState({
    proposedSalary: '',
    startDate: '',
    notes: ''
  });

  // Sample team members data
  const [teamMembers] = useState([
    { id: 1, name: 'John Doe', role: 'Manager' },
    { id: 2, name: 'Jane Smith', role: 'Senior Manager' },
    { id: 3, name: 'Mike Johnson', role: 'Team Lead' }
  ]);

  // Sample alternative roles
  const [alternativeRoles] = useState([
    {
      id: 1,
      title: 'Senior Developer',
      fitmentScore: 85,
      skillsMatch: ['JavaScript', 'React', 'Node.js']
    },
    {
      id: 2,
      title: 'Technical Lead',
      fitmentScore: 78,
      skillsMatch: ['Leadership', 'Architecture', 'Communication']
    }
  ]);

  const [selectedAlternativeRoles, setSelectedAlternativeRoles] = useState([]);

  const handlePostSelectionAction = (action) => {
    console.log(`Post-selection action: ${action}`);
    // Add implementation for API calls or state updates
  };

  const handleOnboardingManagerAssignment = (managerId) => {
    console.log('Assigned manager:', managerId);
    // Add implementation for API calls or state updates
  };

  const handleAlternativeRoleSelection = (roleId) => {
    setSelectedAlternativeRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleFeedbackSubmission = () => {
    console.log('Feedback submitted:', feedback);
    // Add implementation for API calls or state updates
  };

  const Step = ({ title, active, completed, children }) => (
    <div className="ml-8 relative pb-8 last:pb-0">
      <div className="absolute left-[-2rem] flex items-center justify-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center 
          ${completed ? 'bg-green-500' : active ? 'bg-blue-500' : 'bg-gray-300'} text-white`}>
        </div>
        {!completed && <div className="absolute h-full w-0.5 bg-gray-200 top-8 left-4" />}
      </div>
      <div className="mb-2 font-semibold">{title}</div>
      <div className="ml-2">{children}</div>
    </div>
  );

  return (
    <div className="p-4">
      <div className="space-y-4">
        {/* Status Selection */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Candidate Status</label>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {selectedStatus === 'selected' ? (
          // Selected Candidate Flow
          <div className="space-y-6">
            {/* Offer Approval Process */}
            <Step title="Offer Approval Process" active={true} completed={false}>
              <div className="space-y-4">
                <input
                  type="number"
                  value={offerDetails.proposedSalary}
                  onChange={(e) => setOfferDetails(prev => ({
                    ...prev,
                    proposedSalary: e.target.value
                  }))}
                  placeholder="Proposed Salary"
                  className="w-full p-2 border rounded-md"
                />
                <input
                  type="date"
                  value={offerDetails.startDate}
                  onChange={(e) => setOfferDetails(prev => ({
                    ...prev,
                    startDate: e.target.value
                  }))}
                  className="w-full p-2 border rounded-md"
                />
                <textarea
                  value={offerDetails.notes}
                  onChange={(e) => setOfferDetails(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  placeholder="Additional Notes"
                  className="w-full p-2 border rounded-md"
                />
                <button 
                  onClick={() => handlePostSelectionAction('offer_approval')}
                  className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Trigger Approval
                </button>
              </div>
            </Step>

            {/* Background Verification */}
            <Step title="Background Verification" active={true} completed={false}>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="background-check" />
                  <label htmlFor="background-check">
                    Background check required
                  </label>
                </div>
                <button 
                  onClick={() => handlePostSelectionAction('background_check')}
                  className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Initiate Verification
                </button>
              </div>
            </Step>

            {/* Onboarding Manager Assignment */}
            <Step title="Onboarding Manager Assignment" active={true} completed={false}>
              <div className="space-y-4">
                <select 
                  className="w-full p-2 border rounded-md"
                  onChange={(e) => handleOnboardingManagerAssignment(e.target.value)}
                >
                  <option value="">Select Onboarding Manager</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </option>
                  ))}
                </select>
              </div>
            </Step>
          </div>
        ) : (
          // Rejected Candidate Flow
          <div className="space-y-6">
            {/* Feedback Section */}
            <div className="space-y-4">
              <h3 className="font-medium">Rejection Feedback</h3>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Please provide detailed feedback for future reference"
                className="w-full p-2 border rounded-md h-32"
              />
              <button
                onClick={handleFeedbackSubmission}
                className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save Feedback
              </button>
            </div>

            {/* Alternative Roles Section */}
            <div className="space-y-4">
              <h3 className="font-medium">Alternative Role Recommendations</h3>
              <div className="space-y-4">
                {alternativeRoles.map(role => (
                  <div key={role.id} className="p-4 border rounded-md space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{role.title}</h3>
                      <span className="text-blue-600">{role.fitmentScore}% Match</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Skills Match:</p>
                      <div className="flex flex-wrap gap-2">
                        {role.skillsMatch.map((skill, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAlternativeRoleSelection(role.id)}
                      className={`w-full p-2 rounded-md ${
                        selectedAlternativeRoles.includes(role.id)
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      {selectedAlternativeRoles.includes(role.id)
                        ? 'Selected for Consideration'
                        : 'Consider for Role'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostSelection;
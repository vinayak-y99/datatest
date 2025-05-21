import React, { useState, useMemo } from 'react';

export default function CandidateComparison() {
  // Sample data
  const [candidates, setCandidates] = useState([
    { id: 1, name: "Alex Johnson", role: "Frontend Developer", skills: ["React", "JavaScript", "CSS", "HTML"], experience: 4, score: 85, interviewFeedback: "Strong technical skills, good cultural fit", salary: 95000 },
    { id: 2, name: "Jamie Smith", role: "Frontend Developer", skills: ["Angular", "TypeScript", "SASS", "HTML"], experience: 3, score: 78, interviewFeedback: "Good problem-solving abilities, needs mentoring", salary: 88000 },
    { id: 3, name: "Taylor Wilson", role: "Backend Developer", skills: ["Node.js", "Python", "MongoDB", "SQL"], experience: 5, score: 92, interviewFeedback: "Excellent system design skills, great communicator", salary: 105000 },
    { id: 4, name: "Morgan Lee", role: "Backend Developer", skills: ["Java", "Spring", "Oracle", "Microservices"], experience: 6, score: 88, interviewFeedback: "Strong in architecture, average on coding tests", salary: 110000 },
    { id: 5, name: "Casey Brown", role: "UX Designer", skills: ["Figma", "Adobe XD", "User Research", "Prototyping"], experience: 4, score: 90, interviewFeedback: "Creative, user-centered approach, portfolio impressed", salary: 92000 },
    { id: 6, name: "Jordan Miller", role: "UX Designer", skills: ["Sketch", "InVision", "User Testing", "Wireframing"], experience: 2, score: 75, interviewFeedback: "Good visual design skills, limited research experience", salary: 82000 },
    { id: 7, name: "Riley Davis", role: "Product Manager", skills: ["Agile", "Roadmapping", "Analytics", "Stakeholder Management"], experience: 7, score: 89, interviewFeedback: "Strategic thinker, strong leadership potential", salary: 120000 },
    { id: 8, name: "Quinn Evans", role: "Data Scientist", skills: ["Python", "R", "Machine Learning", "SQL", "Statistics"], experience: 3, score: 95, interviewFeedback: "Exceptional analytical abilities, good technical foundation", salary: 98000 },
  ]);

  const [jobs, setJobs] = useState([
    { id: 1, title: "Frontend Developer", department: "Engineering", requiredSkills: ["JavaScript", "React", "HTML", "CSS"], minExperience: 2, salary: { min: 80000, max: 110000 }, description: "Develop responsive web applications" },
    { id: 2, title: "Backend Developer", department: "Engineering", requiredSkills: ["Node.js", "Python", "SQL", "API Design"], minExperience: 3, salary: { min: 90000, max: 120000 }, description: "Build scalable server-side solutions" },
    { id: 3, title: "UX Designer", department: "Design", requiredSkills: ["Figma", "User Research", "Prototyping", "Wireframing"], minExperience: 2, salary: { min: 75000, max: 105000 }, description: "Create user-centered designs" },
    { id: 4, title: "Product Manager", department: "Product", requiredSkills: ["Agile", "Roadmapping", "Stakeholder Management", "Analytics"], minExperience: 5, salary: { min: 100000, max: 140000 }, description: "Lead product strategy" },
    { id: 5, title: "Data Scientist", department: "Data", requiredSkills: ["Python", "R", "Machine Learning", "Statistics"], minExperience: 2, salary: { min: 85000, max: 115000 }, description: "Analyze complex datasets" },
  ]);

  // UI states
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [filterSkill, setFilterSkill] = useState("");
  const [sortCriteria, setSortCriteria] = useState("score");
  const [sortDirection, setSortDirection] = useState("desc");
  const [view, setView] = useState("comparison");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: "", role: "", experience: "", skills: "", score: "", salary: "", interviewFeedback: ""
  });
  const [selectedJobForComparison, setSelectedJobForComparison] = useState("");

  // Memoized calculations
  const allSkills = useMemo(() => {
    const skillSet = new Set();
    candidates.forEach(candidate => candidate.skills.forEach(skill => skillSet.add(skill)));
    return Array.from(skillSet).sort();
  }, [candidates]);

  const uniqueRoles = useMemo(() => [...new Set(candidates.map(candidate => candidate.role))], [candidates]);

  const filteredCandidates = useMemo(() => {
    let filtered = [...candidates];
    if (selectedRoles.length > 0) filtered = filtered.filter(candidate => selectedRoles.includes(candidate.role));
    if (filterSkill) filtered = filtered.filter(candidate => 
      candidate.skills.some(skill => skill.toLowerCase().includes(filterSkill.toLowerCase()))
    );
    return filtered.sort((a, b) => 
      sortDirection === "asc" ? a[sortCriteria] - b[sortCriteria] : b[sortCriteria] - a[sortCriteria]
    );
  }, [candidates, selectedRoles, filterSkill, sortCriteria, sortDirection]);

  const trendsData = useMemo(() => {
    const skillFrequency = {};
    const roleStats = {};
    
    candidates.forEach(candidate => {
      candidate.skills.forEach(skill => skillFrequency[skill] = (skillFrequency[skill] || 0) + 1);
      if (!roleStats[candidate.role]) {
        roleStats[candidate.role] = { count: 0, totalScore: 0, totalExperience: 0, totalSalary: 0 };
      }
      const role = roleStats[candidate.role];
      role.count++;
      role.totalScore += candidate.score;
      role.totalExperience += candidate.experience;
      role.totalSalary += candidate.salary;
    });
    
    Object.keys(roleStats).forEach(role => {
      const stats = roleStats[role];
      stats.avgScore = Math.round(stats.totalScore / stats.count);
      stats.avgExperience = +(stats.totalExperience / stats.count).toFixed(1);
      stats.avgSalary = Math.round(stats.totalSalary / stats.count);
    });
    
    const topSkills = Object.entries(skillFrequency).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return { skillFrequency: topSkills, roleStats };
  }, [candidates]);

  const crossRoleFitment = useMemo(() => {
    const fitment = [];
    
    candidates.forEach(candidate => {
      jobs.forEach(job => {
        if (job.title !== candidate.role) {
          const matchingSkills = candidate.skills.filter(skill => job.requiredSkills.includes(skill));
          const skillMatchPercentage = Math.round((matchingSkills.length / job.requiredSkills.length) * 100);
          const meetsExperience = candidate.experience >= job.minExperience;
          const salaryFit = candidate.salary >= job.salary.min && candidate.salary <= job.salary.max;
          const experienceDelta = candidate.experience - job.minExperience;
          const potentialGrowth = skillMatchPercentage >= 60 && experienceDelta >= 0;

          if (skillMatchPercentage >= 40 && meetsExperience) {
            fitment.push({
              candidateId: candidate.id,
              candidateName: candidate.name,
              currentRole: candidate.role,
              potentialRole: job.title,
              skillMatchPercentage,
              matchingSkills,
              missingSkills: job.requiredSkills.filter(skill => !candidate.skills.includes(skill)),
              salary: { current: candidate.salary, potential: job.salary, withinRange: salaryFit },
              experienceFit: { current: candidate.experience, required: job.minExperience, delta: experienceDelta },
              potentialGrowth,
              recommendation: potentialGrowth ? "Strong Fit" : "Moderate Fit",
              trainingNeeds: job.requiredSkills
                .filter(skill => !candidate.skills.includes(skill))
                .map(skill => ({ skill, difficulty: Math.random() > 0.5 ? "Intermediate" : "Basic" }))
            });
          }
        }
      });
    });
    
    return fitment.sort((a, b) => b.skillMatchPercentage - a.skillMatchPercentage);
  }, [candidates, jobs]);

  // Event handlers
  const toggleCandidateSelection = (candidateId) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) ? prev.filter(id => id !== candidateId) : [...prev, candidateId]
    );
  };

  const toggleRoleFilter = (role) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCandidate(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const skillsArray = newCandidate.skills.split(',').map(skill => skill.trim());
    const newId = Math.max(...candidates.map(c => c.id)) + 1;
    
    setCandidates(prev => [...prev, {
      id: newId,
      name: newCandidate.name,
      role: newCandidate.role,
      skills: skillsArray,
      experience: parseInt(newCandidate.experience),
      score: parseInt(newCandidate.score),
      interviewFeedback: newCandidate.interviewFeedback,
      salary: parseInt(newCandidate.salary)
    }]);
    
    setNewCandidate({ name: "", role: "", experience: "", skills: "", score: "", salary: "", interviewFeedback: "" });
    setIsModalOpen(false);
  };

  const exportTrendsData = () => {
    const csv = [
      "Skill,Frequency",
      ...trendsData.skillFrequency.map(([skill, count]) => `${skill},${count}`),
      "\nRole Statistics",
      "Role,Count,Avg Score,Avg Experience,Avg Salary",
      ...Object.entries(trendsData.roleStats).map(([role, stats]) => 
        `${role},${stats.count},${stats.avgScore},${stats.avgExperience},${stats.avgSalary}`
      )
    ].join("\n");
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trends_data.csv';
    a.click();
  };

  // View renderers
  const renderComparisonView = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Candidate Comparison</h2>
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
          <div className="flex flex-wrap gap-2">
            {uniqueRoles.map(role => (
              <button
                key={role}
                onClick={() => toggleRoleFilter(role)}
                className={`px-3 py-1 rounded-full text-sm ${selectedRoles.includes(role) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Skill</label>
          <input
            type="text"
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
            placeholder="Enter skill..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <div className="flex">
            <select
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-l-md"
            >
              <option value="score">Evaluation Score</option>
              <option value="experience">Experience</option>
              <option value="salary">Salary Expectations</option>
            </select>
            <button
              onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
              className="px-3 py-2 border border-gray-300 border-l-0 rounded-r-md bg-gray-50"
            >
              {sortDirection === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>
        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Compare to Job</label>
          <select
            value={selectedJobForComparison}
            onChange={(e) => setSelectedJobForComparison(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Job</option>
            {jobs.map(job => (
              <option key={job.id} value={job.title}>{job.title}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="h-4 w-4 mr-2"
                  onChange={(e) => setSelectedCandidates(e.target.checked ? filteredCandidates.map(c => c.id) : [])}
                  checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
                />
                Candidate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
              {selectedJobForComparison && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Match %</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCandidates.map((candidate) => {
              const jobMatch = selectedJobForComparison ? 
                jobs.find(j => j.title === selectedJobForComparison) : null;
              const matchPercentage = jobMatch ? 
                Math.round((candidate.skills.filter(skill => jobMatch.requiredSkills.includes(skill)).length / jobMatch.requiredSkills.length) * 100) : null;
              
              return (
                <tr 
                  key={candidate.id} 
                  className={`hover:bg-blue-50 ${selectedCandidates.includes(candidate.id) ? 'bg-blue-50' : ''}`}
                  onClick={() => toggleCandidateSelection(candidate.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 mr-2"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => {}}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                        <div className="text-xs text-gray-500">ID: {candidate.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {candidate.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  {selectedJobForComparison && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="h-2.5 rounded-full bg-blue-600"
                            style={{ width: `${matchPercentage}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm">{matchPercentage}%</span>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.experience} years</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            candidate.score >= 90 ? 'bg-green-600' : 
                            candidate.score >= 75 ? 'bg-blue-600' : 
                            candidate.score >= 60 ? 'bg-yellow-500' : 'bg-red-600'
                          }`}
                          style={{ width: `${candidate.score}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-900">{candidate.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${candidate.salary.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {selectedCandidates.length > 1 && (
        <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Candidate Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedCandidates.map(id => {
              const candidate = candidates.find(c => c.id === id);
              if (!candidate) return null;
              return (
                <div key={id} className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-medium text-lg mb-2">{candidate.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{candidate.role} • {candidate.experience} years</p>
                  {selectedJobForComparison && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">Match with {selectedJobForComparison}</div>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="h-2.5 rounded-full bg-blue-600"
                            style={{ width: `${Math.round((candidate.skills.filter(skill => jobs.find(j => j.title === selectedJobForComparison).requiredSkills.includes(skill)).length / jobs.find(j => j.title === selectedJobForComparison).requiredSkills.length) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm">{Math.round((candidate.skills.filter(skill => jobs.find(j => j.title === selectedJobForComparison).requiredSkills.includes(skill)).length / jobs.find(j => j.title === selectedJobForComparison).requiredSkills.length) * 100)}%</span>
                      </div>
                    </div>
                  )}
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">Skills</div>
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">Feedback</div>
                    <p className="text-sm text-gray-700">"{candidate.interviewFeedback}"</p>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Salary Expectation</div>
                    <p className="text-sm text-gray-700">${candidate.salary.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderTrendsView = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Hiring Insights & Trends</h2>
        <button 
          onClick={exportTrendsData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Export Insights
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Top Skills in Demand</h3>
          <div className="space-y-3">
            {trendsData.skillFrequency.map(([skill, count], index) => (
              <div key={skill} className="flex items-center">
                <div className="w-40 text-sm truncate">{skill}</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full bg-blue-600" 
                      style={{ width: `${Math.min(100, (count / trendsData.skillFrequency[0][1]) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-2 text-sm">{count}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Role Statistics</h3>
          <div className="space-y-4">
            {Object.entries(trendsData.roleStats).map(([role, stats]) => (
              <div key={role} className="bg-white p-3 rounded border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{role}</h4>
                  <span className="text-sm text-gray-500">{stats.count} candidates</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-xs text-gray-500">Avg Score</div>
                    <div className="font-medium">{stats.avgScore}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Avg Experience</div>
                    <div className="font-medium">{stats.avgExperience} yrs</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Avg Salary</div>
                    <div className="font-medium">${(stats.avgSalary / 1000).toFixed(0)}k</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Evaluation Consistency</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score Range</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience Range</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary Range</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {uniqueRoles.map(role => {
                  const roleCandidates = candidates.filter(c => c.role === role);
                  const minScore = Math.min(...roleCandidates.map(c => c.score));
                  const maxScore = Math.max(...roleCandidates.map(c => c.score));
                  const minExp = Math.min(...roleCandidates.map(c => c.experience));
                  const maxExp = Math.max(...roleCandidates.map(c => c.experience));
                  const minSalary = Math.min(...roleCandidates.map(c => c.salary));
                  const maxSalary = Math.max(...roleCandidates.map(c => c.salary));
                  return (
                    <tr key={role}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{roleCandidates.length}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {minScore} - {maxScore}
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div className="h-1.5 rounded-full bg-blue-600" style={{ width: '100%' }}></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{minExp} - {maxExp} years</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(minSalary/1000).toFixed(0)}k - ${(maxSalary/1000).toFixed(0)}k</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFitmentView = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Cross-Role Fitment Analysis</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Export Fitment Report
        </button>
      </div>
      <div className="mb-6">
        <p className="text-gray-600">Showing {crossRoleFitment.length} potential role transitions</p>
        <div className="mt-2 flex gap-4">
          <select className="px-3 py-2 border rounded-md">
            <option>Filter by Current Role</option>
            {uniqueRoles.map(role => <option key={role} value={role}>{role}</option>)}
          </select>
          <select className="px-3 py-2 border rounded-md">
            <option>Filter by Potential Role</option>
            {jobs.map(job => <option key={job.id} value={job.title}>{job.title}</option>)}
          </select>
        </div>
      </div>
      {crossRoleFitment.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
          <p className="text-gray-500">No strong cross-role matches found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {crossRoleFitment.map((match, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium">{match.candidateName}</h3>
                  <div className="text-sm text-gray-600 mb-3">
                    {match.currentRole} → {match.potentialRole}
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      match.recommendation === "Strong Fit" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {match.recommendation}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{match.skillMatchPercentage}% Skill Match</div>
                  <div className="w-32 bg-gray-200 rounded-full h-2.5 mt-2 ml-auto">
                    <div 
                      className="h-2.5 rounded-full bg-blue-600" 
                      style={{ width: `${match.skillMatchPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Analysis</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Matching:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {match.matchingSkills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Missing (Training Needs):</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {match.trainingNeeds.map((need, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            {need.skill} ({need.difficulty})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Experience Fit</h4>
                  <div className="text-sm">
                    <p>Current: {match.experienceFit.current} years</p>
                    <p>Required: {match.experienceFit.required} years</p>
                    <p className={match.experienceFit.delta >= 0 ? "text-green-600" : "text-red-600"}>
                      Difference: {match.experienceFit.delta >= 0 ? "+" : ""}{match.experienceFit.delta} years
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Salary Analysis</h4>
                  <div className="text-sm">
                    <p>Current: ${match.salary.current.toLocaleString()}</p>
                    <p>Range: ${match.salary.potential.min.toLocaleString()} - ${match.salary.potential.max.toLocaleString()}</p>
                    <p className={match.salary.withinRange ? "text-green-600" : "text-orange-600"}>
                      {match.salary.withinRange ? "Within Range" : "Outside Range"}
                    </p>
                  </div>
                </div>
              </div>
              {match.potentialGrowth && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-sm text-green-600 font-medium">
                    Growth Potential: Candidate shows strong potential for role transition
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Recommended Training Duration: {match.trainingNeeds.length * 2} weeks
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const AddCandidateModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Candidate</h2>
          <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={newCandidate.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={newCandidate.role}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select role</option>
                {uniqueRoles.map(role => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
              <input
                type="number"
                name="experience"
                value={newCandidate.experience}
                onChange={handleInputChange}
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <input
                type="text"
                name="skills"
                value={newCandidate.skills}
                onChange={handleInputChange}
                placeholder="Comma-separated skills"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation Score</label>
              <input
                type="number"
                name="score"
                value={newCandidate.score}
                onChange={handleInputChange}
                min="0"
                max="100"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Expectation</label>
              <input
                type="number"
                name="salary"
                value={newCandidate.salary}
                onChange={handleInputChange}
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Interview Feedback</label>
              <textarea
                name="interviewFeedback"
                value={newCandidate.interviewFeedback}
                onChange={handleInputChange}
                rows="3"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Candidate
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-2">
      <div className="w-full mx-auto">
        {/* <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Comparative Candidate Analysis
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Compare candidates across different job descriptions and roles.
          </p>
        </div> */}
        <div className="flex justify-between items-center mb-8">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setView("comparison")}
                className={`px-4 py-2 rounded-md ${view === "comparison" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
              >
                Candidate Comparison
              </button>
              <button
                onClick={() => setView("trends")}
                className={`px-4 py-2 rounded-md ${view === "trends" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
              >
                Hiring Trends & Insights
              </button>
              <button
                onClick={() => setView("fitment")}
                className={`px-4 py-2 rounded-md ${view === "fitment" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
              >
                Cross-Role Fitment
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            + Add New Candidate
          </button>
        </div>
        {view === "comparison" && renderComparisonView()}
        {view === "trends" && renderTrendsView()}
        {view === "fitment" && renderFitmentView()}
        {isModalOpen && <AddCandidateModal />}
        <div className="mt-8 flex justify-end space-x-4">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Export Data
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}
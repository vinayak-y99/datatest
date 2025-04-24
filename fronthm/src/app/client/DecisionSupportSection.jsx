


"use client";
import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, XCircle,  Briefcase, Award,  ChevronDown, ChevronUp } from 'lucide-react';

const DecisionSupportSection = () => {
  const [expanded, setExpanded] = useState({
    additionalMetrics: false,
    competencies: false,
    evaluationHistory: false
  });

  const [candidate, setCandidate] = useState({
    name: "Jane Doe",
    position: "Senior Software Engineer",
    totalScore: 87,
    jobMatchPercentage: 92,
    cultureFitScore: 88,
    potentialScore: 84,
    experienceRelevance: 95,
    strengths: [
      { category: "Technical Skills", score: 95, details: "Advanced programming, system design" },
      { category: "Communication", score: 85, details: "Clear technical communication" },
      { category: "Problem Solving", score: 92, details: "Excellent analytical thinking and creative solutions" }
    ],
    improvementAreas: [
      { category: "Leadership", score: 65, details: "Limited team management experience" },
      { category: "Stakeholder Management", score: 72, details: "Could improve client-facing communication" }
    ],
    coreCompetencies: [
      { name: "Technical Expertise", score: 93, benchmark: 80 },
      { name: "Teamwork", score: 85, benchmark: 75 },
      { name: "Innovation", score: 88, benchmark: 70 },
      { name: "Adaptability", score: 82, benchmark: 75 }
    ],
    evaluationDetails: {
      technicalInterview: { score: 90, passed: true, interviewer: "John Smith", notes: "Excellent knowledge of system architecture" },
      behavioralInterview: { score: 83, passed: true, interviewer: "Mary Johnson", notes: "Good teamwork examples, could improve on conflict resolution" },
      technicalTest: { score: 88, passed: true, evaluator: "Tech Team", notes: "Strong coding skills, particularly in backend development" }
    },
    evaluationHistory: [
      { date: "2025-01-15", stage: "Resume Screening", score: 92, outcome: "Passed" },
      { date: "2025-01-28", stage: "Technical Assignment", score: 88, outcome: "Passed" },
      { date: "2025-02-05", stage: "First Interview", score: 85, outcome: "Passed" },
      { date: "2025-02-12", stage: "Final Interview", score: 89, outcome: "Passed" }
    ],
    yearsOfExperience: 8,
    educationLevel: "Master's Degree",
    certifications: ["AWS Certified Solutions Architect", "PMP"],
    salaryExpectation: "$140,000 - $160,000",
    noticePeriod: "1 month",
    skillGapAnalysis: {
      gapPercentage: 15,
      criticalGaps: ["Team leadership", "Enterprise architecture"],
      developableSkills: ["Project management", "Cross-functional collaboration"]
    }
  });

  const getRecommendation = () => {
    if (candidate.totalScore >= 85 && candidate.jobMatchPercentage >= 90) {
      return {
        status: "SELECT",
        icon: <CheckCircle2 className="text-emerald-500" size={24} />,
        message: "Strong candidate. Recommended for immediate hiring.",
        color: "text-emerald-500",
        detailedReasoning: "Candidate exceeds job requirements with a high job match percentage and excellent technical skills. The strengths in critical areas outweigh improvement needs."
      };
    } else if (candidate.totalScore >= 75 && candidate.jobMatchPercentage >= 80) {
      return {
        status: "REVIEW",
        icon: <AlertCircle className="text-orange-500" size={24} />,
        message: "Potential candidate. Requires further interview or skill assessment.",
        color: "text-orange-500",
        detailedReasoning: "While meeting baseline requirements, additional assessment is needed to evaluate fit for specific role demands and team dynamics."
      };
    } else {
      return {
        status: "REJECT",
        icon: <XCircle className="text-red-500" size={24} />,
        message: "Does not meet current job requirements.",
        color: "text-red-500",
        detailedReasoning: "Candidate's skills and experience do not align sufficiently with the core requirements for this position."
      };
    }
  };

  const recommendation = getRecommendation();

  const ProgressBar = ({ value, colorClass = "bg-blue-500", benchmark = null }) => (
    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden relative">
      <div
        className={`h-full ${colorClass} transition-all duration-300 ease-in-out`}
        style={{ width: `${value}%` }}
      />
      {benchmark !== null && (
        <div className="absolute top-0 bottom-0" style={{ left: `${benchmark}%` }}>
          <div className="h-full border-l-2 border-gray-800"></div>
          <div className="absolute -top-1 -translate-x-1/2 bg-gray-800 text-white text-xs px-1 rounded">
            {benchmark}%
          </div>
        </div>
      )}
    </div>
  );

  const toggleSection = (section) => {
    setExpanded({
      ...expanded,
      [section]: !expanded[section]
    });
  };

  return (
    <div className="bg-white">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="border-b">
          <h1 className="text-3xl font-bold text-pink-900 py-4">
            Decision Support
          </h1>
        </div>

        {/* Candidate Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{candidate.name}</h2>
            <p className="text-gray-600">{candidate.position}</p>
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <Briefcase size={16} className="mr-1" />
              <span>{candidate.yearsOfExperience} years experience</span>
            </div>
            <div className="mt-1 flex items-center text-sm text-gray-600">
              <Award size={16} className="mr-1" />
              <span>{candidate.educationLevel}</span>
            </div>
          </div>
          <div className="bg-white rounded p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              {recommendation.icon}
              <div>
                <div className={`font-semibold ${recommendation.color}`}>{recommendation.status}</div>
                <div className="text-sm text-gray-600">{recommendation.message}</div>
              </div>
            </div>
            <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md mt-2">
              <strong>Reasoning:</strong> {recommendation.detailedReasoning}
            </div>
          </div>
        </div>

        {/* Primary Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-md shadow-sm">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Score</h3>
            <ProgressBar value={candidate.totalScore} colorClass="bg-blue-500" />
            <div className="flex justify-between mt-1">
              <p className="text-gray-600">{candidate.totalScore}/100</p>
              <p className="text-xs text-gray-500">Threshold: 75</p>
            </div>
          </div>
           
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Job Match</h3>
            <ProgressBar value={candidate.jobMatchPercentage} colorClass="bg-emerald-500" />
            <div className="flex justify-between mt-1">
              <p className="text-gray-600">{candidate.jobMatchPercentage}%</p>
              <p className="text-xs text-gray-500">Threshold: 80%</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Overall Status</h3>
            <div className="flex items-center gap-2">
              {recommendation.icon}
              <span className={`font-semibold ${recommendation.color}`}>{recommendation.status}</span>
            </div>
            <div className="mt-3">
              <span className="text-xs text-gray-500 block">Consideration factors:</span>
              <span className="text-xs text-gray-500 block">- Score threshold</span>
              <span className="text-xs text-gray-500 block">- Job match percentage</span>
              <span className="text-xs text-gray-500 block">- Critical skill coverage</span>
            </div>
          </div>
        </div>

        {/* Additional Metrics Section - Collapsible */}
        <div className="bg-white rounded-md shadow-sm overflow-hidden">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('additionalMetrics')}
          >
            <h3 className="text-lg font-semibold text-gray-800">Additional Assessment Metrics</h3>
            {expanded.additionalMetrics ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {expanded.additionalMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border-t">
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-2">Culture Fit</h4>
                <ProgressBar value={candidate.cultureFitScore} colorClass="bg-indigo-500" />
                <p className="text-gray-600 mt-1">{candidate.cultureFitScore}/100</p>
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-2">Potential Growth</h4>
                <ProgressBar value={candidate.potentialScore} colorClass="bg-purple-500" />
                <p className="text-gray-600 mt-1">{candidate.potentialScore}/100</p>
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-2">Experience Relevance</h4>
                <ProgressBar value={candidate.experienceRelevance} colorClass="bg-teal-500" />
                <p className="text-gray-600 mt-1">{candidate.experienceRelevance}/100</p>
              </div>
            </div>
          )}
        </div>

        {/* Strengths and Improvements Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white rounded-md shadow-sm">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Strengths</h3>
            {candidate.strengths.map((strength, index) => (
              <div key={index} className="bg-emerald-50 rounded p-3">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-800">{strength.category}</span>
                  <span className="text-emerald-600">{strength.score}/100</span>
                </div>
                <ProgressBar value={strength.score} colorClass="bg-emerald-500" />
                <p className="text-sm text-gray-700 mt-2">{strength.details}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Areas for Improvement</h3>
            {candidate.improvementAreas.map((area, index) => (
              <div key={index} className="bg-red-50 rounded p-3">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-800">{area.category}</span>
                  <span className="text-red-600">{area.score}/100</span>
                </div>
                <ProgressBar value={area.score} colorClass="bg-red-500" />
                <p className="text-sm text-gray-700 mt-2">{area.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Core Competencies Section - Collapsible */}
        <div className="bg-white rounded-md shadow-sm overflow-hidden">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('competencies')}
          >
            <h3 className="text-lg font-semibold text-gray-800">Core Competencies Assessment</h3>
            {expanded.competencies ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {expanded.competencies && (
            <div className="p-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {candidate.coreCompetencies.map((competency, index) => (
                  <div key={index} className="bg-blue-50 rounded p-3">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-800">{competency.name}</span>
                      <span className="text-blue-600">{competency.score}/100</span>
                    </div>
                    <ProgressBar value={competency.score} colorClass="bg-blue-500" benchmark={competency.benchmark} />
                    <p className="text-xs text-gray-600 mt-2">Benchmark: {competency.benchmark}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Interview Assessment Section */}
        <div className="p-4 bg-white rounded-md shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Interview Assessments</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(candidate.evaluationDetails).map(([key, detail]) => (
              <div
                key={key}
                className={`p-3 rounded ${detail.passed ? 'bg-emerald-50' : 'bg-red-50'}`}
              >
                <h4 className="text-gray-800 font-medium mb-2 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </h4>
                <div className="flex items-center gap-2 mb-2">
                  {detail.passed ? (
                    <CheckCircle2 className="text-emerald-500" size={16} />
                  ) : (
                    <XCircle className="text-red-500" size={16} />
                  )}
                  <span className={`font-medium ${detail.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                    {detail.score}/100
                  </span>
                </div>
                <div className="text-xs text-gray-700 mt-1">
                  <span className="font-medium">By: </span>
                  {detail.interviewer || detail.evaluator}
                </div>
                <p className="text-sm text-gray-700 mt-2 bg-white p-2 rounded">{detail.notes}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation History - Collapsible */}
        <div className="bg-white rounded-md shadow-sm overflow-hidden">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('evaluationHistory')}
          >
            <h3 className="text-lg font-semibold text-gray-800">Evaluation History</h3>
            {expanded.evaluationHistory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {expanded.evaluationHistory && (
            <div className="p-4 border-t">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {candidate.evaluationHistory.map((entry, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{entry.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{entry.stage}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.score}/100</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            entry.outcome === 'Passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {entry.outcome}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Skill Gap Analysis Section */}
        <div className="p-4 bg-white rounded-md shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Skill Gap Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1">
              <div className="flex items-center justify-center flex-col bg-gray-50 rounded-md p-6">
                <div className="relative h-32 w-32">
                  <svg viewBox="0 0 36 36" className="h-32 w-32 transform -rotate-90">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      strokeDasharray={`${100 - candidate.skillGapAnalysis.gapPercentage}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{100 - candidate.skillGapAnalysis.gapPercentage}%</span>
                  </div>
                </div>
                <p className="text-center mt-4 text-gray-700 font-medium">Skills Matched</p>
                <p className="text-center text-sm text-gray-500">({candidate.skillGapAnalysis.gapPercentage}% gap)</p>
              </div>
            </div>
            
            <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Critical Skills Gaps</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {candidate.skillGapAnalysis.criticalGaps.map((gap, index) => (
                    <li key={index} className="text-red-600">
                      <span className="text-gray-700">{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Developable Skills</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {candidate.skillGapAnalysis.developableSkills.map((skill, index) => (
                    <li key={index} className="text-emerald-600">
                      <span className="text-gray-700">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Candidate Information */}
        <div className="p-4 bg-white rounded-md shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Certifications</h4>
              <ul className="space-y-1">
                {candidate.certifications.map((cert, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <Award size={16} className="mr-2 text-blue-500" />
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Salary Expectation</h4>
                <p className="text-gray-700">{candidate.salaryExpectation}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Notice Period</h4>
                <p className="text-gray-700">{candidate.noticePeriod}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DecisionSupportSection;
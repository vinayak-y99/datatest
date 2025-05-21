"use client"
import React, { useState, useEffect } from 'react';
import { Github, Linkedin, Award, Briefcase, Code, Star, TrendingUp, Users, Clock, Target, Activity, BarChart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border p-4 ${className}`}>{children}</div>
);

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-200 text-gray-600',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800'
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-sm font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

const Tab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
      ${active ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
  >
    {children}
  </button>
);

const InsightCard = ({ icon: Icon, title, value, trend, description }) => (
  <div className="border rounded-lg p-4">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-blue-600" />
        <h4 className="font-medium">{title}</h4>
      </div>
      {trend && (
        <Badge variant={trend > 0 ? 'success' : 'warning'}>
          {trend > 0 ? '+' : ''}{trend}%
        </Badge>
      )}
    </div>
    <p className="text-2xl font-bold mt-2">{value}</p>
    <p className="text-sm text-gray-600 mt-1">{description}</p>
  </div>
);

const SocialProfileIntegration = () => {
  const [activeProfile, setActiveProfile] = useState('linkedin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('6m');

  // Enhanced profile data with additional insights
  const profileData = {
    linkedin: {
      name: "Jane Smith",
      title: "Senior Software Engineer",
      endorsements: [
        { skill: "React", count: 28, growth: 15 },
        { skill: "TypeScript", count: 24, growth: 12 },
        { skill: "Node.js", count: 19, growth: 8 },
        { skill: "AWS", count: 16, growth: 10 },
        { skill: "Python", count: 14, growth: 5 }
      ],
      experiences: [
        {
          company: "Tech Corp",
          role: "Senior Developer",
          duration: "2020 - Present",
          projects: [
            {
              name: "Team Leadership",
              description: "Led team of 5 developers",
              impact: "Improved team velocity by 40%",
              technologies: ["React", "Node.js", "AWS"]
            },
            {
              name: "CI/CD Pipeline",
              description: "Improved CI/CD pipeline",
              impact: "Reduced deployment time by 60%",
              technologies: ["Jenkins", "Docker", "Kubernetes"]
            }
          ],
          skills: ["Leadership", "DevOps", "Architecture"]
        },
        {
          company: "StartupXYZ",
          role: "Full Stack Developer",
          duration: "2018 - 2020",
          projects: [
            {
              name: "Customer Dashboard",
              description: "Built customer dashboard",
              impact: "Increased user engagement by 35%",
              technologies: ["React", "GraphQL", "PostgreSQL"]
            },
            {
              name: "Payment System",
              description: "Implemented payment system",
              impact: "Processed $1M+ in transactions",
              technologies: ["Stripe", "Node.js", "Redis"]
            }
          ],
          skills: ["Full Stack", "Payment Integration", "API Design"]
        }
      ],
      insights: {
        skillGrowth: [
          { month: 'Jan', value: 82 },
          { month: 'Feb', value: 85 },
          { month: 'Mar', value: 87 },
          { month: 'Apr', value: 89 },
          { month: 'May', value: 92 },
          { month: 'Jun', value: 95 }
        ],
        keyMetrics: {
          totalEndorsements: 156,
          endorsementGrowth: 12,
          projectCount: 8,
          projectImpact: 45,
          teamSize: 5,
          avgProjectDuration: 4.5
        }
      }
    },
    github: {
      username: "janesmith",
      repos: [
        {
          name: "e-commerce-platform",
          stars: 245,
          description: "Full stack e-commerce solution",
          mainTech: ["React", "Node.js", "MongoDB"],
          impact: "Used by 50+ companies",
          codeQuality: 92,
          performance: 95
        },
        {
          name: "react-components",
          stars: 189,
          description: "Reusable React component library",
          mainTech: ["React", "TypeScript", "Storybook"],
          impact: "500+ downloads/month",
          codeQuality: 94,
          performance: 89
        }
      ],
      contributions: 1243,
      contributionTrend: [
        { month: 'Jan', value: 180 },
        { month: 'Feb', value: 200 },
        { month: 'Mar', value: 220 },
        { month: 'Apr', value: 190 },
        { month: 'May', value: 240 },
        { month: 'Jun', value: 250 }
      ],
      topLanguages: ["JavaScript", "TypeScript", "Python"],
      insights: {
        codeQuality: 93,
        performanceScore: 91,
        collaborators: 15,
        openSourceImpact: 78
      }
    }
  };

  const LinkedInContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InsightCard
          icon={TrendingUp}
          title="Skill Growth"
          value="+15%"
          trend={15}
          description="Average skill endorsement growth"
        />
        <InsightCard
          icon={Users}
          title="Team Impact"
          value="5+"
          trend={20}
          description="Direct reports managed"
        />
        <InsightCard
          icon={Target}
          title="Project Impact"
          value="45%"
          trend={12}
          description="Average performance improvement"
        />
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Skill Growth Trajectory</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={profileData.linkedin.insights.skillGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2563eb" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Project Impact Analysis
        </h3>
        <div className="mt-4 space-y-4">
          {profileData.linkedin.experiences.map((exp, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h4 className="font-medium">{exp.company}</h4>
              <p className="text-sm text-gray-600">{exp.role} • {exp.duration}</p>
              
              <div className="mt-4 space-y-4">
                {exp.projects.map((project, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3">
                    <h5 className="font-medium">{project.name}</h5>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    <div className="mt-2">
                      <Badge variant="success">{project.impact}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {project.technologies.map((tech, techIdx) => (
                        <Badge key={techIdx} variant="outline">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {exp.skills.map((skill, skillIdx) => (
                  <Badge key={skillIdx} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Award className="w-5 h-5" />
          Skill Endorsements & Growth
        </h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {profileData.linkedin.endorsements.map((endorsement, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">{endorsement.skill}</h4>
                <Badge variant={endorsement.growth > 10 ? 'success' : 'secondary'}>
                  +{endorsement.growth}%
                </Badge>
              </div>
              <div className="mt-2">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-600 rounded-full"
                    style={{ width: `${(endorsement.count / 30) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {endorsement.count} endorsements
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const GitHubContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightCard
          icon={Code}
          title="Code Quality"
          value={`${profileData.github.insights.codeQuality}%`}
          trend={5}
          description="Overall code quality score"
        />
        <InsightCard
          icon={Activity}
          title="Performance"
          value={`${profileData.github.insights.performanceScore}%`}
          trend={3}
          description="Code performance score"
        />
        <InsightCard
          icon={Users}
          title="Collaborators"
          value={profileData.github.insights.collaborators}
          trend={8}
          description="Active collaborators"
        />
        <InsightCard
          icon={BarChart}
          title="Impact"
          value={`${profileData.github.insights.openSourceImpact}%`}
          trend={15}
          description="Open source impact score"
        />
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Contribution Activity</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={profileData.github.contributionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2563eb" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Code className="w-5 h-5" />
          Repository Analysis
        </h3>
        <div className="mt-4 space-y-4">
          {profileData.github.repos.map((repo, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">{repo.name}</h4>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span className="text-sm">{repo.stars}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{repo.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-600">Code Quality</p>
                  <div className="mt-1 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-green-600 rounded-full"
                      style={{ width: `${repo.codeQuality}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Performance</p>
                  <div className="mt-1 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: `${repo.performance}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Badge variant="success">{repo.impact}</Badge>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {repo.mainTech.map((tech, idx) => (
                  <Badge key={idx} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

     
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold">Top Languages</h3>
          <div className="mt-4 space-y-2">
            {profileData.github.topLanguages.map((lang, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">{lang}</span>
                <div className="w-48 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-600 rounded-full"
                    style={{ width: `${100 - (index * 20)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Contributions</h3>
          <div className="mt-4">
            <p className="text-3xl font-bold text-blue-600">
              {profileData.github.contributions}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total contributions this year</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Time range selector component
  const TimeRangeSelector = () => (
    <div className="flex gap-2 mb-4">
      {['1m', '3m', '6m', '1y'].map((range) => (
        <button
          key={range}
          onClick={() => setTimeRange(range)}
          className={`px-3 py-1 rounded-full text-sm ${
            timeRange === range
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );

  // Analytics summary component
  const AnalyticsSummary = () => {
    const currentProfile = profileData[activeProfile];
    const metrics = activeProfile === 'linkedin' 
      ? currentProfile.insights.keyMetrics
      : currentProfile.insights;

    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Analytics Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(metrics).map(([key, value], index) => (
            <div key={index} className="text-center">
              <p className="text-sm text-gray-600">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <p className="text-xl font-bold text-blue-600">
                {typeof value === 'number' && value % 1 === 0 ? value : value.toFixed(1)}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full ">
      <div className="mb-0">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-l">Professional Profile Analytics</h2>
          <TimeRangeSelector />
        </div>
        
        <div className="flex gap-4 border-b pb-4">
          <Tab
            active={activeProfile === 'linkedin'}
            onClick={() => setActiveProfile('linkedin')}
          >
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </Tab>
          <Tab
            active={activeProfile === 'github'}
            onClick={() => setActiveProfile('github')}
          >
            <Github className="w-4 h-4" />
            GitHub
          </Tab>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading profile data...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          <p className="font-medium">Error loading profile data</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <AnalyticsSummary />
          <div className="mt-4">
            {activeProfile === 'linkedin' ? <LinkedInContent /> : <GitHubContent />}
          </div>
        </>
      )}
    </Card>
  );
};

export default SocialProfileIntegration;


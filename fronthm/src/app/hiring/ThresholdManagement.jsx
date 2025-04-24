// import React, { useState } from 'react';
// import { Box, Paper, Stack, FormControl, InputLabel, Select, MenuItem, Typography, Grid, Slider, Button, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material';
// import { Users as TeamIcon, Save as SaveIcon, Edit as EditIcon } from 'lucide-react';

// const ThresholdManagement = () => {
//   const [selectedJobForThreshold, setSelectedJobForThreshold] = useState('');
//   const [thresholdScores, setThresholdScores] = useState({
//     technicalSkills: 70,
//     communication: 60,
//     experience: 75,
//     leadership: 65
//   });

//   // Sample data - replace with your actual data
//   const jobDescriptions = [
//     { id: 1, title: 'Senior Software Engineer' },
//     { id: 2, title: 'Product Manager' },
//     { id: 3, title: 'UX Designer' }
//   ];

//   const savedThresholds = [
//     {
//       jobId: 1,
//       jobTitle: 'Senior Software Engineer',
//       technicalSkills: 80,
//       communication: 70,
//       experience: 75,
//       leadership: 65,
//       lastUpdated: '2025-02-13'
//     },
//     {
//       jobId: 2,
//       jobTitle: 'Product Manager',
//       technicalSkills: 60,
//       communication: 85,
//       experience: 70,
//       leadership: 80,
//       lastUpdated: '2025-02-12'
//     }
//   ];

//   const handleThresholdChange = (criteria, value) => {
//     setThresholdScores(prev => ({
//       ...prev,
//       [criteria]: value
//     }));
//   };

//   const handleSaveThreshold = () => {
//     console.log('Saving threshold scores:', thresholdScores);
//   };

//   const handleEditThreshold = (score) => {
//     setSelectedJobForThreshold(score.jobId);
//     setThresholdScores({
//       technicalSkills: score.technicalSkills,
//       communication: score.communication,
//       experience: score.experience,
//       leadership: score.leadership
//     });
//   };

//   return (
//     <Box className="p-4">
//       <Paper className="p-4 mb-8">
//         <Stack className="space-y-4">
//           <FormControl fullWidth>
//             <InputLabel>Select Job Description</InputLabel>
//             <Select
//               value={selectedJobForThreshold}
//               onChange={(e) => setSelectedJobForThreshold(e.target.value)}
//               className="min-w-[200px]"
//             >
//               {jobDescriptions.map(job => (
//                 <MenuItem key={job.id} value={job.id}>
//                   {job.title}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           {selectedJobForThreshold && (
//             <>
//               <Typography className="text-xl font-semibold mt-4">
//                 Scoring Criteria
//               </Typography>

//               <Grid container spacing={4}>
//                 <Grid item xs={12} md={6}>
//                   <Typography className="mb-2">Technical Skills</Typography>
//                   <Stack direction="row" spacing={2} alignItems="center">
//                     <Slider
//                       value={thresholdScores.technicalSkills}
//                       onChange={(_, value) => handleThresholdChange('technicalSkills', value)}
//                       valueLabelDisplay="auto"
//                       marks
//                       step={5}
//                       min={0}
//                       max={100}
//                       className="flex-1"
//                     />
//                     <Typography className="w-12">
//                       {thresholdScores.technicalSkills}%
//                     </Typography>
//                   </Stack>
//                 </Grid>

//                 <Grid item xs={12} md={6}>
//                   <Typography className="mb-2">Communication</Typography>
//                   <Stack direction="row" spacing={2} alignItems="center">
//                     <Slider
//                       value={thresholdScores.communication}
//                       onChange={(_, value) => handleThresholdChange('communication', value)}
//                       valueLabelDisplay="auto"
//                       marks
//                       step={5}
//                       min={0}
//                       max={100}
//                       className="flex-1"
//                     />
//                     <Typography className="w-12">
//                       {thresholdScores.communication}%
//                     </Typography>
//                   </Stack>
//                 </Grid>

//                 <Grid item xs={12} md={6}>
//                   <Typography className="mb-2">Experience</Typography>
//                   <Stack direction="row" spacing={2} alignItems="center">
//                     <Slider
//                       value={thresholdScores.experience}
//                       onChange={(_, value) => handleThresholdChange('experience', value)}
//                       valueLabelDisplay="auto"
//                       marks
//                       step={5}
//                       min={0}
//                       max={100}
//                       className="flex-1"
//                     />
//                     <Typography className="w-12">
//                       {thresholdScores.experience}%
//                     </Typography>
//                   </Stack>
//                 </Grid>

//                 <Grid item xs={12} md={6}>
//                   <Typography className="mb-2">Leadership</Typography>
//                   <Stack direction="row" spacing={2} alignItems="center">
//                     <Slider
//                       value={thresholdScores.leadership}
//                       onChange={(_, value) => handleThresholdChange('leadership', value)}
//                       valueLabelDisplay="auto"
//                       marks
//                       step={5}
//                       min={0}
//                       max={100}
//                       className="flex-1"
//                     />
//                     <Typography className="w-12">
//                       {thresholdScores.leadership}%
//                     </Typography>
//                   </Stack>
//                 </Grid>
//               </Grid>

//               <Button
//                 variant="contained"
//                 onClick={handleSaveThreshold}
//                 className="mt-4"
//               >
//                 <SaveIcon className="w-4 h-4 mr-2" />
//                 Save Threshold Scores
//               </Button>
//             </>
//           )}
//         </Stack>
//       </Paper>

//       <TableContainer component={Paper}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Job Title</TableCell>
//               <TableCell align="right">Technical</TableCell>
//               <TableCell align="right">Communication</TableCell>
//               <TableCell align="right">Experience</TableCell>
//               <TableCell align="right">Leadership</TableCell>
//               <TableCell>Last Updated</TableCell>
//               <TableCell>Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {savedThresholds.map((score) => (
//               <TableRow key={score.jobId}>
//                 <TableCell>{score.jobTitle}</TableCell>
//                 <TableCell align="right">{score.technicalSkills}%</TableCell>
//                 <TableCell align="right">{score.communication}%</TableCell>
//                 <TableCell align="right">{score.experience}%</TableCell>
//                 <TableCell align="right">{score.leadership}%</TableCell>
//                 <TableCell>{score.lastUpdated}</TableCell>
//                 <TableCell>
//                   <IconButton onClick={() => handleEditThreshold(score)}>
//                     <EditIcon className="w-4 h-4" />
//                   </IconButton>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Box>
//   );
// };

// export default ThresholdManagement;

"use client";
import React, { useState, useEffect } from 'react';
import { CheckCircle, Save, Settings } from 'lucide-react';
import ThresholdScoreManagementSection from '../client/ThresholdManagement';

// Mock data for demonstration
const mockJobs = [
  { id: 1, title: 'Frontend Developer', department: 'Engineering' },
  { id: 2, title: 'UX Designer', department: 'Design' },
  { id: 3, title: 'Product Manager', department: 'Product' },
  { id: 4, title: 'Sales Representative', department: 'Sales' },
];

const mockCriteria = [
  { id: 1, name: 'Technical Skills', description: 'Programming languages, frameworks, tools' },
  { id: 2, name: 'Communication', description: 'Written and verbal communication skills' },
  { id: 3, name: 'Experience', description: 'Years of relevant experience' },
  { id: 4, name: 'Culture Fit', description: 'Alignment with company values and culture' },
  { id: 5, name: 'Problem Solving', description: 'Analytical thinking and creative solutions' },
];

const ThresholdScoreManagement = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [thresholds, setThresholds] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize thresholds from mock data
  useEffect(() => {
    const initialThresholds = {};
    mockJobs.forEach(job => {
      initialThresholds[job.id] = {};
      mockCriteria.forEach(criterion => {
        initialThresholds[job.id][criterion.id] = 70; // Default threshold is 70
      });
    });
    setThresholds(initialThresholds);
  }, []);

  const handleJobChange = (e) => {
    setSelectedJob(parseInt(e.target.value));
    setIsEditing(false);
  };

  const handleThresholdChange = (criterionId, e) => {
    if (!selectedJob) return;
   
    setThresholds(prev => ({
      ...prev,
      [selectedJob]: {
        ...prev[selectedJob],
        [criterionId]: parseInt(e.target.value)
      }
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to a backend
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="border rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">Threshold Score Configuration</h1>
          <p className="text-gray-500 mt-1">
            Set minimum threshold scores for each criterion in the selected job description
          </p>
        </div>
       
        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Job selector */}
            <div className="space-y-2">
              <h3 className="text-md font-medium">Select Job Description</h3>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedJob || ""}
                onChange={handleJobChange}
              >
                <option value="" disabled>Select a job description</option>
                {mockJobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title} - {job.department}
                  </option>
                ))}
              </select>
            </div>

            {/* Success notification */}
            {showSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-green-800">Success</h4>
                  <p className="text-green-700">
                    Threshold scores have been saved successfully.
                  </p>
                </div>
              </div>
            )}

            {/* Thresholds configuration */}
            {selectedJob && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    {mockJobs.find(j => j.id === selectedJob)?.title} Threshold Scores
                  </h3>
                  <button
                    className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                      isEditing
                        ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Settings className="h-4 w-4" />
                    {isEditing ? "Cancel" : "Edit Thresholds"}
                  </button>
                </div>

                <div className="space-y-6">
                  {mockCriteria.map(criterion => (
                    <div key={criterion.id} className="space-y-2">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">{criterion.name}</h4>
                          <p className="text-sm text-gray-500">{criterion.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xl">
                            {thresholds[selectedJob]?.[criterion.id] || 0}
                          </span>
                          <span className="text-gray-500">/ 100</span>
                        </div>
                      </div>
                      {isEditing ? (
                        <div className="pt-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={thresholds[selectedJob]?.[criterion.id] || 0}
                            onChange={(e) => handleThresholdChange(criterion.id, e)}
                            className="w-full"
                          />
                        </div>
                      ) : (
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${thresholds[selectedJob]?.[criterion.id] || 0}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <button
                    onClick={handleSave}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                  >
                    <Save className="h-4 w-4" />
                    Save Threshold Scores
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
       
        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50">
          <p className="text-sm text-gray-500">
            Threshold scores determine the minimum qualifications for candidates.
            Scores below the threshold will flag candidates for additional review.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThresholdScoreManagement;

import React, { useState, useEffect } from 'react';
import { 
  Box, Stack, Typography, Grid, TextField, FormControl, FormLabel, 
  Rating, Button, IconButton, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert, Tooltip, MenuItem, Select,
  Avatar, Divider, Card, CardContent, CardHeader, Breadcrumbs, Link,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  InputLabel
} from '@mui/material';
import { 
  Save as SaveIcon, Edit as EditIcon, AlertCircle as AlertIcon,
  FileText as DetailsIcon, User as UserIcon,
  Briefcase as JobIcon, FileText as FileTextIcon,
  Home as HomeIcon, List as ListIcon, Calendar as CalendarIcon, Eye as EyeIcon,
  CheckCircle as CompletedIcon, Clock as PendingIcon, PauseCircle as HoldIcon,
  Upload as UploadIcon, BarChart2 as DashboardIcon, Plus as PlusIcon
} from 'lucide-react';

const InterviewFeedback = () => {
  const mockData = {
    jdList: [
      { id: 'JD-001', name: 'Senior Developer', department: 'Engineering', uploadDate: '2025-01-15' },
      { id: 'JD-002', name: 'Product Manager', department: 'Product', uploadDate: '2025-02-01' },
      { id: 'JD-003', name: 'UX Designer', department: 'Design', uploadDate: '2025-02-10' },
      { id: 'JD-004', name: 'Data Scientist', department: 'Data', uploadDate: '2025-02-15' },
      { id: 'JD-005', name: 'DevOps Engineer', department: 'Operations', uploadDate: '2025-02-20' }
    ],
    interviews: [
      {
        id: 1, candidateName: 'John Doe', jdId: 'JD-001', 
        dateTime: '2025-02-05', ranking: 1, score: 4.8,
        status: 'completed', feedback: 'Excellent technical skills'
      },
      {
        id: 2, candidateName: 'Jane Smith', jdId: 'JD-002', 
        dateTime: '2025-02-04', ranking: 2, score: 4.2,
        status: 'completed', feedback: 'Strong leadership potential'
      },
      {
        id: 3, candidateName: 'Alex Johnson', jdId: 'JD-003', 
        dateTime: '2025-02-03', ranking: 3, score: 3.9,
        status: 'completed', feedback: 'Creative thinker'
      },
      {
        id: 4, candidateName: 'Sarah Williams', jdId: 'JD-001', 
        dateTime: '2025-02-02', ranking: 4, score: 3.7,
        status: 'completed', feedback: 'Good cultural fit'
      },
      {
        id: 5, candidateName: 'Michael Brown', jdId: 'JD-002', 
        dateTime: '2025-02-01', ranking: 5, score: 3.5,
        status: 'completed', feedback: 'Needs more experience'
      },
      {
        id: 6, candidateName: 'Emily Davis', jdId: 'JD-004', 
        dateTime: '2025-02-18', ranking: 1, score: 4.5,
        status: 'pending', feedback: 'Outstanding analytical skills'
      },
      {
        id: 7, candidateName: 'Robert Wilson', jdId: 'JD-005', 
        dateTime: '2025-02-22', ranking: 1, score: 4.6,
        status: 'pending', feedback: 'Great team player'
      },
      {
        id: 8, candidateName: 'Jessica Taylor', jdId: 'JD-004', 
        dateTime: '2025-02-19', ranking: 2, score: 4.0,
        status: 'hold', feedback: 'Requires further assessment'
      },
      {
        id: 9, candidateName: 'David Martin', jdId: 'JD-005', 
        dateTime: '2025-02-23', ranking: 2, score: 3.8,
        status: 'hold', feedback: 'Potential for junior role'
      },
      {
        id: 10, candidateName: 'Andrew Lee', jdId: 'JD-003', 
        dateTime: '2025-02-12', ranking: 2, score: 3.6,
        status: 'completed', feedback: 'Good design sense'
      }
    ]
  };

  const [selectedJdId, setSelectedJdId] = useState('');
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState({
    candidateName: '',
    interviewDate: '', 
    technicalSkills: '', 
    communicationSkills: '', 
    problemSolving: '', 
    overallRating: 0, 
    recommendation: 'recommended', 
    notes: ''
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedJd, setSelectedJd] = useState(null);
  const [dashboardInterviews, setDashboardInterviews] = useState([]);
  const [candidatesForSelectedJd, setCandidatesForSelectedJd] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [suggestInterviewDialogOpen, setSuggestInterviewDialogOpen] = useState(false);
  const [selectedCandidateForInterview, setSelectedCandidateForInterview] = useState(null);

  useEffect(() => {
    if (mockData.jdList.length > 0) {
      setSelectedJdId(mockData.jdList[0].id);
      setSelectedJd(mockData.jdList[0]);
      
      // Set 5 sample interviews for the dashboard regardless of the selected JD
      const sampleInterviews = [];
      
      // Take one from each JD to ensure diversity
      mockData.jdList.forEach(jd => {
        const interviewsForJd = mockData.interviews.filter(i => i.jdId === jd.id);
        if (interviewsForJd.length > 0) {
          sampleInterviews.push(interviewsForJd[0]);
        }
      });
      
      // If we need more to make 5, add some others
      if (sampleInterviews.length < 5) {
        const remainingNeeded = 5 - sampleInterviews.length;
        const existingIds = new Set(sampleInterviews.map(i => i.id));
        
        // Add more interviews without duplicates
        mockData.interviews.forEach(interview => {
          if (!existingIds.has(interview.id) && sampleInterviews.length < 5) {
            sampleInterviews.push(interview);
            existingIds.add(interview.id);
          }
        });
      }
      
      // Only take 5 interviews
      setDashboardInterviews(sampleInterviews.slice(0, 5));
    }
  }, []);

  useEffect(() => {
    if (selectedJdId) {
      const filtered = mockData.interviews.filter(interview => interview.jdId === selectedJdId);
      setFilteredInterviews(filtered);
      
      const jd = mockData.jdList.find(jd => jd.id === selectedJdId);
      if (jd) {
        setSelectedJd(jd);
        
        // Update the form with JD details
        setFeedbackForm(prev => ({
          ...prev,
          jdId: jd.id,
          jdName: jd.name,
          department: jd.department,
          uploadDate: jd.uploadDate
        }));
      }
      
      // Get unique candidates for this JD
      const candidates = [...new Set(filtered.map(i => i.candidateName))];
      setCandidatesForSelectedJd(candidates);
      
      if (candidates.length > 0) {
        setSelectedCandidate(candidates[0]);
        // Auto-fill the first candidate's details
        const firstInterview = filtered.find(i => i.candidateName === candidates[0]);
        if (firstInterview) {
          setFeedbackForm(prev => ({
            ...prev,
            candidateName: firstInterview.candidateName,
            interviewDate: firstInterview.dateTime
          }));
        }
      }
    }
  }, [selectedJdId]);

  const handleJdChange = (event) => {
    const newJdId = event.target.value;
    setSelectedJdId(newJdId);
  };

  const handleCandidateChange = (event) => {
    const candidateName = event.target.value;
    setSelectedCandidate(candidateName);
    
    // Find the interview for this candidate and JD
    const interview = filteredInterviews.find(i => 
      i.candidateName === candidateName && i.jdId === selectedJdId
    );
    
    if (interview) {
      setFeedbackForm(prev => ({
        ...prev,
        candidateName: interview.candidateName,
        interviewDate: interview.dateTime
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setFeedbackForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handleSuggestInterview = (candidate) => {
    setSelectedCandidateForInterview(candidate);
    setSuggestInterviewDialogOpen(true);
  };

  const handleCloseSuggestInterviewDialog = () => {
    setSuggestInterviewDialogOpen(false);
    setSelectedCandidateForInterview(null);
  };

  const handleSubmitSuggestedInterview = () => {
    // Here you would typically make an API call to schedule the interview
    console.log(`Scheduling additional interview for ${selectedCandidateForInterview}`);
    setSuggestInterviewDialogOpen(false);
    setSelectedCandidateForInterview(null);
  };

  // Group interviews by candidate and check if any interview has 'hold' status
  const interviewsByCandidate = mockData.interviews.reduce((acc, interview) => {
    if (!acc[interview.candidateName]) {
      acc[interview.candidateName] = {
        interviews: [],
        hasHoldStatus: false
      };
    }
    acc[interview.candidateName].interviews.push(interview);
    if (interview.status === 'hold') {
      acc[interview.candidateName].hasHoldStatus = true;
    }
    return acc;
  }, {});

  return (
    <Box className="p-4" sx={{ overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" href="#" sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon size={16} style={{ marginRight: 4 }} /> Home
        </Link>
        <Link underline="hover" color="inherit" href="#" sx={{ display: 'flex', alignItems: 'center' }}>
          <ListIcon size={16} style={{ marginRight: 4 }} /> Hiring
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <FileTextIcon size={16} style={{ marginRight: 4 }} /> Interview Feedback
        </Typography>
      </Breadcrumbs>
      
      {/* Dashboard Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={600} sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          mb: 2,
          backgroundColor: '#f5f5f5',
          p: 2,
          borderRadius: '4px'
        }}>
          <DashboardIcon size={24} /> Feedback Dashboard
        </Typography>
        
        <TableContainer component={Paper} elevation={3} sx={{ border: '1px solid #e0e0e0' }}>
          <Table sx={{ minWidth: 650 }} aria-label="feedback dashboard">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>JD ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>JD Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Candidate</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Interview Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ranking</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboardInterviews.map((interview) => {
                const jd = mockData.jdList.find(jd => jd.id === interview.jdId);
                return (
                  <TableRow key={interview.id} hover>
                    <TableCell>{interview.jdId}</TableCell>
                    <TableCell>{jd?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ 
                          width: 32, 
                          height: 32, 
                          fontSize: '0.875rem',
                          bgcolor: 'primary.main' 
                        }}>
                          {interview.candidateName.charAt(0).toUpperCase()}
                        </Avatar>
                        {interview.candidateName}
                      </Box>
                    </TableCell>
                    <TableCell>{interview.dateTime}</TableCell>
                    <TableCell>#{interview.ranking}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating 
                          value={interview.score} 
                          precision={0.1} 
                          readOnly 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2">
                          {interview.score.toFixed(1)}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Job Description Details Section */}
      <Stack spacing={4} sx={{ mb: 6 }}>
        <Typography variant="h5" fontWeight={600} sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          backgroundColor: '#f5f5f5',
          p: 2,
          borderRadius: '4px'
        }}>
          <JobIcon size={24} /> Job Description Details
        </Typography>
        
        <Card elevation={3}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="jd-select-label">Select Job Description</InputLabel>
                  <Select
                    labelId="jd-select-label"
                    id="jd-select"
                    value={selectedJdId}
                    label="Select Job Description"
                    onChange={handleJdChange}
                    startAdornment={<JobIcon size={20} style={{ marginRight: 8, color: '#757575' }} />}
                  >
                    {mockData.jdList.map((jd) => (
                      <MenuItem key={jd.id} value={jd.id}>
                        {jd.id} - {jd.name} ({jd.department})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth 
                  label="JD ID" 
                  value={selectedJd?.id || ''}
                  InputProps={{ 
                    readOnly: true, 
                    startAdornment: <JobIcon size={20} style={{ marginRight: 8, color: '#757575' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth 
                  label="JD Name" 
                  value={selectedJd?.name || ''}
                  InputProps={{ 
                    readOnly: true, 
                    startAdornment: <FileTextIcon size={20} style={{ marginRight: 8, color: '#757575' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth 
                  label="Department" 
                  value={selectedJd?.department || ''}
                  InputProps={{ 
                    readOnly: true, 
                    startAdornment: <ListIcon size={20} style={{ marginRight: 8, color: '#757575' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth 
                  label="Upload Date" 
                  value={selectedJd?.uploadDate || ''}
                  InputProps={{ 
                    readOnly: true, 
                    startAdornment: <UploadIcon size={20} style={{ marginRight: 8, color: '#757575' }} />
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Stack>

      {/* Feedback Form Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" fontWeight={600} sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          mb: 3,
          backgroundColor: '#f5f5f5',
          p: 2,
          borderRadius: '4px'
        }}>
          <EditIcon size={24} /> Interview Feedback Form
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="candidate-select-label">Select Candidate</InputLabel>
              <Select
                labelId="candidate-select-label"
                id="candidate-select"
                value={selectedCandidate}
                label="Select Candidate"
                onChange={handleCandidateChange}
                startAdornment={<UserIcon size={20} style={{ marginRight: 8, color: '#757575' }} />}
              >
                {candidatesForSelectedJd.map((candidate) => (
                  <MenuItem key={candidate} value={candidate}>
                    {candidate}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth 
              label="Candidate Name" 
              value={feedbackForm.candidateName}
              onChange={(e) => handleInputChange('candidateName', e.target.value)}
              InputProps={{ 
                startAdornment: <UserIcon size={20} style={{ marginRight: 8, color: '#757575' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth 
              label="Interview Date"
              value={feedbackForm.interviewDate}
              InputProps={{ 
                readOnly: true,
                startAdornment: <CalendarIcon size={20} style={{ marginRight: 8, color: '#757575' }} />
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Technical Skills Assessment"
              multiline 
              rows={3} 
              value={feedbackForm.technicalSkills}
              onChange={(e) => handleInputChange('technicalSkills', e.target.value)}
              placeholder="Evaluate the candidate's technical skills relevant to the position..."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth 
              label="Communication Skills" 
              multiline 
              rows={3}
              value={feedbackForm.communicationSkills}
              onChange={(e) => handleInputChange('communicationSkills', e.target.value)}
              placeholder="Assess the candidate's communication abilities..."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth 
              label="Problem Solving Ability" 
              multiline 
              rows={3}
              value={feedbackForm.problemSolving}
              onChange={(e) => handleInputChange('problemSolving', e.target.value)}
              placeholder="Evaluate how the candidate approaches and solves problems..."
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel sx={{ mb: 1, fontWeight: 500 }}>Overall Rating</FormLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Rating
                  value={feedbackForm.overallRating}
                  onChange={(_, value) => handleInputChange('overallRating', value)}
                  precision={0.5} 
                  size="large"
                />
                <Typography variant="body2" color="text.secondary">
                  {feedbackForm.overallRating > 0 ? `${feedbackForm.overallRating}/5` : 'Not rated'}
                </Typography>
              </Box>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth 
              label="Additional Notes" 
              multiline 
              rows={3}
              value={feedbackForm.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional comments or observations about the candidate..."
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<EyeIcon />}
                onClick={handlePreview}
                sx={{ px: 4 }}
              >
                Preview
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Candidate Interviews Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={600} sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          mb: 3,
          backgroundColor: '#f5f5f5',
          p: 2,
          borderRadius: '4px'
        }}>
          <UserIcon size={24} /> Candidate Interviews
        </Typography>
        
        <Grid container spacing={3}>
          {Object.entries(interviewsByCandidate).map(([candidateName, candidateData]) => (
            <Grid item xs={12} md={6} key={candidateName}>
              <Card elevation={3}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {candidateName.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  title={candidateName}
                  action={
                    candidateData.hasHoldStatus && (
                      <Button 
                        variant="contained" 
                        size="small" 
                        startIcon={<PlusIcon size={18} />}
                        onClick={() => handleSuggestInterview(candidateName)}
                        sx={{ textTransform: 'none' }}
                      >
                        Suggest Interview
                      </Button>
                    )
                  }
                />
                <CardContent>
                  <Stack spacing={2}>
                    {candidateData.interviews.map((interview) => {
                      const jd = mockData.jdList.find(jd => jd.id === interview.jdId);
                      return (
                        <Box key={interview.id} sx={{ 
                          p: 2, 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '4px',
                          backgroundColor: '#fafafa'
                        }}>
                          <Typography variant="subtitle2" gutterBottom>
                            {jd?.name || 'Unknown Position'} ({interview.jdId})
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              <CalendarIcon size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                              {interview.dateTime}
                            </Typography>
                            <Chip 
                              label={interview.status} 
                              size="small"
                              color={
                                interview.status === 'completed' ? 'success' : 
                                interview.status === 'pending' ? 'warning' : 'default'
                              }
                              icon={
                                interview.status === 'completed' ? <CompletedIcon size={16} /> :
                                interview.status === 'pending' ? <PendingIcon size={16} /> : <HoldIcon size={16} />
                              }
                            />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Rating value={interview.score} precision={0.1} readOnly size="small" />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {interview.score.toFixed(1)}/5
                            </Typography>
                          </Box>
                          <Typography variant="body2">
                            <strong>Feedback:</strong> {interview.feedback}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EyeIcon size={24} />
            <Typography variant="h6">Feedback Preview</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Card variant="outlined">
              <CardHeader 
                title="Candidate Information" 
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                avatar={<UserIcon size={20} />}
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Candidate Name</Typography>
                    <Typography>{feedbackForm.candidateName || 'Not specified'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Interview Date</Typography>
                    <Typography>{feedbackForm.interviewDate || 'Not specified'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Card variant="outlined">
              <CardHeader 
                title="Job Description" 
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                avatar={<JobIcon size={20} />}
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">JD ID</Typography>
                    <Typography>{selectedJd?.id || 'Not specified'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">JD Name</Typography>
                    <Typography>{selectedJd?.name || 'Not specified'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Department</Typography>
                    <Typography>{selectedJd?.department || 'Not specified'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Card variant="outlined">
              <CardHeader 
                title="Feedback Details" 
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                avatar={<EditIcon size={20} />}
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Technical Skills Assessment
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {feedbackForm.technicalSkills || 'No information provided'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Communication Skills
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {feedbackForm.communicationSkills || 'No information provided'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Problem Solving Ability
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {feedbackForm.problemSolving || 'No information provided'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Overall Rating
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating value={feedbackForm.overallRating} readOnly precision={0.5} />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {feedbackForm.overallRating > 0 ? `${feedbackForm.overallRating}/5` : 'Not rated'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Additional Notes
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {feedbackForm.notes || 'No additional notes'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPreviewOpen(false)} variant="outlined" sx={{ mr: 1 }}>
            Close
          </Button>
          <Button variant="contained" startIcon={<SaveIcon />}>
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>

      {/* Suggest Interview Dialog */}
      <Dialog open={suggestInterviewDialogOpen} onClose={handleCloseSuggestInterviewDialog}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PlusIcon size={24} />
            <Typography variant="h6">Suggest Additional Interview</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2, minWidth: '400px' }}>
            <Typography>
              Schedule an additional interview for <strong>{selectedCandidateForInterview}</strong>
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="interview-type-label">Interview Type</InputLabel>
              <Select
                labelId="interview-type-label"
                label="Interview Type"
                defaultValue="technical"
              >
                <MenuItem value="technical">Technical Interview</MenuItem>
                <MenuItem value="hr">HR Interview</MenuItem>
                <MenuItem value="managerial">Managerial Interview</MenuItem>
                <MenuItem value="cultural">Cultural Fit Interview</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Interview Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Notes"
              multiline
              rows={3}
              placeholder="Any special instructions or notes for this interview..."
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseSuggestInterviewDialog} variant="outlined" sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitSuggestedInterview} 
            variant="contained" 
            startIcon={<SaveIcon />}
          >
            Schedule Interview
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InterviewFeedback;
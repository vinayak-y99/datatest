"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
  Container, Grid, Paper, Typography, Box, IconButton, Badge,
  Switch, FormControlLabel, TextField, Button, Divider, Card,
  CardContent, List, ListItem, ListItemText, ListItemIcon,
  ListItemSecondaryAction, Select, MenuItem, InputLabel,
  FormControl, Slider, Alert, Snackbar, Pagination, Fade,
  Tabs, Tab, AppBar, Toolbar, useTheme, useMediaQuery,
  LinearProgress, Chip, Tooltip, CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Group as GroupIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

const NotificationsDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Core States
  const [notifications, setNotifications] = useState([]);
  const [hiringMetrics, setHiringMetrics] = useState({
    thresholds: {
      applicants: 100,
      interviews: 50,
      offers: 20,
    },
    current: {
      applicants: 0,
      interviews: 0,
      offers: 0,
    }
  });
  const [panelMetrics, setPanelMetrics] = useState({
    interviewsCompleted: 0,
    averageRating: 0,
    successRate: 0,
    timePerInterview: 0,
  });

  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    readStatus: 'all',
    currentPage: 1,
  });

  const [settings, setSettings] = useState({
    realTimeEnabled: false,
    soundEnabled: false,
    refreshInterval: 10,
    emailNotifications: true,
    pushNotifications: true,
    thresholdAlerts: false,
    performanceMonitoring: false,
  });

  const [ui, setUi] = useState({
    showSnackbar: false,
    snackbarMessage: '',
    currentTab: 0,
    showFilters: !isMobile,
    selectedMetricView: 'hiring', // 'hiring' or 'panel'
  });

  // Categories Configuration with Hiring-specific categories
  const categories = [
    { id: 'all', label: 'All', icon: <NotificationsIcon />, color: 'default' },
    { id: 'hiring', label: 'Hiring Alerts', icon: <PersonIcon />, color: 'primary' },
    { id: 'panel', label: 'Panel Performance', icon: <AssessmentIcon />, color: 'secondary' },
    { id: 'threshold', label: 'Threshold Alerts', icon: <WarningIcon />, color: 'warning' },
    { id: 'success', label: 'Success', icon: <CheckCircleIcon />, color: 'success' },
    { id: 'error', label: 'Error', icon: <ErrorIcon />, color: 'error' },
  ];

  // Mock Data Generator with Hiring-specific notifications
  const generateMockNotification = () => {
    const types = [
      {
        category: 'hiring',
        messages: [
          'New candidate application received',
          'Interview scheduled',
          'Offer sent to candidate',
          'Candidate accepted offer'
        ]
      },
      {
        category: 'panel',
        messages: [
          'Panel performance report available',
          'Interview feedback submitted',
          'Panel rating updated'
        ]
      },
      {
        category: 'threshold',
        messages: [
          'Hiring threshold approaching for position',
          'Interview capacity reached',
          'Offer limit warning'
        ]
      }
    ];

    const selectedType = types[Math.floor(Math.random() * types.length)];
    const message = selectedType.messages[Math.floor(Math.random() * selectedType.messages.length)];

    return {
      id: Date.now(),
      message,
      details: `Details for ${message.toLowerCase()} at ${new Date().toLocaleTimeString()}`,
      category: selectedType.category,
      time: new Date().toISOString(),
      read: false,
    };
  };

  // Simulate hiring metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (settings.thresholdAlerts) {
        setHiringMetrics(prev => {
          const newMetrics = {
            ...prev,
            current: {
              applicants: prev.current.applicants + Math.floor(Math.random() * 5),
              interviews: prev.current.interviews + Math.floor(Math.random() * 3),
              offers: prev.current.offers + Math.floor(Math.random() * 2),
            }
          };

          // Check thresholds and create alerts
          Object.entries(newMetrics.current).forEach(([key, value]) => {
            if (value >= prev.thresholds[key] && value !== prev.current[key]) {
              const notification = {
                id: Date.now(),
                category: 'threshold',
                message: `${key.charAt(0).toUpperCase() + key.slice(1)} threshold exceeded`,
                details: `Current: ${value}, Threshold: ${prev.thresholds[key]}`,
                time: new Date().toISOString(),
                read: false,
              };
              setNotifications(prevNotifications => [notification, ...prevNotifications]);
            }
          });

          return newMetrics;
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [settings.thresholdAlerts]);

  // Simulate panel performance updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (settings.performanceMonitoring) {
        setPanelMetrics(prev => {
          const newMetrics = {
            interviewsCompleted: prev.interviewsCompleted + Math.floor(Math.random() * 3),
            averageRating: Math.min(5, prev.averageRating + (Math.random() * 0.2 - 0.1)),
            successRate: Math.min(100, prev.successRate + (Math.random() * 4 - 2)),
            timePerInterview: Math.max(30, prev.timePerInterview + (Math.random() * 4 - 2)),
          };

          // Generate performance alerts
          if (newMetrics.averageRating < 3.5) {
            const notification = {
              id: Date.now(),
              category: 'panel',
              message: 'Low panel rating alert',
              details: `Current average rating: ${newMetrics.averageRating.toFixed(2)}`,
              time: new Date().toISOString(),
              read: false,
            };
            setNotifications(prevNotifications => [notification, ...prevNotifications]);
          }

          return newMetrics;
        });
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [settings.performanceMonitoring]);

  // Initialize with mock data
  useEffect(() => {
    const mockData = Array(10).fill(null).map(() => generateMockNotification());
    setNotifications(mockData);
  }, []);

  // Metrics Display Component
  const MetricsDisplay = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="">
            {ui.selectedMetricView === 'hiring' ? 'Hiring Metrics' : 'Panel Performance'}
          </Typography>
          <Box>
            <Button
              size="small"
              variant={ui.selectedMetricView === 'hiring' ? 'contained' : 'outlined'}
              onClick={() => setUi(prev => ({ ...prev, selectedMetricView: 'hiring' }))}
              sx={{ mr: 1 }}
            >
              Hiring
            </Button>
            <Button
              size="small"
              variant={ui.selectedMetricView === 'panel' ? 'contained' : 'outlined'}
              onClick={() => setUi(prev => ({ ...prev, selectedMetricView: 'panel' }))}
            >
              Panel
            </Button>
          </Box>
        </Box>

        {ui.selectedMetricView === 'hiring' ? (
          <Grid container spacing={2}>
            {Object.entries(hiringMetrics.current).map(([key, value]) => (
              <Grid item xs={12} md={4} key={key}>
                <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(value / hiringMetrics.thresholds[key]) * 100}
                    color={value >= hiringMetrics.thresholds[key] ? "error" : "primary"}
                  />
                  <Typography variant="caption">
                    {value} / {hiringMetrics.thresholds[key]}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Tooltip title="Total interviews completed">
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress
                    variant="determinate"
                    value={Math.min(100, (panelMetrics.interviewsCompleted / 100) * 100)}
                  />
                  <Typography variant="body2">
                    {panelMetrics.interviewsCompleted} Interviews
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
            <Grid item xs={12} md={3}>
              <Tooltip title="Average panel rating">
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress
                    variant="determinate"
                    value={(panelMetrics.averageRating / 5) * 100}
                    color={panelMetrics.averageRating < 3.5 ? "warning" : "success"}
                  />
                  <Typography variant="body2">
                    {panelMetrics.averageRating.toFixed(1)} Rating
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
            <Grid item xs={12} md={3}>
              <Tooltip title="Success rate">
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress
                    variant="determinate"
                    value={panelMetrics.successRate}
                    color={panelMetrics.successRate < 70 ? "warning" : "success"}
                  />
                  <Typography variant="body2">
                    {panelMetrics.successRate.toFixed(1)}% Success
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
            <Grid item xs={12} md={3}>
              <Tooltip title="Average time per interview">
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress
                    variant="determinate"
                    value={(panelMetrics.timePerInterview / 60) * 100}
                  />
                  <Typography variant="body2">
                    {panelMetrics.timePerInterview.toFixed(0)} mins/interview
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );

  // Filtered & Paginated Data
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const categoryMatch = filters.category === 'all' || notification.category === filters.category;
      const searchMatch = notification.message.toLowerCase().includes(filters.search.toLowerCase());
      const readMatch = filters.readStatus === 'all' 
        || (filters.readStatus === 'unread' && !notification.read)
        || (filters.readStatus === 'read' && notification.read);
      return categoryMatch && searchMatch && readMatch;
    });
  }, [notifications, filters]);

  const paginatedNotifications = useMemo(() => {
    const startIndex = (filters.currentPage - 1) * 10;
    return filteredNotifications.slice(startIndex, startIndex + 10);
  }, [filteredNotifications, filters.currentPage]);

  // Utility Functions
  const showSnackbarMessage = (message) => {
    setUi(prev => ({ ...prev, showSnackbar: true, snackbarMessage: message }));
  };

  const handleNotificationAction = (id, action) => {
    switch (action) {
      case 'toggle':
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, read: !n.read } : n)
        );
        showSnackbarMessage('Notification status updated');
        break;
      case 'delete':
        setNotifications(prev => prev.filter(n => n.id !== id));
        showSnackbarMessage('Notification deleted');
        break;
    }
  };

  // Main Render
  return (
    <Container maxWidth="xl" sx={{ py: 0 }} style={{ padding: '0px' }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1} sx={{ mb: 1.5 }}>
        <Toolbar>
          <Typography variant="" sx={{ flexGrow: 1 }}>
            Hiring & Panel Performance Dashboard
          </Typography>
          <IconButton onClick={() => setUi(prev => ({ ...prev, showFilters: !prev.showFilters }))}>
            <FilterListIcon />
          </IconButton>
          <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
            <NotificationsIcon />
          </Badge>
        </Toolbar>
      </AppBar>

      {/* Metrics Display */}
      <MetricsDisplay />

      <Grid container spacing={3}>
        {/* Filters & Controls Panel */}
        {ui.showFilters && (
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              {/* Search */}
              <TextField
                fullWidth
                label="Search"
                variant="outlined"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
                sx={{ mb: 2 }}
              />

              {/* Category Filter */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  label="Category"
                >
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {cat.icon}
                        <Typography>{cat.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Controls */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Monitoring Controls</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.thresholdAlerts}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          thresholdAlerts: e.target.checked
                        }))}
                      />
                    }
                    label="Threshold Alerts"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.performanceMonitoring}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          performanceMonitoring: e.target.checked
                        }))}
                      />
                    }
                    label="Performance Monitoring"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.soundEnabled}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          soundEnabled: e.target.checked
                        }))}
                      />
                    }
                    label="Sound Alerts"
                  />
                </CardContent>
              </Card>
            </Paper>
          </Grid>
        )}

        {/* Notifications List */}
        <Grid item xs={12} md={ui.showFilters ? 9 : 12}>
          <Paper>
            <Tabs
              value={ui.currentTab}
              onChange={(e, val) => setUi(prev => ({ ...prev, currentTab: val }))}
              centered
            >
              <Tab label="All" />
              <Tab label="Hiring" />
              <Tab label="Panel" />
            </Tabs>
            <Divider />
            
            <List>
              {paginatedNotifications.map(notification => (
                <Fade in key={notification.id}>
                  <ListItem
                    sx={{
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                      '&:hover': { bgcolor: 'action.selected' },
                    }}
                  >
                    <ListItemIcon>
                      {categories.find(cat => cat.id === notification.category)?.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography>{notification.message}</Typography>
                          <Chip
                            size="small"
                            label={notification.category}
                            color={categories.find(cat => cat.id === notification.category)?.color}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2">{notification.details}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(notification.time).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={() => handleNotificationAction(notification.id, 'toggle')}
                      >
                        <CheckCircleIcon color={notification.read ? 'success' : 'action'} />
                      </IconButton>
                      <IconButton
                        onClick={() => handleNotificationAction(notification.id, 'delete')}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Fade>
              ))}
            </List>

            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(filteredNotifications.length / 10)}
                page={filters.currentPage}
                onChange={(e, page) => setFilters(prev => ({ ...prev, currentPage: page }))}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={ui.showSnackbar}
        autoHideDuration={3000}
        onClose={() => setUi(prev => ({ ...prev, showSnackbar: false }))}
      >
        <Alert severity="success" onClose={() => setUi(prev => ({ ...prev, showSnackbar: false }))}>
          {ui.snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NotificationsDashboard;
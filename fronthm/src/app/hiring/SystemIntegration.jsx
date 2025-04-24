import React, { useState } from 'react';
import {
  Box,
  Stack,
  Paper,
  Typography,
  Card,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import SettingsIcon from '@mui/icons-material/Settings';
import EventIcon from '@mui/icons-material/Event';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';

const SystemIntegration = () => {
  // Mock integration logs data
  const [integrationLogs, setIntegrationLogs] = useState([
    {
      message: 'Workday ATS sync completed successfully',
      status: 'success',
      timestamp: '2024-02-13T10:30:00'
    },
    {
      message: 'Google Calendar sync failed - retry in progress',
      status: 'error',
      timestamp: '2024-02-13T09:45:00'
    },
    {
      message: 'Email templates updated',
      status: 'success',
      timestamp: '2024-02-13T09:00:00'
    },
    {
      message: 'Starting scheduled system sync',
      status: 'info',
      timestamp: '2024-02-13T08:30:00'
    }
  ]);

  // Handler for sync operations
  const handleSync = (integrationType) => {
    const newLog = {
      message: `Starting ${integrationType} synchronization...`,
      status: 'info',
      timestamp: new Date().toISOString()
    };
    setIntegrationLogs([newLog, ...integrationLogs]);
  };

  // Handler for configuration
  const handleConfigureIntegration = (integrationType) => {
    console.log(`Configuring ${integrationType} integration`);
  };

  return (
    <Box sx={{ p: 1 }}>
      <Stack spacing={1}>
        {/* ATS Integration */}
        <Paper sx={{ p: 1 }}>
          <Typography variant="h6" gutterBottom>
            ATS Integration
          </Typography>
          <Card sx={{ p: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle1">Workday ATS</Typography>
                <Typography variant="body2" color="textSecondary">
                  Last synced: {new Date().toLocaleString()}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<SyncIcon />}
                  onClick={() => handleSync('ats')}
                  button="true"
                >
                  Sync Now
                </Button>
                <IconButton onClick={() => handleConfigureIntegration('ats')}>
                  <SettingsIcon />
                </IconButton>
              </Stack>
            </Stack>
          </Card>
        </Paper>

        {/* Calendar Integration */}
        <Paper sx={{ p: 1 }}>
          <Typography variant="h6" gutterBottom>
            Calendar Integration
          </Typography>
          <Card sx={{ p: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle1">Google Calendar</Typography>
                <Typography variant="body2" color="textSecondary">
                  Connected
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<EventIcon />}
                  onClick={() => handleSync('calendar')}
                  button="true"
                >
                  Sync Events
                </Button>
                <IconButton onClick={() => handleConfigureIntegration('calendar')}>
                  <SettingsIcon />
                </IconButton>
              </Stack>
            </Stack>
          </Card>
        </Paper>

        {/* Email Integration */}
        <Paper sx={{ p: 1 }}>
          <Typography variant="h6" gutterBottom>
            Email Integration
          </Typography>
          <Card sx={{ p: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle1">Microsoft Outlook</Typography>
                <Typography variant="body2" color="textSecondary">
                  Connected
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<EmailIcon />}
                  onClick={() => handleSync('email')}
                  button="true"
                >
                  Sync Templates
                </Button>
                <IconButton onClick={() => handleConfigureIntegration('email')}>
                  <SettingsIcon />
                </IconButton>
              </Stack>
            </Stack>
          </Card>
        </Paper>

        {/* Integration Logs */}
        <Paper sx={{ p: 1 }}>
          <Typography variant="h6" gutterBottom>
            Integration Logs
          </Typography>
          <List>
            {integrationLogs.map((log, index) => (
              <ListItem
                key={index}
                divider={index < integrationLogs.length - 1}
              >
                <ListItemIcon>
                  {log.status === 'success' ? (
                    <CheckCircleIcon color="success" />
                  ) : log.status === 'error' ? (
                    <ErrorIcon color="error" />
                  ) : (
                    <InfoIcon color="info" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={log.message}
                  secondary={new Date(log.timestamp).toLocaleString()}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Stack>
    </Box>
  );
};

export default SystemIntegration;
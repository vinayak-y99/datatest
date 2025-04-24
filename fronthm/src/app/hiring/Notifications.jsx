import React, { useState } from 'react';
import {
  Box,
  Stack,
  Paper,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip
} from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import EventIcon from '@mui/icons-material/Event';
import TaskIcon from '@mui/icons-material/Task';
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';

const Notifications = () => {
  // State for notification filter
  const [notificationFilter, setNotificationFilter] = useState('all');

  // Sample notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'candidate',
      message: 'New application received for Senior Developer position',
      timestamp: '2024-02-13T10:30:00',
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'interview',
      message: 'Interview scheduled with John Doe',
      timestamp: '2024-02-13T09:15:00',
      read: false,
      priority: 'normal'
    },
    {
      id: 3,
      type: 'task',
      message: 'Review pending candidate assessments',
      timestamp: '2024-02-12T16:45:00',
      read: true,
      priority: 'normal'
    },
    {
      id: 4,
      type: 'system',
      message: 'System maintenance scheduled for tonight',
      timestamp: '2024-02-12T14:20:00',
      read: true,
      priority: 'high'
    }
  ]);

  // Function to handle marking notification as read
  const handleMarkAsRead = (notificationId) => {
    setNotifications(notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    ));
  };

  // Function to get appropriate icon for notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'candidate':
        return <PersonIcon color="primary" />;
      case 'interview':
        return <EventIcon color="success" />;
      case 'task':
        return <TaskIcon color="warning" />;
      case 'system':
        return <SystemUpdateIcon color="info" />;
      default:
        return <WorkIcon color="action" />;
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Stack spacing={1}>
        {/* Notification Filters */}
        <Paper sx={{ p: 1 }}>
          <Stack direction="row" spacing={1}>
            <Button
              variant={notificationFilter === 'all' ? 'contained' : 'outlined'}
              onClick={() => setNotificationFilter('all')}
              button="true"
            >
              All
            </Button>
            <Button
              variant={notificationFilter === 'unread' ? 'contained' : 'outlined'}
              onClick={() => setNotificationFilter('unread')}
              button="true"
            >
              Unread
            </Button>
            <Button
              variant={notificationFilter === 'important' ? 'contained' : 'outlined'}
              onClick={() => setNotificationFilter('important')}
              button="true"
            >
              Important
            </Button>
          </Stack>
        </Paper>

        {/* Notifications List */}
        <Paper sx={{ p: 1 }}>
          <List>
            {notifications
              .filter(notification => {
                if (notificationFilter === 'unread') return !notification.read;
                if (notificationFilter === 'important') return notification.priority === 'high';
                return true;
              })
              .map((notification, index) => (
                <ListItem
                  key={notification.id}
                  divider={index < notifications.length - 1}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={notification.read}
                    >
                      {notification.read ? (
                        <DoneAllIcon color="disabled" />
                      ) : (
                        <DoneIcon color="primary" />
                      )}
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {notification.message}
                        {notification.priority === 'high' && (
                          <Chip
                            label="Important"
                            size="small"
                            color="error"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={new Date(notification.timestamp).toLocaleString()}
                    sx={{
                      '& .MuiTypography-root': {
                        color: notification.read ? 'text.secondary' : 'text.primary'
                      }
                    }}
                  />
                </ListItem>
              ))}
          </List>
        </Paper>
      </Stack>
    </Box>
  );
};

export default Notifications;






"use client";
import React, { useState } from 'react';
import { Bell, AlertCircle, Calendar, ClipboardCheck, Trophy, CheckCircle2, Star, Clock } from 'lucide-react';

const NotificationsSection = () => {
  const [notifications] = useState([
    {
      id: 1,
      type: 'approval',
      message: 'Hiring approval needed for Senior Developer position',
      time: '30 mins ago',
      status: 'unread',
      priority: 'High',
      requiredAction: 'Final approval needed from hiring manager',
      deadline: '24 hours remaining'
    },
    {
      id: 2,
      type: 'action',
      message: 'Background check pending for Product Manager candidate',
      time: '1 hour ago',
      status: 'unread',
      priority: 'Medium',
      requiredAction: 'Send verification email to previous employer',
      deadline: '48 hours remaining'
    },
    {
      id: 3,
      type: 'score',
      message: 'High-scoring candidate: Sarah Chen scored 95% on technical assessment',
      time: '2 hours ago',
      status: 'unread',
      score: '95%',
      threshold: '85%',
      position: 'Full Stack Developer',
      exceedsThreshold: true
    },
    {
      id: 4,
      type: 'evaluation',
      message: 'Pending evaluation: Review technical assessment for Frontend Developer',
      time: '3 hours ago',
      status: 'unread',
      deadline: '24 hours remaining',
      evaluationType: 'Technical Assessment',
      candidateName: 'Michael Brown'
    },
    {
      id: 5,
      type: 'interview',
      message: 'Interview scheduled: Senior Software Engineer position with John Doe',
      time: '1 day ago',
      status: 'unread',
      deadline: 'Tomorrow at 2:00 PM',
      interviewType: 'Technical Round',
      location: 'Virtual Meeting'
    },
    {
      id: 6,
      type: 'deadline',
      message: 'Decision deadline approaching for UX Designer role',
      time: '4 hours ago',
      status: 'unread',
      deadline: '12 hours remaining',
      position: 'UX Designer',
      candidateName: 'Emma Wilson'
    }
  ]);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  const pendingApprovalsCount = notifications.filter(n => n.type === 'approval' || n.type === 'action').length;
  const deadlineCount = notifications.filter(n => 
    parseInt(n.deadline?.split(' ')[0]) <= 24 && n.deadline?.includes('hours')
  ).length;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-blue-600" />
            <div className="absolute -top-1 -right-1 flex">
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
              {(pendingApprovalsCount > 0 || deadlineCount > 0) && (
                <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center -ml-1">
                  {pendingApprovalsCount + deadlineCount}
                </span>
              )}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-red-900">Notifications & Reminders</h2>
        </div>
        <button className="text-blue-600 text-sm hover:text-blue-700 font-medium">
          Mark all as read
        </button>
      </div>

      {(pendingApprovalsCount > 0 || deadlineCount > 0) && (
        <div className="text-sm text-red-600 flex items-center mb-2">
          <AlertCircle className="w-4 h-4 mr-2" />
          {pendingApprovalsCount > 0 && `${pendingApprovalsCount} pending approval${pendingApprovalsCount !== 1 ? 's' : ''}`}
          {pendingApprovalsCount > 0 && deadlineCount > 0 && ' and '}
          {deadlineCount > 0 && `${deadlineCount} urgent deadline${deadlineCount !== 1 ? 's' : ''}`}
          {' require your attention'}
        </div>
      )}

      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="flex items-start space-x-4 hover:bg-gray-50 transition-colors py-2"
        >
          {notification.type === 'interview' && (
            <Calendar className="w-6 h-6 text-blue-500 flex-shrink-0" />
          )}
          {notification.type === 'evaluation' && (
            <ClipboardCheck className="w-6 h-6 text-blue-500 flex-shrink-0" />
          )}
          {notification.type === 'score' && (
            <Trophy className="w-6 h-6 text-blue-500 flex-shrink-0" />
          )}
          {notification.type === 'approval' && (
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
          )}
          {notification.type === 'action' && (
            <CheckCircle2 className="w-6 h-6 text-orange-500 flex-shrink-0" />
          )}
          {notification.type === 'deadline' && (
            <Clock className="w-6 h-6 text-red-500 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              {notification.message}
            </p>

            {(notification.type === 'approval' || notification.type === 'action') && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Required Action: </span>
                  {notification.requiredAction}
                </p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Priority: <span className={`font-medium ${
                      notification.priority === 'High' ? 'text-red-500' :
                      notification.priority === 'Medium' ? 'text-orange-500' : 'text-blue-500'
                    }`}>{notification.priority}</span>
                  </span>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Take Action
                  </button>
                </div>
              </div>
            )}

            {notification.type === 'score' && notification.exceedsThreshold && (
              <div className="mt-2 bg-green-50 p-2 rounded-md">
                <p className="text-sm text-green-700">
                  Exceeds threshold score of {notification.threshold}
                </p>
              </div>
            )}

            {notification.type === 'evaluation' && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Evaluation Type: </span>
                  {notification.evaluationType}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Candidate: </span>
                  {notification.candidateName}
                </p>
              </div>
            )}

            {notification.type === 'interview' && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Interview Type: </span>
                  {notification.interviewType}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Location: </span>
                  {notification.location}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">
                {notification.time}
              </span>
              {notification.deadline && (
                <span className={`text-sm font-medium ${
                  notification.deadline.includes('hours') && parseInt(notification.deadline) <= 24
                    ? 'text-red-600'
                    : 'text-blue-600'
                }`}>
                  {notification.deadline}
                </span>
              )}
              {notification.score && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-600">
                    Score: {notification.score}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationsSection;
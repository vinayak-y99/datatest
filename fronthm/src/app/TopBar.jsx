'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  MessageSquare,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Search,
  ChevronDown,
  Calendar,
  Clock,
  Filter,
  BarChart2,
  Upload,
  Download, 
  Shield,
  Moon,
  Sun
} from 'lucide-react';

export default function TopBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  
    const [user, setUser] = useState({
      name: 'FastHire',
      role: 'Admin'
    });

    useEffect(() => {
      const loggedInUser = localStorage.getItem('loggedInUser');
      if (loggedInUser) {
        setUser({
          name: loggedInUser,
          role: 'User'
        });
      }
    }, []);
  // Refs for dropdowns
  const dropdownRef = useRef(null);
  const messagesRef = useRef(null);
  const alertsRef = useRef(null);
  const searchRef = useRef(null);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const messages = [
    { id: 1, sender: 'John Doe', content: 'New candidate profile needs review', time: '5m ago', unread: true },
    { id: 2, sender: 'Alice Smith', content: 'Interview scheduled for tomorrow', time: '30m ago', unread: true },
    { id: 3, sender: 'Bob Wilson', content: 'Assessment results are ready', time: '1h ago', unread: false },
    { id: 4, sender: 'Sarah Johnson', content: 'Updated hiring criteria', time: '2h ago', unread: false },
  ];

  const alerts = [
    { id: 1, title: 'Interview Alert', content: 'Upcoming interview in 1 hour', type: 'warning', time: '10m ago' },
    { id: 2, title: 'New Application', content: 'Senior Developer position - 3 new applications', type: 'info', time: '1h ago' },
    { id: 3, title: 'Deadline Alert', content: 'Position closing in 24 hours', type: 'error', time: '2h ago' },
    { id: 4, title: 'System Update', content: 'New features available for testing', type: 'info', time: '3h ago' },
  ];

  const quickActions = [
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
      if (messagesRef.current && !messagesRef.current.contains(event.target)) setIsMessagesOpen(false);
      if (alertsRef.current && !alertsRef.current.contains(event.target)) setIsAlertsOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setIsSearchOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsMessagesOpen(false);
    setIsAlertsOpen(false);
  };

  const toggleMessages = () => {
    setIsMessagesOpen(!isMessagesOpen);
    setIsDropdownOpen(false);
    setIsAlertsOpen(false);
  };

  const toggleAlerts = () => {
    setIsAlertsOpen(!isAlertsOpen);
    setIsDropdownOpen(false);
    setIsMessagesOpen(false);
  };

  const getInitials = (name) => name.split(' ').map(word => word[0]).join('').toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    window.location.href = '/';
  };

  return (
    <div className="bg-white text-gray-800 h-16 flex items-center justify-between px-6 w-full sticky top-0 z-50 shadow-lg border-b border-gray-200">
      {/* Left Section */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Fasthire99
          </h1>
          
        </div>
        

        {/* Quick Actions - Now empty */}
        <div className="flex items-center space-x-4">
          {quickActions.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-6">
        {/* Search */}
        <div ref={searchRef} className="relative">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search candidates, jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-sm"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Filter className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          {currentTime}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div ref={alertsRef} className="relative">
          <button 
            onClick={toggleAlerts}
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Bell className="w-5 h-5" />
            {user.unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {user.unreadAlerts}
              </span>
            )}
          </button>

          {isAlertsOpen && (
            <div className="absolute right-0 mt-2 bg-white rounded-lg w-80 overflow-hidden shadow-xl border border-gray-200">
              <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <button className="text-xs text-blue-600 hover:text-blue-800">Mark all as read</button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {alerts.map(alert => (
                  <div key={alert.id} className="p-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{alert.title}</span>
                      <span className="text-xs text-gray-500">{alert.time}</span>
                    </div>
                    <p className="text-sm text-gray-600">{alert.content}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 text-center border-t border-gray-100 bg-gray-50">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div ref={messagesRef} className="relative">
          <button 
            onClick={toggleMessages}
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            {user.unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {user.unreadMessages}
              </span>
            )}
          </button>

          {isMessagesOpen && (
            <div className="absolute right-0 mt-2 bg-white rounded-lg w-80 overflow-hidden shadow-xl border border-gray-200">
              <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Messages</h3>
                <button className="text-xs text-blue-600 hover:text-blue-800">Mark all as read</button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {messages.map(message => (
                  <div key={message.id} className="p-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{message.sender}</span>
                      <span className="text-xs text-gray-500">{message.time}</span>
                    </div>
                    <p className="text-sm text-gray-600">{message.content}</p>
                    {message.unread && (
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-2 text-center border-t border-gray-100 bg-gray-50">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View All Messages
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-md">
              {user.avatar ? (
                <img src={user.avatar} alt="User" className="w-full h-full rounded-full" />
              ) : (
                <span className="text-sm font-medium">{getInitials(user.name)}</span>
              )}
            </div>
            <div className="hidden md:flex items-center">
              <div className="text-sm mr-2">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 bg-white rounded-lg w-56 overflow-hidden shadow-xl border border-gray-200">
              <div className="p-3 border-b border-gray-100">
                <div className="font-medium text-sm">{user.name}</div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>
              <div className="py-2">
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </button>
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button>
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy
                </button>
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help & Support
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
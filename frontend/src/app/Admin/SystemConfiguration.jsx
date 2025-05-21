"use client";
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter, usePathname } from 'next/navigation'; // Correct import
import 'bootstrap-icons/font/bootstrap-icons.css';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    general: {
      companyName: 'My Company',
      websiteUrl: 'https://example.com',
      timezone: 'UTC',
      language: 'English',
      logo: null,
      termsOfServiceUrl: 'https://example.com/terms-of-service',
      privacyPolicyUrl: 'https://example.com/privacy-policy'
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: '30',
      passwordLength: 12,
      passwordExpiry: '90',
      ipRestriction: false,
      allowedIps: ''
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      slackNotifications: false,
      notificationEmail: 'admin@example.com'
    },
    integrations: {
      googleAnalytics: false,
      googleAnalyticsId: '',
      slack: false,
      slackWebhook: ''
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [emailRecovery, setEmailRecovery] = useState('admin@example.com');

  const router = useRouter();
  const pathname = usePathname(); // Optional, but helpful for debugging

  useEffect(() => {
    // Simulate fetching settings from an API
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings'); // Replace with your API endpoint
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        } else {
          console.error('Failed to fetch settings:', response.status);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
    console.log("Current Pathname:", pathname); // Debugging
  }, [pathname]); // Include pathname in dependency array

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    // Handle saving settings to backend
    console.log('Saving settings:', settings);

    try {
      const response = await fetch('/api/settings', { // Replace with your API endpoint
        method: 'POST', // or PUT
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        console.log('Settings saved successfully!');
      } else {
        console.error('Failed to save settings:', response.status);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleLogout = () => {
    setActiveTab('logout');
    if (settings.security.twoFactorAuth) {
      setShowMFA(true);
    } else {
      console.log('Logging out...');
      // Add your logout logic here
      router.push('/login'); // Example: Redirect to login page
    }
  };

  const handleLogoutAllDevices = () => {
    console.log('Logging out of all devices...');
    // Add your logout all devices logic here
    router.push('/login'); // Example: Redirect to login page
  };

  const handleVerifyMFA = () => {
    if (mfaCode === '123456') { // Placeholder for actual verification logic
      console.log('MFA verified, logging out...');
      setShowMFA(false);
      // Add your logout logic here
      router.push('/login'); // Example: Redirect to login page
    } else {
      alert('Invalid MFA code. Please try again.');
    }
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'security', label: 'Security' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'logout', label: 'Logout' }
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
        <button
          onClick={handleSaveSettings}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'logout') {
                  handleLogout();
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={settings.general.companyName}
                    onChange={(e) => handleSettingChange('general', 'companyName', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={settings.general.websiteUrl}
                    onChange={(e) => handleSettingChange('general', 'websiteUrl', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="GMT">GMT</option>
                    <option value="EST">EST</option>
                    <option value="PST">PST</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    value={settings.general.language}
                    onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleSettingChange('general', 'logo', URL.createObjectURL(file));
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                   {settings.general.logo && (
                    <img src={settings.general.logo} alt="Company Logo" className="mt-2 max-h-20" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terms of Service URL
                  </label>
                  <input
                    type="url"
                    value={settings.general.termsOfServiceUrl}
                    onChange={(e) => handleSettingChange('general', 'termsOfServiceUrl', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Privacy Policy URL
                  </label>
                  <input
                    type="url"
                    value={settings.general.privacyPolicyUrl}
                    onChange={(e) => handleSettingChange('general', 'privacyPolicyUrl', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                    <p className="text-sm text-gray-500">Require 2FA for all users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Timeout (minutes)
                  </label>
                  <select
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Password Length
                  </label>
                  <input
                    type="number"
                    min="8"
                    max="32"
                    value={settings.security.passwordLength}
                    onChange={(e) => handleSettingChange('security', 'passwordLength', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                    <p className="text-sm text-gray-500">Receive system alerts via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notification Email
                  </label>
                  <input
                    type="email"
                    value={settings.notifications.notificationEmail}
                    onChange={(e) => handleSettingChange('notifications', 'notificationEmail', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Integrations Settings */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Integration Settings</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Google Analytics</label>
                    <p className="text-sm text-gray-500">Track website traffic and user behavior</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.integrations.googleAnalytics}
                      onChange={(e) => handleSettingChange('integrations', 'googleAnalytics', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {settings.integrations.googleAnalytics && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Google Analytics ID
                    </label>
                    <input
                      type="text"
                      value={settings.integrations.googleAnalyticsId}
                      onChange={(e) => handleSettingChange('integrations', 'googleAnalyticsId', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Logout / MFA Settings */}
        {activeTab === 'logout' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Multi-Factor Authentication</h3>
            <p className="text-sm text-gray-600 mb-4">
              Require an extra security challenge when logging in. If you are unable to pass this challenge, you will have the option to recover your account via email.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowMFA(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Enable MFA
              </button>
            </div>
            {showMFA && (
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-4">Enter the 6-digit code from your authenticator app:</p>
                <input
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  maxLength={6}
                  className="w-full p-2 border border-gray-300 rounded-md mb-4"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleVerifyMFA}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Verify Code
                  </button>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  Can't access your code? <a href={`mailto:${emailRecovery}`} className="text-blue-600 underline">Recover via email</a>
                </p>
              </div>
            )}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Log Out of All Devices</h3>
              <p className="text-sm text-gray-600 mb-4">
                End all active sessions across all devices, including this one. Please note, it may take up to 30 minutes for all other devices to be logged out.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={handleLogoutAllDevices}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Log Out All Devices
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-600">
          Remember to save your changes. Some settings may require a system restart to take effect.
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
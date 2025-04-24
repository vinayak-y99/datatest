import React from 'react';
import { Shield, FileText, Activity } from 'lucide-react';
import { Switch } from '@headlessui/react';

const ComplianceSettings = () => {
  const [cookieConsent, setCookieConsent] = React.useState(false);
  const [doNotSell, setDoNotSell] = React.useState(false);

  const auditLogs = [
    { id: 1, action: 'User Login', user: 'john@example.com', timestamp: '2024-02-19 10:30:00', ip: '192.168.1.1' },
    { id: 2, action: 'Settings Changed', user: 'admin@example.com', timestamp: '2024-02-19 09:15:00', ip: '192.168.1.2' },
  ]; 

  return (
    <div className="max-w-full mx-auto p-6 space-y-8">
      {/* GDPR Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-indigo-900 mb-6">GDPR Compliance</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Cookie Consent Banner</h4>
              <p className="text-sm text-gray-500">Show cookie consent notice to EU visitors</p>
            </div>
            <Switch
              checked={cookieConsent}
              onChange={setCookieConsent}
              className={`${
                cookieConsent ? 'bg-indigo-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full`}
            >
              <span className={`${
                cookieConsent ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition`} />
            </Switch>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Data Processing Agreement</h4>
              <p className="text-sm text-gray-500">Generate and manage DPAs</p>
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Generate DPA
            </button>
          </div>
        </div>
      </section>

      {/* CCPA Section */}
      <section className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-purple-900 mb-6">CCPA Compliance</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Do Not Sell Link</h4>
              <p className="text-sm text-gray-500">Display "Do Not Sell My Info" link</p>
            </div>
            <Switch
              checked={doNotSell}
              onChange={setDoNotSell}
              className={`${
                doNotSell ? 'bg-purple-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full`}
            >
              <span className={`${
                doNotSell ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition`} />
            </Switch>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Privacy Notice</h4>
              <p className="text-sm text-gray-500">California-specific privacy notice</p>
            </div>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Update Notice
            </button>
          </div>
        </div>
      </section>

      {/* Audit Trails Section */}
      <section className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Audit Trails</h2>
          <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-md flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Export Logs
          </button>
        </div>
        
        <div className="bg-white rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{log.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{log.user}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ComplianceSettings;
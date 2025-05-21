import {  useState } from 'react';
import { 
  Plus, CheckCircle, Clock, AlertTriangle, 
  X,Database,RefreshCw,Shield,FileText,Download
} from 'lucide-react';
const IntegrationCompliance = () => {
    const [integrations] = useState([
      {
        name: 'ATS System',
        status: 'Connected',
        lastSync: '10 minutes ago',
        type: 'Applicant Tracking',
        health: 'good'
      },
      {
        name: 'HR Management Tool',
        status: 'Connected',
        lastSync: '1 hour ago',
        type: 'HR Data',
        health: 'warning'
      },
      {
        name: 'Background Check API',
        status: 'Connected',
        lastSync: '30 minutes ago',
        type: 'Verification',
        health: 'good'
      }
    ]);
  
    const [complianceChecks] = useState([
      {
        name: 'Data Privacy Compliance',
        status: 'Compliant',
        lastCheck: '1 hour ago',
        nextCheck: '23 hours',
        type: 'GDPR & Privacy'
      },
      {
        name: 'Hiring Policy Adherence',
        status: 'Review Needed',
        lastCheck: '1 day ago',
        nextCheck: '2 hours',
        type: 'Internal Policy'
      },
      {
        name: 'Equal Employment Opportunity',
        status: 'Compliant',
        lastCheck: '2 hours ago',
        nextCheck: '22 hours',
        type: 'Legal Requirement'
      }
    ]);
  
    const [auditLogs] = useState([
      {
        action: 'Candidate Data Sync',
        timestamp: '2024-02-06 14:30:00',
        user: 'System',
        details: 'Synchronized 25 candidate records from ATS'
      },
      {
        action: 'Compliance Check',
        timestamp: '2024-02-06 13:15:00',
        user: 'Admin',
        details: 'Quarterly compliance audit completed'
      },
      {
        action: 'Policy Update',
        timestamp: '2024-02-06 11:00:00',
        user: 'HR Manager',
        details: 'Updated hiring policy documentation'
      }
    ]);
  
    return (
      <div className="p-6 space-y-8">
        <div className="flex items-center space-x-3">
          {/* sss */}
          <h2 className="text-3xl font-bold text-blue-900">Integration Compliance</h2>
        </div>
        {/* System Integrations */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Database className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">System Integrations</h3>
          </div>
         
          <div className="space-y-4">
            {integrations.map((integration, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{integration.name}</div>
                    <div className="text-sm text-gray-500">{integration.type}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {integration.lastSync}
                    </div>
                    <div className={integration.health === 'good' ? 'text-green-600' : 'text-yellow-600'}>
                      {integration.health === 'good' ?
                        <CheckCircle className="w-5 h-5" /> :
                        <AlertTriangle className="w-5 h-5" />
                      }
                    </div>
                    <RefreshCw className="w-5 h-5 text-blue-500 cursor-pointer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
  
        {/* Compliance Monitoring */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold">Compliance Monitoring</h3>
          </div>
         
          <div className="space-y-4">
            {complianceChecks.map((check, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{check.name}</div>
                    <div className="text-sm text-gray-500">{check.type}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    check.status === 'Compliant'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {check.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <span>Last check: {check.lastCheck}</span>
                  <span>Next check in: {check.nextCheck}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
  
        {/* Audit Trail */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold">Audit Trail</h3>
            </div>
            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <Download className="w-4 h-4" />
              <span>Export Audit Log</span>
            </button>
          </div>
         
          <div className="space-y-4">
            {auditLogs.map((log, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{log.action}</div>
                    <div className="text-sm text-gray-500">{log.details}</div>
                    <div className="mt-2 text-sm text-gray-500">By: {log.user}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {log.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  export default IntegrationCompliance;
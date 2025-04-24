"use client"
import { useState } from 'react';
import { 
  FileText, Shield, Clock, CheckCircle, AlertTriangle,
  Download, Upload, Search, Plus, Edit, Trash2,
  Filter, MoreVertical, RefreshCw
} from 'lucide-react';

export default function ComplianceDocumentation() {
  // Enhanced state management
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Employee Handbook.pdf', type: 'PDF', uploadDate: '2024-01-20', status: 'active', category: 'HR' },
    { id: 2, name: 'Safety Guidelines.docx', type: 'DOCX', uploadDate: '2024-01-18', status: 'review', category: 'Safety' }
  ]);
  
  const [policies, setPolicies] = useState([
    { id: 1, name: 'Hiring Policy 2024', status: 'active', lastUpdated: '2024-01-15', category: 'HR', version: '1.0' },
    { id: 2, name: 'Interview Guidelines', status: 'active', lastUpdated: '2024-01-10', category: 'HR', version: '2.1' },
    { id: 3, name: 'Documentation Standards', status: 'review', lastUpdated: '2024-01-05', category: 'Compliance', version: '1.2' }
  ]);
  
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: 'Policy Created', user: 'John Doe', timestamp: '2024-01-15 14:30', status: 'completed', details: 'New hiring policy created' },
    { id: 2, action: 'Document Updated', user: 'Jane Smith', timestamp: '2024-01-14 09:15', status: 'pending', details: 'Safety guidelines updated' }
  ]);

  // UI state management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showNewPolicyModal, setShowNewPolicyModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');

  // Form states
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    description: '',
    status: 'draft',
    category: '',
    version: '1.0'
  });

  const [newDocument, setNewDocument] = useState({
    name: '',
    category: '',
    status: 'active'
  });

  // Handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilter = (category) => {
    setFilterCategory(category);
  };

  const handleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const filteredPolicies = policies
    .filter(policy => 
      (filterCategory === 'all' || policy.category === filterCategory) &&
      policy.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.lastUpdated);
      const dateB = new Date(b.lastUpdated);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const handleDocumentUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newDoc = {
        id: documents.length + 1,
        name: file.name,
        type: file.type.split('/')[1].toUpperCase(),
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'active',
        category: newDocument.category || 'Uncategorized'
      };
      setDocuments([...documents, newDoc]);
      addAuditLog(`Document uploaded: ${file.name}`, 'Document Upload');
      setShowDocumentModal(false);
    }
  };

  const addAuditLog = (action, type, details = '') => {
    const newLog = {
      id: auditLogs.length + 1,
      action,
      type,
      user: 'Current User',
      timestamp: new Date().toLocaleString(),
      status: 'completed',
      details
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleAddPolicy = () => {
    if (selectedItem) {
      setPolicies(policies.map(p => 
        p.id === selectedItem.id 
          ? {...newPolicy, id: p.id, lastUpdated: new Date().toISOString().split('T')[0]}
          : p
      ));
      addAuditLog(`Policy updated: ${newPolicy.name}`, 'Policy Update');
    } else {
      const policy = {
        id: policies.length + 1,
        ...newPolicy,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setPolicies([...policies, policy]);
      addAuditLog(`New policy created: ${newPolicy.name}`, 'Policy Creation');
    }
    setShowNewPolicyModal(false);
    resetForms();
  };

  const handleDeleteItem = (id, type) => {
    if (type === 'policy') {
      setPolicies(policies.filter(p => p.id !== id));
      addAuditLog(`Policy deleted: ${policies.find(p => p.id === id).name}`, 'Policy Deletion');
    } else {
      setDocuments(documents.filter(d => d.id !== id));
      addAuditLog(`Document deleted: ${documents.find(d => d.id === id).name}`, 'Document Deletion');
    }
  };

  const generateReport = () => {
    const report = {
      policies: policies,
      documents: documents,
      auditLogs: auditLogs,
      generatedAt: new Date().toISOString(),
      generatedBy: 'Current User'
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addAuditLog('Compliance report generated', 'Report Generation');
  };

  const resetForms = () => {
    setNewPolicy({ name: '', description: '', status: 'draft', category: '', version: '1.0' });
    setNewDocument({ name: '', category: '', status: 'active' });
    setSelectedItem(null);
  };

  // UI Components
  const renderHeader = () => (
    <div className="mb-0">
      {/* <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Compliance & Documentation Management
      </h1> */}
      {/* <p className="text-gray-600">
        Comprehensive system for managing policies, documents, and compliance records
      </p> */}
    </div>
  );

  const renderSearchBar = () => (
    <div className="mb-6 flex gap-4 flex-wrap">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search policies and documents..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setShowNewPolicyModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Policy
        </button>
        <button
          onClick={() => setShowDocumentModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="p-0">
      {renderHeader()}
      {renderSearchBar()}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Policy Section */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold">Policies</h2>
            </div>
            <button onClick={handleSort} className="p-2 hover:bg-gray-100 rounded-full">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          {/* Policy list */}
          <div className="space-y-4">
            {filteredPolicies.map(policy => (
              <div key={policy.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{policy.name}</p>
                  <p className="text-sm text-gray-500">
                    {policy.category} • v{policy.version} • {policy.lastUpdated}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    policy.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {policy.status}
                  </span>
                  <button
                    onClick={() => handleDeleteItem(policy.id, 'policy')}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold">Documents</h2>
            </div>
          </div>
          <div className="space-y-4">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-gray-500">
                    {doc.category} • {doc.uploadDate}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-gray-200 rounded-full text-xs">
                    {doc.type}
                  </span>
                  <button
                    onClick={() => handleDeleteItem(doc.id, 'document')}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Logs Section */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold">Audit Trail</h2>
            </div>
            <button
              onClick={generateReport}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{log.action}</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    log.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {log.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{log.user} • {log.timestamp}</p>
                {log.details && (
                  <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showNewPolicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {selectedItem ? 'Edit Policy' : 'Add New Policy'}
            </h3>
            <input
              type="text"
              placeholder="Policy Name"
              className="w-full p-2 mb-4 border rounded"
              value={newPolicy.name}
              onChange={(e) => setNewPolicy({...newPolicy, name: e.target.value})}
            />
            <textarea
              placeholder="Policy Description"
              className="w-full p-2 mb-4 border rounded"
              value={newPolicy.description}
              onChange={(e) => setNewPolicy({...newPolicy, description: e.target.value})}
            />
            <input
              type="text"
              placeholder="Category"
              className="w-full p-2 mb-4 border rounded"
              value={newPolicy.category}
              onChange={(e) => setNewPolicy({...newPolicy, category: e.target.value})}
            />
            <input
              type="text"
              placeholder="Version"
              className="w-full p-2 mb-4 border rounded"
              value={newPolicy.version}
              onChange={(e) => setNewPolicy({...newPolicy, version: e.target.value})}
            />
            <select
              className="w-full p-2 mb-4 border rounded"
              value={newPolicy.status}
              onChange={(e) => setNewPolicy({...newPolicy, status: e.target.value})}
            >
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="active">Active</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowNewPolicyModal(false);
                  resetForms();
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPolicy}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {selectedItem ? 'Update Policy' : 'Add Policy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Upload Document</h3>
            <input
              type="text"
              placeholder="Document Category"
              className="w-full p-2 mb-4 border rounded"
              value={newDocument.category}
              onChange={(e) => setNewDocument({...newDocument, category: e.target.value})}
            />
            <select
              className="w-full p-2 mb-4 border rounded"
              value={newDocument.status}
              onChange={(e) => setNewDocument({...newDocument, status: e.target.value})}
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="review">Under Review</option>
            </select>
            <label className="block mb-4">
              <span className="sr-only">Choose file</span>
              <input 
                type="file"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                onChange={handleDocumentUpload}
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDocumentModal(false);
                  resetForms();
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


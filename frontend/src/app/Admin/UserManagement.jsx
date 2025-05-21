// "use client"
// import React, { useState, useEffect } from 'react';
// import { Plus, Trash2, Edit2, Mail } from 'lucide-react';
// import axios from 'axios';

// const UserManagement = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [users, setUsers] = useState([]);
//   const [showAddUser, setShowAddUser] = useState(false);
//   const [notification, setNotification] = useState({
//     show: false,
//     message: '',
//     type: ''
//   });
//   const [newUser, setNewUser] = useState({
//     username: '',
//     name: '',
//     email: '',
//     password: '',
//     role_id: 1,
//     credentials: {"active": true}
//   });

//   const fetchUsers = async () => {
//     try {
//       const response = await axios.get('http://127.0.0.1:8000/api/users/users');
//       setUsers(response.data);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     }
//   };

//   const handleAddUser = async () => {
//     try {
//       const userData = {
//         username: newUser.username,
//         name: newUser.name,
//         email: newUser.email,
//         password: newUser.password,
//         role_id: newUser.role_id,
//         credentials: {"active": true}
//       };
   
//       await axios.post('http://127.0.0.1:8000/users', userData, {
//         headers: {
//           'Content-Type': 'application/json',
//           'accept': 'application/json'
//         }
//       });
   
//       await fetchUsers();
//       setShowAddUser(false);
//       setNewUser({ 
//         username: '', 
//         name: '', 
//         email: '', 
//         password: '', 
//         role_id: 1,
//         credentials: {"active": true}
//       });
//       setNotification({
//         show: true,
//         message: 'User added successfully!',
//         type: 'success'
//       });
//       setTimeout(() => setNotification({show: false, message: '', type: ''}), 3000);
//     } catch (error) {
//       setNotification({
//         show: true,
//         message: 'Failed to add user. Please try again.',
//         type: 'error'
//       });
//       setTimeout(() => setNotification({show: false, message: '', type: ''}), 3000);
//     }
//   };

//   useEffect(() => {
//     fetchUsers().finally(() => setIsLoading(false));
//   }, []);

//   if (isLoading) {
//     return <div className="p-6 max-w-7xl mx-auto">Loading...</div>;
//   }

//   return (
//     <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-sm">
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
//         <button
//           onClick={() => setShowAddUser(!showAddUser)}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
//         >
//           <Plus size={16} /> Add User
//         </button>
//       </div>

//       {showAddUser && (
//         <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//             <input
//               value={newUser.username}
//               onChange={(e) => setNewUser({...newUser, username: e.target.value})}
//               className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Username"
//             />
//             <input
//               value={newUser.name}
//               onChange={(e) => setNewUser({...newUser, name: e.target.value})}
//               className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Name"
//             />
//             <input
//               value={newUser.email}
//               onChange={(e) => setNewUser({...newUser, email: e.target.value})}
//               className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Email"
//               type="email"
//             />
//             <input
//               value={newUser.password}
//               onChange={(e) => setNewUser({...newUser, password: e.target.value})}
//               className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Password"
//               type="password"
//             />
//           </div>
//           <div className="flex justify-end gap-2">
//             <button
//               className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
//               onClick={() => setShowAddUser(false)}
//             >
//               Cancel
//             </button>
//             <button
//               className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
//               onClick={handleAddUser}
//             >
//               Save User
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {users.map(user => (
//               <tr key={user.user_id} className="hover:bg-gray-50">
//                 <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{user.role_id}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
//                     Active
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex gap-3">
//                     <button className="text-gray-600 hover:text-blue-600 transition-colors">
//                       <Edit2 className="h-5 w-5" />
//                     </button>
//                     <button className="text-gray-600 hover:text-blue-600 transition-colors">
//                       <Mail className="h-5 w-5" />
//                     </button>
//                     <button className="text-gray-600 hover:text-red-600 transition-colors">
//                       <Trash2 className="h-5 w-5" />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {notification.show && (
//         <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
//           notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
//         } text-white`}>
//           {notification.message}
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserManagement;

// "use client"
// import React, { useState, useEffect } from 'react';
// import { Plus, Trash2, Edit2, Mail } from 'lucide-react';
// import axios from 'axios';

// const UserManagement = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [users, setUsers] = useState([]);
//   const [showAddUser, setShowAddUser] = useState(false);
//   const [notification, setNotification] = useState({
//     show: false,
//     message: '',
//     type: ''
//   });
//   const [newUser, setNewUser] = useState({
//     username: '',
//     name: '',
//     email: '',
//     password: '',
//     role_id: 1,
//     credentials: {"active": true}
//   });

//   const fetchUsers = async () => {
//     try {
//       const response = await axios.get('http://127.0.0.1:8000/api/hiredb/users');
//       setUsers(response.data);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     }
//   };

//   const handleAddUser = async () => {
//     try {
//       const userData = {
//         username: newUser.username,
//         name: newUser.name,
//         email: newUser.email,
//         password: newUser.password,
//         role_id: newUser.role_id,
//         credentials: {"active": true}
//       };
   
//       await axios.post('http://127.0.0.1:8000/api/hiredb/users', userData, {
//         headers: {
//           'Content-Type': 'application/json',
//           'accept': 'application/json'
//         }
//       });
   
//       await fetchUsers();
//       setShowAddUser(false);
//       setNewUser({ 
//         username: '', 
//         name: '', 
//         email: '', 
//         password: '', 
//         role_id: 1,
//         credentials: {"active": true}
//       });
//       setNotification({
//         show: true,
//         message: 'User added successfully!',
//         type: 'success'
//       });
//       setTimeout(() => setNotification({show: false, message: '', type: ''}), 3000);
//     } catch (error) {
//       setNotification({
//         show: true,
//         message: 'Failed to add user. Please try again.',
//         type: 'error'
//       });
//       setTimeout(() => setNotification({show: false, message: '', type: ''}), 3000);
//     }
//   };

//   useEffect(() => {
//     fetchUsers().finally(() => setIsLoading(false));
//   }, []);

//   if (isLoading) {
//     return <div className="p-6 max-w-7xl mx-auto">Loading...</div>;
//   }

//   return (
//     <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-sm">
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
//         <button
//           onClick={() => setShowAddUser(!showAddUser)}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
//         >
//           <Plus size={16} /> Add User
//         </button>
//       </div>

//       {showAddUser && (
//         <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//             <input
//               value={newUser.username}
//               onChange={(e) => setNewUser({...newUser, username: e.target.value})}
//               className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Username"
//             />
//             <input
//               value={newUser.name}
//               onChange={(e) => setNewUser({...newUser, name: e.target.value})}
//               className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Name"
//             />
//             <input
//               value={newUser.email}
//               onChange={(e) => setNewUser({...newUser, email: e.target.value})}
//               className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Email"
//               type="email"
//             />
//             <input
//               value={newUser.password}
//               onChange={(e) => setNewUser({...newUser, password: e.target.value})}
//               className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Password"
//               type="password"
//             />
//           </div>
//           <div className="flex justify-end gap-2">
//             <button
//               className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
//               onClick={() => setShowAddUser(false)}
//             >
//               Cancel
//             </button>
//             <button
//               className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
//               onClick={handleAddUser}
//             >
//               Save User
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {users.map(user => (
//               <tr key={user.user_id} className="hover:bg-gray-50">
//                 <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{user.role_id}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
//                     Active
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex gap-3">
//                     <button className="text-gray-600 hover:text-blue-600 transition-colors">
//                       <Edit2 className="h-5 w-5" />
//                     </button>
//                     <button className="text-gray-600 hover:text-blue-600 transition-colors">
//                       <Mail className="h-5 w-5" />
//                     </button>
//                     <button className="text-gray-600 hover:text-red-600 transition-colors">
//                       <Trash2 className="h-5 w-5" />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {notification.show && (
//         <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
//           notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
//         } text-white`}>
//           {notification.message}
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserManagement;

// "use client"
// import React, { useState, useEffect } from 'react';
// import { Plus, Trash2, Edit2, Search, Filter, Download, Trash } from 'lucide-react';
// import axios from 'axios';

// const UserManagement = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [users, setUsers] = useState([]);
//   const [showAddUser, setShowAddUser] = useState(false);
//   const [notification, setNotification] = useState({
//     show: false,
//     message: '',
//     type: ''
//   });
//   const [newUser, setNewUser] = useState({
//     username: '',
//     name: '',
//     email: '',
//     phone: '',
//     password: '',
//     role_id: 1,
//     department: 'IT',
//     credentials: {"active": true}
//   });
//   const [selectedUsers, setSelectedUsers] = useState([]);

//   const fetchUsers = async () => {
//     try {
//       const response = await axios.get('http://127.0.0.1:8000/api/hiredb/users');
//       // Transform the data to include the additional fields from the image
//       const transformedUsers = response.data.map(user => ({
//         ...user,
//         phone: user.phone || '---',
//         department: user.department || 'IT',
//         last_login: user.last_login || '2024-02-11',
//         created_at: user.created_at || '2024-01-01',
//       }));
//       setUsers(transformedUsers);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     }
//   };

//   const handleAddUser = async () => {
//     try {
//       const userData = {
//         username: newUser.username,
//         name: newUser.name,
//         email: newUser.email,
//         password: newUser.password,
//         phone: newUser.phone,
//         department: newUser.department,
//         role_id: newUser.role_id,
//         credentials: {"active": true}
//       };
   
//       await axios.post('http://127.0.0.1:8000/api/hiredb/users', userData, {
//         headers: {
//           'Content-Type': 'application/json',
//           'accept': 'application/json'
//         }
//       });
   
//       await fetchUsers();
//       setShowAddUser(false);
//       setNewUser({ 
//         username: '', 
//         name: '', 
//         email: '', 
//         phone: '',
//         password: '', 
//         department: 'IT',
//         role_id: 1,
//         credentials: {"active": true}
//       });
//       setNotification({
//         show: true,
//         message: 'User added successfully!',
//         type: 'success'
//       });
//       setTimeout(() => setNotification({show: false, message: '', type: ''}), 3000);
//     } catch (error) {
//       setNotification({
//         show: true,
//         message: 'Failed to add user. Please try again.',
//         type: 'error'
//       });
//       setTimeout(() => setNotification({show: false, message: '', type: ''}), 3000);
//     }
//   };

//   const handleSelectAll = (e) => {
//     if (e.target.checked) {
//       setSelectedUsers(users.map(user => user.user_id));
//     } else {
//       setSelectedUsers([]);
//     }
//   };

//   const handleSelectUser = (userId) => {
//     if (selectedUsers.includes(userId)) {
//       setSelectedUsers(selectedUsers.filter(id => id !== userId));
//     } else {
//       setSelectedUsers([...selectedUsers, userId]);
//     }
//   };

//   const handleDeleteSelected = async () => {
//     try {
//       // In a real implementation, you would make API calls to delete the selected users
//       // For now, we just filter them out of the local state
//       setUsers(users.filter(user => !selectedUsers.includes(user.user_id)));
//       setSelectedUsers([]);
//       setNotification({
//         show: true,
//         message: 'Selected users deleted successfully!',
//         type: 'success'
//       });
//       setTimeout(() => setNotification({show: false, message: '', type: ''}), 3000);
//     } catch (error) {
//       setNotification({
//         show: true,
//         message: 'Failed to delete users. Please try again.',
//         type: 'error'
//       });
//       setTimeout(() => setNotification({show: false, message: '', type: ''}), 3000);
//     }
//   };

//   useEffect(() => {
//     fetchUsers().finally(() => setIsLoading(false));
//   }, []);

//   if (isLoading) {
//     return <div className="p-6 max-w-7xl mx-auto">Loading...</div>;
//   }

//   return (
//     <div className="p-6 w-full mx-auto bg-white">
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
//         <div className="flex gap-2">
//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//               <Search className="h-4 w-4 text-gray-400" />
//             </div>
//             <input
//               type="text"
//               className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
//               placeholder="Search users..."
//             />
//           </div>
//           <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2">
//             <Filter className="h-4 w-4" /> Filters
//           </button>
//           <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2">
//             <Download className="h-4 w-4" /> Export
//           </button>
//           <button 
//             className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
//             disabled={selectedUsers.length === 0}
//             onClick={handleDeleteSelected}
//           >
//             <Trash className="h-4 w-4" /> Delete Selected
//           </button>
//           <button
//             onClick={() => setShowAddUser(!showAddUser)}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
//           >
//             <Plus size={16} /> Add User
//           </button>
//         </div>
//       </div>

//       {showAddUser && (
//         <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//             <input
//               value={newUser.username}
//               onChange={(e) => setNewUser({...newUser, username: e.target.value})}
//               className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Username"
//             />
//             <input
//               value={newUser.name}
//               onChange={(e) => setNewUser({...newUser, name: e.target.value})}
//               className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Name"
//             />
//             <input
//               value={newUser.email}
//               onChange={(e) => setNewUser({...newUser, email: e.target.value})}
//               className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Email"
//               type="email"
//             />
//             <input
//               value={newUser.phone}
//               onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
//               className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Phone"
//               type="tel"
//             />
//             <input
//               value={newUser.password}
//               onChange={(e) => setNewUser({...newUser, password: e.target.value})}
//               className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Password"
//               type="password"
//             />
//             <select
//               value={newUser.department}
//               onChange={(e) => setNewUser({...newUser, department: e.target.value})}
//               className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="IT">IT</option>
//               <option value="HR">HR</option>
//               <option value="Finance">Finance</option>
//               <option value="Marketing">Marketing</option>
//             </select>
//           </div>
//           <div className="flex justify-end gap-2">
//             <button
//               className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
//               onClick={() => setShowAddUser(false)}
//             >
//               Cancel
//             </button>
//             <button
//               className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
//               onClick={handleAddUser}
//             >
//               Save User
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-3 py-3 text-left">
//                 <input 
//                   type="checkbox" 
//                   className="form-checkbox rounded"
//                   onChange={handleSelectAll}
//                   checked={selectedUsers.length === users.length && users.length > 0}
//                 />
//               </th>
//               <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
//               <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//               <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//               <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
//               <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
//               <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//               <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
//               <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
//               <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
//               <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {users.map(user => (
//               <tr key={user.user_id} className="hover:bg-gray-50">
//                 <td className="px-3 py-4 whitespace-nowrap">
//                   <input 
//                     type="checkbox" 
//                     className="form-checkbox rounded"
//                     checked={selectedUsers.includes(user.user_id)}
//                     onChange={() => handleSelectUser(user.user_id)}
//                   />
//                 </td>
//                 <td className="px-3 py-4 whitespace-nowrap">U{String(user.user_id).padStart(3, '0')}</td>
//                 <td className="px-3 py-4 whitespace-nowrap">{user.name}</td>
//                 <td className="px-3 py-4 whitespace-nowrap">{user.email}</td>
//                 <td className="px-3 py-4 whitespace-nowrap">{user.phone || '---'}</td>
//                 <td className="px-3 py-4 whitespace-nowrap">
//                   <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                     user.role_id === 1 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
//                   }`}>
//                     {user.role_id === 1 ? 'Admin' : 'User'}
//                   </span>
//                 </td>
//                 <td className="px-3 py-4 whitespace-nowrap">
//                   <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
//                     Active
//                   </span>
//                 </td>
//                 <td className="px-3 py-4 whitespace-nowrap">{user.department || 'IT'}</td>
//                 <td className="px-3 py-4 whitespace-nowrap">{user.last_login || '2024-02-11'}</td>
//                 <td className="px-3 py-4 whitespace-nowrap">{user.created_at || '2024-01-01'}</td>
//                 <td className="px-3 py-4 whitespace-nowrap">
//                   <div className="flex gap-3">
//                     <button className="text-blue-600 hover:text-blue-800 transition-colors">
//                       <Edit2 className="h-5 w-5" />
//                     </button>
//                     <button className="text-red-600 hover:text-red-800 transition-colors">
//                       <Trash2 className="h-5 w-5" />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {notification.show && (
//         <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
//           notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
//         } text-white`}>
//           {notification.message}
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserManagement;



"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search, Filter, Download, Trash } from 'lucide-react';
import axios from 'axios';

const UserManagement = ({ selectedDepartment }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: ''
  });
  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    role_id: 1,
    department: selectedDepartment || 'IT',
    organization: '',
    position: '',
    
    credentials: {"active": true}
  });

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/hiredb/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddUser = async () => {
    try {
      const userData = {
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        phone: newUser.phone,
        department: newUser.department,
        organization: newUser.organization,
        position: newUser.position,
        
        role_id: newUser.role_id,
        credentials: {"active": true}
      };
   
      await axios.post('http://127.0.0.1:8000/api/hiredb/users', userData, {
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        }
      });
   
      await fetchUsers();
      setShowAddUser(false);
      setNewUser({ 
        username: '', 
        name: '', 
        email: '', 
        phone: '',
        password: '', 
        department: selectedDepartment || 'IT',
        organization: '',
        position: '',
       
        role_id: 1,
        credentials: {"active": true}
      });
      setNotification({
        show: true,
        message: 'User added successfully!',
        type: 'success'
      });
      setTimeout(() => setNotification({show: false, message: '', type: ''}), 3000);
    } catch (error) {
      setNotification({
        show: true,
        message: 'Failed to add user. Please try again.',
        type: 'error'
      });
      setTimeout(() => setNotification({show: false, message: '', type: ''}), 3000);
    }
  };

  useEffect(() => {
    fetchUsers().finally(() => setIsLoading(false));
  }, []);

  const filteredUsers = selectedDepartment 
    ? users.filter(user => user.department === selectedDepartment)
    : users;

  if (isLoading) {
    return <div className="p-6 max-w-7xl mx-auto">Loading...</div>;
  }

  return (
    <div className="p-6 w-full mx-auto bg-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          {selectedDepartment && (
            <p className="text-gray-600 mt-1">Filtered by: {selectedDepartment}</p>
          )}
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowAddUser(!showAddUser)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      {showAddUser && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              value={newUser.username}
              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              placeholder="Username"
            />
            <input
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              placeholder="Full Name"
            />
            <input
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              placeholder="Email"
              type="email"
            />
            <input
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
              type="password"
            />
            <select
              value={newUser.department}
              onChange={(e) => setNewUser({...newUser, department: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Department</option>
              <option value="hiring_manager">Hiring Manager</option>
              <option value="technical_staff">Technical Staff</option>
              <option value="recruiter">Recruiter</option>
              <option value="client">Client</option>
            </select>
            
            <input
              value={newUser.position}
              onChange={(e) => setNewUser({...newUser, position: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              placeholder="Position"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
              onClick={() => setShowAddUser(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              onClick={handleAddUser}
            >
              Save User
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
           
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <tr key={user.user_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.department || 'Not Assigned'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.position || 'Not Assigned'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-3">
                    <button className="text-gray-600 hover:text-blue-600 transition-colors">
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button className="text-gray-600 hover:text-red-600 transition-colors">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default UserManagement;


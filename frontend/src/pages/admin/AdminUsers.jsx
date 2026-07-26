import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaSearch, 
  FaFileCsv, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaGoogle, 
  FaMobileAlt,
  FaSyncAlt
} from 'react-icons/fa';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('agrishield_admin_auth') || localStorage.getItem('agrishield_token');
      const res = await axios.get(`${apiUrl}/auth/admin/users`, {
        params: { search: search.trim() || undefined },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data && res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err.response?.data?.message || 'Failed to load farmers list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  // Export to CSV helper
  const handleExportCSV = () => {
    if (!users.length) return;

    const headers = ['ID', 'Full Name', 'Phone', 'Email', 'Village', 'Pincode', 'Auth Method', 'Registration Date'];
    const rows = users.map(u => [
      u.id,
      `"${(u.fullName || '').replace(/"/g, '""')}"`,
      `"${u.phone}"`,
      `"${u.email}"`,
      `"${(u.village || '').replace(/"/g, '""')}"`,
      `"${u.pincode}"`,
      `"${u.authType}"`,
      `"${new Date(u.registrationDate).toLocaleDateString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `agrishield_farmers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const googleUsersCount = users.filter(u => u.authType === 'Google').length;
  const phoneUsersCount = users.filter(u => u.authType === 'Phone OTP').length;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
      
      {/* Header and Stats */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Farmer Directory & Auth Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            View all registered farmers, filter by Phone or Name, and export data.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={fetchUsers}
            className="p-3 text-gray-600 hover:text-emerald-700 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-colors"
            title="Refresh List"
          >
            <FaSyncAlt className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleExportCSV}
            disabled={!users.length}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold rounded-xl shadow-sm transition-all text-sm cursor-pointer"
          >
            <FaFileCsv className="text-lg" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-800 uppercase">Total Farmers</p>
            <p className="text-2xl font-black text-emerald-950 mt-1">{users.length}</p>
          </div>
          <FaUser className="text-2xl text-emerald-600" />
        </div>

        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-red-800 uppercase">Google Sign-In</p>
            <p className="text-2xl font-black text-red-950 mt-1">{googleUsersCount}</p>
          </div>
          <FaGoogle className="text-2xl text-red-500" />
        </div>

        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-800 uppercase">Phone OTP</p>
            <p className="text-2xl font-black text-blue-950 mt-1">{phoneUsersCount}</p>
          </div>
          <FaMobileAlt className="text-2xl text-blue-600" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <FaSearch />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search farmers by mobile number, name, village, or email..."
          className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 text-sm font-medium outline-none transition-all"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 rounded-2xl bg-red-50 text-red-700 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Farmers Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs font-extrabold uppercase tracking-wider">
              <th className="py-3 px-4">Farmer Name</th>
              <th className="py-3 px-4">Phone Number</th>
              <th className="py-3 px-4">Email Address</th>
              <th className="py-3 px-4">Village / Place</th>
              <th className="py-3 px-4">Pincode</th>
              <th className="py-3 px-4">Auth Method</th>
              <th className="py-3 px-4">Registered Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  Loading farmers list...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No registered farmers match your search.
                </td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900">
                    {u.fullName || 'Farmer'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-800">
                    {u.phone !== 'N/A' ? `+91 ${u.phone}` : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {u.email}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {u.village}
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-mono text-xs">
                    {u.pincode}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      u.authType === 'Google' 
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {u.authType === 'Google' ? <FaGoogle /> : <FaMobileAlt />}
                      {u.authType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {new Date(u.registrationDate).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AdminUsers;

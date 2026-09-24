import { useState } from 'react';
import { Save, Building, Key, Shield, UserCircle } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('school');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage school profile, API keys, and admin roles.</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 transition">
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('school')}
              className={`${
                activeTab === 'school'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
            >
              <Building className={`${
                activeTab === 'school' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              } flex-shrink-0 -ml-1 mr-3 h-5 w-5`} />
              School Profile
            </button>
            
            <button
              onClick={() => setActiveTab('api')}
              className={`${
                activeTab === 'api'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
            >
              <Key className={`${
                activeTab === 'api' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              } flex-shrink-0 -ml-1 mr-3 h-5 w-5`} />
              Payment Gateway
            </button>

            <button
              onClick={() => setActiveTab('roles')}
              className={`${
                activeTab === 'roles'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
            >
              <Shield className={`${
                activeTab === 'roles' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              } flex-shrink-0 -ml-1 mr-3 h-5 w-5`} />
              Admin Roles
            </button>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200">
          {activeTab === 'school' && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-4">School Profile</h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">School Name</label>
                  <input type="text" defaultValue="Elimu Academy" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                  <input type="text" defaultValue="REG-2026-991" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Physical Address</label>
                  <input type="text" defaultValue="123 Education Lane, Nairobi, Kenya" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                  <input type="email" defaultValue="admin@elimuacademy.ac.ke" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                  <input type="text" defaultValue="+254 700 000 000" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-4">Payment Gateway Integration (M-Pesa Daraja)</h2>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-sm text-blue-800">These credentials are used to connect to Safaricom's Daraja API for STK Push and C2B payments. Keep them secure.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Environment</label>
                  <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <option>Sandbox (Testing)</option>
                    <option>Production (Live)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Consumer Key</label>
                  <input type="password" defaultValue="••••••••••••••••" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Consumer Secret</label>
                  <input type="password" defaultValue="••••••••••••••••" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Paybill / Till Number</label>
                  <input type="text" defaultValue="174379" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-4">Admin Roles & Permissions</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <UserCircle className="w-10 h-10 text-gray-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">School Admin</p>
                      <p className="text-sm text-gray-500">Super Administrator</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <UserCircle className="w-10 h-10 text-gray-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Finance Manager</p>
                      <p className="text-sm text-gray-500">Bursar (Read/Write Ledgers)</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                </div>

                <button className="mt-2 text-sm text-blue-600 font-medium hover:text-blue-800">
                  + Invite new administrator
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

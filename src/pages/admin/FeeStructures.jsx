import { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';

export default function FeeStructures() {
  const [activeTab, setActiveTab] = useState('base');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Structure Management</h1>
          <p className="text-sm text-gray-500 mt-1">Configure academic fees, transport zones, and discounts</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition font-medium">
          Generate Invoices
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('base')}
              className={`${
                activeTab === 'base'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition`}
            >
              Base Tuition Fees
            </button>
            <button
              onClick={() => setActiveTab('modular')}
              className={`${
                activeTab === 'modular'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition`}
            >
              Modular Items
            </button>
            <button
              onClick={() => setActiveTab('discounts')}
              className={`${
                activeTab === 'discounts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition`}
            >
              Discounts & Scholarships
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'base' && (
            <div className="space-y-4">
              <div className="flex justify-end mb-4">
                <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
                  <Plus className="w-4 h-4 mr-2" /> Add Grade Fee
                </button>
              </div>
              <table className="min-w-full divide-y divide-gray-200 border rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tuition Amount (Ksh)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {['Grade 1 - 3', 'Grade 4 - 6', 'Grade 7 - 8'].map((grade, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{grade}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">50,000</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3"><Edit2 className="w-4 h-4" /></button>
                        <button className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'modular' && (
            <div className="space-y-4">
              <div className="flex justify-end mb-4">
                <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
                  <Plus className="w-4 h-4 mr-2" /> Add Module
                </button>
              </div>
              <table className="min-w-full divide-y divide-gray-200 border rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost (Ksh)</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Transport - Zone A</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Transport</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">15,000</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900"><Edit2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Lunch Program</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Meals</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10,000</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900"><Edit2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'discounts' && (
            <div className="text-center py-12 text-gray-500">
              <p>No discounts or scholarships configured yet.</p>
              <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none">
                <Plus className="w-4 h-4 mr-2" /> Create Discount Rule
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Search, Download, AlertTriangle, Code, ArrowRightLeft } from 'lucide-react';

export default function Transactions() {
  const [activeTab, setActiveTab] = useState('ledger');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions & Reconciliation</h1>
          <p className="text-sm text-gray-500 mt-1">Financial ledger, unallocated payments, and gateway logs</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex -mb-px px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`${
                activeTab === 'ledger'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition`}
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" /> Complete Ledger
            </button>
            <button
              onClick={() => setActiveTab('unallocated')}
              className={`${
                activeTab === 'unallocated'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition`}
            >
              <AlertTriangle className="w-4 h-4 mr-2" /> Unallocated (M-Pesa)
              <span className="ml-2 bg-yellow-100 text-yellow-800 py-0.5 px-2 rounded-full text-xs">2</span>
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`${
                activeTab === 'webhooks'
                  ? 'border-gray-500 text-gray-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition`}
            >
              <Code className="w-4 h-4 mr-2" /> Webhook Logs (Dev)
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search receipt, student, amount..."
                    className="pl-9 pr-4 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-64"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-2" /> Export Excel
                </button>
              </div>
              <p className="text-gray-500 text-sm italic">Showing the last 30 days of transactions.</p>
              {/* Full ledger table can go here (similar to Dashboard but with Receipt No, Payment Method) */}
            </div>
          )}

          {activeTab === 'unallocated' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      These payments were received via M-Pesa but the Account Number (Admission No) provided did not match any active student. Please manually allocate them.
                    </p>
                  </div>
                </div>
              </div>
              
              <table className="min-w-full divide-y divide-gray-200 border rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">M-Pesa Ref</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Input Account No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">RKH5TR8Y2</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2026-09-24 10:15 AM</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">+254712345678</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-bold">SOO1 (Typo)</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">Ksh 15,000</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 font-bold">Allocate</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">RKH9PL4M1</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2026-09-23 04:30 PM</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">+254798765432</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-bold">FEES</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">Ksh 5,000</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 font-bold">Allocate</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'webhooks' && (
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
              <p className="text-gray-400 mb-2">// Listening for incoming Daraja API STK Push callbacks...</p>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500">[2026-09-24 16:45:01] POST /api/mpesa/callback</span>
                  <pre className="mt-1">{JSON.stringify({ "Body": { "stkCallback": { "MerchantRequestID": "29115-34620561-1", "CheckoutRequestID": "ws_CO_24092026164501234", "ResultCode": 0, "ResultDesc": "The service request is processed successfully." } } }, null, 2)}</pre>
                </div>
                <div className="text-red-400">
                  <span className="text-gray-500">[2026-09-24 16:40:12] POST /api/mpesa/callback</span>
                  <pre className="mt-1">{JSON.stringify({ "Body": { "stkCallback": { "ResultCode": 1032, "ResultDesc": "Request cancelled by user" } } }, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

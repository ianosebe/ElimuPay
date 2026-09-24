import { studentsData, feeStructure } from '../data/mockData';
import { format } from 'date-fns';
import { FileText, CreditCard, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ParentDashboard() {
  const { user } = useAuth();
  
  // Find the student associated with the logged-in parent
  const student = studentsData.find(s => s.id === user.studentId) || studentsData[0];
  const balance = student.totalFees - student.paidFees;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
        <span className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full">
          Viewing: {student.name} ({student.grade})
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Fees</p>
              <h3 className="text-xl font-bold text-gray-900">Ksh {student.totalFees.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Paid Fees</p>
              <h3 className="text-xl font-bold text-gray-900">Ksh {student.paidFees.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ongoing Balance</p>
              <h3 className="text-xl font-bold text-gray-900">Ksh {balance.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Transactions History</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {student.transactions.map((tx) => (
              <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                <div>
                  <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                  <p className="text-sm text-gray-500">{format(new Date(tx.date), 'MMM dd, yyyy')}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'credit' ? '+' : '-'} Ksh {tx.amount.toLocaleString()}
                  </p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                    tx.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {tx.type.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
            {student.transactions.length === 0 && (
              <div className="p-6 text-center text-gray-500">No transactions found.</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Fee Structure</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Tuition</span>
                <span className="font-medium">Ksh {feeStructure.tuition.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transport</span>
                <span className="font-medium">Ksh {feeStructure.transport.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lunch Program</span>
                <span className="font-medium">Ksh {feeStructure.lunch.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>Ksh {feeStructure.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
            <h3 className="text-indigo-800 font-medium mb-2">Make a Payment</h3>
            <p className="text-sm text-indigo-600 mb-4">Pay your outstanding balance securely online.</p>
            <button className="w-full bg-indigo-600 text-white rounded-md py-2 px-4 hover:bg-indigo-700 transition font-medium">
              Pay Ksh {balance.toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

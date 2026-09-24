import { useParams, Link } from 'react-router-dom';
import { studentsData } from '../data/mockData';
import { ArrowLeft, User, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminStudentProfile() {
  const { id } = useParams();
  const student = studentsData.find(s => s.id === id);

  if (!student) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Student not found</h2>
        <Link to="/admin" className="text-indigo-600 mt-4 inline-block hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const unpaid = student.totalFees - student.paidFees;
  const isFinished = unpaid <= 0;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <User className="w-8 h-8" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
              <p className="text-gray-500 flex items-center mt-1">
                <BookOpen className="w-4 h-4 mr-1" /> {student.id} | {student.grade}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isFinished ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isFinished ? <CheckCircle className="w-4 h-4 mr-1" /> : <AlertTriangle className="w-4 h-4 mr-1" />}
              {isFinished ? 'Fees Cleared' : 'Balance Pending'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
          <p className="text-sm font-medium text-gray-500">Total Fees Required</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">Ksh {student.totalFees.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
          <p className="text-sm font-medium text-green-700">Total Paid</p>
          <p className="text-2xl font-bold text-green-900 mt-2">Ksh {student.paidFees.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
          <p className="text-sm font-medium text-red-700">Unpaid Balance</p>
          <p className="text-2xl font-bold text-red-900 mt-2">Ksh {unpaid.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Transaction Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3 text-right">Amount (Ksh)</th>
              </tr>
            </thead>
            <tbody>
              {student.transactions.map(tx => (
                <tr key={tx.id} className="bg-white border-b">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(tx.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {tx.description}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      tx.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-medium ${
                    tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.type === 'credit' ? '+' : '-'} {tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {student.transactions.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">No transactions recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

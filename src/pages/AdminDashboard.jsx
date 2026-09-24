import { useState } from 'react';
import { studentsData } from '../data/mockData';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, TrendingUp, AlertCircle, Download, FileText, Plus, Bell, Calendar, UserPlus } from 'lucide-react';

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [academicTerm, setAcademicTerm] = useState('Term 3, 2026');

  // Calculate totals
  const totalSchoolFees = studentsData.reduce((acc, student) => acc + student.totalFees, 0);
  const totalPaidFees = studentsData.reduce((acc, student) => acc + student.paidFees, 0);
  const totalUnpaidFees = totalSchoolFees - totalPaidFees;

  const filteredStudents = studentsData.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRecentPayments = () => {
    let allTx = [];
    studentsData.forEach(student => {
      student.transactions.forEach(tx => {
        if (tx.type === 'credit') {
          allTx.push({ ...tx, studentName: student.name, studentId: student.id });
        }
      });
    });
    return allTx.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  };

  return (
    <div className="space-y-6">
      {/* Header & Global Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of school finances and enrollments</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
              value={academicTerm}
              onChange={(e) => setAcademicTerm(e.target.value)}
            >
              <option>Term 1, 2026</option>
              <option>Term 2, 2026</option>
              <option>Term 3, 2026</option>
              <option>Full Year 2026</option>
            </select>
            <Calendar className="w-4 h-4 text-gray-500 absolute right-3 top-2.5 pointer-events-none" />
          </div>
          
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 transition">
            <UserPlus className="w-4 h-4 mr-2" /> New Student
          </button>
          
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg shadow-sm hover:bg-gray-50 transition">
            <FileText className="w-4 h-4 mr-2" /> Manual Payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-6 rounded-lg shadow-sm text-white">
          <p className="text-indigo-100 font-medium">Total School Fees ({academicTerm})</p>
          <h3 className="text-3xl font-bold mt-2">Ksh {totalSchoolFees.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Paid (Collected)</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">Ksh {totalPaidFees.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Unpaid (Deficit)</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">Ksh {totalUnpaidFees.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-medium text-gray-900">Students Directory</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search students..."
                  className="pl-9 pr-4 py-1.5 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-48"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
              </div>
              <button className="p-1.5 text-gray-500 hover:text-blue-600 border border-gray-300 rounded hover:bg-gray-50 transition" title="Export CSV">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Paid</th>
                  <th className="px-6 py-3">Unpaid</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => {
                  const unpaid = student.totalFees - student.paidFees;
                  const isFinished = unpaid <= 0;
                  return (
                    <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span>{student.name}</span>
                          <span className="text-xs text-gray-500">{student.id} • {student.grade}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-green-600 font-medium">
                        Ksh {student.paidFees.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-red-600 font-medium">
                        Ksh {unpaid.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isFinished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {isFinished ? 'Cleared' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex items-center space-x-3">
                        {!isFinished && (
                          <button 
                            className="text-gray-400 hover:text-blue-600 transition flex items-center" 
                            title="Send SMS Reminder"
                            onClick={() => alert(`SMS Reminder sent to ${student.name}'s parent for Ksh ${unpaid.toLocaleString()} arrears.`)}
                          >
                            <Bell className="w-4 h-4" />
                          </button>
                        )}
                        <Link to={`/admin/student/${student.id}`} className="text-indigo-600 hover:text-indigo-900 inline-flex items-center">
                          View <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-fit">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Recent Payments</h2>
            <button className="text-xs text-blue-600 font-medium hover:underline flex items-center">
              Export PDF
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {getRecentPayments().map((tx, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{tx.studentName}</p>
                  <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
                <span className="text-sm font-bold text-green-600">
                  +Ksh {tx.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
            <Link to="/admin/transactions" className="text-sm text-indigo-600 font-medium hover:underline">
              View all transactions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

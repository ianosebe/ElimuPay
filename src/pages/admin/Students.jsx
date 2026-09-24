import { useState } from 'react';
import { studentsData } from '../../data/mockData';
import { Search, Filter, Plus, MoreVertical, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Students() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredStudents = studentsData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isCleared = student.totalFees - student.paidFees <= 0;
    const matchesStatus = statusFilter === 'all' 
      ? true 
      : statusFilter === 'cleared' ? isCleared : !isCleared;
      
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student CRM</h1>
          <p className="text-sm text-gray-500 mt-1">Manage enrollment, contact details, and fee ledgers.</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 transition">
          <Plus className="w-4 h-4 mr-2" /> Enroll Student
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search by name or admission number..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              className="border border-gray-300 text-sm rounded-lg py-2 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="cleared">Fees Cleared</option>
              <option value="pending">Balance Pending</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Financial Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map(student => {
                const balance = student.totalFees - student.paidFees;
                const isCleared = balance <= 0;
                
                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <Link to={`/admin/student/${student.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                            {student.name}
                          </Link>
                          <div className="text-xs text-gray-500">Adm: {student.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.grade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Parent / Guardian</div>
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <Phone className="w-3 h-3 mr-1" /> +254 7XX XXX XXX
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isCleared ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Cleared
                        </span>
                      ) : (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 w-max">
                            Pending
                          </span>
                          <span className="text-xs font-semibold text-red-600 mt-1">
                            Arrears: Ksh {balance.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button className="text-gray-400 hover:text-blue-600" title="Edit Student">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600" title="Delete Student">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No students found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

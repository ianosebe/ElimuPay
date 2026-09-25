import { Users, Briefcase } from 'lucide-react';

export default function Teachers() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Profiles</h1>
          <p className="text-sm text-gray-500 mt-1">Manage teaching staff, assignments, and records.</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 transition">
          <Briefcase className="w-4 h-4 mr-2" /> Add Teacher
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-12 text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900">No Teachers Found</h2>
          <p className="text-gray-500 mt-2">Get started by adding your teaching staff to the system.</p>
        </div>
      </div>
    </div>
  );
}

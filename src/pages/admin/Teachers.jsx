import { useState, useEffect } from 'react';
import { Briefcase, Search, Plus, Edit, Trash2, Phone, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function Teachers() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) {
        // If table doesn't exist, it will error here, which is fine, we just log it and show empty
        console.error('Error fetching teachers:', error);
      } else {
        setTeachers(data || []);
      }
    } catch (error) {
      console.error('Exception fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the system?`)) {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);
        
      if (error) {
        alert('Error deleting teacher: ' + error.message);
      } else {
        setTeachers(teachers.filter(t => t.id !== id));
      }
    }
  };

  const filteredTeachers = teachers.filter(t => 
    `${t.first_name} ${t.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Profiles</h1>
          <p className="text-sm text-gray-500 mt-1">Manage teaching staff, assignments, and records.</p>
        </div>
        <Link to="/admin/teachers/add" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 transition">
          <Briefcase className="w-4 h-4 mr-2" /> Add Teacher
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading teachers...</div>
        ) : filteredTeachers.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-gray-900">No Teachers Found</h2>
            <p className="text-gray-500 mt-2">Get started by adding your teaching staff to the system.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3">Teacher</th>
                  <th className="px-6 py-3">Subject / Dept</th>
                  <th className="px-6 py-3">Classes</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map(teacher => (
                  <tr key={teacher.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{teacher.first_name} {teacher.last_name}</span>
                        <span className="text-xs text-gray-500">{teacher.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{teacher.subject || '-'}</td>
                    <td className="px-6 py-4">{teacher.classes || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        {teacher.phone && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Phone className="w-3 h-3 mr-1" /> {teacher.phone}
                          </div>
                        )}
                        {teacher.email && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Mail className="w-3 h-3 mr-1" /> {teacher.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button 
                        onClick={() => navigate('/admin/teachers/add', { state: { editTeacher: teacher } })}
                        className="text-blue-600 hover:text-blue-900 transition"
                        title="Edit Teacher"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button 
                        onClick={() => handleDelete(teacher.id, `${teacher.first_name} ${teacher.last_name}`)}
                        className="text-red-600 hover:text-red-900 transition"
                        title="Remove Teacher"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

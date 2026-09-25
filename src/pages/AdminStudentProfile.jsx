import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, User, BookOpen } from 'lucide-react';

export default function AdminStudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
        setStudent({
          ...data,
          name: `${data.first_name} ${data.last_name}`,
          totalFees: 0, // Defaults until transactions are linked
          paidFees: 0,
          transactions: []
        });
      }
      setLoading(false);
    };
    
    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-4 font-medium">Loading profile...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Student not found</h2>
        <button onClick={() => navigate(-1)} className="text-blue-600 mt-4 inline-block hover:underline font-medium">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 focus:outline-none">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <User className="w-8 h-8" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">First Name</p>
              <p className="text-gray-900 mt-1">{student.first_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Last Name</p>
              <p className="text-gray-900 mt-1">{student.last_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Admission Number</p>
              <p className="text-gray-900 mt-1">{student.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Current Class</p>
              <p className="text-gray-900 mt-1">{student.grade}</p>
            </div>
          </div>
        </div>

        {/* Guardian Details Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Guardian Details</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Guardian Name</p>
              <p className="text-gray-900 mt-1">{student.parent_name || 'Not Provided'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Contact Number</p>
              <p className="text-gray-900 mt-1">{student.parent_phone || 'Not Provided'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email Address</p>
              <p className="text-gray-900 mt-1">Not Provided</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Physical Address</p>
              <p className="text-gray-900 mt-1">Not Provided</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

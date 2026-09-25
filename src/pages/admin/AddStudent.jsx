import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, User, Phone, MapPin, Calendar, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AddStudent() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const editStudent = location.state?.editStudent;
  const isEdit = !!editStudent;
  
  const initialGrade = location.state?.grade || 'Grade 1';
  
  const [formData, setFormData] = useState({
    firstName: editStudent?.first_name || '',
    lastName: editStudent?.last_name || '',
    admissionNumber: editStudent?.id || '',
    dateOfBirth: '', // Not in DB yet
    gender: 'Male',
    grade: editStudent?.grade || initialGrade,
    parentName: editStudent?.parent_name || '',
    parentPhone: editStudent?.parent_phone || '',
    parentEmail: '',
    address: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = { 
      id: formData.admissionNumber, 
      first_name: formData.firstName,
      last_name: formData.lastName,
      grade: formData.grade,
      parent_phone: formData.parentPhone,
      parent_name: formData.parentName
    };

    let error;

    if (isEdit) {
      const { error: updateError } = await supabase
        .from('students')
        .update(payload)
        .eq('id', editStudent.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('students')
        .insert([payload]);
      error = insertError;
    }

    if (error) {
      alert(`Error ${isEdit ? 'updating' : 'saving'} student: ` + error.message);
    } else {
      alert(`Successfully ${isEdit ? 'updated' : 'added'} student ${formData.firstName} ${formData.lastName}!`);
      navigate('/admin/students');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/admin/students" className="p-2 rounded-full hover:bg-gray-200 transition text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Student' : 'Add New Student'}</h1>
            <p className="text-sm text-gray-500 mt-1">Enter the student's personal and guardian details to enroll them.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Details Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Student Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Jane" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admission Number</label>
              <input type="text" name="admissionNumber" required value={formData.admissionNumber} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 font-mono" placeholder="e.g. S004" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <div className="relative">
                <input type="date" name="dateOfBirth" required value={formData.dateOfBirth} onChange={handleChange} className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-blue-500 focus:border-blue-500" />
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
        </div>

        {/* Parent / Guardian Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
            <Phone className="w-5 h-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Parent / Guardian Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Guardian's Full Name</label>
              <input type="text" name="parentName" required value={formData.parentName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. John Doe Sr." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (M-Pesa Registered)</label>
              <input type="tel" name="parentPhone" required value={formData.parentPhone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. +254 712 345 678" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (Optional)</label>
              <input type="email" name="parentEmail" value={formData.parentEmail} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. parent@example.com" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Physical Address</label>
              <div className="relative">
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. 123 Nairobi Road" />
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end space-x-4">
          <Link to="/admin/students" className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition">
            Cancel
          </Link>
          <button type="submit" className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 transition">
            <Save className="w-5 h-5 mr-2" /> {isEdit ? 'Save Changes' : 'Save Student'}
          </button>
        </div>
      </form>
    </div>
  );
}

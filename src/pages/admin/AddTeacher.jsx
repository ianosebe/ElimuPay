import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Briefcase, Phone, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AddTeacher() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const editTeacher = location.state?.editTeacher;
  const isEdit = !!editTeacher;
  
  const [formData, setFormData] = useState({
    firstName: editTeacher?.first_name || '',
    lastName: editTeacher?.last_name || '',
    teacherId: editTeacher?.id || '',
    phone: editTeacher?.phone || '',
    email: editTeacher?.email || '',
    subject: editTeacher?.subject || '',
  });

  const availableGrades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
  const [selectedGrades, setSelectedGrades] = useState(
    editTeacher?.classes ? editTeacher.classes.split(', ') : []
  );

  const handleGradeToggle = (grade) => {
    if (selectedGrades.includes(grade)) {
      setSelectedGrades(selectedGrades.filter(g => g !== grade));
    } else {
      setSelectedGrades([...selectedGrades, grade]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = { 
      id: formData.teacherId, 
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: formData.phone,
      email: formData.email,
      subject: formData.subject,
      classes: selectedGrades.join(', ')
    };

    let error;

    if (isEdit) {
      const { error: updateError } = await supabase
        .from('teachers')
        .update(payload)
        .eq('id', editTeacher.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('teachers')
        .insert([payload]);
      error = insertError;
    }

    if (error) {
      alert(`Error ${isEdit ? 'updating' : 'saving'} teacher: ` + error.message);
    } else {
      alert(`Successfully ${isEdit ? 'updated' : 'added'} teacher ${formData.firstName} ${formData.lastName}!`);
      navigate('/admin/teachers');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/admin/teachers" className="p-2 rounded-full hover:bg-gray-200 transition text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Teacher' : 'Add New Teacher'}</h1>
            <p className="text-sm text-gray-500 mt-1">Enter the teacher's professional and contact details.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal & Professional Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
            <Briefcase className="w-5 h-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Professional Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. John" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teacher ID / TSC Number</label>
              <input type="text" name="teacherId" required value={formData.teacherId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 font-mono" placeholder="e.g. T001" disabled={isEdit} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Subject / Department</label>
              <input type="text" name="subject" required value={formData.subject} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Mathematics" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Classes</label>
              <div className="flex flex-wrap gap-2">
                {availableGrades.map(grade => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => handleGradeToggle(grade)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                      selectedGrades.includes(grade)
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
            <Phone className="w-5 h-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. +254 712 345 678" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. teacher@school.com" />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end space-x-4">
          <Link to="/admin/teachers" className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition">
            Cancel
          </Link>
          <button type="submit" className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 transition">
            <Save className="w-5 h-5 mr-2" /> {isEdit ? 'Save Changes' : 'Save Teacher'}
          </button>
        </div>
      </form>
    </div>
  );
}

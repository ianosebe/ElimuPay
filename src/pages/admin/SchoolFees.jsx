import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, ChevronRight, TrendingUp, AlertCircle, Download, FileText, Bell, Calendar, UserPlus, X, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export const mapGradeToClassFeeKey = (grade) => {
  if (!grade) return null;
  const g = grade.toLowerCase();
  if (g.includes('playgroup') || g.includes('p1') || g.includes('pp2') || g.includes('pre')) return 'Playgroup, P1 and PP2';
  if (g.includes('1') || g.includes('2') || g.includes('3')) return 'Grades 1, 2 and 3';
  if (g.includes('4')) return 'Grade P4';
  if (g.includes('5')) return 'Grade 5';
  if (g.includes('6')) return 'Grade 6';
  return null;
};

function FeeStructureSection() {
  const [classFees, setClassFees] = useState([]);
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [editClassForm, setEditClassForm] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingClass, setIsSavingClass] = useState(false);
  const [isBulkBilling, setIsBulkBilling] = useState(false);

  useEffect(() => {
    fetchFees();

    const classFeeSubscription = supabase
      .channel('public:class_fee_structures')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'class_fee_structures' }, () => {
        fetchFees();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(classFeeSubscription);
    };
  }, []);

  const fetchFees = async () => {
    const defaultClassFees = [
      { grade: 'Playgroup, P1 and PP2', fees: 3500, meals: 1800, exam: 300, total: 5600 },
      { grade: 'Grades 1, 2 and 3', fees: 4000, meals: 2000, exam: 300, total: 6300 },
      { grade: 'Grade P4', fees: 4200, meals: 2100, exam: 300, total: 6600 },
      { grade: 'Grade 5', fees: 4500, meals: 2100, exam: 300, total: 6900 },
      { grade: 'Grade 6', fees: 5000, meals: 2100, exam: 300, total: 7400 }
    ];

    try {
      const { data, error } = await supabase.from('class_fee_structures').select('*').order('grade');

      if (error) {
        console.warn("Supabase fetch error, using fallback.", error);
        setClassFees(defaultClassFees);
        setEditClassForm(JSON.parse(JSON.stringify(defaultClassFees)));
        return;
      }

      if (data && data.length > 0) {
        // Handle sorting custom since it's text
        const order = ['Playgroup, P1 and PP2', 'Grades 1, 2 and 3', 'Grade P4', 'Grade 5', 'Grade 6'];
        const sortedClassData = [...data].sort((a, b) => {
          let ia = order.indexOf(a.grade);
          let ib = order.indexOf(b.grade);
          ia = ia === -1 ? 99 : ia;
          ib = ib === -1 ? 99 : ib;
          return ia - ib;
        });
        
        setClassFees(sortedClassData);
        setEditClassForm(JSON.parse(JSON.stringify(sortedClassData)));
      } else {
        // Empty table
        setClassFees(defaultClassFees);
        setEditClassForm(JSON.parse(JSON.stringify(defaultClassFees)));
      }
    } catch (error) {
      console.error("Error fetching fee structure:", error);
      setClassFees(defaultClassFees);
      setEditClassForm(JSON.parse(JSON.stringify(defaultClassFees)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveClassFees = async () => {
    setIsSavingClass(true);
    try {
      const updates = editClassForm.map(row => ({
        ...row,
        fees: Number(row.fees),
        meals: Number(row.meals),
        exam: Number(row.exam),
        total: Number(row.fees) + Number(row.meals) + Number(row.exam),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('class_fee_structures').upsert(updates);
      if (error) throw error;

      setIsEditingClass(false);
    } catch (error) {
      console.error("Error saving class fee structure:", error);
      alert("Failed to save class fees: " + (error.message || "Unknown error"));
    } finally {
      setIsSavingClass(false);
    }
  };

  const updateEditClassForm = (index, field, value) => {
    const newForm = [...editClassForm];
    newForm[index][field] = Number(value);
    newForm[index].total = newForm[index].fees + newForm[index].meals + newForm[index].exam;
    setEditClassForm(newForm);
  };

  const handleBulkDiaryFee = async () => {
    if (!window.confirm("Are you sure you want to bill Ksh 200 for the School Diary to ALL students? This cannot be easily undone.")) return;
    
    setIsBulkBilling(true);
    try {
      const { data: students, error: fetchError } = await supabase.from('students').select('id');
      if (fetchError) throw fetchError;

      if (students && students.length > 0) {
        const charges = students.map(s => ({
          student_id: s.id,
          amount: 200,
          type: 'charge',
          reference: `School Diary ${new Date().getFullYear()}`
        }));

        const { error: insertError } = await supabase.from('transactions').insert(charges);
        if (insertError) throw insertError;
        alert(`Successfully billed School Diary to ${students.length} students.`);
      } else {
        alert("No students found.");
      }
    } catch (error) {
      console.error("Bulk billing error:", error);
      alert("Failed to apply bulk billing: " + error.message);
    } finally {
      setIsBulkBilling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        Loading fee structure...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Class Fee Structure</h2>
          <p className="text-sm text-gray-500 mt-1">Detailed fee breakdown per grade</p>
        </div>
        {!isEditingClass ? (
          <button onClick={() => setIsEditingClass(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition font-medium flex items-center">
            <Edit2 className="w-4 h-4 mr-2" /> Edit Class Fees
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setIsEditingClass(false); setEditClassForm(JSON.parse(JSON.stringify(classFees))); }} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition font-medium">
              Cancel
            </button>
            <button onClick={handleSaveClassFees} disabled={isSavingClass} className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition font-medium">
              {isSavingClass ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fees (Ksh)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meals (Ksh)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam (Ksh)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (Ksh)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(isEditingClass ? editClassForm : classFees).map((row, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.grade}</td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isEditingClass ? (
                    <input type="number" className="border border-gray-300 rounded-md px-2 py-1 w-24 focus:ring-blue-500 focus:border-blue-500" value={row.fees} onChange={e => updateEditClassForm(idx, 'fees', e.target.value)} />
                  ) : (
                    row.fees?.toLocaleString() || 0
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isEditingClass ? (
                    <input type="number" className="border border-gray-300 rounded-md px-2 py-1 w-24 focus:ring-blue-500 focus:border-blue-500" value={row.meals} onChange={e => updateEditClassForm(idx, 'meals', e.target.value)} />
                  ) : (
                    row.meals?.toLocaleString() || 0
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isEditingClass ? (
                    <input type="number" className="border border-gray-300 rounded-md px-2 py-1 w-24 focus:ring-blue-500 focus:border-blue-500" value={row.exam} onChange={e => updateEditClassForm(idx, 'exam', e.target.value)} />
                  ) : (
                    row.exam?.toLocaleString() || 0
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {row.total?.toLocaleString() || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
          <BookOpen className="w-5 h-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Annual Bulk Actions</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4">Apply mandatory yearly fees (like the School Diary) to all currently enrolled students at once.</p>
          <button 
            onClick={handleBulkDiaryFee}
            disabled={isBulkBilling}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 transition font-medium flex items-center"
          >
            {isBulkBilling ? 'Billing...' : 'Bill School Diary (Ksh 200) to All Students'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TransactionsSection({ studentsData, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [academicTerm, setAcademicTerm] = useState('Full Year');
  const [isManualPaymentOpen, setIsManualPaymentOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classFees, setClassFees] = useState([]);
  const [viewStudent, setViewStudent] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    student_id: '',
    amount: '',
    method: 'cash',
    reference: '',
    phone: ''
  });

  useEffect(() => {
    const fetchFees = async () => {
      const defaultClassFees = [
        { grade: 'Playgroup, P1 and PP2', fees: 3500, meals: 1800, exam: 300, total: 5600 },
        { grade: 'Grades 1, 2 and 3', fees: 4000, meals: 2000, exam: 300, total: 6300 },
        { grade: 'Grade P4', fees: 4200, meals: 2100, exam: 300, total: 6600 },
        { grade: 'Grade 5', fees: 4500, meals: 2100, exam: 300, total: 6900 },
        { grade: 'Grade 6', fees: 5000, meals: 2100, exam: 300, total: 7400 }
      ];
      try {
        const { data, error } = await supabase.from('class_fee_structures').select('*');
        if (error) {
          setClassFees(defaultClassFees);
        } else if (data && data.length > 0) {
          setClassFees(data);
        } else {
          setClassFees(defaultClassFees);
        }
      } catch (err) {
        setClassFees(defaultClassFees);
      }
    };
    fetchFees();
    const feeSub = supabase.channel('public:class_fee_structures_tx')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'class_fee_structures' }, fetchFees)
      .subscribe();
    return () => supabase.removeChannel(feeSub);
  }, []);

  const handleManualPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentForm.student_id || !paymentForm.amount) return;

    setIsSubmitting(true);
    try {
      if (paymentForm.method === 'mpesa_prompt') {
        if (!paymentForm.phone) throw new Error("Phone number is required for STK Push");

        // Trigger Supabase Edge Function for M-Pesa STK Push
        const { data, error } = await supabase.functions.invoke('mpesa', {
          body: {
            action: 'stk_push',
            phone: paymentForm.phone,
            amount: parseFloat(paymentForm.amount),
            student_id: paymentForm.student_id
          }
        });

        if (error) throw error;
        alert(`STK Push prompt sent successfully to ${paymentForm.phone}!`);
      } else {
        // Direct Database Insert for cash/cheque/bank
        const { error } = await supabase.from('transactions').insert([{
          student_id: paymentForm.student_id,
          amount: parseFloat(paymentForm.amount),
          method: paymentForm.method,
          type: 'credit',
          reference: paymentForm.reference || null,
        }]);

        if (error) throw error;
      }

      setPaymentForm({ student_id: '', amount: '', method: 'cash', reference: '', phone: '' });
      setIsManualPaymentOpen(false);
    } catch (err) {
      console.error("Error recording manual payment:", err);
      alert("Failed to record payment: " + (err.message || err.details || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStudentStats = (student) => {
    let remaining = student.paidFees;
    const mappedKey = mapGradeToClassFeeKey(student.grade);
    const classFeeObj = classFees.find(c => c.grade === mappedKey);
    // Use the total from the class fee structure, fallback to 0 if not found
    const perTermReq = classFeeObj ? classFeeObj.total : 0;
    
    // We treat the total as per term for calculation purposes (Term 1, Term 2, Term 3)
    // Add extra initial fees (admission, etc) to Term 1 requirement
    const t1Req = perTermReq + (student.extraFees || 0);
    const t1Paid = Math.min(remaining, t1Req);
    remaining = Math.max(0, remaining - t1Req);

    const t2Req = perTermReq;
    const t2Paid = Math.min(remaining, t2Req);
    remaining = Math.max(0, remaining - t2Req);

    const t3Req = perTermReq;
    const t3Paid = Math.min(remaining, t3Req);

    if (academicTerm === 'Term 1') return { req: t1Req, paid: t1Paid };
    if (academicTerm === 'Term 2') return { req: t2Req, paid: t2Paid };
    if (academicTerm === 'Term 3') return { req: t3Req, paid: t3Paid };
    return { req: t1Req + t2Req + t3Req, paid: student.paidFees };
  };

  const filteredStudents = studentsData.filter(s => {
    const nameStr = s.name || '';
    const idStr = s.id || '';
    return nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idStr.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalSchoolFees = filteredStudents.reduce((acc, s) => acc + getStudentStats(s).req, 0);
  const totalPaidFees = filteredStudents.reduce((acc, s) => acc + getStudentStats(s).paid, 0);
  const totalUnpaidFees = totalSchoolFees - totalPaidFees;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        Loading real-time transactions...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Global Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Transactions</h2>
          <p className="text-sm text-gray-500 mt-1">Overview of school finances and enrollments</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
              value={academicTerm}
              onChange={(e) => setAcademicTerm(e.target.value)}
            >
              <option value="Full Year">Full Year (All Terms)</option>
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
            <Calendar className="w-4 h-4 text-gray-500 absolute right-3 top-2.5 pointer-events-none" />
          </div>

          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 transition">
            <UserPlus className="w-4 h-4 mr-2" /> New Student
          </button>

          <button
            onClick={() => setIsManualPaymentOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg shadow-sm hover:bg-gray-50 transition"
          >
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-medium text-gray-900">Students Directory</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                className="pl-9 pr-4 py-1.5 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-48 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
            </div>
            <button className="p-1.5 text-gray-500 hover:text-blue-600 border border-gray-300 rounded hover:bg-gray-50 transition shadow-sm" title="Export CSV">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Paid ({academicTerm})</th>
                <th className="px-6 py-3">Unpaid ({academicTerm})</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? filteredStudents.map(student => {
                const stats = getStudentStats(student);
                const unpaid = stats.req - stats.paid;
                const isFinished = unpaid <= 0 && stats.req > 0;

                return (
                  <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{student.name}</span>
                        <span className="text-xs text-gray-500">{student.id} • {student.grade}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-green-600 font-medium whitespace-nowrap">
                      Ksh {stats.paid.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-red-600 font-medium whitespace-nowrap">
                      Ksh {unpaid.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${isFinished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {isFinished ? 'Cleared' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center space-x-3 whitespace-nowrap">
                      {!isFinished && (
                        <button
                          className="text-gray-400 hover:text-blue-600 transition flex items-center"
                          title="Send SMS Reminder"
                          onClick={() => alert(`SMS Reminder sent to ${student.name}'s parent for Ksh ${unpaid.toLocaleString()} arrears.`)}
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => setViewStudent(student)} className="text-indigo-600 hover:text-indigo-900 inline-flex items-center">
                        View <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Student Transactions Modal */}
      {viewStudent && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{viewStudent.name} - Transactions</h2>
                <p className="text-sm text-gray-500">{viewStudent.id} • {viewStudent.grade}</p>
              </div>
              <button onClick={() => setViewStudent(null)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-0 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {viewStudent.transactions.length > 0 ? (
                    viewStudent.transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(tx => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tx.created_at ? new Date(tx.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {tx.type === 'charge' ? (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs">Fee / Billed</span>
                          ) : (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs">Payment</span>
                          )}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${tx.type === 'charge' ? 'text-gray-600' : 'text-green-600'}`}>
                          Ksh {Number(tx.amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{tx.type === 'charge' ? 'System' : (tx.method || 'cash')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.reference || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No transactions recorded for this student.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Manual Payment Modal */}
      {isManualPaymentOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Record Manual Payment</h2>
              <button onClick={() => setIsManualPaymentOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleManualPaymentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={paymentForm.student_id}
                  onChange={e => setPaymentForm({ ...paymentForm, student_id: e.target.value })}
                >
                  <option value="">-- Choose a student --</option>
                  {studentsData.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Ksh)</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={paymentForm.method}
                  onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })}
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="manual_mpesa">M-Pesa (Manual)</option>
                  <option value="mpesa_prompt">M-Pesa (Send STK Prompt)</option>
                </select>
              </div>

              {paymentForm.method === 'mpesa_prompt' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. 254712345678"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500"
                    value={paymentForm.phone}
                    onChange={e => setPaymentForm({ ...paymentForm, phone: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: 2547XXXXXXXX or 07XXXXXXXX</p>
                </div>
              )}

              {paymentForm.method !== 'mpesa_prompt' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference / Receipt No. (Optional)</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                    value={paymentForm.reference}
                    onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2.5 px-4 rounded-lg shadow transition"
              >
                {isSubmitting ? 'Recording...' : 'Record Payment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FeesByGradeSection({ studentsData }) {
  const [classFees, setClassFees] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      const defaultClassFees = [
        { grade: 'Playgroup, P1 and PP2', fees: 3500, meals: 1800, exam: 300, total: 5600 },
        { grade: 'Grades 1, 2 and 3', fees: 4000, meals: 2000, exam: 300, total: 6300 },
        { grade: 'Grade P4', fees: 4200, meals: 2100, exam: 300, total: 6600 },
        { grade: 'Grade 5', fees: 4500, meals: 2100, exam: 300, total: 6900 },
        { grade: 'Grade 6', fees: 5000, meals: 2100, exam: 300, total: 7400 }
      ];
      try {
        const { data, error } = await supabase.from('class_fee_structures').select('*');
        if (error) {
          setClassFees(defaultClassFees);
        } else if (data && data.length > 0) {
          setClassFees(data);
        } else {
          setClassFees(defaultClassFees);
        }
      } catch (err) {
        console.error("Error fetching fees for grades:", err);
        setClassFees(defaultClassFees);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFees();

    const feeSubscription = supabase
      .channel('public:class_fee_structures_grades')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'class_fee_structures' }, () => {
        fetchFees();
      })
      .subscribe();

    return () => supabase.removeChannel(feeSubscription);
  }, []);

  const uniqueGrades = ['All', ...new Set(studentsData.map(s => s.grade).filter(Boolean))].sort();

  const filteredStudents = selectedGrade === 'All'
    ? studentsData
    : studentsData.filter(s => s.grade === selectedGrade);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        Loading fee allocations...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Fees by Grade</h2>
          <p className="text-sm text-gray-500 mt-1">Detailed fee distribution per student across academic terms</p>
        </div>
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm font-medium focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
        >
          {uniqueGrades.map(g => (
            <option key={g} value={g}>{g === 'All' ? 'All Grades' : g}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Term 1</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Term 2</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Term 3</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Paid</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.length > 0 ? filteredStudents.map(student => {
              let remaining = student.paidFees;
              const mappedKey = mapGradeToClassFeeKey(student.grade);
              const classFeeObj = classFees.find(c => c.grade === mappedKey);
              const perTermReq = classFeeObj ? classFeeObj.total : 0;
              
              const t1Req = perTermReq + (student.extraFees || 0);
              const t1Paid = Math.min(remaining, t1Req);
              remaining = Math.max(0, remaining - t1Req);

              const t2Req = perTermReq;
              const t2Paid = Math.min(remaining, t2Req);
              remaining = Math.max(0, remaining - t2Req);

              const t3Req = perTermReq;
              const t3Paid = Math.min(remaining, t3Req);

              const totalReq = t1Req + t2Req + t3Req;
              const balance = totalReq - student.paidFees;

              return (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.name || <span className="text-red-400 italic">No Name in DB ({student.id})</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.grade}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                    {t1Paid.toLocaleString()} <span className="text-xs text-gray-400">/ {t1Req.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                    {t2Paid.toLocaleString()} <span className="text-xs text-gray-400">/ {t2Req.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                    {t3Paid.toLocaleString()} <span className="text-xs text-gray-400">/ {t3Req.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">{student.paidFees.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-red-600">{balance.toLocaleString()}</td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No students found for this selection.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SchoolFees() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('schoolFeesActiveTab') || 'fee-structure';
  });
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('schoolFeesActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchData();

    // Subscribe to real-time changes
    const txSubscription = supabase
      .channel('public:transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        fetchData();
      })
      .subscribe();

    const studentSubscription = supabase
      .channel('public:students')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(txSubscription);
      supabase.removeChannel(studentSubscription);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: students, error: studentError } = await supabase.from('students').select('*');
      const { data: transactions, error: txError } = await supabase.from('transactions').select('*');

      if (studentError) throw studentError;
      if (txError) throw txError;

      // Format data to match UI expectations
      const formattedData = (students || []).map(student => {
        const studentTxs = (transactions || []).filter(tx => tx.student_id === student.id);
        const paidFees = studentTxs.filter(tx => tx.type !== 'charge').reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
        const extraFees = studentTxs.filter(tx => tx.type === 'charge').reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

        const fullName = student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unknown Student';

        return {
          id: student.id,
          name: fullName,
          grade: student.grade,
          totalFees: student.total_fees || 75000, // fallback if no total_fees column
          paidFees: paidFees,
          extraFees: extraFees,
          transactions: studentTxs
        };
      });

      setStudentsData(formattedData);
    } catch (error) {
      console.error("Error fetching live data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">School Fees</h1>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('fee-structure')}
            className={`${activeTab === 'fee-structure'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition`}
          >
            Fee Structure
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`${activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('fees-grade')}
            className={`${activeTab === 'fees-grade'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition`}
          >
            Fees / Grade
          </button>
        </nav>
      </div>

      {activeTab === 'fee-structure' && <FeeStructureSection />}
      {activeTab === 'transactions' && (
        <TransactionsSection studentsData={studentsData} loading={loading} />
      )}
      {activeTab === 'fees-grade' && (
        <FeesByGradeSection studentsData={studentsData} />
      )}
    </div>
  );
}

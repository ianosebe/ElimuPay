import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, ChevronRight, TrendingUp, AlertCircle, Download, FileText, Bell, Calendar, UserPlus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

function FeeStructureSection() {
  const [termFees, setTermFees] = useState({
    'Term 1': 0,
    'Term 2': 0,
    'Term 3': 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchFees();
    
    const feeSubscription = supabase
      .channel('public:fee_structures')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fee_structures' }, () => {
        fetchFees();
      })
      .subscribe();

    return () => supabase.removeChannel(feeSubscription);
  }, []);

  const fetchFees = async () => {
    try {
      const { data, error } = await supabase.from('fee_structures').select('*');
      if (error) throw error;
      
      if (data) {
        const fees = { 'Term 1': 0, 'Term 2': 0, 'Term 3': 0 };
        data.forEach(item => {
          fees[item.term] = Number(item.amount);
        });
        setTermFees(fees);
        setEditForm(fees);
      }
    } catch (error) {
      console.error("Error fetching fee structure:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = Object.entries(editForm).map(([term, amount]) => ({
        term,
        amount: Number(amount),
        updated_at: new Date().toISOString()
      }));
      
      const { error } = await supabase.from('fee_structures').upsert(updates);
      if (error) throw error;
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving fee structure:", error);
      alert("Failed to save fees: " + (error.message || "Unknown error"));
    } finally {
      setIsSaving(false);
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
          <h2 className="text-xl font-semibold text-gray-900">Term Fee Structure</h2>
          <p className="text-sm text-gray-500 mt-1">Manage global fee amounts for each academic term</p>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition font-medium flex items-center">
            <Edit2 className="w-4 h-4 mr-2" /> Edit Fees
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setIsEditing(false); setEditForm(termFees); }} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition font-medium">
              Cancel
            </button>
            <button onClick={handleSave} disabled={isSaving} className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition font-medium">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Term</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tuition Amount (Ksh)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {['Term 1', 'Term 2', 'Term 3'].map((term) => (
              <tr key={term}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{term}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">Ksh</span>
                      <input
                        type="number"
                        className="border border-gray-300 rounded-md px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500"
                        value={editForm[term]}
                        onChange={(e) => setEditForm({...editForm, [term]: e.target.value})}
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-gray-900 font-medium">Ksh {termFees[term]?.toLocaleString() || 0}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TransactionsSection({ studentsData, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [academicTerm, setAcademicTerm] = useState('Term 3, 2026');
  const [isManualPaymentOpen, setIsManualPaymentOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    student_id: '',
    amount: '',
    method: 'cash',
    reference: ''
  });

  const handleManualPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentForm.student_id || !paymentForm.amount) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('transactions').insert([{
        student_id: paymentForm.student_id,
        amount: parseFloat(paymentForm.amount),
        method: paymentForm.method,
        type: 'credit',
        reference: paymentForm.reference || null,
      }]);
      
      if (error) throw error;
      
      setPaymentForm({ student_id: '', amount: '', method: 'cash', reference: '' });
      setIsManualPaymentOpen(false);
    } catch (err) {
      console.error("Error recording manual payment:", err);
      alert("Failed to record payment: " + (err.message || err.details || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate totals
  const totalSchoolFees = studentsData.reduce((acc, student) => acc + student.totalFees, 0);
  const totalPaidFees = studentsData.reduce((acc, student) => acc + student.paidFees, 0);
  const totalUnpaidFees = totalSchoolFees - totalPaidFees;

  const filteredStudents = studentsData.filter(s => {
    const nameStr = s.name || '';
    const idStr = s.id || '';
    return nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || 
           idStr.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getRecentPayments = () => {
    let allTx = [];
    studentsData.forEach(student => {
      student.transactions.forEach(tx => {
        if (tx.type === 'credit' || !tx.type) {
          allTx.push({ 
            ...tx, 
            date: tx.date || tx.created_at, 
            studentName: student.name, 
            studentId: student.id 
          });
        }
      });
    });
    return allTx.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-medium text-gray-900">Students Directory</h3>
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
                {filteredStudents.length > 0 ? filteredStudents.map(student => {
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
                }) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No students found. Add some students to the database to see them here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-fit">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Recent Payments</h3>
            <button className="text-xs text-blue-600 font-medium hover:underline flex items-center">
              Export PDF
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {getRecentPayments().length > 0 ? getRecentPayments().map((tx, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{tx.studentName}</p>
                  <p className="text-xs text-gray-500">
                    {tx.date ? new Date(tx.date).toLocaleDateString() : 'Unknown date'}
                  </p>
                </div>
                <span className="text-sm font-bold text-green-600">
                  +Ksh {Number(tx.amount).toLocaleString()}
                </span>
              </div>
            )) : (
              <div className="p-6 text-center text-sm text-gray-500">
                No recent transactions found.
              </div>
            )}
          </div>
        </div>
      </div>

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
                  onChange={e => setPaymentForm({...paymentForm, student_id: e.target.value})}
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
                  onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={paymentForm.method}
                  onChange={e => setPaymentForm({...paymentForm, method: e.target.value})}
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="manual_mpesa">M-Pesa (Manual)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference / Receipt No. (Optional)</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                  value={paymentForm.reference}
                  onChange={e => setPaymentForm({...paymentForm, reference: e.target.value})}
                />
              </div>
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
        const paidFees = studentTxs.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
        
        return {
          id: student.id,
          name: student.name,
          grade: student.grade,
          totalFees: student.total_fees || 75000, // fallback if no total_fees column
          paidFees: paidFees,
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
            className={`${
              activeTab === 'fee-structure'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition`}
          >
            Fee Structure
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition`}
          >
            Transactions
          </button>
        </nav>
      </div>

      {activeTab === 'fee-structure' && <FeeStructureSection />}
      {activeTab === 'transactions' && (
        <TransactionsSection studentsData={studentsData} loading={loading} />
      )}
    </div>
  );
}

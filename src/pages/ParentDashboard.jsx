import { useState, useEffect } from 'react';
import { studentsData, feeStructure } from '../data/mockData';
import { format, isPast, parseISO } from 'date-fns';
import { FileText, CreditCard, DollarSign, Download, ChevronDown, Calendar, MessageSquare, X, Upload, Smartphone, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ParentDashboard() {
  const { user } = useAuth();
  
  // Find the students associated with the logged-in parent
  const parentStudents = studentsData.filter(s => user.childrenIds?.includes(s.id)) || [studentsData[0]];
  
  const [activeStudentId, setActiveStudentId] = useState(parentStudents[0]?.id);
  const [isChildDropdownOpen, setIsChildDropdownOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  const student = parentStudents.find(s => s.id === activeStudentId) || parentStudents[0];
  const balance = student.totalFees - student.paidFees;
  
  // Mock due date
  const dueDate = '2026-09-01'; // Mock past due date for demonstration
  const isOverdue = balance > 0 && isPast(parseISO(dueDate));

  return (
    <div className="space-y-6 relative">
      {/* Header & Multi-Child Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
        
        {parentStudents.length > 1 ? (
          <div className="relative">
            <button 
              onClick={() => setIsChildDropdownOpen(!isChildDropdownOpen)}
              className="flex items-center space-x-2 bg-white border border-gray-300 py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition"
            >
              <div className="flex flex-col text-left">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Viewing</span>
                <span className="text-sm font-bold text-gray-900">{student.name} ({student.grade})</span>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </button>
            
            {isChildDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Your Children</span>
                </div>
                {parentStudents.map(child => (
                  <button
                    key={child.id}
                    onClick={() => {
                      setActiveStudentId(child.id);
                      setIsChildDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition flex items-center justify-between ${activeStudentId === child.id ? 'bg-blue-50/50' : ''}`}
                  >
                    <div>
                      <p className={`text-sm font-medium ${activeStudentId === child.id ? 'text-blue-700' : 'text-gray-900'}`}>{child.name}</p>
                      <p className="text-xs text-gray-500">{child.grade}</p>
                    </div>
                    {activeStudentId === child.id && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span className="text-sm bg-blue-100 text-blue-800 py-2 px-4 rounded-full font-medium shadow-sm">
            Viewing: {student.name} ({student.grade})
          </span>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Fees</p>
              <h3 className="text-xl font-bold text-gray-900">Ksh {student.totalFees.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Paid Fees</p>
              <h3 className="text-xl font-bold text-gray-900">Ksh {student.paidFees.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className={`bg-white p-6 rounded-xl shadow-sm border ${isOverdue ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200'}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${isOverdue ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ongoing Balance</p>
                <h3 className="text-xl font-bold text-gray-900">Ksh {balance.toLocaleString()}</h3>
              </div>
            </div>
          </div>
          {balance > 0 && (
            <div className={`mt-4 px-3 py-2 rounded-md flex items-center text-xs font-medium ${isOverdue ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              Due: {format(parseISO(dueDate), 'MMM dd, yyyy')}
              {isOverdue && <span className="ml-auto font-bold uppercase tracking-wider">Overdue</span>}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Transactions History</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {student.transactions.map((tx) => (
              <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition group">
                <div>
                  <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                  <p className="text-sm text-gray-500">{format(new Date(tx.date), 'MMM dd, yyyy')}</p>
                </div>
                <div className="text-right flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'credit' ? '+' : '-'} Ksh {tx.amount.toLocaleString()}
                    </p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                      tx.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.type.toUpperCase()}
                    </span>
                  </div>
                  {tx.type === 'credit' && (
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition" title="Download Official Receipt">
                      <Download className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {student.transactions.length === 0 && (
              <div className="p-6 text-center text-gray-500">No transactions found.</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Fee Structure</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Tuition</span>
                <span className="font-medium">Ksh {feeStructure.tuition.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transport</span>
                <span className="font-medium">Ksh {feeStructure.transport.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lunch Program</span>
                <span className="font-medium">Ksh {feeStructure.lunch.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t flex justify-between font-bold text-lg text-gray-900">
                <span>Total</span>
                <span>Ksh {feeStructure.total.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={() => setIsDisputeModalOpen(true)}
                className="w-full flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-blue-600 font-medium py-2 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Missing Payment / Query Balance</span>
              </button>
            </div>
          </div>

          {balance > 0 && (
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-blue-900 font-bold text-lg mb-2">Settle Balance</h3>
                <p className="text-sm text-blue-700 mb-5 leading-relaxed">Ensure uninterrupted learning by clearing the outstanding arrears securely.</p>
                <button 
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full bg-blue-600 text-white rounded-lg py-3 px-4 hover:bg-blue-700 transition font-bold shadow-md flex items-center justify-center space-x-2"
                >
                  <DollarSign className="w-5 h-5" />
                  <span>Pay Ksh {balance.toLocaleString()}</span>
                </button>
              </div>
              {/* Decorative background element */}
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                <CreditCard className="w-32 h-32 text-blue-600" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Make a Payment</h2>
                <p className="text-sm text-gray-500">Student: {student.name}</p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex border-b border-gray-200 bg-gray-50/50">
              <button 
                onClick={() => setPaymentMethod('mpesa')}
                className={`flex-1 py-4 text-sm font-medium border-b-2 transition ${paymentMethod === 'mpesa' ? 'border-green-500 text-green-700 bg-green-50/50' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}
              >
                M-Pesa Express
              </button>
              <button 
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-4 text-sm font-medium border-b-2 transition ${paymentMethod === 'card' ? 'border-blue-500 text-blue-700 bg-blue-50/50' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}
              >
                Card Payment
              </button>
              <button 
                onClick={() => setPaymentMethod('bank')}
                className={`flex-1 py-4 text-sm font-medium border-b-2 transition ${paymentMethod === 'bank' ? 'border-gray-900 text-gray-900 bg-gray-100/50' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}
              >
                Bank Transfer
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {paymentMethod === 'mpesa' && (
                <div className="space-y-6 max-w-md mx-auto">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Pay via STK Push</h3>
                    <p className="text-sm text-gray-500 mt-1">Enter your M-Pesa registered number. A prompt will be sent to your phone.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">M-Pesa Phone Number</label>
                      <input type="text" defaultValue="0712 345 678" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-green-500 focus:border-green-500 font-medium text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Ksh)</label>
                      <input type="number" defaultValue={balance} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-green-500 focus:border-green-500 font-bold text-gray-900 bg-gray-50" readOnly />
                    </div>
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow transition">
                      Send STK Push
                    </button>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-6 max-w-md mx-auto">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Secure Card Payment</h3>
                    <p className="text-sm text-gray-500 mt-1">Powered by Pesapal / Flutterwave</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    {/* Mock iFrame Area */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Card Number</label>
                        <input type="text" placeholder="•••• •••• •••• ••••" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Expiry</label>
                          <input type="text" placeholder="MM/YY" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">CVV</label>
                          <input type="text" placeholder="•••" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                        </div>
                      </div>
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg shadow transition mt-4">
                        Pay Ksh {balance.toLocaleString()}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'bank' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                      <h3 className="font-bold text-gray-900 mb-4">Official Bank Details</h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-gray-500">Bank Name</p>
                          <p className="font-medium text-gray-900">Equity Bank Kenya</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Account Name</p>
                          <p className="font-medium text-gray-900">Elimu Academy</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Account Number</p>
                          <p className="font-bold text-gray-900 font-mono text-base tracking-wide">0123456789123</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Branch</p>
                          <p className="font-medium text-gray-900">Westlands Branch</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-center">
                      <h3 className="font-bold text-gray-900 mb-2">Upload Deposit Slip</h3>
                      <p className="text-xs text-gray-500 mb-4">After depositing funds, upload a clear photo of the receipt for admin verification.</p>
                      
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500"><span className="font-semibold text-blue-600">Click to upload</span> or drag and drop</p>
                        </div>
                        <input type="file" className="hidden" />
                      </label>
                      <button className="w-full mt-4 bg-gray-900 hover:bg-black text-white font-bold py-2 px-4 rounded-lg transition">
                        Submit Receipt
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {isDisputeModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Report Missing Payment</h2>
              <button onClick={() => setIsDisputeModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      If you paid via M-Pesa but your balance hasn't updated, please provide the confirmation code below.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">M-Pesa Confirmation Code</label>
                <input type="text" placeholder="e.g. RKH5TR8Y2" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 font-mono uppercase" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details (Optional)</label>
                <textarea rows="3" placeholder="Enter any extra info..." className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
              <button onClick={() => {
                alert("Query submitted to the finance office. We will get back to you shortly.");
                setIsDisputeModalOpen(false);
              }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg shadow transition">
                Submit Query
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

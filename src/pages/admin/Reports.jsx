import { useState, useEffect, useCallback } from 'react';
import {
  BarChart2, Download, FileText, Users, BookOpen,
  CheckSquare, ClipboardList, TrendingUp, Filter,
  AlertCircle, GraduationCap, Briefcase, Calendar,
  ChevronDown, Search, DollarSign, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ─── Helpers ────────────────────────────────────────────────────────────────

const GRADES = ['All Grades', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
const TERMS  = ['All Terms', 'Term 1', 'Term 2', 'Term 3'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS  = Array.from({ length: 5 }, (_, i) => String(CURRENT_YEAR - i));

function fmt(n) { return Number(n || 0).toLocaleString(); }
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-KE', { dateStyle: 'medium' });
}

function exportCSV(filename, headers, rows) {
  const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename + '.csv'; a.click();
  URL.revokeObjectURL(url);
}

function Badge({ color, children }) {
  const colors = {
    green:  'bg-green-100 text-green-800',
    red:    'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue:   'bg-blue-100 text-blue-800',
    gray:   'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center items-center h-48 text-gray-400">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
      Loading report data…
    </div>
  );
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <Icon className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ─── Report 1: Fee Transactions ─────────────────────────────────────────────

function FeeTransactionsReport() {
  const [students,      setStudents]      = useState([]);
  const [transactions,  setTransactions]  = useState([]);
  const [feeStructures, setFeeStructures] = useState({});
  const [loading,       setLoading]       = useState(true);
  const [grade,         setGrade]         = useState('All Grades');
  const [term,          setTerm]          = useState('All Terms');
  const [year,          setYear]          = useState(String(CURRENT_YEAR));
  const [search,        setSearch]        = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: s }, { data: tx }, { data: fs }] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('fee_structures').select('*'),
      ]);
      setStudents(s || []);
      setTransactions(tx || []);
      const fmap = {};
      (fs || []).forEach(r => { fmap[r.term] = Number(r.amount); });
      setFeeStructures(fmap);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filter transactions by year
  const txByYear = transactions.filter(tx => {
    if (!tx.created_at) return false;
    return new Date(tx.created_at).getFullYear() === Number(year);
  });

  // Map students
  const rows = students
    .filter(s => grade === 'All Grades' || s.grade === grade)
    .filter(s => {
      const name = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
      return name.includes(search.toLowerCase()) || (s.id || '').toLowerCase().includes(search.toLowerCase());
    })
    .map(s => {
      const studentTx = txByYear.filter(tx => tx.student_id === s.id);

      // Split paid amount across terms sequentially
      const total = studentTx.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
      let rem = total;
      const t1r = feeStructures['Term 1'] || 0;
      const t1p = Math.min(rem, t1r); rem = Math.max(0, rem - t1r);
      const t2r = feeStructures['Term 2'] || 0;
      const t2p = Math.min(rem, t2r); rem = Math.max(0, rem - t2r);
      const t3r = feeStructures['Term 3'] || 0;
      const t3p = Math.min(rem, t3r);

      const termPaid  = term === 'Term 1' ? t1p : term === 'Term 2' ? t2p : term === 'Term 3' ? t3p : total;
      const termReq   = term === 'Term 1' ? t1r : term === 'Term 2' ? t2r : term === 'Term 3' ? t3r
                        : (t1r + t2r + t3r);
      const balance   = termReq - termPaid;

      return {
        id: s.id,
        name: `${s.first_name || ''} ${s.last_name || ''}`.trim() || '—',
        grade: s.grade || '—',
        txCount: studentTx.length,
        termPaid,
        termReq,
        balance,
        status: balance <= 0 && termReq > 0 ? 'Cleared' : 'Pending',
      };
    });

  const totPaid = rows.reduce((a, r) => a + r.termPaid, 0);
  const totBal  = rows.reduce((a, r) => a + r.balance, 0);
  const totReq  = rows.reduce((a, r) => a + r.termReq, 0);

  const doExport = () => {
    exportCSV(
      `fee-transactions-${grade.replace(' ', '')}-${term.replace(' ', '')}-${year}`,
      ['Student ID', 'Name', 'Grade', 'Term', 'Year', '# Payments', 'Required (Ksh)', 'Paid (Ksh)', 'Balance (Ksh)', 'Status'],
      rows.map(r => [r.id, r.name, r.grade, term, year, r.txCount, r.termReq, r.termPaid, r.balance, r.status])
    );
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search student…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          {[
            { label: 'Grade', value: grade, set: setGrade, opts: GRADES },
            { label: 'Term',  value: term,  set: setTerm,  opts: TERMS  },
            { label: 'Year',  value: year,  set: setYear,  opts: YEARS  },
          ].map(({ label, value, set, opts }) => (
            <div key={label} className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
                value={value} onChange={e => set(e.target.value)}
              >
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          ))}
          <button onClick={load} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-500" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={doExport}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Required', value: `Ksh ${fmt(totReq)}`, color: 'bg-indigo-600 text-white' },
          { label: 'Total Collected', value: `Ksh ${fmt(totPaid)}`, color: 'bg-white border border-gray-200 text-green-600' },
          { label: 'Outstanding Balance', value: `Ksh ${fmt(totBal)}`, color: 'bg-white border border-gray-200 text-red-600' },
        ].map(c => (
          <div key={c.label} className={`rounded-xl p-5 shadow-sm ${c.color}`}>
            <p className="text-xs font-medium opacity-80 mb-1">{c.label}</p>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-xs opacity-60 mt-1">{term} · {year} · {grade}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-700">{rows.length} Student{rows.length !== 1 ? 's' : ''}</h3>
          <span className="text-xs text-gray-400">{term} · {year}</span>
        </div>
        {loading ? <Spinner /> : rows.length === 0 ? (
          <EmptyState icon={DollarSign} message="No transaction data for this selection." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Student', 'Grade', 'Payments', 'Required', 'Paid', 'Balance', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-medium tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {rows.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {r.name}<br />
                      <span className="text-xs text-gray-400 font-normal">{r.id}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{r.grade}</td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{r.txCount}</td>
                    <td className="px-5 py-3 text-gray-700 whitespace-nowrap">Ksh {fmt(r.termReq)}</td>
                    <td className="px-5 py-3 text-green-600 font-medium whitespace-nowrap">Ksh {fmt(r.termPaid)}</td>
                    <td className="px-5 py-3 text-red-600 font-medium whitespace-nowrap">Ksh {fmt(r.balance)}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <Badge color={r.status === 'Cleared' ? 'green' : 'yellow'}>{r.status}</Badge>
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

// ─── Report 2: Attendance Summary ───────────────────────────────────────────

function AttendanceReport() {
  const [students, setStudents]   = useState([]);
  const [records,  setRecords]    = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [error,    setError]      = useState(null);
  const [grade,    setGrade]      = useState('All Grades');
  const [term,     setTerm]       = useState('All Terms');
  const [year,     setYear]       = useState(String(CURRENT_YEAR));
  const [search,   setSearch]     = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [{ data: s }, { data: a, error: ae }] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('attendance').select('*'),
      ]);
      if (ae) { setError(ae.message); }
      setStudents(s || []);
      setRecords(a || []);
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const rows = students
    .filter(s => grade === 'All Grades' || s.grade === grade)
    .filter(s => {
      const name = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
      return name.includes(search.toLowerCase()) || (s.id || '').toLowerCase().includes(search.toLowerCase());
    })
    .map(s => {
      let recs = records.filter(r => r.student_id === s.id);
      // Filter by year
      recs = recs.filter(r => r.date && new Date(r.date).getFullYear() === Number(year));
      // Filter by term (approximate: T1=Jan–Apr, T2=May–Aug, T3=Sep–Dec)
      if (term !== 'All Terms') {
        const termMonths = { 'Term 1': [1,2,3,4], 'Term 2': [5,6,7,8], 'Term 3': [9,10,11,12] };
        recs = recs.filter(r => {
          const m = new Date(r.date).getMonth() + 1;
          return termMonths[term]?.includes(m);
        });
      }
      const total   = recs.length;
      const present = recs.filter(r => r.status === 'present').length;
      const absent  = recs.filter(r => r.status === 'absent').length;
      const late    = recs.filter(r => r.status === 'late').length;
      const rate    = total > 0 ? Math.round((present / total) * 100) : null;
      return {
        id: s.id,
        name: `${s.first_name || ''} ${s.last_name || ''}`.trim() || '—',
        grade: s.grade || '—',
        total, present, absent, late, rate,
      };
    });

  const doExport = () => {
    exportCSV(
      `attendance-${grade.replace(' ', '')}-${term.replace(' ', '')}-${year}`,
      ['Student ID', 'Name', 'Grade', 'Total Days', 'Present', 'Absent', 'Late', 'Attendance Rate (%)'],
      rows.map(r => [r.id, r.name, r.grade, r.total, r.present, r.absent, r.late, r.rate ?? 'N/A'])
    );
  };

  const avgRate = rows.filter(r => r.rate !== null).length > 0
    ? Math.round(rows.filter(r => r.rate !== null).reduce((a, r) => a + r.rate, 0) / rows.filter(r => r.rate !== null).length)
    : null;

  return (
    <div className="space-y-5">
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Attendance table not set up yet</p>
            <p className="text-xs text-amber-600 mt-0.5 font-mono">{error}</p>
            <p className="text-xs text-amber-700 mt-1">Create an <strong>attendance</strong> table in Supabase with columns: <code>id, student_id, date, status (present/absent/late)</code>.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search student…" value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          {[
            { label: 'Grade', value: grade, set: setGrade, opts: GRADES },
            { label: 'Term',  value: term,  set: setTerm,  opts: TERMS  },
            { label: 'Year',  value: year,  set: setYear,  opts: YEARS  },
          ].map(({ label, value, set, opts }) => (
            <div key={label} className="relative">
              <select className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
                value={value} onChange={e => set(e.target.value)}>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          ))}
          <button onClick={load} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-500">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={doExport} className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
        </div>
      </div>

      {avgRate !== null && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Average Attendance Rate', value: `${avgRate}%`, color: avgRate >= 80 ? 'text-green-600' : 'text-red-600', bg: 'bg-white border border-gray-200' },
            { label: 'Students Tracked', value: rows.filter(r => r.total > 0).length, bg: 'bg-white border border-gray-200', color: 'text-blue-600' },
            { label: 'Perfect Attendance', value: rows.filter(r => r.rate === 100).length, bg: 'bg-white border border-gray-200', color: 'text-purple-600' },
          ].map(c => (
            <div key={c.label} className={`rounded-xl p-5 shadow-sm ${c.bg}`}>
              <p className="text-xs font-medium text-gray-500 mb-1">{c.label}</p>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Student', 'Grade', 'Total Days', 'Present', 'Absent', 'Late', 'Rate'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-medium tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {rows.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-400 text-sm">No records found.</td></tr>
                ) : rows.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {r.name}<br/><span className="text-xs text-gray-400 font-normal">{r.id}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{r.grade}</td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{r.total}</td>
                    <td className="px-5 py-3 text-green-600 font-medium whitespace-nowrap">{r.present}</td>
                    <td className="px-5 py-3 text-red-600 font-medium whitespace-nowrap">{r.absent}</td>
                    <td className="px-5 py-3 text-yellow-600 font-medium whitespace-nowrap">{r.late}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      {r.rate === null ? <Badge color="gray">No data</Badge>
                        : <Badge color={r.rate >= 80 ? 'green' : r.rate >= 60 ? 'yellow' : 'red'}>{r.rate}%</Badge>}
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

// ─── Report 3: Exam Results ──────────────────────────────────────────────────

function ExamResultsReport() {
  const [students, setStudents] = useState([]);
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [grade,    setGrade]    = useState('All Grades');
  const [term,     setTerm]     = useState('All Terms');
  const [year,     setYear]     = useState(String(CURRENT_YEAR));
  const [search,   setSearch]   = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [{ data: s }, { data: r, error: re }] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('exam_results').select('*'),
      ]);
      if (re) setError(re.message);
      setStudents(s || []);
      setResults(r || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const getGrade = (score) => {
    if (score >= 80) return { letter: 'A', color: 'green' };
    if (score >= 65) return { letter: 'B', color: 'blue' };
    if (score >= 50) return { letter: 'C', color: 'yellow' };
    if (score >= 40) return { letter: 'D', color: 'red' };
    return { letter: 'E', color: 'red' };
  };

  const rows = students
    .filter(s => grade === 'All Grades' || s.grade === grade)
    .filter(s => {
      const name = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
      return name.includes(search.toLowerCase()) || (s.id || '').toLowerCase().includes(search.toLowerCase());
    })
    .map(s => {
      let recs = results.filter(r => r.student_id === s.id);
      if (term !== 'All Terms') recs = recs.filter(r => r.term === term);
      if (year) recs = recs.filter(r => r.year === Number(year) || String(r.year) === year);
      const avg = recs.length > 0 ? Math.round(recs.reduce((a, r) => a + Number(r.score || 0), 0) / recs.length) : null;
      const subjects = recs.map(r => r.subject || '—');
      return {
        id: s.id,
        name: `${s.first_name || ''} ${s.last_name || ''}`.trim() || '—',
        grade: s.grade || '—',
        subjects: subjects.join(', ') || '—',
        subjectCount: recs.length,
        avg,
        letterGrade: avg !== null ? getGrade(avg) : null,
        position: recs.length > 0 ? (recs[0].position ?? '—') : '—',
      };
    });

  const doExport = () => {
    exportCSV(
      `exam-results-${grade.replace(' ', '')}-${term.replace(' ', '')}-${year}`,
      ['Student ID', 'Name', 'Grade', 'Term', 'Year', 'Subjects', 'Avg Score', 'Letter Grade'],
      rows.map(r => [r.id, r.name, r.grade, term, year, r.subjectCount, r.avg ?? 'N/A', r.letterGrade?.letter ?? 'N/A'])
    );
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Exam results table not set up yet</p>
            <p className="text-xs text-amber-600 mt-0.5 font-mono">{error}</p>
            <p className="text-xs text-amber-700 mt-1">Create an <strong>exam_results</strong> table with: <code>id, student_id, subject, score, term, year, position</code>.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full"
              placeholder="Search student…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {[
            { label: 'Grade', value: grade, set: setGrade, opts: GRADES },
            { label: 'Term',  value: term,  set: setTerm,  opts: TERMS  },
            { label: 'Year',  value: year,  set: setYear,  opts: YEARS  },
          ].map(({ label, value, set, opts }) => (
            <div key={label} className="relative">
              <select className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                value={value} onChange={e => set(e.target.value)}>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          ))}
          <button onClick={load} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-500"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={doExport} className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Student', 'Grade', 'Subjects Taken', 'Avg Score', 'Letter Grade', 'Class Position'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-medium tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {rows.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-gray-400 text-sm">No exam records found.</td></tr>
                ) : rows.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {r.name}<br/><span className="text-xs text-gray-400 font-normal">{r.id}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{r.grade}</td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{r.subjectCount}</td>
                    <td className="px-5 py-3 font-bold text-gray-700 whitespace-nowrap">
                      {r.avg !== null ? `${r.avg}%` : <span className="text-gray-300 font-normal">—</span>}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      {r.letterGrade
                        ? <Badge color={r.letterGrade.color}>{r.letterGrade.letter}</Badge>
                        : <Badge color="gray">—</Badge>}
                    </td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{r.position}</td>
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

// ─── Report 4: Student Enrollment ───────────────────────────────────────────

function EnrollmentReport() {
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [grade,    setGrade]    = useState('All Grades');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('students').select('*');
      setStudents(data || []);
      setLoading(false);
    })();
  }, []);

  const filtered = students
    .filter(s => grade === 'All Grades' || s.grade === grade)
    .filter(s => {
      const name = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
      return name.includes(search.toLowerCase()) || (s.id || '').toLowerCase().includes(search.toLowerCase());
    });

  // Grade breakdown
  const gradeBreakdown = GRADES.slice(1).map(g => ({
    grade: g,
    count: students.filter(s => s.grade === g).length,
  }));

  const doExport = () => {
    exportCSV('student-enrollment', 
      ['Student ID', 'First Name', 'Last Name', 'Grade', 'Parent Phone', 'Enrolled'],
      filtered.map(s => [s.id, s.first_name, s.last_name, s.grade, s.parent_phone, fmtDate(s.created_at)])
    );
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full"
              placeholder="Search student…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="relative">
            <select className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              value={grade} onChange={e => setGrade(e.target.value)}>
              {GRADES.map(g => <option key={g}>{g}</option>)}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
          <button onClick={doExport} className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
        </div>
      </div>

      {/* Grade breakdown cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {gradeBreakdown.map(({ grade: g, count }) => (
          <div
            key={g}
            onClick={() => setGrade(g)}
            className={`bg-white rounded-xl border p-4 text-center cursor-pointer transition shadow-sm
              ${grade === g ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}`}
          >
            <p className="text-xs font-medium text-gray-500">{g}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{count}</p>
            <p className="text-xs text-gray-400 mt-0.5">students</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Total Enrolled: {students.length}</h3>
          <span className="text-xs text-gray-400">Showing {filtered.length}</span>
        </div>
        {loading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Student ID', 'Name', 'Grade', 'Parent Phone', 'Date Enrolled'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-medium tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-gray-400">No students found.</td></tr>
                ) : filtered.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{s.id}</td>
                    <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {`${s.first_name || ''} ${s.last_name || ''}`.trim() || '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{s.grade || '—'}</td>
                    <td className="px-5 py-3 text-gray-500">{s.parent_phone || '—'}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{fmtDate(s.created_at)}</td>
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

// ─── Report 5: Teacher Directory ────────────────────────────────────────────

function TeacherReport() {
  const [teachers, setTeachers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('teachers').select('*').order('first_name');
      setTeachers(data || []);
      setLoading(false);
    })();
  }, []);

  const filtered = teachers.filter(t =>
    `${t.first_name} ${t.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (t.subject || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.id || '').toLowerCase().includes(search.toLowerCase())
  );

  const doExport = () => {
    exportCSV('teacher-directory',
      ['Teacher ID', 'First Name', 'Last Name', 'Subject', 'Email', 'Phone', 'Date Joined'],
      filtered.map(t => [t.id, t.first_name, t.last_name, t.subject, t.email, t.phone, fmtDate(t.created_at)])
    );
  };

  const subjectGroups = [...new Set(teachers.map(t => t.subject).filter(Boolean))];

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full"
              placeholder="Search by name or subject…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={doExport} className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Teachers', value: teachers.length, color: 'text-blue-600' },
          { label: 'Subjects Covered', value: subjectGroups.length, color: 'text-purple-600' },
          { label: 'Showing', value: filtered.length, color: 'text-gray-700' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs text-gray-500 font-medium mb-1">{c.label}</p>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Teacher ID', 'Name', 'Subject', 'Email', 'Phone', 'Date Joined'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-medium tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-gray-400">No teachers found.</td></tr>
                ) : filtered.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{t.id}</td>
                    <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {`${t.first_name || ''} ${t.last_name || ''}`.trim() || '—'}
                    </td>
                    <td className="px-5 py-3"><Badge color="blue">{t.subject || '—'}</Badge></td>
                    <td className="px-5 py-3 text-gray-500">{t.email || '—'}</td>
                    <td className="px-5 py-3 text-gray-500">{t.phone || '—'}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{fmtDate(t.created_at)}</td>
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

// ─── Report 6: Financial Summary ────────────────────────────────────────────

function FinancialSummaryReport() {
  const [students,     setStudents]     = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [feeStructure, setFeeStructure] = useState({});
  const [loading,      setLoading]      = useState(true);
  const [year,         setYear]         = useState(String(CURRENT_YEAR));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: s }, { data: tx }, { data: fs }] = await Promise.all([
        supabase.from('students').select('id, grade'),
        supabase.from('transactions').select('*').order('created_at'),
        supabase.from('fee_structures').select('*'),
      ]);
      setStudents(s || []);
      setTransactions(tx || []);
      const fmap = {};
      (fs || []).forEach(r => { fmap[r.term] = Number(r.amount); });
      setFeeStructure(fmap);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const yearTx = transactions.filter(tx =>
    tx.created_at && new Date(tx.created_at).getFullYear() === Number(year)
  );

  // By month
  const months = Array.from({ length: 12 }, (_, i) => {
    const label = new Date(Number(year), i, 1).toLocaleString('en-KE', { month: 'short' });
    const collected = yearTx
      .filter(tx => new Date(tx.created_at).getMonth() === i)
      .reduce((a, tx) => a + Number(tx.amount || 0), 0);
    return { label, collected };
  });

  // By grade
  const gradeRows = GRADES.slice(1).map(g => {
    const gStudents = students.filter(s => s.grade === g);
    const gIds = new Set(gStudents.map(s => s.id));
    const collected = yearTx.filter(tx => gIds.has(tx.student_id)).reduce((a, tx) => a + Number(tx.amount || 0), 0);
    const req = gStudents.length * (feeStructure['Term 1'] + feeStructure['Term 2'] + feeStructure['Term 3'] || 0);
    return { grade: g, students: gStudents.length, collected, req, balance: req - collected };
  });

  // By method
  const methodMap = {};
  yearTx.forEach(tx => {
    const m = tx.method || 'cash';
    methodMap[m] = (methodMap[m] || 0) + Number(tx.amount || 0);
  });

  const totalCollected = yearTx.reduce((a, tx) => a + Number(tx.amount || 0), 0);
  const totalReq       = students.length * ((feeStructure['Term 1'] || 0) + (feeStructure['Term 2'] || 0) + (feeStructure['Term 3'] || 0));
  const collectionRate = totalReq > 0 ? Math.round((totalCollected / totalReq) * 100) : 0;

  const maxMonth = Math.max(...months.map(m => m.collected), 1);

  const doExport = () => {
    exportCSV(`financial-summary-${year}`,
      ['Month', 'Collected (Ksh)'],
      months.map(m => [m.label, m.collected])
    );
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <select className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            value={year} onChange={e => setYear(e.target.value)}>
            {YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>
        <button onClick={load} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-500"><RefreshCw className="w-4 h-4" /></button>
        <button onClick={doExport} className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition ml-auto">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </button>
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Required',   value: `Ksh ${fmt(totalReq)}`,       color: 'bg-indigo-600 text-white' },
              { label: 'Total Collected',  value: `Ksh ${fmt(totalCollected)}`, color: 'bg-green-600 text-white' },
              { label: 'Outstanding',      value: `Ksh ${fmt(totalReq - totalCollected)}`, color: 'bg-red-600 text-white' },
              { label: 'Collection Rate',  value: `${collectionRate}%`,         color: 'bg-white border border-gray-200 text-gray-900' },
            ].map(c => (
              <div key={c.label} className={`rounded-xl p-5 shadow-sm ${c.color}`}>
                <p className="text-xs font-medium opacity-70 mb-1">{c.label}</p>
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-xs opacity-50 mt-1">{year}</p>
              </div>
            ))}
          </div>

          {/* Monthly bar chart (CSS) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-5">Monthly Collections — {year}</h3>
            <div className="flex items-end gap-2 h-40">
              {months.map(m => {
                const h = totalCollected > 0 ? Math.round((m.collected / maxMonth) * 100) : 0;
                return (
                  <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600 relative group"
                      style={{ height: `${Math.max(h, m.collected > 0 ? 4 : 0)}%` }}
                    >
                      {m.collected > 0 && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition z-10">
                          Ksh {fmt(m.collected)}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By Grade */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700">Collections by Grade</h3>
              </div>
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    {['Grade', 'Students', 'Collected', 'Balance'].map(h => (
                      <th key={h} className="px-5 py-3 text-left font-medium tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {gradeRows.map(r => (
                    <tr key={r.grade} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{r.grade}</td>
                      <td className="px-5 py-3 text-gray-500">{r.students}</td>
                      <td className="px-5 py-3 text-green-600 font-medium">Ksh {fmt(r.collected)}</td>
                      <td className="px-5 py-3 text-red-600 font-medium">Ksh {fmt(r.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* By Method */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700">Collections by Payment Method</h3>
              </div>
              {Object.keys(methodMap).length === 0 ? (
                <EmptyState icon={DollarSign} message="No transactions for this year." />
              ) : (
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      {['Method', 'Total Collected'].map(h => (
                        <th key={h} className="px-5 py-3 text-left font-medium tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Object.entries(methodMap).sort((a, b) => b[1] - a[1]).map(([method, amount]) => (
                      <tr key={method} className="hover:bg-gray-50">
                        <td className="px-5 py-3 capitalize font-medium text-gray-900">{method.replace(/_/g, ' ')}</td>
                        <td className="px-5 py-3 text-green-600 font-medium">Ksh {fmt(amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Reports Page ───────────────────────────────────────────────────────

const REPORT_TABS = [
  {
    id: 'fee-transactions',
    label: 'Fee Transactions',
    icon: DollarSign,
    description: 'Per student · per grade · per term · per year',
    component: FeeTransactionsReport,
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: CheckSquare,
    description: 'Presence, absence & late records',
    component: AttendanceReport,
  },
  {
    id: 'exam-results',
    label: 'Exam Results',
    icon: ClipboardList,
    description: 'Scores, grades & class positions',
    component: ExamResultsReport,
  },
  {
    id: 'enrollment',
    label: 'Student Enrollment',
    icon: GraduationCap,
    description: 'Full student register by grade',
    component: EnrollmentReport,
  },
  {
    id: 'teachers',
    label: 'Teacher Directory',
    icon: Briefcase,
    description: 'Staff list with subjects',
    component: TeacherReport,
  },
  {
    id: 'financial',
    label: 'Financial Summary',
    icon: TrendingUp,
    description: 'Annual overview · monthly · by grade · by method',
    component: FinancialSummaryReport,
  },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem('reportsActiveTab') || 'fee-transactions'
  );

  useEffect(() => {
    localStorage.setItem('reportsActiveTab', activeTab);
  }, [activeTab]);

  const active = REPORT_TABS.find(t => t.id === activeTab) || REPORT_TABS[0];
  const ActiveComponent = active.component;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics &amp; Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Generate, filter and export school reports</p>
        </div>
      </div>

      {/* Report Type Selector (card grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {REPORT_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-start p-4 rounded-xl border text-left transition shadow-sm
                ${isActive
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
                }`}
            >
              <Icon className={`w-6 h-6 mb-2 ${isActive ? 'text-white' : 'text-blue-600'}`} />
              <span className="text-sm font-semibold leading-tight">{tab.label}</span>
              <span className={`text-xs mt-1 leading-tight ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                {tab.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Report */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <active.icon className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">{active.label} Report</h2>
        </div>
        <ActiveComponent />
      </div>
    </div>
  );
}

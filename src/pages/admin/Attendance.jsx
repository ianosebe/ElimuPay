import { useState, useEffect, useCallback } from 'react';
import {
  CheckSquare, ChevronLeft, Users, Check, X,
  Clock, Save, RefreshCw, Calendar, AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];

const GRADE_COLORS = [
  { bg: 'bg-blue-500',   light: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   ring: 'ring-blue-400' },
  { bg: 'bg-purple-500', light: 'bg-purple-50',  border: 'border-purple-200', text: 'text-purple-700', ring: 'ring-purple-400' },
  { bg: 'bg-emerald-500',light: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700',ring: 'ring-emerald-400' },
  { bg: 'bg-orange-500', light: 'bg-orange-50',  border: 'border-orange-200', text: 'text-orange-700', ring: 'ring-orange-400' },
  { bg: 'bg-rose-500',   light: 'bg-rose-50',    border: 'border-rose-200',   text: 'text-rose-700',   ring: 'ring-rose-400' },
  { bg: 'bg-indigo-500', light: 'bg-indigo-50',  border: 'border-indigo-200', text: 'text-indigo-700', ring: 'ring-indigo-400' },
];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── Grade Register View ─────────────────────────────────────────────────────

function GradeRegister({ grade, color, date, onBack }) {
  const [students,    setStudents]    = useState([]);
  const [attendance,  setAttendance]  = useState({}); // { student_id: 'present' | 'absent' | 'late' }
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [dbError,     setDbError]     = useState(null);

  // Load students + existing attendance for this date/grade
  const load = useCallback(async () => {
    setLoading(true);
    setDbError(null);
    try {
      const { data: studentRows, error: sErr } = await supabase
        .from('students')
        .select('id, first_name, last_name')
        .eq('grade', grade)
        .order('first_name', { ascending: true });

      if (sErr) throw sErr;
      setStudents(studentRows || []);

      // Try to load existing attendance records for this date+grade
      if (studentRows && studentRows.length > 0) {
        const ids = studentRows.map(s => s.id);
        const { data: attRows, error: aErr } = await supabase
          .from('attendance')
          .select('student_id, status')
          .eq('date', date)
          .in('student_id', ids);

        if (aErr) {
          // Table might not exist yet — that's OK, we'll create on save
          setAttendance({});
        } else {
          const map = {};
          (attRows || []).forEach(r => { map[r.student_id] = r.status; });
          setAttendance(map);
        }
      }
    } catch (err) {
      setDbError(err.message);
    } finally {
      setLoading(false);
    }
  }, [grade, date]);

  useEffect(() => { load(); }, [load]);

  const mark = (studentId, status) => {
    setSaved(false);
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? undefined : status,
    }));
  };

  const markAll = (status) => {
    setSaved(false);
    const map = {};
    students.forEach(s => { map[s.id] = status; });
    setAttendance(map);
  };

  const handleSave = async () => {
    setSaving(true);
    setDbError(null);
    try {
      const records = students
        .filter(s => attendance[s.id])
        .map(s => ({
          student_id: s.id,
          date,
          status: attendance[s.id],
          grade,
        }));

      if (records.length === 0) {
        setSaving(false);
        return;
      }

      // Upsert: update if exists, insert if not
      const { error } = await supabase
        .from('attendance')
        .upsert(records, { onConflict: 'student_id,date' });

      if (error) throw error;
      setSaved(true);
    } catch (err) {
      setDbError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter(s => attendance[s.id] === 'present').length;
  const absentCount  = students.filter(s => attendance[s.id] === 'absent').length;
  const lateCount    = students.filter(s => attendance[s.id] === 'late').length;
  const unmarked     = students.filter(s => !attendance[s.id]).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center text-gray-500 hover:text-gray-800 transition text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> All Classes
        </button>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${color.bg} flex items-center justify-center shadow-sm`}>
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{grade}</h2>
            <p className="text-xs text-gray-400">
              {new Date(date + 'T00:00:00').toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* DB error / setup notice */}
      {dbError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Attendance table not set up yet</p>
            <p className="text-xs text-amber-600 mt-0.5 font-mono">{dbError}</p>
            <p className="text-xs text-amber-700 mt-1">
              Run this in your Supabase SQL Editor to create the table:
            </p>
            <pre className="text-xs bg-amber-100 rounded p-2 mt-1 overflow-x-auto text-amber-900">
{`create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  student_id text references students(id) on delete cascade,
  date date not null,
  grade text,
  status text check (status in ('present','absent','late')),
  created_at timestamptz default now(),
  unique(student_id, date)
);`}
            </pre>
          </div>
        </div>
      )}

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Present', count: presentCount, color: 'bg-green-100 text-green-700 border-green-200' },
          { label: 'Absent',  count: absentCount,  color: 'bg-red-100 text-red-700 border-red-200' },
          { label: 'Late',    count: lateCount,    color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
          { label: 'Unmarked',count: unmarked,     color: 'bg-gray-100 text-gray-600 border-gray-200' },
        ].map(({ label, count, color: c }) => (
          <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${c}`}>
            <span>{count}</span>
            <span className="opacity-70">{label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
          <span>{students.length} total students</span>
        </div>
      </div>

      {/* Bulk actions */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-medium text-gray-500 mr-1">Mark all:</span>
        <button onClick={() => markAll('present')}
          className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition">
          <Check className="w-3.5 h-3.5 mr-1" /> All Present
        </button>
        <button onClick={() => markAll('absent')}
          className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition">
          <X className="w-3.5 h-3.5 mr-1" /> All Absent
        </button>
        <button onClick={() => setAttendance({})}
          className="inline-flex items-center px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium rounded-lg transition">
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Clear All
        </button>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48 text-gray-400">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600 mr-3" />
            Loading students…
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No students found in {grade}.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {students.map((student, idx) => {
              const status = attendance[student.id];
              const name = `${student.first_name || ''} ${student.last_name || ''}`.trim() || '—';
              const initials = `${(student.first_name || '')[0] || ''}${(student.last_name || '')[0] || ''}`.toUpperCase();

              return (
                <li key={student.id}
                  className={`flex items-center gap-4 px-5 py-3.5 transition
                    ${status === 'present' ? 'bg-green-50/50'
                    : status === 'absent'  ? 'bg-red-50/50'
                    : status === 'late'    ? 'bg-yellow-50/50'
                    : 'hover:bg-gray-50'}`}
                >
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                    ${color.light} ${color.text}`}>
                    {initials || idx + 1}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                    <p className="text-xs text-gray-400">{student.id}</p>
                  </div>

                  {/* Status mark buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Present */}
                    <button
                      onClick={() => mark(student.id, 'present')}
                      title="Present"
                      className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition
                        ${status === 'present'
                          ? 'bg-green-500 border-green-500 text-white shadow-sm'
                          : 'border-gray-200 text-gray-300 hover:border-green-400 hover:text-green-500'}`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    {/* Absent */}
                    <button
                      onClick={() => mark(student.id, 'absent')}
                      title="Absent"
                      className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition
                        ${status === 'absent'
                          ? 'bg-red-500 border-red-500 text-white shadow-sm'
                          : 'border-gray-200 text-gray-300 hover:border-red-400 hover:text-red-500'}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {/* Late */}
                    <button
                      onClick={() => mark(student.id, 'late')}
                      title="Late"
                      className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition
                        ${status === 'late'
                          ? 'bg-yellow-400 border-yellow-400 text-white shadow-sm'
                          : 'border-gray-200 text-gray-300 hover:border-yellow-400 hover:text-yellow-500'}`}
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Save Bar */}
      {students.length > 0 && (
        <div className="sticky bottom-4 flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-lg px-5 py-3">
          <p className="text-sm text-gray-500">
            {unmarked > 0
              ? <span className="text-amber-600 font-medium">{unmarked} student{unmarked !== 1 ? 's' : ''} not yet marked</span>
              : <span className="text-green-600 font-medium">All students marked ✓</span>
            }
          </p>
          <button
            onClick={handleSave}
            disabled={saving || Object.keys(attendance).length === 0}
            className={`inline-flex items-center px-5 py-2 text-sm font-bold rounded-lg shadow transition
              ${saved
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300'}`}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Register'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Grade Card Grid ─────────────────────────────────────────────────────────

function GradeGrid({ studentCounts, selectedDate, onSelectGrade }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {GRADES.map((grade, idx) => {
        const color = GRADE_COLORS[idx];
        const count = studentCounts[grade] ?? '…';

        return (
          <button
            key={grade}
            onClick={() => onSelectGrade(grade, color)}
            className={`group relative flex flex-col items-center justify-center aspect-square rounded-2xl border-2 shadow-sm
              cursor-pointer transition-all duration-150 hover:scale-105 hover:shadow-md active:scale-95
              ${color.light} ${color.border}`}
          >
            {/* Coloured top strip */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl ${color.bg}`} />

            {/* Icon */}
            <div className={`w-11 h-11 rounded-xl ${color.bg} flex items-center justify-center shadow mb-3`}>
              <CheckSquare className="w-6 h-6 text-white" />
            </div>

            <span className={`text-sm font-bold ${color.text}`}>{grade}</span>
            <span className="text-xs text-gray-400 mt-0.5">
              {typeof count === 'number' ? `${count} student${count !== 1 ? 's' : ''}` : count}
            </span>

            {/* Hover cue */}
            <span className={`absolute bottom-2 text-xs font-medium opacity-0 group-hover:opacity-100 transition ${color.text}`}>
              Take Register →
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Attendance Page ────────────────────────────────────────────────────

export default function Attendance() {
  const [selectedGrade,  setSelectedGrade]  = useState(null);
  const [selectedColor,  setSelectedColor]  = useState(null);
  const [selectedDate,   setSelectedDate]   = useState(todayISO());
  const [studentCounts,  setStudentCounts]  = useState({});
  const [countsLoading,  setCountsLoading]  = useState(true);

  // Fetch student counts per grade for the cards
  useEffect(() => {
    (async () => {
      setCountsLoading(true);
      const { data } = await supabase.from('students').select('grade');
      if (data) {
        const counts = {};
        data.forEach(s => {
          if (s.grade) counts[s.grade] = (counts[s.grade] || 0) + 1;
        });
        setStudentCounts(counts);
      }
      setCountsLoading(false);
    })();
  }, []);

  const handleSelectGrade = (grade, color) => {
    setSelectedGrade(grade);
    setSelectedColor(color);
  };

  const handleBack = () => {
    setSelectedGrade(null);
    setSelectedColor(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track daily presence, absences and late arrivals per class.
          </p>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={e => { setSelectedDate(e.target.value); setSelectedGrade(null); }}
            className="text-sm font-medium text-gray-700 bg-transparent outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Date display pill */}
      <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-sm">
        <Calendar className="w-4 h-4 text-blue-500" />
        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-KE', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        })}
      </div>

      {/* Conditional render: grade grid OR register view */}
      {!selectedGrade ? (
        <>
          <div>
            <h2 className="text-base font-semibold text-gray-700 mb-3">Select a Class</h2>
            {countsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {GRADES.map(g => (
                  <div key={g} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <GradeGrid
                studentCounts={studentCounts}
                selectedDate={selectedDate}
                onSelectGrade={handleSelectGrade}
              />
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-2">
            {[
              { icon: <Check className="w-3.5 h-3.5" />, label: 'Present', color: 'text-green-600 bg-green-100' },
              { icon: <X className="w-3.5 h-3.5" />,     label: 'Absent',  color: 'text-red-600 bg-red-100' },
              { icon: <Clock className="w-3.5 h-3.5" />, label: 'Late',    color: 'text-yellow-600 bg-yellow-100' },
            ].map(({ icon, label, color: c }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-5 h-5 rounded flex items-center justify-center ${c}`}>{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </>
      ) : (
        <GradeRegister
          grade={selectedGrade}
          color={selectedColor}
          date={selectedDate}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

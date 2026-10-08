import { useState, useEffect } from 'react';
import { ClipboardList, Save, Search, Download, Check, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const getLearningAreas = (grade) => {
  if (!grade) return [];
  const g = grade.toLowerCase();
  
  if (g.includes('4') || g.includes('5') || g.includes('6')) {
    return ['Math', 'Eng/Comp', 'Kiswa/Ludia', 'Science/H.Science', 'Agric', 'Creative', 'S.Studies', 'CRE'];
  }
  
  if (g.includes('grade 1') || g.includes('grade 2') || g.includes('grade 3')) {
    return ['Math', 'English Reading', 'Kisa-Kwetu', 'Creative Arts', 'Environmental', 'CRE'];
  }
  
  return ['Math Activities', 'Language', 'Creative Arts', 'Environmental', 'R. Education'];
};

const getGradeAndPoints = (average) => {
  if (average >= 90) return { grade: 'EE1', points: 8 };
  if (average >= 75) return { grade: 'EE2', points: 7 };
  if (average >= 58) return { grade: 'ME1', points: 6 };
  if (average >= 41) return { grade: 'ME2', points: 5 };
  if (average >= 31) return { grade: 'AE1', points: 4 };
  if (average >= 21) return { grade: 'AE2', points: 3 };
  if (average >= 11) return { grade: 'BE1', points: 2 };
  if (average > 0) return { grade: 'BE2', points: 1 };
  return { grade: '-', points: 0 };
};

export default function Exams() {
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedGrade, setSelectedGrade] = useState('Grade 1');
  
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(true);

  const gradesList = ['Playgroup', 'PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade P4', 'Grade 5', 'Grade 6'];
  const learningAreas = getLearningAreas(selectedGrade);

  useEffect(() => {
    fetchData();
  }, [selectedTerm, selectedYear, selectedGrade]);

  const fetchData = async () => {
    setIsLoading(true);
    setIsEditing(true); // Always start editable when changing terms/classes
    try {
      // Fetch students for this grade
      const { data: stds, error: stdsErr } = await supabase
        .from('students')
        .select('id, first_name, last_name, grade');
      
      if (stdsErr) throw stdsErr;
      
      // We filter locally to handle any case or whitespace issues
      const safeStds = (stds || []).filter(s => {
        if (!s.grade) return false;
        // Strip spaces and lowercase to compare e.g., "Grade1" vs "Grade 1"
        const dbG = s.grade.toLowerCase().replace(/\s+/g, '');
        const selG = selectedGrade.toLowerCase().replace(/\s+/g, '');
        return dbG.includes(selG) || selG.includes(dbG);
      });
      
      setStudents(safeStds);

      // Fetch existing results for these students, term, and year
      const { data: res, error: resErr } = await supabase
        .from('exam_results')
        .select('*')
        .eq('term', selectedTerm)
        .eq('academic_year', selectedYear);

      if (resErr && resErr.code !== '42P01') {
        console.warn("Exam results table might not be ready:", resErr);
      }

      const resultsMap = {};
      safeStds.forEach(s => {
        // Find existing result record if any
        const existing = res ? res.find(r => r.student_id === s.id) : null;
        if (existing) {
          resultsMap[s.id] = { ...existing };
        } else {
          // Initialize empty
          resultsMap[s.id] = {
            student_id: s.id,
            term: selectedTerm,
            academic_year: selectedYear,
            student_grade: selectedGrade,
            scores: {},
            total_marks: 0,
            average: 0,
            performance_grade: '-',
            points: 0
          };
        }
      });

      setResults(resultsMap);
    } catch (error) {
      console.error("Error fetching exams data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreChange = (studentId, area, value) => {
    const numValue = value === '' ? '' : Number(value);
    
    setResults(prev => {
      const studentResult = { ...prev[studentId] };
      const newScores = { ...studentResult.scores, [area]: numValue };
      
      // Recalculate
      let total = 0;
      let count = learningAreas.length;
      
      learningAreas.forEach(a => {
        if (newScores[a]) total += Number(newScores[a]);
      });
      
      const average = count > 0 ? (total / count) : 0;
      const { grade, points } = getGradeAndPoints(average);

      return {
        ...prev,
        [studentId]: {
          ...studentResult,
          scores: newScores,
          total_marks: total,
          average: average,
          performance_grade: grade,
          points: points
        }
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = Object.values(results).map(r => ({
        student_id: r.student_id,
        term: r.term,
        academic_year: r.academic_year,
        student_grade: r.student_grade,
        scores: r.scores,
        total_marks: r.total_marks,
        average: r.average,
        performance_grade: r.performance_grade,
        points: r.points,
        updated_at: new Date().toISOString()
      }));

      // Upsert
      const { error } = await supabase.from('exam_results').upsert(payload, { onConflict: 'student_id,term,academic_year' });
      if (error) throw error;
      
      setIsEditing(false);
      alert("Results saved successfully!");
    } catch (error) {
      console.error("Error saving results:", error);
      alert("Failed to save results. Ensure the database schema has been updated.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const fullName = s.name || `${s.first_name || ''} ${s.last_name || ''}`;
    return fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Examination & Results</h1>
          <p className="text-sm text-gray-500 mt-1">Record and manage student performance and grades (KNEC 2026).</p>
        </div>
        
        {isEditing ? (
          <button 
            onClick={handleSave} 
            disabled={isSaving || students.length === 0}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 transition disabled:bg-blue-400"
          >
            <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save All Results'}
          </button>
        ) : (
          <button 
            onClick={() => setIsEditing(true)} 
            className="inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded-lg shadow-sm hover:bg-gray-50 transition"
          >
            <Edit2 className="w-4 h-4 mr-2" /> Edit Results
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Academic Year</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-blue-500 bg-white">
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Term</label>
          <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-blue-500 bg-white">
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Class / Grade</label>
          <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-blue-500 bg-white">
            {gradesList.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        
        <div className="ml-auto relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input 
            type="text" 
            placeholder="Search student..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg pl-9 pr-3 py-1.5 text-sm focus:ring-blue-500 w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            Loading students...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-gray-900">No Students Found</h2>
            <p className="text-gray-500 mt-2">There are no students enrolled in {selectedGrade}.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r border-gray-200">Student Name</th>
                {learningAreas.map(area => (
                  <th key={area} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    {area}
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100">Total Marks</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50">Avg (%)</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-green-700 uppercase tracking-wider bg-green-50">Grade</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-purple-700 uppercase tracking-wider bg-purple-50">Points</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map(student => {
                const fullName = student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim();
                const res = results[student.id];
                if (!res) return null;
                
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                      {fullName}
                    </td>
                    
                    {learningAreas.map(area => (
                      <td key={area} className="px-2 py-3 text-center">
                        {isEditing ? (
                          <input 
                            type="number" 
                            min="0" 
                            max="100"
                            value={res.scores[area] !== undefined ? res.scores[area] : ''}
                            onChange={(e) => handleScoreChange(student.id, area, e.target.value)}
                            className="w-16 border border-gray-300 rounded px-2 py-1 text-center text-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <span className="text-gray-900 font-medium">
                            {res.scores[area] !== undefined && res.scores[area] !== '' ? res.scores[area] : '-'}
                          </span>
                        )}
                      </td>
                    ))}
                    
                    <td className="px-4 py-3 text-center whitespace-nowrap text-sm font-bold text-gray-900 bg-gray-50">
                      {res.total_marks}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap text-sm font-bold text-blue-600 bg-blue-50/30">
                      {res.average.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap text-sm font-bold text-green-600 bg-green-50/30">
                      {res.performance_grade}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap text-sm font-bold text-purple-600 bg-purple-50/30">
                      {res.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Calendar, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const EVENT_COLORS = [
  { label: 'Blue', bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-700', value: 'blue' },
  { label: 'Green', bg: 'bg-green-500', light: 'bg-green-100', text: 'text-green-700', value: 'green' },
  { label: 'Red', bg: 'bg-red-500', light: 'bg-red-100', text: 'text-red-700', value: 'red' },
  { label: 'Orange', bg: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-700', value: 'orange' },
  { label: 'Purple', bg: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-700', value: 'purple' },
];

const COLOR_MAP = Object.fromEntries(EVENT_COLORS.map(c => [c.value, c]));

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function SchoolCalendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', color: 'blue' });

  // Fetch events from Supabase
  const fetchEvents = async () => {
    try {
      setDbError(null);
      const { data, error } = await supabase
        .from('school_events')
        .select('*')
        .order('event_date', { ascending: true });
      if (error) {
        setDbError(error.message);
      } else {
        setEvents(data || []);
      }
    } catch (err) {
      setDbError(err.message || 'Failed to connect to database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    const sub = supabase
      .channel('public:school_events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'school_events' }, fetchEvents)
      .subscribe();

    return () => supabase.removeChannel(sub);
  }, []);

  // Navigate months
  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  // Build calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.event_date === dateStr);
  };

  const openAdd = (day) => {
    if (!day) return;
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setForm({ title: '', description: '', color: 'blue' });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase.from('school_events').insert([{
        title: form.title.trim(),
        description: form.description.trim() || null,
        event_date: selectedDate,
        color: form.color,
      }]).select().single();
      if (error) throw error;
      // Optimistically update local state immediately — don't wait for Realtime
      if (data) {
        setEvents(prev =>
          [...prev, data].sort((a, b) => a.event_date.localeCompare(b.event_date))
        );
      }
      setIsModalOpen(false);
    } catch (err) {
      alert('Failed to save event: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    // Optimistically remove from local state immediately
    setEvents(prev => prev.filter(ev => ev.id !== id));
    try {
      const { error } = await supabase.from('school_events').delete().eq('id', id);
      if (error) {
        // Rollback on failure by re-fetching
        fetchEvents();
        throw error;
      }
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const isToday = (day) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  // Upcoming events (next 5)
  const todayStr = today.toISOString().split('T')[0];
  const upcoming = events
    .filter(e => e.event_date >= todayStr)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Calendar of Events</h2>
          <p className="text-sm text-gray-500 mt-1">Manage school events, holidays, and important dates</p>
        </div>
      </div>

      {/* DB Error Banner — shown when the table doesn't exist yet */}
      {dbError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
          <div className="shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" /></svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">Database table not set up yet</p>
            <p className="text-sm text-amber-700 mt-1">
              Please run the <strong>school_events</strong> SQL in your Supabase Dashboard (SQL Editor) to activate this feature.
            </p>
            <p className="text-xs text-amber-600 mt-1 font-mono break-all">{dbError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-200 transition text-gray-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900">
              {MONTHS[currentMonth]} {currentYear}
            </h3>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-200 transition text-gray-600">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-500 uppercase py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              return (
                <div
                  key={idx}
                  onClick={() => openAdd(day)}
                  className={`min-h-[90px] border-b border-r border-gray-100 p-1.5 cursor-pointer transition
                    ${day ? 'hover:bg-blue-50/40' : 'bg-gray-50 cursor-default'}
                    ${isToday(day) ? 'bg-blue-50' : ''}
                  `}
                >
                  {day && (
                    <>
                      <div className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium mb-1
                        ${isToday(day) ? 'bg-blue-600 text-white font-bold' : 'text-gray-700 hover:bg-blue-100'}
                      `}>
                        {day}
                      </div>
                      {isLoading ? (
                        <div className="h-1.5 bg-gray-100 rounded animate-pulse w-3/4"></div>
                      ) : (
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 2).map(ev => {
                            const color = COLOR_MAP[ev.color] || COLOR_MAP['blue'];
                            return (
                              <div
                                key={ev.id}
                                onClick={e => { e.stopPropagation(); }}
                                className={`text-xs px-1.5 py-0.5 rounded font-medium truncate flex items-center justify-between group ${color.light} ${color.text}`}
                              >
                                <span className="truncate">{ev.title}</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(ev.id); }}
                                  className="ml-1 opacity-0 group-hover:opacity-100 transition"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-400 pl-1">+{dayEvents.length - 2} more</div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* Upcoming Events Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-base font-semibold text-gray-900 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                Upcoming Events
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {upcoming.length > 0 ? upcoming.map(ev => {
                const color = COLOR_MAP[ev.color] || COLOR_MAP['blue'];
                const date = new Date(ev.event_date + 'T00:00:00');
                return (
                  <div key={ev.id} className="p-4 flex items-start gap-3 hover:bg-gray-50 transition group">
                    <div className={`mt-0.5 w-3 h-3 rounded-full shrink-0 ${color.bg}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{ev.title}</p>
                      {ev.description && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{ev.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              }) : (
                <div className="p-6 text-center text-sm text-gray-500">
                  No upcoming events. Click any date on the calendar to add one!
                </div>
              )}
            </div>
          </div>

          {/* Color Legend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Event Categories</h4>
            <div className="space-y-2">
              {EVENT_COLORS.map(c => (
                <div key={c.value} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${c.bg}`}></div>
                  <span className="text-sm text-gray-600">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add Event</h2>
                <p className="text-sm text-gray-500">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sports Day, Mid-Term Break..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Add more details about this event..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color Label</label>
                <div className="flex gap-3">
                  {EVENT_COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm({ ...form, color: c.value })}
                      className={`w-8 h-8 rounded-full ${c.bg} transition ring-offset-2
                        ${form.color === c.value ? 'ring-2 ring-gray-700 scale-110' : 'hover:scale-105'}
                      `}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2.5 px-4 rounded-lg shadow transition flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Add Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

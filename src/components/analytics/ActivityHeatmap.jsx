import { useState } from 'react';
import { Flame } from 'lucide-react';

/**
 * ActivityHeatmap renders a GitHub-style activity contribution grid for the last 30 days.
 * Highlights creation, meeting scheduling, and calls logged.
 *
 * @param {object} props The component props.
 * @param {Array} props.data Heatmap dataset [{ date, count, created, meetings, contacts }]
 * @returns {React.ReactNode} The rendered heatmap card.
 */
export default function ActivityHeatmap({ data = [] }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const totalActivities = data.reduce((sum, d) => sum + d.count, 0);

  /**
   * Determine coloring scale based on total daily counts.
   */
  const getColorClass = (count) => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800/60 border-slate-200/30';
    if (count <= 2) return 'bg-blue-100 dark:bg-blue-950/40 border-blue-200/20 text-blue-700';
    if (count <= 4) return 'bg-blue-300 dark:bg-blue-800/80 border-blue-400/20 text-white';
    return 'bg-blue-600 dark:bg-blue-600 border-blue-700/20 text-white';
  };

  const handleMouseMove = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-slate-200/80 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm flex flex-col h-full justify-between transition-all duration-200 hover:shadow-md relative">
      <div>
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-750 pb-3">
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Activity Heatmap
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Sales pipeline actions logged over the last 30 days
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-600 dark:border-orange-900/30 dark:bg-orange-950/20 dark:text-orange-400">
            <Flame className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* Heatmap Grid */}
        <div 
          className="mt-6 relative"
          onMouseMove={handleMouseMove}
        >
          {data.length === 0 ? (
            <div className="flex h-28 flex-col items-center justify-center text-center">
              <p className="text-sm text-slate-400 dark:text-gray-500 font-medium">
                No pipeline actions logged in the past 30 days.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-10 gap-2 sm:grid-cols-15 md:grid-cols-10 lg:grid-cols-15">
              {data.map((day) => (
                <div
                  key={day.date}
                  className={`aspect-square rounded-lg border transition-all duration-150 cursor-pointer ${getColorClass(
                    day.count
                  )}`}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                />
              ))}
            </div>
          )}

          {/* Hover custom tooltip inside the relative grid container */}
          {hoveredDay && (
            <div
              style={{
                left: `${mousePos.x + 10}px`,
                top: `${mousePos.y + 15}px`,
              }}
              className="absolute z-10 bg-slate-900/95 dark:bg-gray-950/95 text-white border border-slate-800/40 p-3 rounded-xl shadow-xl text-xs font-semibold pointer-events-none w-48 space-y-1"
            >
              <p className="font-bold text-gray-400 border-b border-slate-800 pb-1">
                {formatDate(hoveredDay.date)}
              </p>
              <div className="flex justify-between mt-1 text-[11px]">
                <span>Total Actions:</span>
                <span className="font-bold">{hoveredDay.count}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Leads Created:</span>
                <span>{hoveredDay.created}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Meetings Booked:</span>
                <span>{hoveredDay.meetings}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Calls/Contacts:</span>
                <span>{hoveredDay.contacts}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="mt-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-700/40 pt-4 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
        <span>{totalActivities} total actions</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          <span className="h-3 w-3 rounded bg-slate-100 border border-slate-200/50 dark:bg-slate-800/60" />
          <span className="h-3 w-3 rounded bg-blue-150 border border-blue-200/50 dark:bg-blue-950/40" />
          <span className="h-3 w-3 rounded bg-blue-300 border border-blue-400/50 dark:bg-blue-800/80" />
          <span className="h-3 w-3 rounded bg-blue-600 border border-blue-700/50 dark:bg-blue-600" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

import React, { useMemo, useState } from 'react';

// Date -> 'YYYY-MM-DD'
const keyOf = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function CalendarPanel({ todos, selectedDate, onSelectDate }) {
  const [cursor, setCursor] = useState(new Date()); // which month is shown
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  // Count todos per day
  const countsByDay = useMemo(() => {
    const map = new Map();
    todos.forEach(t => {
      if (!t.dueDate) return;
      map.set(t.dueDate, (map.get(t.dueDate) || 0) + 1);
    });
    return map;
  }, [todos]);

  const first = new Date(year, month, 1);
  const startWeekday = first.getDay(); // 0 Sun - 6 Sat
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build cells (nulls are fillers for grid alignment)
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const monthTitle = cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  const todayKey = keyOf(new Date());

  return (
    <div className="cal">
      <div className="cal-bar">
        <button className="cal-nav" onClick={() => setCursor(new Date(year, month - 1, 1))}>&lt;</button>
        <div className="cal-title">{monthTitle}</div>
        <button className="cal-nav" onClick={() => setCursor(new Date(year, month + 1, 1))}>&gt;</button>
      </div>

      <div className="cal-grid cal-head">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="cal-head-cell">{d}</div>
        ))}
      </div>

      <div className="cal-grid">
        {cells.map((dateObj, i) => {
          if (!dateObj) return <div key={i} className="cal-cell cal-cell-empty" />;
          const k = keyOf(dateObj);
          const count = countsByDay.get(k) || 0;
          const isSelected = selectedDate === k;
          const isToday = todayKey === k;
          return (
            <button
              key={i}
              className={`cal-cell ${isSelected ? 'cal-selected' : ''} ${isToday ? 'cal-today' : ''}`}
              onClick={() => onSelectDate(k)}
              title={count ? `${count} task(s)` : 'No tasks'}
            >
              <span className="cal-day">{dateObj.getDate()}</span>
              {count > 0 && <span className="cal-dot" data-count={count} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

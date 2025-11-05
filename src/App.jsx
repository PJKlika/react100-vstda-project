import './App.css';
import React, { useMemo, useState, useEffect } from 'react';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import CalendarPanel from './components/CalendarPanel';
import { useInteractiveEffects } from './components/Enhancement';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // ✅ USE THE HOOK - This was missing!
  const { 
    celebrateWithConfetti, 
    showToast, 
    playSound,
    createRipple
  } = useInteractiveEffects();

  // ---- Persistence (optional) ----
  useEffect(() => {
    const saved = localStorage.getItem('todos_v2');
    if (saved) {
      try { setTodos(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos_v2', JSON.stringify(todos));
  }, [todos]);

  // Welcome message on first load
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setTimeout(() => {
        showToast('Welcome to your interactive todo app! ✨', 'info', 5000);
      }, 1000);
      localStorage.setItem('hasVisited', 'true');
    }
  }, [showToast]);

  // ---- Header counts ----
  const { totalCount, remainingCount, completedCount } = useMemo(() => {
    const total = todos.length;
    const remaining = todos.filter(t => !t.completed).length;
    return { totalCount: total, remainingCount: remaining, completedCount: total - remaining };
  }, [todos]);

  // ---- Create ----
  const addTodo = (text, priority, dueDate, dueTime, notes, estimateMinutes, tags = [], subtasks = []) => {
    const newTodo = {
      id: Date.now(),
      text,
      notes: notes || '',
      priority: parseInt(priority),
      completed: false,
      dueDate: dueDate || '',
      dueTime: dueTime || '',
      estimateMinutes: estimateMinutes ? parseInt(estimateMinutes) : undefined,
      tags,
      subtasks
    };
    setTodos(prev => [...prev, newTodo]);
    
    // ✅ Show success feedback
    showToast('✅ Task added successfully!', 'success');
    playSound('success');
  };

  // ---- Toggle ----
  const toggleTodo = (id) => {
    setTodos(prev => prev.map(t => { 
      if (t.id === id) {
        const newCompleted = !t.completed;
        
        // ✅ Celebrate when completing a task!
        if (newCompleted) {
          celebrateWithConfetti();
          showToast('🎉 Great job! Task completed!', 'success');
          playSound('success');
        } else {
          showToast('Task reopened', 'info');
          playSound('click');
        }
        
        return { ...t, completed: newCompleted };
      }
      return t;
    }));
  };

  // ---- Edit ----
  const editTodo = (
    id,
    newText,
    newPriority,
    newDueDate,
    newDueTime,
    newNotes,
    newEstimateMinutes,
    newTags,
    newSubtasks
  ) => {
    setTodos(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              text: newText,
              priority: parseInt(newPriority),
              dueDate: newDueDate || '',
              dueTime: newDueTime || '',
              notes: newNotes ?? t.notes ?? '',
              estimateMinutes:
                newEstimateMinutes !== undefined && newEstimateMinutes !== ''
                  ? parseInt(newEstimateMinutes)
                  : undefined,
              tags: Array.isArray(newTags) ? newTags : t.tags || [],
              subtasks: Array.isArray(newSubtasks) ? newSubtasks : t.subtasks || []
            }
          : t
      )
    );
    
    showToast('📝 Task updated', 'info');
    playSound('click');
  };

  // ---- Delete / Clear ----
  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    showToast('🗑️ Task deleted', 'warning');
    playSound('delete');
  };

  const clearCompleted = () => {
    const count = completedCount;
    setTodos(prev => prev.filter(t => !t.completed));
    
    if (count > 0) {
      showToast(`✨ Cleared ${count} completed task${count > 1 ? 's' : ''}`, 'success');
      playSound('success');
    }
  };

  // ---- Calendar filter ----
  const visibleTodos = useMemo(() => {
    if (!selectedDate) return todos;
    return todos.filter(t => t.dueDate === selectedDate);
  }, [todos, selectedDate]);

  return (
    <div className="app-shell">
      <div className="app-card">
        {/* Header inside block */}
        <div className="app-card-header">
          <div>
            <h1 className="app-title">Very Simple Todo App</h1>
            <p className="app-subtitle">Track all of the things</p>
          </div>
          <div className="header-actions">
            <span className="chip">📊 {remainingCount} active</span>
            <span className="chip chip-muted">✓ {completedCount} done</span>
            <button
              className="btn btn-sm"
              onClick={(e) => {
                createRipple(e);
                clearCompleted();
              }}
              disabled={completedCount === 0}
              title={completedCount === 0 ? 'No completed todos' : 'Clear completed todos'}
              style={{
                background: completedCount === 0 
                  ? 'rgba(148, 163, 184, 0.1)' 
                  : 'rgba(239, 68, 68, 0.15)',
                border: completedCount === 0 
                  ? '1px solid rgba(148, 163, 184, 0.2)' 
                  : '1px solid rgba(239, 68, 68, 0.3)',
                color: completedCount === 0 
                  ? 'var(--muted)' 
                  : '#fca5a5',
                opacity: completedCount === 0 ? 0.5 : 1,
                cursor: completedCount === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              🗑️ Clear ({completedCount})
            </button>
          </div>
        </div>

        {/* Body with two panels */}
        <div className="app-card-body">
          <section className="panel">
            <TodoForm onAddTodo={addTodo} />

            <div style={{ 
              height: '1px', 
              background: 'rgba(148, 163, 184, 0.15)',
              margin: '24px 0'
            }} />

            <h2 className="panel-title">
              {selectedDate ? `Tasks for ${selectedDate}` : 'All Tasks'}
              {selectedDate && (
                <button 
                  className="btn btn-sm" 
                  onClick={() => {
                    setSelectedDate(null);
                    showToast('Showing all tasks', 'info');
                  }}
                  style={{
                    marginLeft: '12px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#93c5fd',
                    padding: '4px 10px',
                    fontSize: '12px'
                  }}
                >
                  Clear filter
                </button>
              )}
            </h2>
            <TodoList
              todos={visibleTodos}
              onToggle={toggleTodo}
              onEdit={editTodo}
              onDelete={deleteTodo}
            />
          </section>

          <section className="panel">
            <h2 className="panel-title">Calendar</h2>
            <CalendarPanel
              todos={todos}
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                if (date) {
                  showToast(`📅 Filtered to ${date}`, 'info');
                  playSound('click');
                }
              }}
            />
          </section>
        </div>
      </div>

    </div>
  );
}
import React, { useState } from 'react';

export default function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);

  // existing
  const [editText, setEditText] = useState(todo.text);
  const [editPriority, setEditPriority] = useState(todo.priority.toString());
  const [editDue, setEditDue] = useState(todo.dueDate || '');

  // NEW fields
  const [editDueTime, setEditDueTime] = useState(todo.dueTime || '');
  const [editNotes, setEditNotes] = useState(todo.notes || '');
  const [editEstimate, setEditEstimate] = useState(
    typeof todo.estimateMinutes === 'number' ? String(todo.estimateMinutes) : ''
  );
  const [editTagsRaw, setEditTagsRaw] = useState((todo.tags || []).join(', '));

  const getPriorityClass = (p) =>
    p === 1 ? 'priority-high' : p === 2 ? 'priority-medium' : 'priority-low';

  const handleSave = () => {
    if (!editText.trim()) return;

    const tags = editTagsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onEdit(
      todo.id,
      editText,
      editPriority,
      editDue,
      editDueTime,
      editNotes,
      editEstimate,
      tags,
      todo.subtasks || []
    );
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setEditPriority(todo.priority.toString());
    setEditDue(todo.dueDate || '');
    setEditDueTime(todo.dueTime || '');
    setEditNotes(todo.notes || '');
    setEditEstimate(
      typeof todo.estimateMinutes === 'number' ? String(todo.estimateMinutes) : ''
    );
    setEditTagsRaw((todo.tags || []).join(', '));
    setIsEditing(false);
  };

  // ----- Edit mode -----
  if (isEditing) {
    return (
      <li
        className={`list-group-item ${getPriorityClass(parseInt(editPriority))}`}
        data-testid="todo-item"
        style={{
          padding: '20px',
          animation: 'slide-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <label>Description</label>
          <textarea
            rows="2"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            data-testid="update-todo-text"
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label>Priority</label>
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value)}
          >
            <option value="1">High Priority</option>
            <option value="2">Medium Priority</option>
            <option value="3">Low Priority</option>
          </select>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '16px',
          marginBottom: '16px'
        }}>
          <div>
            <label>Due date</label>
            <input
              type="date"
              value={editDue}
              onChange={(e) => setEditDue(e.target.value)}
            />
          </div>
          <div>
            <label>Time</label>
            <input
              type="time"
              value={editDueTime}
              onChange={(e) => setEditDueTime(e.target.value)}
            />
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '16px',
          marginBottom: '16px'
        }}>
          <div>
            <label>Estimate (minutes)</label>
            <input
              type="number"
              min="1"
              value={editEstimate}
              onChange={(e) => setEditEstimate(e.target.value)}
            />
          </div>
          <div>
            <label>Tags (comma separated)</label>
            <input
              type="text"
              value={editTagsRaw}
              onChange={(e) => setEditTagsRaw(e.target.value)}
              placeholder="work, school"
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Notes</label>
          <textarea
            rows="2"
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-sm"
            onClick={handleSave}
            data-testid="update-todo"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            ✓ Save
          </button>
          <button 
            className="btn btn-sm" 
            onClick={handleCancel}
            style={{
              background: 'rgba(148, 163, 184, 0.1)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              color: 'var(--muted)',
              padding: '8px 16px',
              fontWeight: 700
            }}
          >
            Cancel
          </button>
        </div>
      </li>
    );
  }

  // ----- View mode -----
  return (
    <li
      className={`list-group-item ${getPriorityClass(todo.priority)} ${todo.completed ? 'completed' : ''}`}
      data-testid="todo-item"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '18px 20px'
      }}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        style={{
          width: '20px',
          height: '20px',
          marginTop: '2px',
          cursor: 'pointer',
          accentColor: 'var(--accent)',
          flexShrink: 0
        }}
      />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          fontSize: '15px',
          fontWeight: 600,
          color: todo.completed ? 'var(--muted)' : 'var(--text)',
          marginBottom: '6px',
          wordBreak: 'break-word'
        }}>
          {todo.text}
        </div>

        {todo.notes && (
          <div style={{ 
            fontSize: '13px',
            color: 'var(--muted)',
            marginTop: '6px',
            fontStyle: 'italic'
          }}>
            💬 {todo.notes}
          </div>
        )}

        {/* Badges row */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '6px',
          marginTop: '10px',
          alignItems: 'center'
        }}>
          {todo.dueDate && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#93c5fd',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700
            }}>
              📅 {todo.dueDate}
            </span>
          )}
          {todo.dueTime && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#c4b5fd',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700
            }}>
              🕐 {todo.dueTime}
            </span>
          )}
          {typeof todo.estimateMinutes === 'number' && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#fcd34d',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700
            }}>
              ⏱️ {todo.estimateMinutes}m
            </span>
          )}
          {todo.tags?.length > 0 &&
            todo.tags.map((tag) => (
              <span 
                key={tag} 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 10px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  color: '#67e8f9',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700
                }}
              >
                #{tag}
              </span>
            ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '8px',
        flexShrink: 0,
        marginLeft: 'auto'
      }}>
        <button
          className="btn btn-sm"
          onClick={() => setIsEditing(true)}
          data-testid="edit-todo"
          style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#93c5fd',
            padding: '6px 12px',
            fontWeight: 700,
            fontSize: '13px',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(59, 130, 246, 0.25)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(59, 130, 246, 0.15)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          ✏️ Edit
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(todo.id)}
          data-testid="delete-todo"
          style={{
            padding: '6px 12px',
            fontWeight: 700,
            fontSize: '13px'
          }}
        >
          🗑️ Delete
        </button>
      </div>
    </li>
  );
}
import React from 'react';
import TodoItem from './TodoItem';

export default function TodoList({ todos, onToggle, onEdit, onDelete }) {
  if (todos.length === 0) {
    return (
      <div className='panel'>
        <h3 className='panel-title'>View Todos</h3>
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: 'rgba(15, 23, 42, 0.4)',
          borderRadius: '12px',
          border: '1px dashed rgba(148, 163, 184, 0.2)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📝</div>
          <p style={{ 
            color: 'var(--muted)', 
            margin: 0,
            fontSize: '15px'
          }}>
            No todos yet. Add one to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='panel'>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '4px'
      }}>
        <h3 className='panel-title' style={{ margin: 0 }}>View Todos</h3>
        <span className='chip'>
          {todos.length} {todos.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>
      <ul className='list-group'>
        {todos.map(todo => (
          <TodoItem 
            key={todo.id} 
            todo={todo} 
            onToggle={onToggle} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
        ))}
      </ul>
    </div>
  );
}
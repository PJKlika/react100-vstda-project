import React, { useState, useCallback } from 'react';

export default function TodoForm({ onAddTodo }) {
  // form fields
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('2');     // default Medium
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [estimate, setEstimate] = useState('');
  const [tagsRaw, setTagsRaw] = useState('');
  const [notes, setNotes] = useState('');

  // ui state
  const [showMore, setShowMore] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiResult, setAiResult] = useState(null);

  const reset = useCallback(() => {
    setText(''); setPriority('2'); setDueDate(''); setDueTime('');
    setEstimate(''); setTagsRaw(''); setNotes('');
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const tags = tagsRaw.split(',').map(s => s.trim()).filter(Boolean);
    onAddTodo(text, priority, dueDate, dueTime, notes, estimate, tags, []);
    reset();
  };

  // ---------- AI modal logic ----------
  const openAIModal = () => {
    setAiResult(null);
    setAiInput(text || '');
    setAiOpen(true);
  };

  const closeAIModal = () => {
    setAiOpen(false);
    setAiBusy(false);
    setAiResult(null);
  };

  const analyzeWithAI = async () => {
    const payload = (aiInput || text).trim();
    if (!payload) {
      alert('Type a quick sentence like: "Email Amir tomorrow 3pm high #work 25m"');
      return;
    }
    
    setAiBusy(true);
    setAiResult(null);
    
    try {
      const res = await fetch('/api/ai/parse-todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: payload })
      });
      
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Server error ${res.status}: ${msg}`);
      }
      
      const data = await res.json();
      setAiResult(data);
    } catch (err) {
      console.error('AI Analysis Error:', err);
      alert(`AI error: ${err.message}`);
    } finally {
      setAiBusy(false);
    }
  };

  const applyAIResult = () => {
    if (!aiResult) return;
    if (aiResult.title) setText(aiResult.title);
    if (aiResult.priority) setPriority(String(aiResult.priority));
    if (aiResult.dueDate) setDueDate(aiResult.dueDate);
    if (aiResult.dueTime) setDueTime(aiResult.dueTime);
    if (aiResult.estimateMinutes) setEstimate(String(aiResult.estimateMinutes));
    if (Array.isArray(aiResult.tags) && aiResult.tags.length) setTagsRaw(aiResult.tags.join(', '));
    if (aiResult.notes) setNotes(aiResult.notes);
    closeAIModal();
  };

  const canSubmit = Boolean(text.trim());

  return (
    <div className="panel">
      <div className="panel-header ai-fill-header">
        <h3 className="panel-title">Add New Todo</h3>
        <button
          type="button"
          className="btn btn-sm ai-fill-btn"
          onClick={openAIModal}
          
        >
          <span>🌟</span> Let AI Fill
        </button>
      </div>

      <div>
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-section">
            <label htmlFor="todoText">I want to…</label>
            <textarea 
              data-testid='create-todo-text' 
              id="todoText"
              rows="3"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe your task..."
            />
          </div>

          {/* Priority segmented buttons */}
          <div className="form-section-priority">
            <label className="priority-label">Priority</label>
            <div className="priority-grid">
              <button 
                type="button"
                className={'priority-btn priority-btn-high' + (priority === '1' ? ' active' : '')}
                onClick={() => setPriority('1')}
              >
                High
              </button>
              <button
                type="button"
                className={'priority-btn priority-btn-medium' + (priority === '2' ? ' active' : '')}
                onClick={() => setPriority('2')}
              >
                Medium
              </button>
              <button
                type="button"
                className={'priority-btn priority-btn-low' + (priority === '3' ? ' active' : '')}
                onClick={() => setPriority('3')}
              >
                Low
              </button>
            </div>

            {/* Hidden select for test suite compatibility */}
            <select
              data-testid="create-todo-priority" 
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="priority-select-hidden"
              aria-hidden="true"
              tabIndex={-1}
            >
              <option value="1">High</option>
              <option value="2">Medium</option>
              <option value="3">Low</option>
            </select>

            <small className="priority-tip">
              Tip: AI also understands words like <em>high/urgent/low</em>.
            </small>
          </div>

          {/* More options toggle */}
          <button
            type="button"
            className="more-options-toggle"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? '▲ Hide options' : '▼ More options (date, time, estimate, tags, notes)'}
          </button>

          {showMore && (
            <div className="more-options-panel">
              {/* Date + Time */}
              <div className="form-row">
                <div>
                  <label htmlFor="todoDue">Due date (optional)</label>
                  <input
                    id="todoDue"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="todoTime">Time (optional)</label>
                  <input
                    id="todoTime"
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Estimate + Tags */}
              <div className="form-row">
                <div>
                  <label htmlFor="todoEst">Estimate (minutes)</label>
                  <input
                    id="todoEst"
                    type="number"
                    min="1"
                    value={estimate}
                    onChange={(e) => setEstimate(e.target.value)}
                    placeholder="e.g., 45"
                  />
                </div>
                <div>
                  <label htmlFor="todoTags">Tags (comma separated)</label>
                  <input
                    id="todoTags"
                    type="text"
                    value={tagsRaw}
                    onChange={(e) => setTagsRaw(e.target.value)}
                    placeholder="work, school"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="todoNotes">Notes (optional)</label>
                <textarea
                  id="todoNotes"
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Extra details, links, or context"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary submit-btn-full"
            disabled={!canSubmit}
            data-testid="create-todo"
          >
            <span className="submit-btn-icon">➕</span>
            Add Task
          </button>
        </form>
      </div>

      {/* ---------- AI Modal ---------- */}
      {aiOpen && (
        <div 
          className="modal-overlay" 
          onClick={(e) => {
            if (e.target.className === 'modal-overlay') {
              closeAIModal();
            }
          }}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <h5 className="modal-title">🤖 Let AI Fill</h5>
              <button 
                type="button" 
                className="modal-close"
                onClick={closeAIModal}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              <label>Describe the task</label>
              <textarea
                rows="3"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder='e.g., "Buy milk tomorrow 7am high #home 20m"'
                disabled={aiBusy}
              />
              <button
                type="button"
                className="btn modal-analyze-btn"
                onClick={analyzeWithAI}
                disabled={aiBusy}
              >
                {aiBusy ? '⏳ Analyzing…' : '🔍 Analyze'}
              </button>

              {aiResult && (
                <div className="modal-result">
                  <div className="result-item">
                    <strong>Title:</strong> <span>{aiResult.title || '(—)'}</span>
                  </div>
                  <div className="result-item">
                    <strong>Priority:</strong> <span>{aiResult.priority ?? '(—)'}</span>
                  </div>
                  <div className="result-item">
                    <strong>Due:</strong> <span>{[aiResult.dueDate, aiResult.dueTime].filter(Boolean).join(' ') || '(—)'}</span>
                  </div>
                  <div className="result-item">
                    <strong>Estimate:</strong> <span>{aiResult.estimateMinutes ? aiResult.estimateMinutes + 'm' : '(—)'}</span>
                  </div>
                  <div className="result-item">
                    <strong>Tags:</strong> <span>{aiResult.tags?.length ? aiResult.tags.join(', ') : '(—)'}</span>
                  </div>
                  {aiResult.notes && (
                    <div className="result-item">
                      <strong>Notes:</strong> <span>{aiResult.notes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              {/* Status area - always present to prevent shifting */}
              <div className="modal-status">
                {aiBusy && (
                  <>
                    <span>⏳</span> AI is analyzing...
                  </>
                )}
                {aiResult && !aiBusy && (
                  <>
                    ✓ Analysis complete!
                  </>
                )}
              </div>
              
              <div className="modal-buttons">
                <button 
                  type="button" 
                  className="btn modal-close-btn"
                  onClick={closeAIModal}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary modal-apply-btn"
                  onClick={applyAIResult}
                  disabled={!aiResult}
                >
                  {aiResult ? '✓ Apply to form' : 'Apply to form'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
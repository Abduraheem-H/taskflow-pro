import React, { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Priority } from '../types/task';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTaskModal = ({ isOpen, onClose }: AddTaskModalProps) => {
  const { addTask } = useTaskStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }
    addTask(title.trim(), description.trim(), priority);
    setTitle('');
    setDescription('');
    setPriority('medium');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Create New Task</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
            />
          </label>
          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details"
              rows={3}
            />
          </label>
          <label>
            Priority
            <div className="priority">
              {(['low', 'medium', 'high'] as Priority[]).map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setPriority(value)}
                  className={priority === value ? 'active' : ''}
                >
                  {value}
                </button>
              ))}
            </div>
          </label>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Task } from '../types/api';
import { Alert, AppShell, DataTable, EmptyState, LoadingScreen, PageHeader, Section, StatusBadge } from '../components/ui';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contractId, setContractId] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [delivDesc, setDelivDesc] = useState('');
  const [delivMedia, setDelivMedia] = useState('');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await api.get<{ success: boolean; data: Task[] }>('/tasks');
      if (res.success && res.data) setTasks(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        contractId,
        description,
        dueDate: dueDate || undefined,
        assigneeId: assigneeId || undefined,
      });
      setContractId('');
      setDescription('');
      setDueDate('');
      setAssigneeId('');
      loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    try {
      await api.post(`/tasks/${selectedTask}/deliverables`, {
        description: delivDesc,
        mediaUrl: delivMedia || undefined,
      });
      setDelivDesc('');
      setDelivMedia('');
      setSelectedTask(null);
      loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  };

  if (loading) return <LoadingScreen label="Loading tasks..." />;

  return (
    <AppShell eyebrow="Tasks">
      <PageHeader
        title="Tasks"
        description="Create contract-linked tasks, track due dates, and attach deliverables to the right work item."
      />
        {error && <Alert>{error}</Alert>}
        <Section title="Create task" description="Delivery setup">
        <form onSubmit={handleCreate} className="form-grid five">
          <div className="form-field">
            <label htmlFor="contract-id">Contract ID</label>
            <input id="contract-id" value={contractId} onChange={(e) => setContractId(e.target.value)} className="input" required />
          </div>
          <div className="form-field span-2">
            <label htmlFor="task-description">Description</label>
            <input id="task-description" value={description} onChange={(e) => setDescription(e.target.value)} className="input" required />
          </div>
          <div className="form-field">
            <label htmlFor="due-date">Due Date</label>
            <input id="due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input" />
          </div>
          <div className="form-field">
            <label htmlFor="assignee-id">Assignee ID</label>
            <input id="assignee-id" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="input" />
          </div>
          <div className="form-actions full">
            <button type="submit" className="button">Create Task</button>
          </div>
        </form>
        </Section>
        <DataTable>
          <table>
            <thead>
              <tr>
                <th className="text-left p-4">ID</th>
                <th className="text-left p-4">Description</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Due</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-4 id-cell">{t.id}</td>
                  <td className="p-4">{t.description}</td>
                  <td className="p-4"><StatusBadge status={t.status} /></td>
                  <td className="p-4">{t.dueDate || '-'}</td>
                  <td className="p-4">
                    <button type="button" onClick={() => setSelectedTask(t.id)} className="button-link">Add Deliverable</button>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr><td colSpan={5}><EmptyState title="No tasks found" description="Create a task once a contract is ready for delivery." /></td></tr>
              )}
            </tbody>
          </table>
        </DataTable>
        {selectedTask && (
          <Section title="Add deliverable" description={`Task ${selectedTask}`}>
          <form onSubmit={handleDeliverable} className="form-grid">
            <div className="form-field">
              <label htmlFor="deliverable-description">Description</label>
              <input id="deliverable-description" value={delivDesc} onChange={(e) => setDelivDesc(e.target.value)} className="input" required />
            </div>
            <div className="form-field">
              <label htmlFor="deliverable-media">Media URL</label>
              <input id="deliverable-media" value={delivMedia} onChange={(e) => setDelivMedia(e.target.value)} className="input" />
            </div>
            <div className="form-actions">
              <button type="submit" className="button button-success">Submit Deliverable</button>
            </div>
          </form>
          </Section>
        )}
    </AppShell>
  );
}

import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Task } from '../types/api';
import { Alert, AppShell, EmptyState, LoadingScreen, PageHeader, Section, StatusBadge } from '../components/ui';
import { useAssistantContext } from '../hooks/useAssistantContext';

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
  const [ready, setReady] = useState(false);
  const { setContext } = useAssistantContext();

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setReady(true), 60);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => {
    setContext({
      page: 'Tasks',
      route: '/tasks',
      data: {
        totalTasks: tasks.length,
        openTasks: tasks.filter((t) => t.status === 'TODO' || t.status === 'IN_PROGRESS').length,
        completedTasks: tasks.filter((t) => t.status === 'DONE').length,
      },
    });
  }, [tasks, setContext]);

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
      await api.post('/tasks', { contractId, description, dueDate, assigneeId });
      setContractId('');
      setDescription('');
      setDueDate('');
      setAssigneeId('');
      loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleDeliver = async (taskId: string) => {
    try {
      await api.post(`/tasks/${taskId}/deliverables`, { description: delivDesc, mediaUrl: delivMedia });
      setDelivDesc('');
      setDelivMedia('');
      setSelectedTask(null);
      loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  };

  const openTasks = tasks.filter((t) => t.status !== 'DONE');

  if (loading) return <LoadingScreen label="Loading tasks..." />;

  return (
    <AppShell eyebrow="Tasks">
      <PageHeader
        title="Tasks"
        description="Track deliverables, assign work, and manage deadlines."
      />
      {error && <Alert>{error}</Alert>}

      <div style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 500ms ease, transform 500ms ease' }}>
        <Section title="New task" description="Assign a deliverable">
          <form onSubmit={handleCreate} className="form-grid">
            <div className="form-field">
              <label htmlFor="contractId">Contract ID</label>
              <input id="contractId" value={contractId} onChange={(e) => setContractId(e.target.value)} className="input" required />
            </div>
            <div className="form-field full">
              <label htmlFor="description">Description</label>
              <input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="input" required />
            </div>
            <div className="form-field">
              <label htmlFor="dueDate">Due date</label>
              <input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input" />
            </div>
            <div className="form-field">
              <label htmlFor="assigneeId">Assignee ID</label>
              <input id="assigneeId" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="input" />
            </div>
            <div className="form-actions full">
              <button type="submit" className="button">Create task</button>
            </div>
          </form>
        </Section>

        <div className="panel">
          <div className="section-heading">
            <h2>Task board</h2>
            <p>{openTasks.length} open · {tasks.filter((t) => t.status === 'DONE').length} completed</p>
          </div>
          {tasks.length === 0 ? (
            <EmptyState title="No tasks" description="Create tasks to track deliverables." />
          ) : (
            <div className="list-rows">
              {tasks.map((t, idx) => (
                <div
                  key={t.id}
                  className="list-row"
                  style={{
                    opacity: ready ? 1 : 0,
                    transform: ready ? 'translateY(0)' : 'translateY(6px)',
                    transition: `opacity 400ms ease ${idx * 40 + 100}ms, transform 400ms ease ${idx * 40 + 100}ms`,
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                    <div className="list-row-main" style={{ flex: 1 }}>
                      <strong>{t.description}</strong>
                      <p>Contract {t.contractId} · Due {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date'}</p>
                    </div>
                    <div className="list-row-meta">
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                  {t.status !== 'DONE' && (
                    <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--color-line)' }}>
                      {selectedTask === t.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <input
                            value={delivDesc}
                            onChange={(e) => setDelivDesc(e.target.value)}
                            className="input"
                            placeholder="Deliverable description"
                          />
                          <input
                            value={delivMedia}
                            onChange={(e) => setDelivMedia(e.target.value)}
                            className="input"
                            placeholder="Media URL"
                          />
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="button" onClick={() => handleDeliver(t.id)} className="button button-success">Submit deliverable</button>
                            <button type="button" onClick={() => setSelectedTask(null)} className="button button-ghost">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setSelectedTask(t.id)} className="button-link" style={{ fontSize: '0.8rem' }}>
                          + Add deliverable
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

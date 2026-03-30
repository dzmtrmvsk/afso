import { useEffect, useState, useCallback } from 'react';
import { Play, Pause, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { ticketsApi } from '@/api/tickets';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import type { Ticket } from '@/types';

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function useTimer(startedAt: string | undefined, totalWorkTimeMs: number, isRunning: boolean) {
  const [elapsed, setElapsed] = useState(totalWorkTimeMs);

  useEffect(() => {
    if (!isRunning) {
      setElapsed(totalWorkTimeMs);
      return;
    }
    const startTime = startedAt ? new Date(startedAt).getTime() : Date.now();
    const interval = setInterval(() => {
      setElapsed(totalWorkTimeMs + (Date.now() - startTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, totalWorkTimeMs, isRunning]);

  return elapsed;
}

export function MyTasksPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(() => {
    ticketsApi
      .getMyTasks()
      .then((res) => setTickets(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(load, [load]);

  const handleStart = async (id: string) => {
    setActionLoading(id);
    try {
      await ticketsApi.startWork(id);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePause = async (id: string) => {
    setActionLoading(id);
    try {
      await ticketsApi.pauseWork(id);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (id: string) => {
    setActionLoading(id);
    try {
      await ticketsApi.completeWork(id);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) return <PageSpinner />;

  const activeTickets = tickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed');
  const completedTickets = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed');

  return (
    <div>
      <Header title="My Tasks" description={`${activeTickets.length} active, ${completedTickets.length} completed`} />

      {activeTickets.length === 0 && completedTickets.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-500">No tasks assigned yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTickets.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Active Tasks</h2>
              <div className="space-y-4">
                {activeTickets.map((ticket) => (
                  <TaskCard
                    key={ticket.id}
                    ticket={ticket}
                    onStart={() => handleStart(ticket.id)}
                    onPause={() => handlePause(ticket.id)}
                    onComplete={() => handleComplete(ticket.id)}
                    isLoading={actionLoading === ticket.id}
                  />
                ))}
              </div>
            </div>
          )}

          {completedTickets.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Completed</h2>
              <div className="space-y-4">
                {completedTickets.map((ticket) => (
                  <TaskCard key={ticket.id} ticket={ticket} isLoading={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface TaskCardProps {
  ticket: Ticket;
  onStart?: () => void;
  onPause?: () => void;
  onComplete?: () => void;
  isLoading: boolean;
}

function TaskCard({ ticket, onStart, onPause, onComplete, isLoading }: TaskCardProps) {
  const isRunning = ticket.status === 'in_progress';
  const elapsed = useTimer(ticket.startedAt, ticket.totalWorkTimeMs || 0, isRunning);

  const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    pending: 'default',
    assigned: 'info',
    in_progress: 'warning',
    on_hold: 'default',
    resolved: 'success',
    closed: 'default',
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-gray-900">{ticket.title}</h3>
          <p className="mt-1 text-sm text-gray-500">{ticket.description.slice(0, 100)}...</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant[ticket.status] || 'default'}>{ticket.status.replace('_', ' ')}</Badge>
            <Badge variant={ticket.priority === 'urgent' ? 'danger' : ticket.priority === 'high' ? 'warning' : 'default'}>
              {ticket.priority}
            </Badge>
            {ticket.slaDeadline && new Date(ticket.slaDeadline) < new Date() && (
              <Badge variant="danger"><AlertTriangle className="mr-1 h-3 w-3" /> SLA Breached</Badge>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            {formatDuration(elapsed)}
          </div>
        </div>
      </div>

      {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
        <div className="mt-4 flex gap-2">
          {ticket.status === 'in_progress' ? (
            <>
              <Button variant="outline" size="sm" onClick={onPause} isLoading={isLoading}>
                <Pause className="mr-1 h-4 w-4" /> Pause
              </Button>
              <Button size="sm" onClick={onComplete} isLoading={isLoading}>
                <CheckCircle className="mr-1 h-4 w-4" /> Complete
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={onStart} isLoading={isLoading}>
              <Play className="mr-1 h-4 w-4" /> Start Work
            </Button>
          )}
        </div>
      )}

      {ticket.address && (
        <div className="mt-3 text-sm text-gray-500">
          <strong>Address:</strong> {ticket.address}
        </div>
      )}
      {ticket.contactName && (
        <div className="mt-1 text-sm text-gray-500">
          <strong>Contact:</strong> {ticket.contactName} {ticket.contactPhone && `(${ticket.contactPhone})`}
        </div>
      )}
    </Card>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { assignmentsApi } from '@/api/assignments';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/lib/utils';
import type { Assignment } from '@/types';

function getAssignmentVariant(status: string) {
  const map: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger'> = {
    pending: 'warning',
    accepted: 'primary',
    completed: 'success',
    declined: 'danger',
  };
  return map[status] || 'default';
}

export function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [declineModal, setDeclineModal] = useState<string | null>(null);
  const [completeModal, setCompleteModal] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [acting, setActing] = useState(false);

  const load = () => {
    assignmentsApi
      .getMy()
      .then((res) => setAssignments(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const handleAccept = async (id: string) => {
    setActing(true);
    try {
      await assignmentsApi.accept(id);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setActing(false);
    }
  };

  const handleDecline = async () => {
    if (!declineModal) return;
    setActing(true);
    try {
      await assignmentsApi.decline(declineModal, reason);
      setDeclineModal(null);
      setReason('');
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setActing(false);
    }
  };

  const handleComplete = async () => {
    if (!completeModal) return;
    setActing(true);
    try {
      await assignmentsApi.complete(completeModal, notes);
      setCompleteModal(null);
      setNotes('');
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setActing(false);
    }
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div>
      <Header title="My Assignments" description={`${assignments.length} assignments`} />

      {assignments.length === 0 ? (
        <EmptyState title="No assignments" description="You have no current assignments" />
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between">
                <div>
                  <Link to={`/tickets/${a.ticketId}`} className="text-lg font-medium text-gray-900 hover:text-primary">
                    {a.ticket?.title || `Ticket ${a.ticketId.slice(0, 8)}...`}
                  </Link>
                  <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                    <Badge variant={getAssignmentVariant(a.status)}>{a.status}</Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDateTime(a.assignedAt)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {a.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => handleAccept(a.id)} isLoading={acting}>
                        <CheckCircle className="h-4 w-4" />
                        Accept
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeclineModal(a.id)}>
                        <XCircle className="h-4 w-4" />
                        Decline
                      </Button>
                    </>
                  )}
                  {a.status === 'accepted' && (
                    <Button size="sm" variant="secondary" onClick={() => setCompleteModal(a.id)}>
                      <CheckCircle className="h-4 w-4" />
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={!!declineModal} onClose={() => setDeclineModal(null)} title="Decline Assignment">
        <div className="space-y-4">
          <Input label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why are you declining?" required />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeclineModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDecline} isLoading={acting}>Decline</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!completeModal} onClose={() => setCompleteModal(null)} title="Complete Assignment">
        <div className="space-y-4">
          <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Completion notes (optional)" />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCompleteModal(null)}>Cancel</Button>
            <Button onClick={handleComplete} isLoading={acting}>Complete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

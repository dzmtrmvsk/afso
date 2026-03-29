import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, User, AlertTriangle } from 'lucide-react';
import { ticketsApi } from '@/api/tickets';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { PageSpinner } from '@/components/ui/Spinner';
import { formatDateTime } from '@/lib/utils';
import { statusOptions, getStatusVariant, getPriorityVariant } from '@/lib/ticket-helpers';
import type { Ticket } from '@/types';

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    ticketsApi
      .getById(id)
      .then((res) => setTicket(res.data))
      .catch(() => navigate('/tickets'))
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !newStatus) return;
    try {
      const res = await ticketsApi.updateStatus(id, newStatus);
      setTicket(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <PageSpinner />;
  if (!ticket) return null;

  return (
    <div>
      <div className="mb-4">
        <Link to="/tickets" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Tickets
        </Link>
      </div>

      <Header
        title={ticket.title}
        actions={
          <div className="flex items-center gap-3">
            <Select
              options={statusOptions}
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-44"
            />
            <Link to={`/tickets/${ticket.id}/edit`}>
              <Button variant="outline">Edit</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="mb-3 text-sm font-medium text-gray-500">Description</h3>
            <p className="whitespace-pre-wrap text-gray-700">{ticket.description}</p>
          </Card>

          {ticket.assignment && (
            <Card>
              <h3 className="mb-3 text-sm font-medium text-gray-500">Assignment</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-sm font-medium text-primary">
                  {ticket.assignment.agent?.firstName?.charAt(0)}
                  {ticket.assignment.agent?.lastName?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {ticket.assignment.agent?.firstName} {ticket.assignment.agent?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">Status: {ticket.assignment.status}</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="mb-4 text-sm font-medium text-gray-500">Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <Badge variant={getStatusVariant(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Priority</span>
                <Badge variant={getPriorityVariant(ticket.priority)}>{ticket.priority}</Badge>
              </div>
              {ticket.slaBreached && (
                <div className="flex items-center gap-2 rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">
                  <AlertTriangle className="h-4 w-4" />
                  SLA Breached
                </div>
              )}
              {ticket.slaDeadline && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">SLA Deadline</span>
                  <span className="text-sm text-gray-700">{formatDateTime(ticket.slaDeadline)}</span>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-sm font-medium text-gray-500">Info</h3>
            <div className="space-y-3 text-sm">
              {ticket.customer && (
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4 text-gray-400" />
                  {ticket.customer.name}
                </div>
              )}
              {ticket.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {ticket.location.name}
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4 text-gray-400" />
                Created {formatDateTime(ticket.createdAt)}
              </div>
              {ticket.resolvedAt && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4 text-gray-400" />
                  Resolved {formatDateTime(ticket.resolvedAt)}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

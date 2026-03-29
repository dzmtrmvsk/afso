import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { ticketsApi } from '@/api/tickets';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/lib/utils';
import { statusOptions, priorityOptions, getStatusVariant, getPriorityVariant } from '@/lib/ticket-helpers';
import type { Ticket, TicketStatus, TicketPriority } from '@/types';

export function TicketsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const status = (searchParams.get('status') as TicketStatus) || undefined;
  const priority = (searchParams.get('priority') as TicketPriority) || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    setIsLoading(true);
    ticketsApi
      .getAll({ status, priority, page, limit: 20 })
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data)) {
          setTickets(data);
          setTotalCount(data.length);
        } else {
          setTickets(data.data || []);
          setTotalCount(data.total ?? data.totalCount ?? 0);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [status, priority, page]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    setSearchParams(params);
  };

  return (
    <div>
      <Header
        title="Tickets"
        description={`${totalCount} total tickets`}
        actions={
          <Link to="/tickets/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Ticket
            </Button>
          </Link>
        }
      />

      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Search className="h-4 w-4" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          <Select
            options={statusOptions}
            placeholder="All Statuses"
            value={status || ''}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-40"
          />
          <Select
            options={priorityOptions}
            placeholder="All Priorities"
            value={priority || ''}
            onChange={(e) => updateFilter('priority', e.target.value)}
            className="w-40"
          />
        </div>
      </Card>

      {isLoading ? (
        <PageSpinner />
      ) : tickets.length === 0 ? (
        <EmptyState
          title="No tickets found"
          description="Create your first ticket or adjust filters"
          action={
            <Link to="/tickets/new">
              <Button>
                <Plus className="h-4 w-4" />
                New Ticket
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Title</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Priority</th>
                <th className="px-4 py-3 font-medium text-gray-500">Customer</th>
                <th className="px-4 py-3 font-medium text-gray-500">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/tickets/${ticket.id}`} className="font-medium text-gray-900 hover:text-primary">
                      {ticket.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatusVariant(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getPriorityVariant(ticket.priority)}>{ticket.priority}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{ticket.customer?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDateTime(ticket.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalCount > 20 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
              <span className="text-sm text-gray-500">
                Page {page} of {Math.ceil(totalCount / 20)}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('page', String(page - 1));
                    setSearchParams(params);
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= Math.ceil(totalCount / 20)}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('page', String(page + 1));
                    setSearchParams(params);
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

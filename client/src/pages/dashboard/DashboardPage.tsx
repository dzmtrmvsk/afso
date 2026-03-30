import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Users, AlertTriangle, CheckCircle, Clock, TrendingUp, Plus, ArrowRight, Crown, Hammer, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsApi } from '@/api/analytics';
import { ticketsApi } from '@/api/tickets';
import { organizationsApi } from '@/api/organizations';
import { registrationKeysApi } from '@/api/registrationKeys';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { formatDateTime } from '@/lib/utils';
import { getStatusVariant, getPriorityVariant } from '@/lib/ticket-helpers';
import type { DashboardStats, Ticket as TicketType, Organization, RegistrationKey } from '@/types';

function StatCard({ title, value, icon: Icon, subtitle, color }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
  color: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );
}

const defaultStats: DashboardStats = {
  tickets: { total: 0, resolved: 0, pending: 0, slaBreached: 0 },
  agents: { total: 0, active: 0, averageLoad: 0 },
  sla: { complianceRate: 100 },
};

function ManagerDashboard() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [recentTickets, setRecentTickets] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      analyticsApi.getDashboard(),
      ticketsApi.getAll({ page: 1, limit: 5 }),
    ]).then(([statsRes, ticketsRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (ticketsRes.status === 'fulfilled') {
        const d = ticketsRes.value.data;
        setRecentTickets(Array.isArray(d) ? d : d.data || []);
      }
    }).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <PageSpinner />;

  return (
    <>
      <Header
        title="Dashboard"
        description="Overview of your field service operations"
        actions={
          <Link to="/tickets/new">
            <Button><Plus className="h-4 w-4" /> New Ticket</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Tickets" value={stats.tickets.total} icon={Ticket} subtitle="Last 30 days" color="bg-primary" />
        <StatCard title="Resolved" value={stats.tickets.resolved} icon={CheckCircle} subtitle={`${stats.tickets.total > 0 ? ((stats.tickets.resolved / stats.tickets.total) * 100).toFixed(0) : 0}% of total`} color="bg-green-500" />
        <StatCard title="Pending" value={stats.tickets.pending} icon={Clock} subtitle="Awaiting action" color="bg-amber-500" />
        <StatCard title="SLA Breached" value={stats.tickets.slaBreached} icon={AlertTriangle} subtitle="Needs attention" color="bg-red-500" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Tickets</h3>
            <Link to="/tickets" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {recentTickets.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              No tickets yet. <Link to="/tickets/new" className="font-medium text-primary hover:text-primary-hover">Create your first ticket</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTickets.map((t) => (
                <Link key={t.id} to={`/tickets/${t.id}`} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">{t.title}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(t.createdAt)}</p>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <Badge variant={getPriorityVariant(t.priority)}>{t.priority}</Badge>
                    <Badge variant={getStatusVariant(t.status)}>{t.status.replace('_', ' ')}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Team Overview</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5">
                <span className="text-sm text-gray-600">Total Agents</span>
                <span className="font-semibold text-gray-900">{stats.agents.total}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5">
                <span className="text-sm text-gray-600">Active Now</span>
                <span className="font-semibold text-green-600">{stats.agents.active}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5">
                <span className="text-sm text-gray-600">Avg Load</span>
                <span className="font-semibold text-gray-900">{stats.agents.averageLoad}</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900">SLA Compliance</h3>
            </div>
            <div className="flex flex-col items-center py-4">
              <div className="relative h-28 w-28">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-gray-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path className={stats.sla.complianceRate >= 90 ? 'text-green-500' : stats.sla.complianceRate >= 70 ? 'text-amber-500' : 'text-red-500'} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${stats.sla.complianceRate}, 100`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{stats.sla.complianceRate}%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function AgentDashboard() {
  const [tasks, setTasks] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ticketsApi.getMyTasks()
      .then((res) => setTasks(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <PageSpinner />;

  const activeTasks = tasks.filter((t) => t.status !== 'resolved' && t.status !== 'closed');
  const pendingTasks = activeTasks.filter((t) => t.status === 'pending' || t.status === 'assigned');
  const inProgressTasks = activeTasks.filter((t) => t.status === 'in_progress');

  return (
    <>
      <Header title="My Dashboard" description="Your assigned tasks and work overview" />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard title="Active Tasks" value={activeTasks.length} icon={Hammer} subtitle="In your queue" color="bg-primary" />
        <StatCard title="Pending" value={pendingTasks.length} icon={Clock} subtitle="Ready to start" color="bg-amber-500" />
        <StatCard title="In Progress" value={inProgressTasks.length} icon={TrendingUp} subtitle="Working now" color="bg-green-500" />
      </div>

      <div className="mt-6">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">My Tasks</h3>
            <Link to="/my-tasks" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {activeTasks.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              No tasks assigned yet. Check back later!
            </div>
          ) : (
            <div className="space-y-3">
              {activeTasks.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">{t.title}</p>
                    <p className="text-xs text-gray-400">{t.address || 'No address'}</p>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <Badge variant={getPriorityVariant(t.priority)}>{t.priority}</Badge>
                    <Badge variant={getStatusVariant(t.status)}>{t.status.replace('_', ' ')}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

function SuperAdminDashboard() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [keys, setKeys] = useState<RegistrationKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      organizationsApi.getAll(),
      registrationKeysApi.getAll(),
    ]).then(([orgsRes, keysRes]) => {
      setOrgs(Array.isArray(orgsRes.data) ? orgsRes.data : []);
      setKeys(Array.isArray(keysRes.data) ? keysRes.data : []);
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <PageSpinner />;

  const usedKeys = keys.filter((k) => k.used).length;
  const unusedKeys = keys.length - usedKeys;

  return (
    <>
      <Header
        title="Super Admin Dashboard"
        description="System-wide overview"
        actions={
          <Link to="/superadmin">
            <Button variant="outline"><Crown className="h-4 w-4" /> Manage System</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard title="Organizations" value={orgs.length} icon={Building2} subtitle="Total registered" color="bg-primary" />
        <StatCard title="Registration Keys" value={keys.length} icon={CheckCircle} subtitle={`${usedKeys} used, ${unusedKeys} unused`} color="bg-green-500" />
        <StatCard title="Pending Keys" value={unusedKeys} icon={Clock} subtitle="Available for use" color="bg-amber-500" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Organizations</h3>
            <Link to="/superadmin" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {orgs.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">No organizations yet</div>
          ) : (
            <div className="space-y-3">
              {orgs.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{o.name}</p>
                    <p className="text-xs text-gray-400">{o.slug}</p>
                  </div>
                  <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Keys</h3>
            <Link to="/superadmin" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover">
              Manage <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {keys.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">No keys generated yet</div>
          ) : (
            <div className="space-y-3">
              {keys.slice(0, 5).map((k) => (
                <div key={k.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{k.organizationName}</p>
                    <code className="text-xs text-gray-400">{k.key.slice(0, 16)}...</code>
                  </div>
                  <Badge variant={k.used ? 'success' : 'default'}>{k.used ? 'Used' : 'Unused'}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

export function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'agent':
      return <AgentDashboard />;
    case 'manager':
    default:
      return <ManagerDashboard />;
  }
}

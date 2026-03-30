import { useEffect, useState } from 'react';
import { Plus, UserCircle, Copy, CheckCircle, Users } from 'lucide-react';
import { usersApi } from '@/api/users';
import { teamsApi } from '@/api/teams';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { getInitials } from '@/lib/utils';
import type { User, Team } from '@/types';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', position: '', teamId: '' });
  const [teamForm, setTeamForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [createdUser, setCreatedUser] = useState<{ firstName: string; lastName: string; email: string; generatedPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const load = () => {
    Promise.all([usersApi.getAll(), teamsApi.getAll()])
      .then(([usersRes, teamsRes]) => {
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setTeams(Array.isArray(teamsRes.data) ? teamsRes.data : []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setForm({ email: '', firstName: '', lastName: '', position: '', teamId: '' });
    setError('');
    setCreatedUser(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await usersApi.create(form);
      const { firstName, lastName, email, generatedPassword } = res.data;
      setCreatedUser({ firstName, lastName, email, generatedPassword });
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await teamsApi.create(teamForm);
      setTeamModalOpen(false);
      setTeamForm({ name: '', description: '' });
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create team');
    } finally {
      setSaving(false);
    }
  };

  const copyPassword = () => {
    if (createdUser?.generatedPassword) {
      navigator.clipboard.writeText(createdUser.generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) return <PageSpinner />;

  const teamOptions = teams.map((t) => ({ value: t.id, label: t.name }));

  return (
    <div>
      <Header
        title="Users"
        description={`${users.length} users in your organization`}
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add User</Button>}
      />

      {users.length === 0 ? (
        <EmptyState
          title="No users yet"
          description="Add team members to your organization"
          icon={<UserCircle className="h-12 w-12" />}
          action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add User</Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">User</th>
                <th className="px-4 py-3 font-medium text-gray-500">Position</th>
                <th className="px-4 py-3 font-medium text-gray-500">Team</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Load</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {getInitials(u.firstName, u.lastName)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{u.position || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{u.organization?.name || '—'}</td>
                  <td className="px-4 py-3"><Badge variant={u.status === 'active' ? 'success' : 'default'}>{u.status}</Badge></td>
                  <td className="px-4 py-3 text-gray-700">{u.currentLoad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Agent">
        {!createdUser ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} required />
              <Input label="Last Name" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} required />
            </div>
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
            <Input label="Position" value={form.position} onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))} placeholder="e.g. Senior Technician" />
            <div className="flex items-end gap-2">
              <Select
                label="Team (optional)"
                className="flex-1"
                options={[{ value: '', label: '— No team —' }, ...teamOptions]}
                value={form.teamId}
                onChange={(e) => setForm((p) => ({ ...p, teamId: e.target.value }))}
              />
              <Button variant="outline" type="button" onClick={() => setTeamModalOpen(true)}><Users className="h-4 w-4" /></Button>
            </div>
            <p className="text-xs text-gray-500">Password will be generated automatically.</p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={saving}>Create Agent</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              <p className="font-medium">User created successfully!</p>
            </div>
            <div className="space-y-2">
              <p><strong>Name:</strong> {createdUser.firstName} {createdUser.lastName}</p>
              <p><strong>Email:</strong> {createdUser.email}</p>
              <div className="flex items-center gap-2">
                <strong>Generated Password:</strong>
                <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm">{createdUser.generatedPassword}</code>
                <button onClick={copyPassword} className="text-gray-400 hover:text-gray-600">
                  {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-amber-600">Important: Save this password! It won&apos;t be shown again.</p>
            <div className="flex justify-end pt-2">
              <Button onClick={() => { setModalOpen(false); setCreatedUser(null); }}>Done</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={teamModalOpen} onClose={() => setTeamModalOpen(false)} title="Create Team">
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <Input label="Team Name" value={teamForm.name} onChange={(e) => setTeamForm((p) => ({ ...p, name: e.target.value }))} required />
          <Input label="Description" value={teamForm.description} onChange={(e) => setTeamForm((p) => ({ ...p, description: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setTeamModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={saving}>Create Team</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

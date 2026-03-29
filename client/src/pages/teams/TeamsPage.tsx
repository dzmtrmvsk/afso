import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Users, UserPlus, X } from 'lucide-react';
import { teamsApi } from '@/api/teams';
import { usersApi } from '@/api/users';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { getInitials } from '@/lib/utils';
import type { Team, User } from '@/types';

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [orgUsers, setOrgUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [membersModalTeam, setMembersModalTeam] = useState<Team | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  const load = () => {
    Promise.all([teamsApi.getAll(), usersApi.getAll()])
      .then(([teamsRes, usersRes]) => {
        setTeams(Array.isArray(teamsRes.data) ? teamsRes.data : []);
        setOrgUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (t: Team) => {
    setEditingId(t.id);
    setForm({ name: t.name, description: t.description || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await teamsApi.update(editingId, form);
      } else {
        await teamsApi.create(form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this team?')) return;
    await teamsApi.remove(id);
    load();
  };

  const openMembers = (team: Team) => {
    setMembersModalTeam(team);
    setSelectedUserId('');
  };

  const handleAddMember = async () => {
    if (!membersModalTeam || !selectedUserId) return;
    try {
      await teamsApi.addMember(membersModalTeam.id, selectedUserId);
      load();
      const updated = await teamsApi.getAll();
      const fresh = (Array.isArray(updated.data) ? updated.data : []).find((t: Team) => t.id === membersModalTeam.id);
      if (fresh) setMembersModalTeam(fresh);
      setSelectedUserId('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!membersModalTeam) return;
    try {
      await teamsApi.removeMember(membersModalTeam.id, userId);
      load();
      const updated = await teamsApi.getAll();
      const fresh = (Array.isArray(updated.data) ? updated.data : []).find((t: Team) => t.id === membersModalTeam.id);
      if (fresh) setMembersModalTeam(fresh);
    } catch (err) {
      console.error(err);
    }
  };

  const memberIds = new Set(membersModalTeam?.members?.map((m: User) => m.id) || []);
  const availableUsers = orgUsers.filter((u) => !memberIds.has(u.id));

  if (isLoading) return <PageSpinner />;

  return (
    <div>
      <Header
        title="Teams"
        description={`${teams.length} teams in your organization`}
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Team</Button>}
      />

      {teams.length === 0 ? (
        <EmptyState title="No teams yet" description="Create teams to organize your users" action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Team</Button>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{team.name}</h3>
                    {team.description && <p className="text-sm text-gray-500">{team.description}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(team)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(team.id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1">
                {(team.members || []).slice(0, 5).map((m: User) => (
                  <div key={m.id} className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-600" title={`${m.firstName} ${m.lastName}`}>
                    {getInitials(m.firstName, m.lastName)}
                  </div>
                ))}
                {(team.members?.length || 0) > 5 && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-[10px] text-gray-500">+{team.members!.length - 5}</div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-gray-500">{team.members?.length || 0} members</span>
                <Button variant="outline" size="sm" onClick={() => openMembers(team)}><UserPlus className="h-3.5 w-3.5" /> Manage</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Team' : 'Add Team'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <Input label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={saving}>{editingId ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!membersModalTeam} onClose={() => setMembersModalTeam(null)} title={`Members — ${membersModalTeam?.name || ''}`}>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Select
              className="flex-1"
              placeholder="Select user to add..."
              options={availableUsers.map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName} (${u.role})` }))}
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            />
            <Button onClick={handleAddMember} disabled={!selectedUserId}><UserPlus className="h-4 w-4" /> Add</Button>
          </div>

          {(membersModalTeam?.members || []).length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">No members in this team yet</p>
          ) : (
            <div className="space-y-2">
              {(membersModalTeam?.members || []).map((m: User) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {getInitials(m.firstName, m.lastName)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.firstName} {m.lastName}</p>
                      <p className="text-xs text-gray-500">{m.role}</p>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveMember(m.id)} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

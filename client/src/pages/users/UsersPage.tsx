import { useEffect, useState } from 'react';
import { Plus, UserCircle } from 'lucide-react';
import { usersApi } from '@/api/users';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { getInitials } from '@/lib/utils';
import type { User } from '@/types';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'dispatcher', label: 'Dispatcher' },
  { value: 'agent', label: 'Agent' },
];

const roleVariant = (role: string) => {
  switch (role) {
    case 'admin': return 'danger' as const;
    case 'manager': return 'warning' as const;
    case 'dispatcher': return 'info' as const;
    default: return 'default' as const;
  }
};

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'agent' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    usersApi
      .getAll()
      .then((res) => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setForm({ email: '', password: '', firstName: '', lastName: '', role: 'agent' });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await usersApi.create(form);
      setModalOpen(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <PageSpinner />;

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
                <th className="px-4 py-3 font-medium text-gray-500">Role</th>
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
                  <td className="px-4 py-3"><Badge variant={roleVariant(u.role)}>{u.role}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={u.status === 'active' ? 'success' : 'default'}>{u.status}</Badge></td>
                  <td className="px-4 py-3 text-gray-700">{u.currentLoad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add User">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} required />
            <Input label="Last Name" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} required />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
          <Select label="Role" options={roleOptions} value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={saving}>Create User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

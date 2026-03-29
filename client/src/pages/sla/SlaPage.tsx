import { useEffect, useState } from 'react';
import { Plus, Pencil, Shield } from 'lucide-react';
import { slaApi } from '@/api/sla';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { priorityOptions, getPriorityVariant } from '@/lib/ticket-helpers';
import type { SlaPolicy } from '@/types';

export function SlaPage() {
  const [policies, setPolicies] = useState<SlaPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', priority: 'medium', responseTimeMinutes: 60, resolutionTimeMinutes: 480 });
  const [saving, setSaving] = useState(false);

  const load = () => {
    slaApi
      .getAll()
      .then((res) => setPolicies(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', description: '', priority: 'medium', responseTimeMinutes: 60, resolutionTimeMinutes: 480 });
    setModalOpen(true);
  };

  const openEdit = (p: SlaPolicy) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || '',
      priority: p.priority,
      responseTimeMinutes: p.responseTimeMinutes,
      resolutionTimeMinutes: p.resolutionTimeMinutes,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await slaApi.update(editingId, form as unknown as Partial<SlaPolicy>);
      } else {
        await slaApi.create(form as unknown as Partial<SlaPolicy>);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div>
      <Header
        title="SLA Policies"
        description={`${policies.length} policies`}
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Policy</Button>}
      />

      {policies.length === 0 ? (
        <EmptyState title="No SLA policies yet" icon={<Shield className="h-12 w-12" />} action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Policy</Button>} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 font-medium text-gray-500">Priority</th>
                <th className="px-4 py-3 font-medium text-gray-500">Response Time</th>
                <th className="px-4 py-3 font-medium text-gray-500">Resolution Time</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {policies.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    {p.description && <p className="text-xs text-gray-500">{p.description}</p>}
                  </td>
                  <td className="px-4 py-3"><Badge variant={getPriorityVariant(p.priority)}>{p.priority}</Badge></td>
                  <td className="px-4 py-3 text-gray-700">{formatTime(p.responseTimeMinutes)}</td>
                  <td className="px-4 py-3 text-gray-700">{formatTime(p.resolutionTimeMinutes)}</td>
                  <td className="px-4 py-3"><Badge variant={p.isActive ? 'success' : 'default'}>{p.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(p)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Pencil className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit SLA Policy' : 'Add SLA Policy'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <Input label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          <Select label="Priority" options={priorityOptions} value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Response Time (min)" type="number" value={String(form.responseTimeMinutes)} onChange={(e) => setForm((p) => ({ ...p, responseTimeMinutes: parseInt(e.target.value) || 0 }))} required />
            <Input label="Resolution Time (min)" type="number" value={String(form.resolutionTimeMinutes)} onChange={(e) => setForm((p) => ({ ...p, resolutionTimeMinutes: parseInt(e.target.value) || 0 }))} required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={saving}>{editingId ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

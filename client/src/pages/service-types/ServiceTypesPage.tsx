import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Wrench } from 'lucide-react';
import { serviceTypesApi } from '@/api/service-types';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { ServiceType } from '@/types';

export function ServiceTypesPage() {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    serviceTypesApi
      .getAll()
      .then((res) => setServiceTypes(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (s: ServiceType) => {
    setEditingId(s.id);
    setForm({ name: s.name, description: s.description || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await serviceTypesApi.update(editingId, form);
      } else {
        await serviceTypesApi.create(form);
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
    if (!confirm('Delete this service type?')) return;
    await serviceTypesApi.remove(id);
    load();
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div>
      <Header
        title="Service Types"
        description={`${serviceTypes.length} service types`}
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Service Type</Button>}
      />

      {serviceTypes.length === 0 ? (
        <EmptyState title="No service types yet" icon={<Wrench className="h-12 w-12" />} action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add</Button>} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 font-medium text-gray-500">Description</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {serviceTypes.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.description || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(s)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(s.id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Service Type' : 'Add Service Type'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <Input label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={saving}>{editingId ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

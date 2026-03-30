import { useEffect, useState } from 'react';
import { Plus, Copy, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import type { Organization, RegistrationKey } from '@/types';
import { organizationsApi } from '@/api/organizations';
import { registrationKeysApi } from '@/api/registrationKeys';

export function SuperAdminPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [keys, setKeys] = useState<RegistrationKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = () => {
    Promise.all([organizationsApi.getAll(), registrationKeysApi.getAll()])
      .then(([orgsRes, keysRes]) => {
        setOrgs(orgsRes.data);
        setKeys(keysRes.data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await registrationKeysApi.generate(orgName);
      setModalOpen(false);
      setOrgName('');
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteKey = async (id: string) => {
    if (!confirm('Delete this key?')) return;
    await registrationKeysApi.delete(id);
    load();
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div>
      <Header
        title="Super Admin"
        description={`${orgs.length} organizations, ${keys.length} registration keys`}
        actions={<Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Generate Key</Button>}
      />

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Organizations</h2>
        {orgs.length === 0 ? (
          <p className="text-gray-500">No organizations yet</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orgs.map((org) => (
              <Card key={org.id}>
                <h3 className="font-medium text-gray-900">{org.name}</h3>
                <p className="text-sm text-gray-500">{org.slug}</p>
                <p className="mt-2 text-xs text-gray-400">Created {new Date(org.createdAt).toLocaleDateString()}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Registration Keys</h2>
        {keys.length === 0 ? (
          <p className="text-gray-500">No keys generated yet</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Organization</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Key</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Used By</th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{k.organizationName}</td>
                    <td className="px-4 py-3 font-mono text-xs">{k.key}</td>
                    <td className="px-4 py-3">
                      {k.used ? (
                        <Badge variant="success"><CheckCircle className="mr-1 h-3 w-3" /> Used</Badge>
                      ) : (
                        <Badge variant="default"><XCircle className="mr-1 h-3 w-3" /> Unused</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{k.usedByEmail || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => copyKey(k.key, k.id)}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          title="Copy key"
                        >
                          <Copy className="h-4 w-4" />
                          {copiedId === k.id && <span className="ml-1 text-xs text-green-600">Copied!</span>}
                        </button>
                        <button
                          onClick={() => deleteKey(k.id)}
                          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          title="Delete key"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Generate Registration Key">
        <form onSubmit={handleGenerateKey} className="space-y-4">
          <Input
            label="Organization Name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="e.g. Acme Corp"
            required
          />
          <p className="text-xs text-gray-500">This will create a one-time key for organization registration.</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={saving}>Generate</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

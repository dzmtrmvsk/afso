import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ticketsApi } from '@/api/tickets';
import { teamsApi } from '@/api/teams';
import { slaApi } from '@/api/sla';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { priorityOptions } from '@/lib/ticket-helpers';
import type { Team, SlaPolicy } from '@/types';

export function CreateTicketPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [slaPolicies, setSlaPolicies] = useState<SlaPolicy[]>([]);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [isNewServiceType, setIsNewServiceType] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    customerId: '',
    customerName: '',
    customerEmail: '',
    serviceTypeId: '',
    serviceTypeName: '',
    teamId: '',
    slaPolicyId: '',
    estimatedDurationMinutes: 60,
    contactName: '',
    contactPhone: '',
    address: '',
  });

  useEffect(() => {
    Promise.all([
      teamsApi.getAll().catch(() => ({ data: [] })),
      slaApi.getAll().catch(() => ({ data: [] })),
    ]).then(([t, sla]) => {
      setTeams(Array.isArray(t.data) ? t.data : []);
      setSlaPolicies(Array.isArray(sla.data) ? sla.data : []);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        priority: form.priority as 'low' | 'medium' | 'high' | 'urgent',
        customerId: isNewCustomer ? undefined : (form.customerId || undefined),
        customerName: isNewCustomer ? form.customerName : undefined,
        customerEmail: isNewCustomer ? form.customerEmail : undefined,
        serviceTypeId: isNewServiceType ? undefined : (form.serviceTypeId || undefined),
        serviceTypeName: isNewServiceType ? form.serviceTypeName : undefined,
        teamId: form.teamId || undefined,
        slaPolicyId: form.slaPolicyId || undefined,
        estimatedDurationMinutes: form.estimatedDurationMinutes,
        contactName: form.contactName || undefined,
        contactPhone: form.contactPhone || undefined,
        address: form.address || undefined,
      };
      await ticketsApi.create(payload);
      navigate('/tickets');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'estimatedDurationMinutes' ? parseInt(value) || 0 : value }));
  };

  return (
    <div>
      <div className="mb-4">
        <Link to="/tickets" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Tickets
        </Link>
      </div>

      <Header title="Create Ticket" description="Fill in all details. Customer and service type will be created automatically if new." />

      <Card className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Basic Info</h3>
            <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                required
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Priority" name="priority" options={priorityOptions} value={form.priority} onChange={handleChange} />
              <Input label="Estimated Duration (min)" name="estimatedDurationMinutes" type="number" value={String(form.estimatedDurationMinutes)} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-4 border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Customer</h3>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="newCustomer"
                checked={isNewCustomer}
                onChange={(e) => setIsNewCustomer(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="newCustomer" className="text-sm text-gray-700">New customer</label>
            </div>
            {isNewCustomer ? (
              <>
                <Input label="Customer Name" name="customerName" value={form.customerName} onChange={handleChange} placeholder="e.g. John Smith" required={isNewCustomer} />
                <Input label="Customer Email" name="customerEmail" type="email" value={form.customerEmail} onChange={handleChange} placeholder="customer@example.com" required={isNewCustomer} />
              </>
            ) : (
              <Input label="Customer ID (optional)" name="customerId" value={form.customerId} onChange={handleChange} placeholder="Existing customer ID if known" />
            )}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Contact Name" name="contactName" value={form.contactName} onChange={handleChange} placeholder="Person to contact on site" />
              <Input label="Contact Phone" name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="Phone number" />
            </div>
          </div>

          <div className="space-y-4 border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Service & Assignment</h3>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="newServiceType"
                checked={isNewServiceType}
                onChange={(e) => setIsNewServiceType(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="newServiceType" className="text-sm text-gray-700">New service type</label>
            </div>
            {isNewServiceType ? (
              <Input label="Service Type Name" name="serviceTypeName" value={form.serviceTypeName} onChange={handleChange} placeholder="e.g. Phone Repair" required={isNewServiceType} />
            ) : (
              <Input label="Service Type ID (optional)" name="serviceTypeId" value={form.serviceTypeId} onChange={handleChange} placeholder="Existing service type ID" />
            )}
            <Select
              label="Assign to Team"
              name="teamId"
              options={[{ value: '', label: '— Auto assign —' }, ...teams.map((t) => ({ value: t.id, label: t.name }))]}
              value={form.teamId}
              onChange={handleChange}
            />
            <Select
              label="SLA Policy (optional)"
              name="slaPolicyId"
              options={[{ value: '', label: '— Default —' }, ...slaPolicies.map((s) => ({ value: s.id, label: s.name }))]}
              value={form.slaPolicyId}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-4 border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Location</h3>
            <Input label="Address" name="address" value={form.address} onChange={handleChange} placeholder="Full address where service is needed" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link to="/tickets">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit" isLoading={isLoading}>Create Ticket</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

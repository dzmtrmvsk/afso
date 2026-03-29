import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ticketsApi } from '@/api/tickets';
import { customersApi } from '@/api/customers';
import { locationsApi } from '@/api/locations';
import { serviceTypesApi } from '@/api/service-types';
import { slaApi } from '@/api/sla';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { priorityOptions } from '@/lib/ticket-helpers';
import type { Customer, Location, ServiceType, SlaPolicy } from '@/types';

export function CreateTicketPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [slaPolicies, setSlaPolicies] = useState<SlaPolicy[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    customerId: '',
    locationId: '',
    serviceTypeId: '',
    slaPolicyId: '',
    estimatedDurationMinutes: 0,
  });

  useEffect(() => {
    Promise.all([
      customersApi.getAll().catch(() => ({ data: [] })),
      locationsApi.getAll().catch(() => ({ data: [] })),
      serviceTypesApi.getAll().catch(() => ({ data: [] })),
      slaApi.getAll().catch(() => ({ data: [] })),
    ]).then(([c, l, st, sla]) => {
      setCustomers(Array.isArray(c.data) ? c.data : []);
      setLocations(Array.isArray(l.data) ? l.data : []);
      setServiceTypes(Array.isArray(st.data) ? st.data : []);
      setSlaPolicies(Array.isArray(sla.data) ? sla.data : []);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        ...form,
        customerId: form.customerId || undefined,
        locationId: form.locationId || undefined,
        serviceTypeId: form.serviceTypeId || undefined,
        slaPolicyId: form.slaPolicyId || undefined,
      };
      await ticketsApi.create(payload as Parameters<typeof ticketsApi.create>[0]);
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

      <Header title="Create Ticket" />

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Input
              label="Estimated Duration (min)"
              name="estimatedDurationMinutes"
              type="number"
              value={String(form.estimatedDurationMinutes)}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Customer"
              name="customerId"
              options={customers.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Select customer"
              value={form.customerId}
              onChange={handleChange}
            />
            <Select
              label="Location"
              name="locationId"
              options={locations.map((l) => ({ value: l.id, label: l.name }))}
              placeholder="Select location"
              value={form.locationId}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Service Type"
              name="serviceTypeId"
              options={serviceTypes.map((s) => ({ value: s.id, label: s.name }))}
              placeholder="Select service type"
              value={form.serviceTypeId}
              onChange={handleChange}
            />
            <Select
              label="SLA Policy"
              name="slaPolicyId"
              options={slaPolicies.map((s) => ({ value: s.id, label: s.name }))}
              placeholder="Select SLA policy"
              value={form.slaPolicyId}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
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

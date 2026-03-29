import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getInitials } from '@/lib/utils';
import { Mail, Phone, Building2, Shield, Calendar } from 'lucide-react';

const roleVariant = (role: string) => {
  switch (role) {
    case 'admin': return 'danger' as const;
    case 'manager': return 'warning' as const;
    case 'dispatcher': return 'info' as const;
    default: return 'default' as const;
  }
};

const roleLabel = (role: string) => {
  switch (role) {
    case 'admin': return 'Administrator';
    case 'manager': return 'Manager';
    case 'dispatcher': return 'Dispatcher';
    case 'agent': return 'Field Agent';
    default: return role;
  }
};

export function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div>
      <Header title="Profile" description="Your account information" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center py-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h2>
            <Badge variant={roleVariant(user.role)} className="mt-2">{roleLabel(user.role)}</Badge>
            <Badge variant={user.status === 'active' ? 'success' : 'default'} className="mt-1">{user.status}</Badge>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Account Details</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{user.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Role</p>
                <p className="font-medium text-gray-900">{roleLabel(user.role)}</p>
              </div>
            </div>

            {user.organization && (
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                <Building2 className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Organization</p>
                  <p className="font-medium text-gray-900">{user.organization.name}</p>
                </div>
              </div>
            )}

            {user.role === 'agent' && (
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Current Load</p>
                  <p className="font-medium text-gray-900">{user.currentLoad} active assignments</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

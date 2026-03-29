import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  Users,
  Building2,
  MapPin,
  Wrench,
  Shield,
  ClipboardList,
  UserCircle,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: null },
  { name: 'Tickets', href: '/tickets', icon: Ticket, roles: null },
  { name: 'My Assignments', href: '/assignments', icon: ClipboardList, roles: [UserRole.AGENT] },
  { name: 'Customers', href: '/customers', icon: Building2, roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER] },
  { name: 'Teams', href: '/teams', icon: Users, roles: [UserRole.ADMIN, UserRole.MANAGER] },
  { name: 'Users', href: '/users', icon: UserCircle, roles: [UserRole.ADMIN, UserRole.MANAGER] },
  { name: 'Locations', href: '/locations', icon: MapPin, roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER] },
  { name: 'Service Types', href: '/service-types', icon: Wrench, roles: [UserRole.ADMIN, UserRole.MANAGER] },
  { name: 'SLA Policies', href: '/sla', icon: Shield, roles: [UserRole.ADMIN, UserRole.MANAGER] },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  const filteredNav = navigation.filter((item) => {
    if (!item.roles) return true;
    return user && (item.roles as readonly string[]).includes(user.role);
  });

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-white">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
        <Shield className="h-7 w-7 text-blue-400" />
        <span className="text-lg font-bold tracking-tight">AFSO</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {filteredNav.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-sidebar-active text-white' : 'text-gray-300 hover:bg-sidebar-hover hover:text-white',
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <NavLink to="/profile" className="mb-3 flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-sidebar-hover">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-active text-sm font-medium">
            {user?.firstName?.charAt(0)}
            {user?.lastName?.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-xs text-gray-400">{user?.role}</p>
          </div>
        </NavLink>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-sidebar-hover hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

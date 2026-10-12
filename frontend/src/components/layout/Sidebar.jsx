import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  FolderTree,
  Users,
  Navigation,
  Fuel,
  Wrench,
  Boxes,
  Lightbulb,
  Bell,
  History,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER', 'DISPATCHER', 'DRIVER'] },
    { name: 'Vehicles', href: '/vehicles', icon: Truck, roles: ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER', 'DISPATCHER'] },
    { name: 'Categories', href: '/categories', icon: FolderTree, roles: ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'] },
    { name: 'Drivers', href: '/drivers', icon: Users, roles: ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER', 'DISPATCHER'] },
    { name: 'Trips & Dispatch', href: '/trips', icon: Navigation, roles: ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER', 'DISPATCHER', 'DRIVER'] },
    { name: 'Fuel Management', href: '/fuel', icon: Fuel, roles: ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'] },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench, roles: ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'] },
    { name: 'Spare Parts', href: '/spare-parts', icon: Boxes, roles: ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'] },
    { name: 'Recommendations', href: '/recommendations', icon: Lightbulb, roles: ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER', 'DISPATCHER'] },
    { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER', 'DISPATCHER', 'DRIVER'] },
    { name: 'Complaints', href: '/complaints', icon: ShieldCheck, roles: ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER', 'DISPATCHER', 'DRIVER'] },
    { name: 'Audit Trail', href: '/audit', icon: History, roles: ['ADMIN', 'SUPER_ADMIN'] },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900/50">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mr-3 text-emerald-400">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-white tracking-wide text-base">FleetOps</span>
          <span className="block text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Enterprise Fleet</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          if (item.roles && !item.roles.includes(user?.role)) {
            return null;
          }
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 mr-3 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Status Bar */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/60">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
            {user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'US'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.fullName || 'User'}</p>
            <p className="text-xs text-slate-400 truncate capitalize">{user?.role ? user.role.replace('_', ' ') : 'Role'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserRole } from '@/lib/types';
import { authClient } from '@/lib/auth-client';
import { useErpStore } from '@/store/useErpStore';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  ShoppingBag,
  Factory,
  ClipboardList,
  Shield,
  UserCheck,
  LogOut,
  Zap,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const currentRole = useErpStore((s) => s.currentRole);
  const setRole = useErpStore((s) => s.setRole);
  const notification = useErpStore((s) => s.notification);
  const setNotification = useErpStore((s) => s.setNotification);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (e) {
      console.error(e);
    }
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, roles: ['admin', 'sales', 'purchase', 'manufacturing', 'inventory', 'owner'] },
    { href: '/dashboard/products', label: 'Products & Inventory', icon: Package, roles: ['admin', 'sales', 'purchase', 'inventory', 'owner'] },
    { href: '/dashboard/bom', label: 'Bill of Materials', icon: Layers, roles: ['admin', 'manufacturing', 'owner'] },
    { href: '/dashboard/sales', label: 'Sales Orders', icon: ShoppingCart, roles: ['admin', 'sales', 'owner'] },
    { href: '/dashboard/purchase', label: 'Purchase Orders', icon: ShoppingBag, roles: ['admin', 'purchase', 'owner'] },
    { href: '/dashboard/manufacturing', label: 'Manufacturing', icon: Factory, roles: ['admin', 'manufacturing', 'owner'] },
    { href: '/dashboard/stock-ledger', label: 'Stock Ledger', icon: ClipboardList, roles: ['admin', 'inventory', 'owner'] },
    { href: '/dashboard/audit-logs', label: 'Audit Logs', icon: Shield, roles: ['admin', 'owner'] },
  ];

  const visibleNavItems = navItems.filter((item) => item.roles.includes(currentRole));

  return (
    <div className="min-h-screen bg-slate-950/5 text-foreground flex flex-col font-sans antialiased">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur-md px-4 lg:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
              S
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-foreground flex items-center gap-2">
                Shiv Furniture Mini ERP
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                  Demand to Delivery
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Centralized Enterprise System</div>
            </div>
          </Link>
        </div>

        {/* Role Switcher & User Control */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-muted/60 p-1 rounded-xl border text-xs">
            <UserCheck className="h-4 w-4 text-indigo-600 ml-1.5" />
            <span className="font-semibold text-muted-foreground">Active Role:</span>
            <select
              value={currentRole}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-card font-bold text-indigo-600 rounded-lg px-2.5 py-1 focus:outline-none border shadow-xs"
            >
              <option value="admin">Admin (Full Access)</option>
              <option value="sales">Sales User</option>
              <option value="purchase">Purchase User</option>
              <option value="manufacturing">Manufacturing User</option>
              <option value="inventory">Inventory Manager</option>
              <option value="owner">Business Owner</option>
            </select>
          </div>

          <button
            onClick={handleSignOut}
            title="Sign Out"
            className="p-2 border rounded-xl hover:bg-rose-500/10 hover:text-rose-600 text-muted-foreground transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Auto Procurement Notification Banner */}
      {notification && (notification.triggeredMOs.length > 0 || notification.triggeredPOs.length > 0) && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 lg:px-8 py-3 text-amber-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Procurement Automation Triggered!</strong> Shortage detected on sales order confirmation.
              {notification.triggeredMOs.length > 0 && ` Auto MOs: ${notification.triggeredMOs.join(', ')}.`}
              {notification.triggeredPOs.length > 0 && ` Auto POs: ${notification.triggeredPOs.join(', ')}.`}
            </span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="font-bold underline hover:text-amber-950 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Body Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 border-r bg-card/40 p-4 space-y-1 flex-shrink-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-3">
            ERP Modules Nav
          </div>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  Wallet,
  BarChart3,
  Settings,
  ChevronLeft,
  Menu,
  Building2,
  Award,
  Bell,
  Bot,
  UsersRound,
  DollarSign,
  Terminal,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Employees',
    href: '/dashboard/employees',
    icon: Users,
  },
  {
    name: 'Departments',
    href: '/dashboard/departments',
    icon: Building2,
  },
  {
    name: 'Designations',
    href: '/dashboard/designations',
    icon: Award,
  },
  {
    name: 'Attendance',
    href: '/dashboard/attendance',
    icon: Clock,
  },
  {
    name: 'Leave',
    href: '/dashboard/leave',
    icon: Calendar,
  },
  {
    name: 'Payroll',
    href: '/dashboard/payroll',
    icon: Wallet,
  },
  {
    name: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
  },
  {
    name: 'Reports',
    href: '/dashboard/reports',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

const agentNavigation = [
  {
    name: 'Agents',
    href: '/dashboard/agents',
    icon: Bot,
  },
  {
    name: 'Teams',
    href: '/dashboard/agents/teams',
    icon: UsersRound,
  },
  {
    name: 'Analytics',
    href: '/dashboard/agents/analytics',
    icon: TrendingUp,
  },
  {
    name: 'Budgets',
    href: '/dashboard/agents/budgets',
    icon: DollarSign,
  },
  {
    name: 'Costs',
    href: '/dashboard/agents/costs',
    icon: Wallet,
  },
  {
    name: 'Commands',
    href: '/dashboard/agents/commands',
    icon: Terminal,
  },
];

interface SidebarContentProps {
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}

function SidebarContent({ pathname, collapsed = false, onNavigate }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center space-x-2" onClick={onNavigate}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            S
          </div>
          {!collapsed && (
            <span className="text-xl font-bold">ShelfZone</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Agent Portal Section */}
        {!collapsed && (
          <div className="mt-4 mb-2 px-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Agent Portal</p>
          </div>
        )}
        {collapsed && <Separator className="my-3" />}
        <div className="space-y-1">
          {agentNavigation.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/dashboard/agents');
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className={cn(
          'text-xs text-muted-foreground',
          collapsed ? 'text-center' : ''
        )}>
          {collapsed ? '© 2024' : '© 2024 ShelfZone'}
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-40"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r bg-card transition-all duration-300',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <SidebarContent pathname={pathname} collapsed={collapsed} />
        
        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 transition-transform',
              collapsed && 'rotate-180'
            )}
          />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </aside>
    </>
  );
}

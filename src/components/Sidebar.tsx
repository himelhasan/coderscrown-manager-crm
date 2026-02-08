'use client';

import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Crown, FolderKanban, LayoutDashboard, LogOut, MessageSquare, Send, Settings, UserCircle, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, role, loading } = useAuth();
  const router = useRouter();

  // Hide sidebar on Auth pages
  if (pathname === '/login' || pathname === '/signup' || pathname === '/onboarding') {
      return null;
  }

  const handleSignOut = async () => {
      if (auth) {
          await auth.signOut();
      }
      router.push('/login');
  };

  const allNavigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Leads', href: '/leads', icon: Users },
    { name: 'Campaigns', href: '/campaigns', icon: Send },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Tickets', href: '/tickets', icon: MessageSquare }, // New Ticket Item
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // Filter navigation based on role
  const navigation = role === 'client'
    ? allNavigation.filter(item => ['Dashboard', 'Tickets', 'Projects', 'Settings'].includes(item.name))
    : allNavigation;

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Crown className="mr-2 h-6 w-6 text-primary" />
        <span className="text-lg font-bold">CODERSCROWN</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
        {role === 'admin' && (
             <Link
              href="/users"
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
                pathname === '/users'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              )}
            >
              <UserCircle
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  pathname === '/users' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )}
                aria-hidden="true"
              />
              Manage Users
            </Link>
        )}
      </nav>
      <div className="p-4 border-t border-border">
        {loading ? (
             <div className="h-12 animate-pulse bg-muted rounded-md"></div>
        ) : user ? (
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 overflow-hidden">
                    {user.photoURL ? (
                        <img src={user.photoURL} alt="User" className="h-8 w-8 rounded-full" />
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <UserCircle className="h-5 w-5" />
                        </div>
                    )}
                    <div className="text-sm truncate">
                        <p className="font-medium truncate">{user.displayName || 'User'}</p>
                        <p className="text-xs text-muted-foreground capitalize">{role || 'Client'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <button onClick={handleSignOut} title="Sign Out" className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-md hover:bg-muted">
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        ) : (
            <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                     <span className="text-xs text-muted-foreground">Theme</span>
                     <ThemeToggle />
                </div>
                <Link href="/login" className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                    Sign In
                </Link>
            </div>
        )}
      </div>
    </div>
  );
}

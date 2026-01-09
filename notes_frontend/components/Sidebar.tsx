'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, User, LogOut, Plus, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  onCreateNote?: () => void;
}

export default function Sidebar({ onCreateNote }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: FileText, label: 'All Notes', href: '/dashboard/notes' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-white border-r border-gray-100 flex flex-col items-center py-6 z-50">
      {/* Pinterest Logo (Simplified) */}
      <div className="mb-8">
        <Link href="/dashboard" className="block p-2 rounded-full hover:bg-gray-100 transition-colors">
          <div className="w-10 h-10 bg-[#e60023] rounded-full flex items-center justify-center text-white shadow-md">
            <FileText className="h-5 w-5 fill-current" />
          </div>
        </Link>
      </div>

      {/* Navigation Rail */}
      <nav className="flex-1 flex flex-col gap-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`
                group relative w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200
                ${active
                  ? 'bg-black text-white'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <Icon className={`h-6 w-6`} />
              {/* Simple Tooltip on Hover */}
              <span className="absolute left-16 bg-black text-white px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </span>
            </Link>
          );
        })}

        <div className="h-px w-8 bg-gray-100 my-2 mx-auto" />

        {/* Pinterest Style Create Button */}
        <button
          onClick={() => {
            if (onCreateNote) onCreateNote();
            else window.dispatchEvent(new CustomEvent('open-create-note-modal'));
          }}
          title="Create Note"
          className="w-12 h-12 bg-[#e60023] hover:bg-[#ad081b] text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 group relative"
        >
          <Plus className="h-7 w-7" />
          <span className="absolute left-16 bg-black text-white px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
            Create Note
          </span>
        </button>
      </nav>

      {/* User & Settings Rail */}
      <div className="flex flex-col gap-4 mt-auto">
        {user && (
          <Link
            href="/dashboard/profile"
            title="Profile"
            className="group relative w-12 h-12 rounded-full overflow-hidden border-2 border-transparent hover:border-gray-200 transition-all p-0.5"
          >
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              <User className="h-6 w-6 text-gray-600" />
            </div>
            <span className="absolute left-16 bg-black text-white px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
              {user.username}
            </span>
          </Link>
        )}

        <button
          onClick={logout}
          title="Logout"
          className="w-12 h-12 flex items-center justify-center rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all group relative"
        >
          <LogOut className="h-5 w-5" />
          <span className="absolute left-16 bg-black text-white px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}

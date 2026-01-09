'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, StickyNote } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const { logout } = useAuth();

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard/notes" className="flex items-center space-x-2">
            <StickyNote className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-gray-900">Notes App</span>
          </Link>
          <Button variant="ghost" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}

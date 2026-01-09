'use client';

import { Note } from '@/lib/types';
import { Clock, Edit, History, Trash2, Maximize2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';

interface NotePinProps {
  note: Note;
  onDelete: (id: number) => void;
  onExpand?: (note: Note) => void;
}

export default function NotePin({ note, onDelete, onExpand }: NotePinProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Generate a consistent but "random" color for the card accent
  const accentColor = useMemo(() => {
    const colors = [
      'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400',
      'bg-purple-400', 'bg-pink-400', 'bg-indigo-400', 'bg-orange-400'
    ];
    return colors[note.id % colors.length];
  }, [note.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className="group relative break-inside-avoid mb-6 focus-within:ring-2 focus-within:ring-blue-500 rounded-2xl outline-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onExpand?.(note)}
    >
      <div
        className={`
          relative bg-white rounded-2xl overflow-hidden border border-gray-100
          transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          ${isHovered ? 'shadow-2xl -translate-y-2 border-gray-200' : 'shadow-sm border-gray-50'}
        `}
      >
        {/* Subtle top accent bar */}
        <div className={`h-1.5 w-full ${accentColor} opacity-40`} />

        {/* Content Section */}
        <div className="p-5">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
            {note.title}
          </h3>

          {/* Content Preview with Fade effect */}
          <div className="relative overflow-hidden max-h-[400px]">
            <div className="text-[15px] text-gray-600 leading-relaxed whitespace-pre-wrap break-words">
              {note.content}
            </div>
            {/* Fade overlay for long content */}
            {note.content.length > 200 && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
            )}
          </div>

          {/* Bottom Meta */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center text-[10px] uppercase tracking-wider text-gray-400 font-bold">
              <Clock className="h-3 w-3 mr-1" />
              {formatDate(note.updated_at)}
            </div>
          </div>
        </div>

        {/* Pinterest-style Overlay Actions */}
        <div
          className={`
            absolute inset-0 bg-black/5 ring-1 ring-inset ring-black/10 transition-opacity duration-300 rounded-2xl
            ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
        >
          {/* Top Right Quick Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExpand?.(note);
              }}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 shadow-lg hover:scale-110 transition-transform active:scale-95"
              title="Expand View"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Bottom Reveal Actions */}
          <div className="absolute bottom-4 left-4 right-4 flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Link
              href={`/dashboard/notes/${note.id}`}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/25"
              onClick={(e) => e.stopPropagation()}
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>

            <Link
              href={`/dashboard/notes/${note.id}/versions`}
              className="w-11 h-11 bg-white hover:bg-gray-100 text-gray-700 rounded-xl transition-all flex items-center justify-center shadow-lg"
              onClick={(e) => e.stopPropagation()}
              title="Version History"
            >
              <History className="h-4 w-4" />
            </Link>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
              className="w-11 h-11 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all flex items-center justify-center shadow-lg hover:shadow-red-500/25"
              title="Delete Note"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

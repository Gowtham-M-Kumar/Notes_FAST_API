'use client';

import { useState, useEffect } from 'react';
import { notesAPI } from '@/lib/api';
import type { Note } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import NotePin from '@/components/NotePin';
import { FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  content: z.string().min(1, 'Content is required'),
});

type NoteFormData = z.infer<typeof noteSchema>;

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [expandModalOpen, setExpandModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
  });

  useEffect(() => {
    // Defer data loading to next tick for instant page render
    const timer = setTimeout(() => {
      loadNotes();
    }, 0);

    const handleOpenModal = () => setIsDialogOpen(true);
    window.addEventListener('open-create-note-modal', handleOpenModal);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('open-create-note-modal', handleOpenModal);
    };
  }, []);

  const loadNotes = async () => {
    const startTime = performance.now();
    try {
      const data = await notesAPI.list();
      setNotes(data);
      const loadTime = performance.now() - startTime;
      console.log(`📊 Loaded ${data.length} notes in ${loadTime.toFixed(0)}ms`);
    } catch (error) {
      toast.error('Failed to load notes');
      console.error('❌ Notes load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpandNote = (note: Note) => {
    setSelectedNote(note);
    setExpandModalOpen(true);
  };

  const onSubmit = async (data: NoteFormData) => {
    setIsSubmitting(true);
    try {
      const newNote = await notesAPI.create(data);
      setNotes([newNote, ...notes]);
      toast.success('Note created successfully');
      setIsDialogOpen(false);
      reset();
    } catch (error) {
      toast.error('Failed to create note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setNoteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (noteToDelete === null) return;

    try {
      await notesAPI.delete(noteToDelete);
      setNotes(notes.filter((note) => note.id !== noteToDelete));
      toast.success('Note deleted successfully');
      // If the deleted note was open in expand modal, close it
      if (selectedNote?.id === noteToDelete) {
        setExpandModalOpen(false);
      }
    } catch (error) {
      toast.error('Failed to delete note');
    } finally {
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="break-inside-avoid mb-6">
              <Skeleton className="w-full rounded-2xl" style={{ height: `${150 + (i % 3) * 100}px` }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Subtle grid background texture */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative z-10 p-8 pt-10 max-w-[2000px] mx-auto">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 rotate-3">
              <FileText className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">No notes found</h3>
            <p className="text-gray-500 max-w-sm mb-10 text-lg leading-relaxed">
              Click the "Create Note" button in the sidebar to start capturing your ideas.
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-10 h-14 text-lg font-bold shadow-2xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
            >
              Create your first note
            </Button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-6">
            {notes.map((note) => (
              <NotePin
                key={note.id}
                note={note}
                onDelete={handleDeleteClick}
                onExpand={handleExpandNote}
              />
            ))}
          </div>
        )}
      </div>

      {/* Expand Note Modal (Pinterest "Closeup" style) */}
      <Dialog open={expandModalOpen} onOpenChange={setExpandModalOpen}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          {selectedNote && (
            <div className="flex flex-col max-h-[90vh]">
              <div className="p-10 overflow-y-auto">
                <div className="flex items-center gap-3 text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">
                  <span className="w-8 h-[2px] bg-blue-600"></span>
                  Note Detail
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tight">
                  {selectedNote.title}
                </h2>
                <div className="text-xl text-gray-700 leading-relaxed whitespace-pre-wrap break-words border-l-4 border-gray-100 pl-8">
                  {selectedNote.content}
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500 font-medium">
                  <Clock className="h-4 w-4 mr-2" />
                  Last updated {new Date(selectedNote.updated_at).toLocaleString()}
                </div>
                <div className="flex gap-3">
                  <Button asChild variant="outline" className="rounded-xl h-11 px-6 font-bold">
                    <Link href={`/dashboard/notes/${selectedNote.id}`} onClick={() => setExpandModalOpen(false)}>
                      Edit Note
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-red-500/20"
                    onClick={() => {
                      handleDeleteClick(selectedNote.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Note Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl p-8 border-none shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-black tracking-tight">New Idea</DialogTitle>
            <DialogDescription className="text-gray-500 text-lg">
              What's on your mind today?
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-bold uppercase tracking-wider text-gray-400">Title</Label>
              <Input
                id="title"
                placeholder="The best idea ever..."
                className="h-14 rounded-2xl text-lg font-medium border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                {...register('title')}
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="text-sm text-destructive font-medium">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-bold uppercase tracking-wider text-gray-400">Content</Label>
              <Textarea
                id="content"
                placeholder="Expand your thoughts here..."
                rows={10}
                className="resize-none rounded-2xl text-lg p-5 border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                {...register('content')}
                disabled={isSubmitting}
              />
              {errors.content && (
                <p className="text-sm text-destructive font-medium">{errors.content.message}</p>
              )}
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                {isSubmitting ? 'Creating...' : 'Post Note'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-3xl border-none shadow-2xl p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-500 text-lg">
              Are you absolutely sure? This action is permanent and your note will be lost forever.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:justify-end">
            <Button variant="ghost" className="rounded-xl h-12 px-6 font-bold" onClick={() => setDeleteDialogOpen(false)}>
              Go Back
            </Button>
            <Button variant="destructive" className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-red-500/20" onClick={confirmDelete}>
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

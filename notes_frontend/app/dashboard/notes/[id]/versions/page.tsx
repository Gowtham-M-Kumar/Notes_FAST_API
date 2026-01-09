'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { versionsAPI, notesAPI } from '@/lib/api';
import type { NoteVersion, Note } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VersionItem from '@/components/VersionItem';
import { ArrowLeft, History } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function VersionsPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = parseInt(params.id as string);

  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [noteId]);

  const loadData = async () => {
    try {
      const [versionsData, noteData] = await Promise.all([
        versionsAPI.list(noteId),
        notesAPI.get(noteId),
      ]);
      setVersions(versionsData);
      setNote(noteData);
    } catch (error) {
      toast.error('Failed to load version history');
      router.push('/dashboard/notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreClick = (versionId: number) => {
    setVersionToRestore(versionId);
    setRestoreDialogOpen(true);
  };

  const confirmRestore = async () => {
    if (versionToRestore === null) return;

    try {
      await versionsAPI.restore(noteId, versionToRestore);
      toast.success('Version restored successfully');
      router.push('/dashboard/notes');
    } catch (error) {
      toast.error('Failed to restore version');
    } finally {
      setRestoreDialogOpen(false);
      setVersionToRestore(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/notes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notes
          </Link>
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex items-start gap-3">
          <History className="h-6 w-6 text-primary mt-1" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Version History</h1>
            {note && (
              <p className="text-gray-600 mt-1">
                <span className="font-semibold">{note.title}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {versions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border">
          <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No version history yet
          </h3>
          <p className="text-gray-500">
            Version history will appear here as you edit the note
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {versions.map((version, index) => (
            <VersionItem
              key={version.id}
              version={version}
              onRestore={handleRestoreClick}
              isLatest={index === 0}
            />
          ))}
        </div>
      )}

      {/* Restore Confirmation Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Version</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore this version? The current note will be
              updated with the content from this version.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRestore}>Restore Version</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

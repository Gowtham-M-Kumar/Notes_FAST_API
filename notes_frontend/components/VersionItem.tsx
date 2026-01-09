import { NoteVersion } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, RotateCcw } from 'lucide-react';

interface VersionItemProps {
  version: NoteVersion;
  onRestore: (versionId: number) => void;
  isLatest: boolean;
}

export default function VersionItem({ version, onRestore, isLatest }: VersionItemProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={isLatest ? 'border-primary' : ''}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              Version {version.version_number}
              {isLatest && (
                <span className="ml-2 text-xs font-normal text-primary">(Current)</span>
              )}
            </CardTitle>
            <CardDescription className="flex items-center text-xs mt-1">
              <Clock className="h-3 w-3 mr-1" />
              {formatDate(version.created_at)}
            </CardDescription>
          </div>
          {!isLatest && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRestore(version.id)}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Restore
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <p className="text-sm font-semibold text-gray-700">Title:</p>
          <p className="text-sm text-gray-600">{version.title}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">Content:</p>
          <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-3">
            {version.content}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

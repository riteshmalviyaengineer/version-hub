import { AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 px-4 bg-destructive/10 rounded-lg border border-destructive/20">
      <div className="flex items-center gap-2 text-destructive">
        <XCircle className="w-5 h-5" />
        <span className="font-medium">Error</span>
      </div>
      <p className="text-sm text-center text-muted-foreground max-w-md">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;

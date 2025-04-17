import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';

interface AuditErrorProps {
  message: string;
  onReset: () => void;
}

const AuditError: React.FC<AuditErrorProps> = ({ message, onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="text-lg font-medium mb-2">Audit Failed</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {message || "There was an error while analyzing this website. Please try again."}
      </p>
      <Button 
        variant="outline" 
        className="border-white/10 hover:bg-white/5"
        onClick={onReset}
      >
        Try Again
      </Button>
    </div>
  );
};

export default AuditError;
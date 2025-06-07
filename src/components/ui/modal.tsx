'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from './button';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface ModalContentProps {
  className?: string;
  children: React.ReactNode;
}

interface ModalHeaderProps {
  className?: string;
  children: React.ReactNode;
}

interface ModalTitleProps {
  className?: string;
  children: React.ReactNode;
}

interface ModalDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

interface ModalFooterProps {
  className?: string;
  children: React.ReactNode;
}

const Modal = ({ open, onOpenChange, children }: ModalProps) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-lg">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      {/* Modal */}
      <div className="relative z-10 w-full animate-slide-up">
        {children}
      </div>
    </div>,
    document.body
  );
};

const ModalContent = ({ className, children }: ModalContentProps) => (
  <div
    className={cn(
      "bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-hidden flex flex-col relative",
      className
    )}
  >
    {children}
  </div>
);

const ModalHeader = ({ className, children }: ModalHeaderProps) => (
  <div className={cn("border-b border-border", className)} style={{ padding: '32px 32px 24px 32px' }}>
    {children}
  </div>
);

const ModalTitle = ({ className, children }: ModalTitleProps) => (
  <h2 className={cn("text-lg leading-none tracking-tight", className)}>
    {children}
  </h2>
);

const ModalDescription = ({ className, children }: ModalDescriptionProps) => (
  <p className={cn("text-sm text-muted-foreground", className)}>
    {children}
  </p>
);

const ModalFooter = ({ className, children }: ModalFooterProps) => (
  <div className={cn("border-t border-border flex flex-col-reverse sm:flex-row sm:justify-end", className)} style={{ padding: '24px 32px 32px 32px', gap: '12px' }}>
    {children}
  </div>
);

const ModalClose = ({ className, ...props }: React.ComponentProps<typeof Button>) => (
  <Button
    variant="ghost"
    size="sm"
    className={cn("absolute h-9 w-9 p-0 z-20 hover:bg-muted/50", className)}
    style={{ right: '16px', top: '16px' }}
    {...props}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close</span>
  </Button>
);

export {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalClose,
};
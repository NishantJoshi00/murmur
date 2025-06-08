'use client';

import {
  Modal,
  ModalContent,
  ModalClose,
} from '@/components/ui/modal';
import type { ConnectionState, ConnectionMode } from '@/types/mcp';
import { ConnectionForm } from '@/components/connection-form';

interface ConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectionState: ConnectionState;
  savedConnections: any[];
  onSaveConnection: (name: string, url: string, headers: Record<string, string>, mode?: ConnectionMode) => Promise<void>;
  onDisconnect: () => Promise<void>;
  showDeleteButton?: boolean;
  onDeleteCurrentConnection?: () => Promise<void>;
  onTestConnection?: (url: string, headers: Record<string, string>, mode?: ConnectionMode) => Promise<void>;
}

export function ConnectionModal({
  open,
  onOpenChange,
  connectionState,
  savedConnections,
  onSaveConnection,
  onDisconnect,
  showDeleteButton,
  onDeleteCurrentConnection,
  onTestConnection
}: ConnectionModalProps) {

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalClose onClick={() => onOpenChange(false)} />
        <div className="p-6">
          <ConnectionForm
            connectionState={connectionState}
            savedConnections={savedConnections}
            onSaveConnection={onSaveConnection}
            onDisconnect={onDisconnect}
            showDeleteButton={showDeleteButton}
            onDeleteCurrentConnection={onDeleteCurrentConnection}
            onTestConnection={onTestConnection}
            onClose={() => onOpenChange(false)}
          />
        </div>
      </ModalContent>
    </Modal>
  );
}

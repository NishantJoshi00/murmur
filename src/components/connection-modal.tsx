'use client';

import {
  Modal,
  ModalContent,
  ModalClose,
} from '@/components/ui/modal';
import type { ConnectionState } from '@/types/mcp';
import type { ConnectionProfile } from '@/lib/connection-manager';
import { ConnectionForm } from '@/components/connection-form';

interface ConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectionState: ConnectionState;
  savedConnections: ConnectionProfile[];
  onConnect: (url: string, headers: Record<string, string>, connectionName?: string) => Promise<void>;
  onConnectWithProfile: (profileId: string) => Promise<void>;
  onDisconnect: () => Promise<void>;
  onSaveConnection: (name: string, url: string, headers: Record<string, string>) => Promise<void>;
  onDeleteConnection: (id: string) => Promise<void>;
}

export function ConnectionModal({
  open,
  onOpenChange,
  connectionState,
  savedConnections,
  onConnect,
  onConnectWithProfile,
  onDisconnect,
  onSaveConnection,
  onDeleteConnection,
}: ConnectionModalProps) {

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalClose onClick={() => onOpenChange(false)} />
        <div className="p-6">
          <ConnectionForm
            connectionState={connectionState}
            savedConnections={savedConnections}
            onConnect={onConnect}
            onConnectWithProfile={onConnectWithProfile}
            onDisconnect={onDisconnect}
            onSaveConnection={onSaveConnection}
            onDeleteConnection={onDeleteConnection}
          />
        </div>
      </ModalContent>
    </Modal>
  );
}

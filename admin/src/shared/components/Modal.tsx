import { ReactNode } from 'react';
import { Button, Modal as AntModal } from 'antd';

type ModalProps = {
  children: ReactNode;
  className?: string;
  layer?: 'primary' | 'secondary';
  onClose: () => void;
  size?: 'default' | 'large' | 'compact';
  title: string;
  width?: number;
};

export function Modal({ children, className, layer = 'primary', onClose, size = 'default', title, width }: ModalProps) {
  return (
    <AntModal
      centered
      className={`atrio-modal${className ? ` ${className}` : ''}`}
      destroyOnClose
      footer={null}
      onCancel={onClose}
      open
      rootClassName={`atrio-modal-root atrio-modal-${layer}`}
      title={title}
      width={width ?? (size === 'large' ? 820 : size === 'compact' ? 480 : 620)}
      zIndex={layer === 'secondary' ? 1200 : 1000}
    >
      {children}
    </AntModal>
  );
}

export function ModalFooter({ isSubmitting = false, onCancel, submitLabel }: { isSubmitting?: boolean; onCancel: () => void; submitLabel: string }) {
  return (
    <div className="modal-footer">
      <Button onClick={onCancel}>Cancelar</Button>
      <Button htmlType="submit" loading={isSubmitting} type="primary">{submitLabel}</Button>
    </div>
  );
}

type ConfirmActionModalProps = {
  confirmLabel: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  tone?: 'primary' | 'danger';
};

export function ConfirmActionModal({ confirmLabel, message, onCancel, onConfirm, title, tone = 'primary' }: ConfirmActionModalProps) {
  return (
    <Modal title={title} onClose={onCancel} size="compact">
      <p className="muted-text">{message}</p>
      <div className="modal-footer">
        <Button onClick={onCancel}>Cancelar</Button>
        <Button danger={tone === 'danger'} onClick={onConfirm} type="primary">{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

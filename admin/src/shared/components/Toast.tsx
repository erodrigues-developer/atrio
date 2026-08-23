import { useEffect } from 'react';
import { Alert } from 'antd';

type ToastProps = {
  message: string;
  onClose: () => void;
  tone: 'success' | 'error';
};

export function Toast({ message, onClose, tone }: ToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onClose, 4_200);
    return () => window.clearTimeout(timeout);
  }, [message, onClose]);

  return <Alert closable message={message} onClose={onClose} showIcon type={tone} />;
}

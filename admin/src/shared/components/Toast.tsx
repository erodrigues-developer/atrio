import { useEffect, useId, useRef } from 'react';
import { App } from 'antd';

type ToastProps = {
  message: string;
  onClose: () => void;
  tone: 'success' | 'error';
};

export function Toast({ message, onClose, tone }: ToastProps) {
  const { message: messageApi } = App.useApp();
  const messageKey = useId();
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    let isActive = true;

    void messageApi.open({
      content: message,
      duration: 4.2,
      key: messageKey,
      onClose: () => {
        if (isActive) onCloseRef.current();
      },
      type: tone,
    });

    return () => {
      isActive = false;
    };
  }, [message, messageApi, messageKey, tone]);

  return null;
}

import { FormEvent, useState } from 'react';
import { Button, Input, Typography } from 'antd';
import { login, type AdminSession } from '../api';

type LoginScreenProps = {
  onAuthenticated: (session: AdminSession) => void;
};

export function LoginScreen({ onAuthenticated }: LoginScreenProps) {
  const [email, setEmail] = useState('admin@atrio.app');
  const [password, setPassword] = useState('admin123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      onAuthenticated(await login(email.trim(), password));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível entrar.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div>
          <p className="eyebrow">Atrio Admin</p>
          <Typography.Title id="login-title" level={1}>Operação do hotel</Typography.Title>
          <p className="login-copy">Acesse o ambiente administrativo para acompanhar estadias, reservas e solicitações.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>Email<Input autoComplete="email" inputMode="email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Senha<Input.Password autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {error ? <p aria-live="polite" className="form-error">{error}</p> : null}
          <Button block htmlType="submit" loading={isSubmitting} type="primary">Entrar</Button>
        </form>
      </section>
    </main>
  );
}

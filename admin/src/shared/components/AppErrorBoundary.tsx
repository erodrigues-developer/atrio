import { Component, ErrorInfo, ReactNode } from 'react';

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Keep technical details out of the UI while still exposing them to observability tooling.
    console.error('Unexpected admin application error', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  override render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="fatal-error" role="alert">
        <section>
          <p className="eyebrow">Atrio Admin</p>
          <h1>Não foi possível exibir esta página</h1>
          <p>Ocorreu um erro inesperado. Tente carregar a interface novamente.</p>
          <button onClick={this.handleRetry} type="button">Tentar novamente</button>
        </section>
      </main>
    );
  }
}

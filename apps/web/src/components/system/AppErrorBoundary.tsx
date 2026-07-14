import { Component, type ErrorInfo, type ReactNode } from 'react';

import Button from '../ui/Button';
import ImminiqLogo from '../ui/ImminiqLogo';

interface IAppErrorBoundaryProps {
  children: ReactNode;
  resetKey?: string;
}

interface IAppErrorBoundaryState {
  error: Error | null;
}

export default class AppErrorBoundary extends Component<
  IAppErrorBoundaryProps,
  IAppErrorBoundaryState
> {
  state: IAppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): IAppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Imminiq render error', error, info);
  }

  componentDidUpdate(previousProps: IAppErrorBoundaryProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  private reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-(--surface-canvas) p-5 text-(--text-primary)">
        <section className="surface-elevated w-full max-w-lg p-7 text-center">
          <ImminiqLogo size={46} className="mx-auto rounded-md" decorative />
          <p className="type-label-sm mt-5 text-(--brand-500)">Recovery mode</p>
          <h1 className="type-heading-xl mt-2">This page hit an unexpected error</h1>
          <p className="type-body-md mx-auto mt-3 max-w-md text-(--text-secondary)">
            Your account and saved data are safe. Try rendering the page again, or reload the
            application if the problem continues.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <Button onClick={this.reset}>Try again</Button>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Reload app
            </Button>
          </div>
          {import.meta.env.DEV && (
            <details className="mt-6 rounded-md bg-(--surface-muted) p-3 text-left text-[11px] text-(--text-secondary)">
              <summary className="font-semibold">Developer details</summary>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap font-mono">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </section>
      </main>
    );
  }
}

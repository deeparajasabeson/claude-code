import { Component, type ReactNode } from 'react';
import { clearApiCache } from '../api';

interface Props {
  fallback: (error: Error, retry: () => void) => ReactNode;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Interview Companion failed to render a page', error);
  }

  retry = () => {
    clearApiCache();
    this.setState({ error: null });
  };

  render() {
    return this.state.error ? this.props.fallback(this.state.error, this.retry) : this.props.children;
  }
}

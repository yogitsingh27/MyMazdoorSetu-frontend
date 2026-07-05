import { Component } from 'react';
import EmptyState from './EmptyState';

// App-level safety net: catches render/runtime errors anywhere below it so a
// single failing screen never blanks the whole app. Must be a class component —
// error boundaries have no hooks equivalent.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error:', error, info);
  }

  handleReload = () => {
    // A full reload is the safest recovery — it clears any corrupt in-memory state.
    window.location.assign('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <section className="section">
          <EmptyState
            icon="alert"
            title="Something went wrong"
            hint="An unexpected error occurred. Reloading usually fixes it."
            actionLabel="Reload the app"
            onAction={this.handleReload}
          />
        </section>
      );
    }
    return this.props.children;
  }
}

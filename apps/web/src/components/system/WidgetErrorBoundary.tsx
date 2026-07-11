import { Component, type ErrorInfo, type ReactNode } from 'react'

import Button from '../ui/Button'

interface IWidgetErrorBoundaryProps {
  children: ReactNode
  title?: string
}

interface IWidgetErrorBoundaryState {
  failed: boolean
}

export default class WidgetErrorBoundary extends Component<
  IWidgetErrorBoundaryProps,
  IWidgetErrorBoundaryState
> {
  state: IWidgetErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): IWidgetErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Imminiq widget error', error, info)
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <section className="surface-flat p-5 text-center">
        <h2 className="type-heading-md text-(--text-primary)">
          {this.props.title ?? 'This section could not load'}
        </h2>
        <p className="type-body-sm mt-1 text-(--text-secondary)">
          The rest of your lesson is still available.
        </p>
        <Button
          size="sm"
          variant="secondary"
          className="mt-4"
          onClick={() => this.setState({ failed: false })}
        >
          Try section again
        </Button>
      </section>
    )
  }
}

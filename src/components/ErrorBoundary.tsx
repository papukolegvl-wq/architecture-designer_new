import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    componentName?: string;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`Uncaught error in ${this.props.componentName || 'Component'}:`, error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div style={{
                    padding: '10px',
                    margin: '10px',
                    backgroundColor: '#2d2d2d',
                    border: '1px solid #ff6b6b',
                    borderRadius: '8px',
                    color: '#ff6b6b',
                    fontSize: '12px'
                }}>
                    <strong>Ошибка в {this.props.componentName || 'компоненте'}</strong>
                    <div style={{ marginTop: '5px', opacity: 0.8 }}>
                        {this.state.error && this.state.error.message}
                    </div>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        style={{
                            marginTop: '10px',
                            padding: '4px 8px',
                            backgroundColor: '#ff6b6b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Восстановить
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

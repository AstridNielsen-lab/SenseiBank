import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = (): void => {
    // Reset the error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // If an onReset callback was provided, call it
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback was provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise, render the default error UI
      return (
        <Paper 
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            maxWidth: '600px',
            mx: 'auto',
            my: 4,
            bgcolor: (theme) => 
              theme.palette.mode === 'dark' ? 'rgba(255, 0, 0, 0.05)' : 'rgba(255, 0, 0, 0.02)',
            border: (theme) => `1px solid ${theme.palette.error.main}`
          }}
        >
          <ErrorOutline color="error" sx={{ fontSize: 64 }} />
          
          <Typography variant="h5" color="error" gutterBottom>
            Oops! Algo deu errado
          </Typography>
          
          <Typography align="center" color="text.secondary" sx={{ mb: 2 }}>
            Ocorreu um erro inesperado. Por favor, tente novamente ou entre em contato com o suporte.
          </Typography>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box 
              sx={{ 
                bgcolor: 'background.paper', 
                p: 2, 
                borderRadius: 1,
                width: '100%',
                overflow: 'auto',
                maxHeight: '200px',
                mb: 2
              }}
            >
              <Typography variant="subtitle2" color="error">
                Error: {this.state.error.toString()}
              </Typography>
              {this.state.errorInfo && (
                <Typography 
                  variant="body2" 
                  component="pre" 
                  sx={{ 
                    mt: 1, 
                    fontSize: '0.75rem',
                    whiteSpace: 'pre-wrap' 
                  }}
                >
                  {this.state.errorInfo.componentStack}
                </Typography>
              )}
            </Box>
          )}
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={this.handleReset}
            startIcon={<Refresh />}
          >
            Tentar Novamente
          </Button>
        </Paper>
      );
    }

    // If there's no error, render the children
    return this.props.children;
  }
}

export default ErrorBoundary;


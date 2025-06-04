import React from 'react';
import { Box, Typography, Button, Paper, useTheme } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
  message?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  message = 'Ocorreu um erro inesperado. Por favor, tente novamente ou entre em contato com o suporte.'
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper 
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        width: '100%',
        bgcolor: isDark ? 'rgba(255, 0, 0, 0.05)' : 'rgba(255, 0, 0, 0.02)',
        border: `1px solid ${theme.palette.error.main}`
      }}
    >
      <ErrorOutline color="error" sx={{ fontSize: 48 }} />
      
      <Typography variant="h6" color="error" gutterBottom>
        Oops! Algo deu errado
      </Typography>
      
      <Typography align="center" color="text.secondary" sx={{ mb: 2 }}>
        {message}
      </Typography>
      
      {process.env.NODE_ENV === 'development' && error && (
        <Box 
          sx={{ 
            bgcolor: 'background.paper', 
            p: 2, 
            borderRadius: 1,
            width: '100%',
            overflow: 'auto',
            maxHeight: '150px',
            mb: 2
          }}
        >
          <Typography variant="subtitle2" color="error">
            {error.toString()}
          </Typography>
        </Box>
      )}
      
      {resetErrorBoundary && (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={resetErrorBoundary}
          startIcon={<Refresh />}
          size="small"
        >
          Tentar Novamente
        </Button>
      )}
    </Paper>
  );
};

export default ErrorFallback;


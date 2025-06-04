import React, { useState } from 'react';
import { Paper, Typography, Box, IconButton, Divider, useTheme, CircularProgress } from '@mui/material';
import { ArrowUpward, ArrowDownward, SwapHoriz, Info } from '@mui/icons-material';
import { Transaction } from '../types/account';
import ErrorFallback from './error/ErrorFallback';

interface TransactionSummaryProps {
  transactions: Transaction[];
  isLoading?: boolean;
  error?: Error | null;
}

export const TransactionSummary: React.FC<TransactionSummaryProps> = ({ 
  transactions, 
  isLoading = false,
  error = null
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  // If error exists, show error UI
  if (error) {
    return (
      <ErrorFallback
        error={error}
        resetErrorBoundary={() => setShowErrorDetails(!showErrorDetails)}
        message="Não foi possível carregar o resumo de transações."
      />
    );
  }

  // Calculate summary
  const getTotalDeposits = () => {
    return transactions
      .filter(tx => tx.type === 'deposit')
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  const getTotalWithdrawals = () => {
    return transactions
      .filter(tx => tx.type === 'withdrawal')
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  const getTotalTransfers = () => {
    return transactions
      .filter(tx => tx.type === 'transfer')
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: 2,
        bgcolor: isDark ? 'background.paper' : 'background.default',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
        Resumo de Transações
      </Typography>
      <Divider sx={{ my: 2 }} />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress size={40} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'space-between' }}>
          <SummaryItem 
            title="Depósitos" 
            value={getTotalDeposits()} 
            icon={<ArrowDownward />}
            color="success.main"
          />
          <SummaryItem 
            title="Saques" 
            value={getTotalWithdrawals()} 
            icon={<ArrowUpward />}
            color="error.main"
          />
          <SummaryItem 
            title="Transferências" 
            value={getTotalTransfers()} 
            icon={<SwapHoriz />}
            color="info.main"
          />
          <SummaryItem 
            title="Total de Transações" 
            value={transactions.length} 
            icon={<Info />}
            color="text.primary"
            isCount
          />
        </Box>
      )}
    </Paper>
  );
};

interface SummaryItemProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  isCount?: boolean;
}

const SummaryItem: React.FC<SummaryItemProps> = ({ title, value, icon, color, isCount = false }) => {
  return (
    <Box sx={{ textAlign: 'center', flex: '1 1 200px' }}>
      <IconButton 
        sx={{ 
          backgroundColor: (theme) => theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.08)' 
            : 'rgba(0, 0, 0, 0.04)',
          mb: 1,
          color
        }}
      >
        {icon}
      </IconButton>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 'bold', color }}>
        {isCount ? value : `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
      </Typography>
    </Box>
  );
};


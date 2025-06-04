import React from 'react';
import { Paper, Typography, Box, useTheme, Grid as MuiGrid } from '@mui/material';
import { Transaction } from '../../types/account';
import { AccountService } from '../../services/accountService';
import { TrendingUp, TrendingDown, SwapHoriz } from '@mui/icons-material';

interface TransactionSummaryProps {
  transactions: Transaction[];
}

export const TransactionSummary: React.FC<TransactionSummaryProps> = ({ transactions }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const summary = transactions.reduce((acc, transaction) => {
    switch (transaction.type) {
      case 'DEPOSIT':
        acc.deposits += transaction.amount;
        acc.totalDeposits++;
        break;
      case 'WITHDRAWAL':
        acc.withdrawals += transaction.amount;
        acc.totalWithdrawals++;
        break;
      case 'TRANSFER':
        acc.transfers += transaction.amount;
        acc.totalTransfers++;
        break;
    }
    return acc;
  }, {
    deposits: 0,
    withdrawals: 0,
    transfers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalTransfers: 0,
  });

  const SummaryCard = ({ title, value, count, icon, color }: {
    title: string;
    value: number;
    count: number;
    icon: React.ReactNode;
    color: string;
  }) => (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        height: '100%',
        backgroundColor: isDark ? 'background.paper' : 'background.default',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box
          sx={{
            backgroundColor: `${color}15`,
            borderRadius: '50%',
            p: 1,
            mr: 1,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" color="textSecondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h5" sx={{ mb: 1, color }}>
        {AccountService.formatCurrency(value)}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {count} operações
      </Typography>
    </Paper>
  );

  return (
    <MuiGrid container spacing={3} sx={{ mb: 4 }}>
      <MuiGrid item xs={12} sm={6} md={4}>
        <SummaryCard
          title="Depósitos"
          value={summary.deposits}
          count={summary.totalDeposits}
          icon={<TrendingUp sx={{ color: theme.palette.success.main }} />}
          color={theme.palette.success.main}
        />
      </MuiGrid>
      <MuiGrid item xs={12} sm={6} md={4}>
        <SummaryCard
          title="Saques"
          value={summary.withdrawals}
          count={summary.totalWithdrawals}
          icon={<TrendingDown sx={{ color: theme.palette.error.main }} />}
          color={theme.palette.error.main}
        />
      </MuiGrid>
      <MuiGrid item xs={12} sm={6} md={4}>
        <SummaryCard
          title="Transferências"
          value={summary.transfers}
          count={summary.totalTransfers}
          icon={<SwapHoriz sx={{ color: theme.palette.primary.main }} />}
          color={theme.palette.primary.main}
        />
      </MuiGrid>
    </MuiGrid>
  );
};


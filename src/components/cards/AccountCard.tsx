import React from 'react';
import { Card, CardContent, Typography, IconButton, Box, useTheme } from '@mui/material';
import { Edit, Delete, SwapHoriz, Add, Remove } from '@mui/icons-material';
import { Account } from '../../types/account';

type AccountCardProps = Pick<Account, 'bankName' | 'balance' | 'accountType'> & {
  onTransfer: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  color?: string;
};

export const AccountCard: React.FC<AccountCardProps> = ({
  bankName,
  balance,
  accountType,
  onTransfer,
  onEdit,
  onDelete,
  onDeposit,
  onWithdraw,
  color = '#1a73e8',
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card 
      sx={{ 
        position: 'relative',
        overflow: 'visible',
        borderRadius: '12px',
        backgroundColor: isDark ? 'background.paper' : 'background.default',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: color,
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
        }}
      />
      <CardContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant="h6" 
            component="h2"
            sx={{ 
              fontWeight: 600,
              color: isDark ? 'text.primary' : 'text.primary',
            }}
          >
            {bankName}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              onClick={onTransfer} 
              size="small"
              sx={{
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: isDark 
                    ? 'rgba(25, 118, 210, 0.12)'
                    : 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              <SwapHoriz />
            </IconButton>
            <IconButton 
              onClick={onEdit} 
              size="small"
              sx={{
                color: theme.palette.secondary.main,
                '&:hover': {
                  backgroundColor: isDark 
                    ? 'rgba(95, 99, 104, 0.12)'
                    : 'rgba(95, 99, 104, 0.04)',
                },
              }}
            >
              <Edit />
            </IconButton>
            <IconButton 
              onClick={onDelete} 
              size="small"
              sx={{
                color: theme.palette.error.main,
                '&:hover': {
                  backgroundColor: isDark 
                    ? 'rgba(211, 47, 47, 0.12)'
                    : 'rgba(211, 47, 47, 0.04)',
                },
              }}
            >
              <Delete />
            </IconButton>
          </Box>
        </Box>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: isDark ? 'text.secondary' : 'text.secondary',
            mb: 2,
          }}
        >
          {accountType}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
          <IconButton 
            onClick={onDeposit} 
            size="small"
            sx={{
              color: theme.palette.success.main,
              bgcolor: isDark ? 'rgba(76, 175, 80, 0.12)' : 'rgba(76, 175, 80, 0.08)',
              '&:hover': {
                bgcolor: isDark ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.12)',
              },
              padding: 1,
            }}
          >
            <Add />
          </IconButton>
          <IconButton 
            onClick={onWithdraw} 
            size="small"
            sx={{
              color: theme.palette.warning.main,
              bgcolor: isDark ? 'rgba(255, 152, 0, 0.12)' : 'rgba(255, 152, 0, 0.08)',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255, 152, 0, 0.12)',
              },
              padding: 1,
            }}
          >
            <Remove />
          </IconButton>
        </Box>

        <Box 
          sx={{ 
            p: 2, 
            borderRadius: '8px',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700,
              color: isDark ? theme.palette.primary.light : theme.palette.primary.main,
            }}
          >
            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

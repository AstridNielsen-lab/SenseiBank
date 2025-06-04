import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Autocomplete,
  Chip,
  Alert,
} from '@mui/material';
import { SwapHoriz, TrendingUp } from '@mui/icons-material';
import { Account, TransferData, Currency } from '../../types/account';
import { BankService } from '../../services/bankService';

interface TransferFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TransferData) => void;
  accounts: Account[];
  fromAccountId?: string;
}

export const TransferForm: React.FC<TransferFormProps> = ({
  open,
  onClose,
  onSubmit,
  accounts,
  fromAccountId,
}) => {
  const [formData, setFormData] = useState<TransferData>({
    fromAccountId: fromAccountId || '',
    toAccountId: '',
    amount: 0,
    descricao: '',
  });
  
  const [projectedBalance, setProjectedBalance] = useState<number | null>(null);
  const [exchangeWarning, setExchangeWarning] = useState<string>('');

  const fromAccount = accounts.find(acc => acc.id === formData.fromAccountId);
  const toAccount = accounts.find(acc => acc.id === formData.toAccountId);
  
  const availableAccounts = accounts.filter(acc => acc.id !== formData.fromAccountId);

  useEffect(() => {
    if (fromAccountId) {
      setFormData(prev => ({ ...prev, fromAccountId }));
    }
  }, [fromAccountId]);

  useEffect(() => {
    // Calculate projected balance
    if (fromAccount && formData.amount > 0) {
      const currentBalance = BankService.getAccountBalance(fromAccount);
      setProjectedBalance(currentBalance - formData.amount);
    } else {
      setProjectedBalance(null);
    }

    // Check for currency exchange
    if (fromAccount && toAccount) {
      const fromCurrency = BankService.getAccountCurrency(fromAccount);
      const toCurrency = BankService.getAccountCurrency(toAccount);
      
      if (fromCurrency !== toCurrency) {
        setExchangeWarning(
          `Atenção: Esta transferência envolve conversão de ${fromCurrency} para ${toCurrency}. ` +
          `Taxa de câmbio pode ser aplicada.`
        );
      } else {
        setExchangeWarning('');
      }
    }
  }, [fromAccount, toAccount, formData.amount]);

  const handleChange = (field: keyof TransferData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fromAccountId || !formData.toAccountId || 
        formData.amount <= 0 || !formData.descricao.trim()) {
      return;
    }

    if (fromAccount && formData.amount > BankService.getAccountBalance(fromAccount)) {
      return;
    }

    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      fromAccountId: fromAccountId || '',
      toAccountId: '',
      amount: 0,
      descricao: '',
    });
    setProjectedBalance(null);
    setExchangeWarning('');
    onClose();
  };

  const isFormValid = formData.fromAccountId && formData.toAccountId && 
                     formData.amount > 0 && formData.descricao.trim() &&
                     fromAccount && formData.amount <= BankService.getAccountBalance(fromAccount);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SwapHoriz color="primary" />
            Transferir Valores
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            
            {/* From Account */}
            <Autocomplete
              options={accounts}
              getOptionLabel={(option) => BankService.getAccountDisplayName(option)}
              value={fromAccount || null}
              onChange={(_, newValue) => handleChange('fromAccountId', newValue?.id || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="De (Conta de Origem)"
                  required
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body1">
                      {BankService.getAccountDisplayName(option)}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {option.agencia || option.agency} • {option.numeroConta || option.accountNumber}
                      </Typography>
                      <Chip 
                        label={BankService.formatCurrency(
                          BankService.getAccountBalance(option),
                          BankService.getAccountCurrency(option)
                        )}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Box>
              )}
            />

            {fromAccount && (
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'primary.light', 
                borderRadius: 1,
                color: 'primary.contrastText'
              }}>
                <Typography variant="subtitle2" gutterBottom>
                  Saldo Disponível
                </Typography>
                <Typography variant="h6">
                  {BankService.formatCurrency(
                    BankService.getAccountBalance(fromAccount),
                    BankService.getAccountCurrency(fromAccount)
                  )}
                </Typography>
              </Box>
            )}
            
            {/* To Account */}
            <Autocomplete
              options={availableAccounts}
              getOptionLabel={(option) => BankService.getAccountDisplayName(option)}
              value={toAccount || null}
              onChange={(_, newValue) => handleChange('toAccountId', newValue?.id || '')}
              disabled={!fromAccount}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Para (Conta de Destino)"
                  required
                  helperText={!fromAccount ? 'Selecione a conta de origem primeiro' : ''}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body1">
                      {BankService.getAccountDisplayName(option)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.agencia || option.agency} • {option.numeroConta || option.accountNumber}
                    </Typography>
                  </Box>
                </Box>
              )}
            />

            {/* Amount */}
            <TextField
              fullWidth
              label="Valor"
              type="number"
              value={formData.amount || ''}
              onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
              InputProps={{ 
                inputProps: { 
                  min: 0,
                  max: fromAccount ? BankService.getAccountBalance(fromAccount) : undefined,
                  step: "0.01"
                },
                startAdornment: fromAccount && (
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {BankService.getCurrencySymbol(BankService.getAccountCurrency(fromAccount))}
                  </Typography>
                )
              }}
              required
              disabled={!fromAccount}
            />

            {/* Description */}
            <TextField
              fullWidth
              label="Descrição"
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              multiline
              rows={2}
              required
              helperText="Motivo ou descrição da transferência"
            />

            {/* Exchange Warning */}
            {exchangeWarning && (
              <Alert severity="warning">
                {exchangeWarning}
              </Alert>
            )}

            {/* Projected Balance */}
            {projectedBalance !== null && isFormValid && (
              <Box sx={{ 
                p: 2, 
                backgroundColor: projectedBalance >= 0 ? 'success.light' : 'error.light',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <TrendingUp color={projectedBalance >= 0 ? 'success' : 'error'} />
                <Box>
                  <Typography variant="subtitle2">
                    Saldo projetado após transferência:
                  </Typography>
                  <Typography variant="h6" color={projectedBalance >= 0 ? 'success.main' : 'error.main'}>
                    {BankService.formatCurrency(
                      projectedBalance,
                      fromAccount ? BankService.getAccountCurrency(fromAccount) : 'BRL'
                    )}
                  </Typography>
                </Box>
              </Box>
            )}
            
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={!isFormValid}
          >
            Transferir
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TransferForm;


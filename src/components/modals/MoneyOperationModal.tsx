import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from '@mui/material';
import { Account } from '../../types/account';

interface MoneyOperationModalProps {
  open: boolean;
  onClose: () => void;
  account: Account | undefined;
  operationType: 'deposit' | 'withdraw';
  onSubmit: (data: { 
    accountId: string; 
    amount: number; 
    description: string; 
  }) => void;
}

export const MoneyOperationModal: React.FC<MoneyOperationModalProps> = ({
  open,
  onClose,
  account,
  operationType,
  onSubmit,
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [projectedBalance, setProjectedBalance] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !account || !description.trim()) return;

    onSubmit({
      accountId: account.id,
      amount: Number(amount),
      description,
    });

    // Reset form
    setAmount('');
    setDescription('');
    onClose();
  };

  const isWithdraw = operationType === 'withdraw';
  const title = isWithdraw ? 'Saque' : 'Depósito';
  const buttonText = isWithdraw ? 'Sacar' : 'Depositar';

  const maxAmount = isWithdraw ? account?.balance : undefined;
  const isAmountValid = 
    Number(amount) > 0 && 
    (!isWithdraw || Number(amount) <= (account?.balance || 0));
    
  // Update projected balance when amount changes
  React.useEffect(() => {
    if (!account || !amount || !isAmountValid) {
      setProjectedBalance(null);
      return;
    }
    
    const numAmount = Number(amount);
    if (isWithdraw) {
      setProjectedBalance((account.balance ?? 0) - numAmount);
    } else {
      setProjectedBalance((account.balance ?? 0) + numAmount);
    }
  }, [amount, account, isWithdraw, isAmountValid]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            {account && (
              <Typography variant="subtitle1" className="font-medium">
                Conta: {account.bankName}
                <span className="block text-sm text-gray-600 dark:text-gray-400">
                  Saldo disponível: R$ {(account.balance ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </Typography>
            )}
            
            <TextField
              fullWidth
              label="Valor"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{ 
                inputProps: { 
                  min: 0,
                  max: maxAmount,
                  step: "0.01"
                }
              }}
              required
            />

            <TextField
              fullWidth
              label="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
              required
              helperText="Por favor, forneça uma descrição para esta operação"
            />
            
            {projectedBalance !== null && isAmountValid && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <Typography variant="subtitle2" className="font-medium">
                  Saldo projetado após a operação:
                  <span className="block text-lg font-bold mt-1">
                    R$ {projectedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </Typography>
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={!isAmountValid || !account || !description.trim()}
          >
            {buttonText}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};


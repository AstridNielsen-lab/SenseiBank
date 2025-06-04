import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
} from '@mui/material';
import { Account } from '../../types/account';

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  fromAccountId: string;
  onTransfer: (data: { 
    fromAccountId: string; 
    toAccountId: string; 
    amount: number; 
    description: string; 
  }) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  open,
  onClose,
  accounts,
  fromAccountId,
  onTransfer,
}) => {
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const fromAccount = accounts.find(acc => acc.id === fromAccountId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !toAccountId) return;

    onTransfer({
      fromAccountId,
      toAccountId,
      amount: Number(amount),
      description,
    });

    // Reset form
    setToAccountId('');
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Transferir Valores</DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <Typography variant="subtitle1" className="font-medium">
              De: {fromAccount?.bankName}
              <span className="block text-sm text-gray-600 dark:text-gray-400">
                Saldo disponível: R$ {(fromAccount?.balance ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </Typography>
            
            <FormControl fullWidth>
              <InputLabel>Para</InputLabel>
              <Select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                required
              >
                {accounts
                  .filter(acc => acc.id !== fromAccountId)
                  .map(account => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.bankName}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Valor"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{ 
                inputProps: { 
                  min: 0,
                  max: fromAccount?.balance ?? 0,
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
            />
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
            disabled={!amount || !toAccountId || Number(amount) > (fromAccount?.balance ?? 0)}
          >
            Transferir
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};


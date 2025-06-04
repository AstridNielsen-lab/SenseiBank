import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import { Account } from '../../types/account';

interface AccountFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (account: Omit<Account, 'id'>) => void;
  initialData?: Account;
}

const accountTypes = [
  'Conta Corrente',
  'Conta Pagamento',
  'Conta PJ',
  'Conta Poupança',
];

export const AccountForm: React.FC<AccountFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<Omit<Account, 'id'>>({
    bankName: initialData?.bankName || '',
    accountType: initialData?.accountType || accountTypes[0],
    balance: initialData?.balance || 0,
    agency: initialData?.agency || '',
    accountNumber: initialData?.accountNumber || '',
    color: initialData?.color || '#1a73e8',
    logo: initialData?.logo || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialData ? 'Editar Conta' : 'Nova Conta'}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <TextField
              fullWidth
              label="Nome do Banco"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              required
            />

            <TextField
              fullWidth
              select
              label="Tipo de Conta"
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              required
            >
              {accountTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Agência"
              name="agency"
              value={formData.agency}
              onChange={handleChange}
              required
            />

            <TextField
              fullWidth
              label="Número da Conta"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              required
            />

            <TextField
              fullWidth
              label="Saldo Inicial"
              name="balance"
              type="number"
              value={formData.balance}
              onChange={handleChange}
              InputProps={{ inputProps: { min: 0, step: "0.01" } }}
              required
              disabled={initialData !== undefined}
            />

            <TextField
              fullWidth
              label="Cor do Card"
              name="color"
              type="color"
              value={formData.color}
              onChange={handleChange}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {initialData ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};


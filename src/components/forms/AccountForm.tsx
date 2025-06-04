import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Box,
  Autocomplete,
  Typography,
} from '@mui/material';
import { 
  Account, 
  Bank, 
  CreateAccountRequest, 
  Currency,
  ACCOUNT_TYPES,
  CURRENCY_CONFIG 
} from '../../types/account';
import { BankService } from '../../services/bankService';

interface AccountFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (account: CreateAccountRequest) => void;
  initialData?: Account;
  mode?: 'create' | 'edit';
}

// Moved to data/banks.ts for better organization

export const AccountForm: React.FC<AccountFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}) => {
  const [formData, setFormData] = useState<CreateAccountRequest>({
    nome: initialData?.nome || initialData?.bankName || '',
    bankId: initialData?.bankId || '',
    tipo: initialData?.tipo || initialData?.accountType || '',
    agencia: initialData?.agencia || initialData?.agency || '',
    numeroConta: initialData?.numeroConta || initialData?.accountNumber || '',
    saldo: initialData?.saldo || initialData?.balance || 0,
    moeda: (initialData?.moeda as Currency) || 'BRL',
    cor: initialData?.cor || initialData?.color || '#1a73e8',
  });

  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [availableAccountTypes, setAvailableAccountTypes] = useState<string[]>([]);

  // Load banks on component mount
  useEffect(() => {
    const loadBanks = async () => {
      setLoadingBanks(true);
      try {
        const bankList = await BankService.getBanks();
        setBanks(bankList);
        
        // Set initial selected bank if editing
        if (initialData?.bankId) {
          const bank = bankList.find(b => b.id === initialData.bankId);
          if (bank) {
            setSelectedBank(bank);
            setAvailableAccountTypes(ACCOUNT_TYPES[bank.tipo] || []);
          }
        }
      } catch (error) {
        console.error('Error loading banks:', error);
        // Display friendly error message to user through form
        onClose(); // Close the form
        // You could also show the error in a more user-friendly way
        // For example, using the notification system from App.tsx
        // This would require passing a showNotification prop to AccountForm
      } finally {
        setLoadingBanks(false);
      }
    };

    if (open) {
      loadBanks();
    }
  }, [open, initialData?.bankId]);

  // Update account types when bank changes
  useEffect(() => {
    if (selectedBank) {
      const types = ACCOUNT_TYPES[selectedBank.tipo] || [];
      setAvailableAccountTypes(types);
      
      // Reset account type if current one is not available for new bank type
      if (!types.includes(formData.tipo)) {
        setFormData(prev => ({ ...prev, tipo: types[0] || '' }));
      }
    }
  }, [selectedBank, formData.tipo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'saldo' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleBankChange = (bank: Bank | null) => {
    setSelectedBank(bank);
    setFormData(prev => ({
      ...prev,
      bankId: bank?.id || '',
    }));
  };

  const handleCurrencyChange = (currency: Currency) => {
    setFormData(prev => ({
      ...prev,
      moeda: currency,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nome.trim() || !formData.bankId || !formData.tipo || 
        !formData.agencia.trim() || !formData.numeroConta.trim()) {
      return;
    }
    
    onSubmit(formData);
    onClose();
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      nome: '',
      bankId: '',
      tipo: '',
      agencia: '',
      numeroConta: '',
      saldo: 0,
      moeda: 'BRL',
      cor: '#1a73e8',
    });
    setSelectedBank(null);
    setAvailableAccountTypes([]);
    onClose();
  };

  const isFormValid = formData.nome.trim() && formData.bankId && 
                     formData.tipo && formData.agencia.trim() && 
                     formData.numeroConta.trim();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === 'edit' ? 'Editar Conta' : 'Nova Conta'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {/* Account Name */}
            <TextField
              fullWidth
              label="Nome da Conta"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              helperText="Nome para identificar esta conta"
            />

            {/* Bank Selection */}
            <Autocomplete
              options={banks}
              getOptionLabel={(option) => `${option.nome} (${option.codigo || 'N/A'})`}
              value={selectedBank}
              onChange={(_, newValue) => handleBankChange(newValue)}
              loading={loadingBanks}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Banco"
                  required
                  helperText="Selecione o banco desta conta"
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1">{option.nome}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.tipo === 'nacional' ? '🇧🇷 Nacional' : '🌍 Internacional'} • 
                      Código: {option.codigo || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              )}
              disabled={mode === 'edit'}
            />

            {/* Account Type */}
            <TextField
              fullWidth
              select
              label="Tipo de Conta"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
              disabled={!selectedBank}
              helperText={!selectedBank ? 'Selecione um banco primeiro' : 'Tipo da conta'}
            >
              {availableAccountTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>

            {/* Agency and Account Number */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Agência"
                name="agencia"
                value={formData.agencia}
                onChange={handleChange}
                required
                disabled={mode === 'edit'}
              />
              <TextField
                fullWidth
                label="Número da Conta"
                name="numeroConta"
                value={formData.numeroConta}
                onChange={handleChange}
                required
                disabled={mode === 'edit'}
              />
            </Box>

            {/* Currency and Initial Balance */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Moeda</InputLabel>
                <Select
                  value={formData.moeda}
                  onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
                  label="Moeda"
                  disabled={mode === 'edit'}
                >
                  {Object.entries(CURRENCY_CONFIG).map(([code, config]) => (
                    <MenuItem key={code} value={code}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{config.symbol}</span>
                        <span>{code}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Saldo Inicial"
                name="saldo"
                type="number"
                value={formData.saldo}
                onChange={handleChange}
                InputProps={{ 
                  inputProps: { min: 0, step: "0.01" },
                  startAdornment: (
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {CURRENCY_CONFIG[formData.moeda || 'BRL'].symbol}
                    </Typography>
                  )
                }}
                required
                disabled={mode === 'edit'}
                helperText={mode === 'edit' ? 'Saldo não pode ser alterado' : 'Valor inicial da conta'}
              />
            </Box>

            {/* Card Color */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Cor do Card
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  label="Cor"
                  name="cor"
                  type="color"
                  value={formData.cor}
                  onChange={handleChange}
                  sx={{ width: 80 }}
                />
                <Chip 
                  label="Preview" 
                  sx={{ 
                    backgroundColor: formData.cor, 
                    color: 'white',
                    fontWeight: 'bold'
                  }} 
                />
              </Box>
            </Box>

            {/* Bank Information Display */}
            {selectedBank && (
              <Box sx={{ 
                p: 2, 
                border: 1, 
                borderColor: 'divider', 
                borderRadius: 1,
                backgroundColor: 'background.paper'
              }}>
                <Typography variant="subtitle2" gutterBottom>
                  Informações do Banco
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={selectedBank.tipo === 'nacional' ? '🇧🇷 Nacional' : '🌍 Internacional'} 
                    variant="outlined" 
                    size="small"
                  />
                  {selectedBank.codigo && (
                    <Chip 
                      label={`Código: ${selectedBank.codigo}`} 
                      variant="outlined" 
                      size="small"
                    />
                  )}
                  <Chip 
                    label={CURRENCY_CONFIG[formData.moeda || 'BRL'].name}
                    variant="outlined" 
                    size="small"
                  />
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
            disabled={!isFormValid || loadingBanks}
          >
            {mode === 'edit' ? 'Salvar' : 'Criar Conta'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};


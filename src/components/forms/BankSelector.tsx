import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Bank, BankType } from '../../types/account';
import { BankService } from '../../services/bankService';

interface BankSelectorProps {
  value: Bank | null;
  onChange: (bank: Bank | null) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  filterType?: BankType;
  helperText?: string;
  error?: boolean;
}

export const BankSelector: React.FC<BankSelectorProps> = ({
  value,
  onChange,
  label = 'Banco',
  required = false,
  disabled = false,
  filterType,
  helperText,
  error = false,
}) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loadBanks = async () => {
      setLoading(true);
      try {
        const bankList = await BankService.getBanks(filterType);
        setBanks(bankList);
      } catch (error) {
        console.error('Error loading banks:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadBanks();
    }
  }, [open, filterType]);

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={banks}
      getOptionLabel={(option) => `${option.nome} (${option.codigo || 'N/A'})`}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      loading={loading}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          helperText={helperText}
          error={error}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1">{option.nome}</Typography>
              <Chip 
                label={option.tipo === 'nacional' ? '🇧🇷 BR' : '🌍 INTL'} 
                size="small" 
                variant="outlined"
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Código: {option.codigo || 'N/A'}
            </Typography>
          </Box>
        </Box>
      )}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      noOptionsText={loading ? 'Carregando...' : 'Nenhum banco encontrado'}
    />
  );
};

export default BankSelector;


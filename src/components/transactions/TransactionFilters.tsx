import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';

interface TransactionFiltersProps {
  dateRange: { start: string; end: string };
  transactionType: string;
  searchTerm: string;
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onTypeChange: (type: string) => void;
  onSearchChange: (term: string) => void;
  onClearFilters: () => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  dateRange,
  transactionType,
  searchTerm,
  onDateRangeChange,
  onTypeChange,
  onSearchChange,
  onClearFilters,
}) => {

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
      <TextField
        type="date"
        label="Data Inicial"
        value={dateRange.start}
        onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
        InputLabelProps={{ shrink: true }}
        size="small"
      />
      <TextField
        type="date"
        label="Data Final"
        value={dateRange.end}
        onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
        InputLabelProps={{ shrink: true }}
        size="small"
      />
      <TextField
        select
        label="Tipo"
        value={transactionType}
        onChange={(e) => onTypeChange(e.target.value)}
        size="small"
        sx={{ minWidth: 120 }}
      >
        <MenuItem value="">Todos</MenuItem>
        <MenuItem value="TRANSFER">Transferência</MenuItem>
        <MenuItem value="DEPOSIT">Depósito</MenuItem>
        <MenuItem value="WITHDRAWAL">Saque</MenuItem>
      </TextField>
      <TextField
        label="Buscar"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        sx={{ flexGrow: 1 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {searchTerm && (
                <IconButton size="small" onClick={() => onSearchChange('')}>
                  <ClearIcon />
                </IconButton>
              )}
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      {(dateRange.start || dateRange.end || transactionType || searchTerm) && (
        <IconButton 
          onClick={onClearFilters}
          size="small"
          sx={{ alignSelf: 'center' }}
        >
          <ClearIcon />
        </IconButton>
      )}
    </Box>
  );
};


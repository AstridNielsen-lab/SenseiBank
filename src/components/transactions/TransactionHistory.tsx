import React, { useState, useMemo, useCallback } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  TablePagination,
  Box,
} from '@mui/material';
import { Transaction, Account } from '../../types/account';
import { AccountService } from '../../services/accountService';
import { TransactionFilters } from './TransactionFilters';

interface TransactionHistoryProps {
  transactions: Transaction[];
  accounts: Account[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  accounts,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filter state
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [transactionType, setTransactionType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const getAccountName = useCallback((id: string) => {
    return accounts.find(acc => acc.id === id)?.bankName || 'Conta não encontrada';
  }, [accounts]);

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(date));
  };
  
  // Filter transactions based on filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = transaction.date ? new Date(transaction.date) : new Date();
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;
      
      const matchesDate = (!startDate || transactionDate >= startDate) &&
                          (!endDate || transactionDate <= endDate);
      
      const matchesType = !transactionType || transaction.type === transactionType;
      
      const matchesSearch = !searchTerm || 
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getAccountName(transaction.fromAccountId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.toAccountId && getAccountName(transaction.toAccountId).toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesDate && matchesType && matchesSearch;
    });
  }, [transactions, dateRange, transactionType, searchTerm, getAccountName]);

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setDateRange({ start: '', end: '' });
    setTransactionType('');
    setSearchTerm('');
  };

  return (
    <Paper 
      elevation={2}
      sx={{
        mt: 4,
        backgroundColor: isDark ? 'background.paper' : 'background.default',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Histórico de Transações
        </Typography>
        
        <TransactionFilters
          dateRange={dateRange}
          transactionType={transactionType}
          searchTerm={searchTerm}
          onDateRangeChange={setDateRange}
          onTypeChange={setTransactionType}
          onSearchChange={setSearchTerm}
          onClearFilters={handleClearFilters}
        />
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>De</TableCell>
              <TableCell>Para</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Descrição</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Nenhuma transação encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transaction) => (
                  <TableRow 
                    key={transaction.id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      backgroundColor: isDark 
                        ? 'background.default' 
                        : 'background.paper',
                    }}
                  >
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <Typography
                        component="span"
                        sx={{
                          color: transaction.type === 'WITHDRAWAL' 
                            ? 'error.main'
                            : transaction.type === 'DEPOSIT'
                            ? 'success.main'
                            : 'primary.main',
                        }}
                      >
                        {transaction.type === 'TRANSFER' ? 'Transferência'
                          : transaction.type === 'DEPOSIT' ? 'Depósito'
                          : 'Saque'}
                      </Typography>
                    </TableCell>
                    <TableCell>{getAccountName(transaction.fromAccountId)}</TableCell>
                    <TableCell>
                      {transaction.toAccountId 
                        ? getAccountName(transaction.toAccountId)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Typography
                        component="span"
                        sx={{
                          color: transaction.type === 'WITHDRAWAL' || 
                                (transaction.type === 'TRANSFER' && !transaction.toAccountId)
                            ? 'error.main'
                            : 'success.main',
                          fontWeight: 'medium',
                        }}
                      >
                        {AccountService.formatCurrency(transaction.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>{transaction.description || '-'}</TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredTransactions.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Itens por página"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
        }
      />
    </Paper>
  );
};


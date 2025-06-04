import React, { useState } from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AccountCard } from './components/cards/AccountCard';
import { TransferModal } from './components/modals/TransferModal';
import { MoneyOperationModal } from './components/modals/MoneyOperationModal';
import { AccountForm } from './components/forms/AccountForm';
import { Grid as MuiGrid, Fab, Alert, Snackbar } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { AccountService } from './services/accountService';
import { Account, AccountFormData, TransferData, Transaction, MoneyOperationType } from './types/account';

// Define the type for money operation parameters
interface MoneyOperationParams {
  accountId: string; 
  amount: number; 
  description: string;
}

// Define the type for account service results
interface AccountServiceResult {
  success: boolean;
  accounts: Account[];
  transaction?: Transaction;
}

import { TransactionHistory } from './components/transactions/TransactionHistory';
import { TransactionSummary } from './components/transactions/TransactionSummary';

const INITIAL_ACCOUNTS: Account[] = [
  {
    id: '1',
    bankName: 'Banco Principal',
    balance: 5000.00,
    accountType: 'Conta Corrente',
    agency: '0001',
    accountNumber: '123456',
    color: '#1a73e8',
  },
];

function App() {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>(undefined);
  const [isMoneyOperationModalOpen, setIsMoneyOperationModalOpen] = useState(false);
  const [moneyOperationType, setMoneyOperationType] = useState<MoneyOperationType>('deposit');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
    open: boolean;
  }>({ message: '', type: 'success', open: false });

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type, open: true });
  };

  const handleTransfer = (transferData: TransferData) => {
    const result = AccountService.executeTransfer(transferData, accounts);
    
    if (result.success) {
      setAccounts(result.accounts);
      // Create and store transaction record
      const transaction = AccountService.createTransaction(transferData);
      setTransactions(prev => [transaction, ...prev]); // Add to beginning of list
      showNotification('Transferência realizada com sucesso!', 'success');
    } else {
      showNotification(result.error || 'Erro ao realizar transferência', 'error');
    }
  };

  const handleAddAccount = (accountData: AccountFormData) => {
    const validation = AccountService.validateNewAccount(accountData, accounts);
    
    if (!validation.isValid) {
      showNotification(validation.error || 'Erro ao adicionar conta', 'error');
      return;
    }

    const newAccount: Account = {
      ...accountData,
      id: Date.now().toString(),
    };
    setAccounts(prev => [...prev, newAccount]);
    showNotification('Conta adicionada com sucesso!', 'success');
  };

  const handleEditAccount = (accountData: AccountFormData) => {
    if (!editingAccount) return;

    const validation = AccountService.validateNewAccount(
      accountData,
      accounts.filter(acc => acc.id !== editingAccount.id)
    );

    if (!validation.isValid) {
      showNotification(validation.error || 'Erro ao editar conta', 'error');
      return;
    }

    setAccounts(prevAccounts =>
      prevAccounts.map(account =>
        account.id === editingAccount.id
          ? { ...accountData, id: account.id }
          : account
      )
    );
    showNotification('Conta atualizada com sucesso!', 'success');
  };

  const handleDelete = (id: string) => {
    if (accounts.length <= 1) {
      showNotification('Não é possível excluir a última conta', 'error');
      return;
    }
    setAccounts(accounts.filter(account => account.id !== id));
    showNotification('Conta excluída com sucesso!', 'success');
  };

  const handleMoneyOperation = (accountId: string, data: MoneyOperationParams, type: MoneyOperationType) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) {
      showNotification('Conta não encontrada', 'error');
      return;
    }

    let result: AccountServiceResult;
    
    if (type === 'deposit') {
      result = AccountService.executeDeposit(data.accountId, data.amount, data.description, accounts);
    } else if (type === 'withdrawal') {
      result = AccountService.executeWithdrawal(data.accountId, data.amount, data.description, accounts);
    } else {
      // Handle unexpected operation type
      showNotification(`Operação ${type} não suportada`, 'error');
      return;
    }

    if (result.success) {
      setAccounts(result.accounts);
      // Add transaction to the list
      if (result.transaction) {
        setTransactions(prev => [result.transaction!, ...prev]);
      }
      showNotification(
        type === 'deposit' 
          ? 'Depósito realizado com sucesso!' 
          : 'Saque realizado com sucesso!', 
        'success'
      );
    } else {
      showNotification(result.error || `Erro ao realizar ${type === 'deposit' ? 'depósito' : 'saque'}`, 'error');
    }
  };

  return (
    <DashboardLayout>
      <MuiGrid container spacing={3}>
        {accounts.map((account) => (
          <MuiGrid item key={account.id} xs={12} sm={6} md={4} lg={3}>
            <AccountCard
              bankName={account.bankName}
              balance={account.balance}
              accountType={account.accountType}
              color={account.color}
              onTransfer={() => {
                setSelectedAccountId(account.id);
                setIsTransferModalOpen(true);
              }}
              onDeposit={() => {
                setSelectedAccountId(account.id);
                setMoneyOperationType('deposit');
                setIsMoneyOperationModalOpen(true);
              }}
              onWithdraw={() => {
                setSelectedAccountId(account.id);
                setMoneyOperationType('withdrawal');
                setIsMoneyOperationModalOpen(true);
              }}
              onEdit={() => {
                setEditingAccount(account);
                setIsAccountFormOpen(true);
              }}
              onDelete={() => handleDelete(account.id)}
            />
          </MuiGrid>
        ))}
      </MuiGrid>
      
      <TransactionSummary transactions={transactions} />
      <TransactionHistory transactions={transactions} accounts={accounts} />

      <Fab
        color="primary"
        aria-label="adicionar conta"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          '&:hover': {
            transform: 'scale(1.1)',
          },
          transition: 'transform 0.2s',
        }}
        onClick={() => {
          setEditingAccount(undefined);
          setIsAccountFormOpen(true);
        }}
      >
        <AddIcon />
      </Fab>

      {selectedAccountId && (
        <TransferModal
          open={isTransferModalOpen}
          onClose={() => {
            setIsTransferModalOpen(false);
            setSelectedAccountId(null);
          }}
          accounts={accounts}
          fromAccountId={selectedAccountId}
          onTransfer={handleTransfer}
        />
      )}

      <AccountForm
        open={isAccountFormOpen}
        onClose={() => {
          setIsAccountFormOpen(false);
          setEditingAccount(undefined);
        }}
        onSubmit={editingAccount ? handleEditAccount : handleAddAccount}
        initialData={editingAccount}
      />

      {selectedAccountId && (
        <MoneyOperationModal
          open={isMoneyOperationModalOpen}
          onClose={() => {
            setIsMoneyOperationModalOpen(false);
            setSelectedAccountId(null);
          }}
          account={accounts.find(acc => acc.id === selectedAccountId)}
          operationType={moneyOperationType === 'deposit' ? 'deposit' : 'withdraw'}
          onSubmit={(data) => {
            if (selectedAccountId) {
              handleMoneyOperation(selectedAccountId, data, moneyOperationType);
              setIsMoneyOperationModalOpen(false);
            }
          }}
        />
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
          severity={notification.type}
          variant="filled"
          elevation={6}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export default App;

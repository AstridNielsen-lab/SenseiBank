import { 
  Account, 
  Transaction, 
  TransferData, 
  AccountValidation,
  AccountBalance 
} from '../types/account';

export class AccountService {
  private static validateDeposit(amount: number): { isValid: boolean; error?: string } {
    if (amount <= 0) {
      return { isValid: false, error: 'O valor do depósito deve ser maior que zero' };
    }
    return { isValid: true };
  }

  private static validateWithdrawal(
    account: Account,
    amount: number
  ): { isValid: boolean; error?: string } {
    if (amount <= 0) {
      return { isValid: false, error: 'O valor do saque deve ser maior que zero' };
    }

    if (account.balance < amount) {
      return { isValid: false, error: 'Saldo insuficiente para realizar o saque' };
    }

    return { isValid: true };
  }
  private static validateTransfer(
    fromAccount: Account,
    amount: number,
    accounts: Account[],
    toAccountId?: string
  ): { isValid: boolean; error?: string } {
    if (amount <= 0) {
      return { isValid: false, error: 'O valor da transferência deve ser maior que zero' };
    }

    if (fromAccount.balance < amount) {
      return { isValid: false, error: 'Saldo insuficiente para realizar a transferência' };
    }

    if (toAccountId) {
      const toAccount = accounts.find(acc => acc.id === toAccountId);
      if (!toAccount) {
        return { isValid: false, error: 'Conta de destino não encontrada' };
      }
    }

    return { isValid: true };
  }

  static executeTransfer(
    data: TransferData,
    accounts: Account[]
  ): { success: boolean; accounts: Account[]; error?: string } {
    const fromAccount = accounts.find(acc => acc.id === data.fromAccountId);
    
    if (!fromAccount) {
      return { success: false, accounts, error: 'Conta de origem não encontrada' };
    }

    const validation = this.validateTransfer(fromAccount, data.amount, accounts, data.toAccountId);
    if (!validation.isValid) {
      return { success: false, accounts, error: validation.error };
    }

    const updatedAccounts = accounts.map(account => {
      if (account.id === data.fromAccountId) {
        return { ...account, balance: account.balance - data.amount };
      }
      if (account.id === data.toAccountId) {
        return { ...account, balance: account.balance + data.amount };
      }
      return account;
    });

    return { 
      success: true, 
      accounts: updatedAccounts 
    };
  }

  static createTransaction(data: TransferData): Transaction {
    return {
      id: Date.now().toString(),
      fromAccountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      amount: data.amount,
      type: 'TRANSFER',
      description: data.description,
      date: new Date(),
    };
  }

  static executeDeposit(
    accountId: string,
    amount: number,
    description: string,
    accounts: Account[]
  ): { success: boolean; accounts: Account[]; error?: string; transaction?: Transaction } {
    const account = accounts.find(acc => acc.id === accountId);
    
    if (!account) {
      return { success: false, accounts, error: 'Conta não encontrada' };
    }

    const validation = this.validateDeposit(amount);
    if (!validation.isValid) {
      return { success: false, accounts, error: validation.error };
    }

    const updatedAccounts = accounts.map(acc => {
      if (acc.id === accountId) {
        return { ...acc, balance: acc.balance + amount };
      }
      return acc;
    });

    const transaction = {
      id: Date.now().toString(),
      toAccountId: accountId,
      amount,
      type: 'DEPOSIT',
      description,
      date: new Date(),
    } as Transaction;

    return { 
      success: true, 
      accounts: updatedAccounts,
      transaction
    };
  }

  static executeWithdrawal(
    accountId: string,
    amount: number,
    description: string,
    accounts: Account[]
  ): { success: boolean; accounts: Account[]; error?: string; transaction?: Transaction } {
    const account = accounts.find(acc => acc.id === accountId);
    
    if (!account) {
      return { success: false, accounts, error: 'Conta não encontrada' };
    }

    const validation = this.validateWithdrawal(account, amount);
    if (!validation.isValid) {
      return { success: false, accounts, error: validation.error };
    }

    const updatedAccounts = accounts.map(acc => {
      if (acc.id === accountId) {
        return { ...acc, balance: acc.balance - amount };
      }
      return acc;
    });

    const transaction = {
      id: Date.now().toString(),
      fromAccountId: accountId,
      amount,
      type: 'WITHDRAWAL',
      description,
      date: new Date(),
    } as Transaction;

    return { 
      success: true, 
      accounts: updatedAccounts,
      transaction
    };
  }

  static getAccountValidation(account: Account, accounts: Account[]): AccountValidation {
    return {
      hasInsufficientFunds: (amount: number): boolean => {
        return account.balance < amount;
      },
      canTransfer: (amount: number, toAccountId: string): boolean => {
        const validation = this.validateTransfer(account, amount, accounts, toAccountId);
        return validation.isValid;
      }
    };
  }

  static formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  static getAccountBalances(accounts: Account[]): AccountBalance[] {
    return accounts.map(({ id, balance }) => ({ id, balance }));
  }

  static validateNewAccount(accountData: Omit<Account, 'id'>, existingAccounts: Account[]): { 
    isValid: boolean; 
    error?: string 
  } {
    if (existingAccounts.length >= 10) {
      return { isValid: false, error: 'Limite máximo de 10 contas atingido' };
    }

    if (!accountData.bankName.trim()) {
      return { isValid: false, error: 'Nome do banco é obrigatório' };
    }

    if (!accountData.agency.trim() || !accountData.accountNumber.trim()) {
      return { isValid: false, error: 'Agência e número da conta são obrigatórios' };
    }

    const isDuplicate = existingAccounts.some(
      acc => acc.agency === accountData.agency && 
            acc.accountNumber === accountData.accountNumber &&
            acc.bankName === accountData.bankName
    );

    if (isDuplicate) {
      return { isValid: false, error: 'Esta conta já está cadastrada' };
    }

    return { isValid: true };
  }
}


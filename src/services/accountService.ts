import { 
  Account, 
  Bank,
  Transaction, 
  TransferData,
  DepositData,
  WithdrawalData,
  CreateAccountRequest,
  UpdateAccountRequest,
  AccountValidation,
  AccountBalance,
  Currency,
  ValidationResult,
  ApiResponse
} from '../types/account';
import { ApiService } from './api';
import { BankService } from './bankService';

export class AccountService {
  // Enhanced account operations with API integration
  static async getAccounts(): Promise<Account[]> {
    try {
      const response = await ApiService.getAccounts();
      if (response.success && response.data) {
        return response.data.map(this.normalizeAccount);
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      return [];
    }
  }

  static async getAccount(id: string): Promise<Account | null> {
    try {
      const response = await ApiService.getAccount(id);
      if (response.success && response.data) {
        return this.normalizeAccount(response.data);
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch account:', error);
      return null;
    }
  }

  static async createAccount(accountData: CreateAccountRequest): Promise<{ success: boolean; account?: Account; error?: string }> {
    try {
      const response = await ApiService.createAccount(accountData);
      if (response.success && response.data) {
        return {
          success: true,
          account: this.normalizeAccount(response.data),
        };
      }
      return {
        success: false,
        error: response.message || 'Erro ao criar conta',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar conta',
      };
    }
  }

  static async updateAccount(id: string, accountData: UpdateAccountRequest): Promise<{ success: boolean; account?: Account; error?: string }> {
    try {
      const response = await ApiService.updateAccount(id, accountData);
      if (response.success && response.data) {
        return {
          success: true,
          account: this.normalizeAccount(response.data),
        };
      }
      return {
        success: false,
        error: response.message || 'Erro ao atualizar conta',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar conta',
      };
    }
  }

  static async deleteAccount(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await ApiService.deleteAccount(id);
      return {
        success: response.success,
        error: response.success ? undefined : (response.message || 'Erro ao excluir conta'),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir conta',
      };
    }
  }

  // Transaction operations with API integration
  static async executeTransfer(data: TransferData): Promise<{ success: boolean; transaction?: Transaction; error?: string }> {
    try {
      const transferData = {
        fromAccountId: data.fromAccountId,
        toAccountId: data.toAccountId,
        amount: data.amount,
        descricao: data.descricao || data.description || 'Transferência entre contas',
      };

      const response = await ApiService.createTransfer(transferData);
      if (response.success && response.data) {
        return {
          success: true,
          transaction: this.normalizeTransaction(response.data),
        };
      }
      return {
        success: false,
        error: response.message || 'Erro ao realizar transferência',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao realizar transferência',
      };
    }
  }

  static async executeDeposit(accountId: string, amount: number, description: string): Promise<{ success: boolean; transaction?: Transaction; error?: string }> {
    try {
      const depositData: DepositData = {
        accountId,
        amount,
        descricao: description,
      };

      const response = await ApiService.createDeposit(depositData);
      if (response.success && response.data) {
        return {
          success: true,
          transaction: this.normalizeTransaction(response.data),
        };
      }
      return {
        success: false,
        error: response.message || 'Erro ao realizar depósito',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao realizar depósito',
      };
    }
  }

  static async executeWithdrawal(accountId: string, amount: number, description: string): Promise<{ success: boolean; transaction?: Transaction; error?: string }> {
    try {
      const withdrawalData: WithdrawalData = {
        accountId,
        amount,
        descricao: description,
      };

      const response = await ApiService.createWithdrawal(withdrawalData);
      if (response.success && response.data) {
        return {
          success: true,
          transaction: this.normalizeTransaction(response.data),
        };
      }
      return {
        success: false,
        error: response.message || 'Erro ao realizar saque',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao realizar saque',
      };
    }
  }

  // Normalization functions for backward compatibility
  private static normalizeAccount(account: Account): Account {
    return {
      ...account,
      // Legacy compatibility
      bankName: account.bank?.nome || account.bankName || account.nome,
      balance: account.saldo,
      accountType: account.tipo,
      agency: account.agencia,
      accountNumber: account.numeroConta,
      color: account.cor,
    };
  }

  private static normalizeTransaction(transaction: Transaction): Transaction {
    return {
      ...transaction,
      // Legacy compatibility
      type: transaction.tipo,
      description: transaction.descricao,
      date: transaction.data,
    };
  }

  // Legacy transaction creation (for backward compatibility)
  static createTransaction(data: TransferData): Transaction {
    return {
      id: Date.now().toString(),
      fromAccountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      amount: data.amount,
      tipo: 'TRANSFER',
      descricao: data.descricao || data.description || '',
      status: 'COMPLETED',
      moedaOrigem: 'BRL',
      data: new Date(),
      // Legacy compatibility
      type: 'TRANSFER',
      description: data.descricao || data.description || '',
      date: new Date(),
    };
  }
  // Enhanced validation methods
  private static validateDeposit(amount: number): ValidationResult {
    if (amount <= 0) {
      return { isValid: false, error: 'O valor do depósito deve ser maior que zero' };
    }
    return { isValid: true };
  }

  private static validateWithdrawal(
    account: Account,
    amount: number
  ): ValidationResult {
    if (amount <= 0) {
      return { isValid: false, error: 'O valor do saque deve ser maior que zero' };
    }

    const balance = this.getAccountBalance(account);
    if (balance < amount) {
      return { isValid: false, error: 'Saldo insuficiente para realizar o saque' };
    }

    return { isValid: true };
  }
  private static validateTransfer(
    fromAccount: Account,
    amount: number,
    accounts: Account[],
    toAccountId?: string
  ): ValidationResult {
    if (amount <= 0) {
      return { isValid: false, error: 'O valor da transferência deve ser maior que zero' };
    }

    const balance = this.getAccountBalance(fromAccount);
    if (balance < amount) {
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

  // Legacy methods for backward compatibility
  static executeTransferLegacy(
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
        const currentBalance = this.getAccountBalance(account);
        return { ...account, balance: currentBalance - data.amount, saldo: currentBalance - data.amount };
      }
      if (account.id === data.toAccountId) {
        const currentBalance = this.getAccountBalance(account);
        return { ...account, balance: currentBalance + data.amount, saldo: currentBalance + data.amount };
      }
      return account;
    });

    return { 
      success: true, 
      accounts: updatedAccounts 
    };
  };

  static createTransactionLegacy(data: TransferData): Transaction {
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

  static executeDepositLegacy(
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
        const currentBalance = this.getAccountBalance(acc);
        return { ...acc, balance: currentBalance + amount, saldo: currentBalance + amount };
      }
      return acc;
    });

    const transaction: Transaction = {
      id: Date.now().toString(),
      fromAccountId: accountId,
      toAccountId: accountId,
      amount,
      tipo: 'DEPOSIT',
      descricao: description,
      status: 'COMPLETED',
      moedaOrigem: 'BRL',
      data: new Date(),
      // Legacy compatibility
      type: 'DEPOSIT',
      description,
      date: new Date(),
    };

    return { 
      success: true, 
      accounts: updatedAccounts,
      transaction
    };
  }

  static executeWithdrawalLegacy(
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
        const currentBalance = this.getAccountBalance(acc);
        return { ...acc, balance: currentBalance - amount, saldo: currentBalance - amount };
      }
      return acc;
    });

    const transaction: Transaction = {
      id: Date.now().toString(),
      fromAccountId: accountId,
      amount,
      tipo: 'WITHDRAWAL',
      descricao: description,
      status: 'COMPLETED',
      moedaOrigem: 'BRL',
      data: new Date(),
      // Legacy compatibility
      type: 'WITHDRAWAL',
      description,
      date: new Date(),
    };

    return { 
      success: true, 
      accounts: updatedAccounts,
      transaction
    };
  }

  static getAccountValidation(account: Account, accounts: Account[]): AccountValidation {
    return {
      hasInsufficientFunds: (amount: number): boolean => {
        return this.getAccountBalance(account) < amount;
      },
      canTransfer: (amount: number, toAccountId: string): boolean => {
        const validation = this.validateTransfer(account, amount, accounts, toAccountId);
        return validation.isValid;
      },
      isValidCurrency: (currency: Currency): boolean => {
        return ['BRL', 'USD', 'EUR'].includes(currency);
      },
      canConvertCurrency: (fromCurrency: Currency, toCurrency: Currency): boolean => {
        // For now, only same currency transfers are supported
        return fromCurrency === toCurrency;
      }
    };
  }

  // Enhanced utility methods
  static formatCurrency(value: number, currency: Currency = 'BRL'): string {
    return BankService.formatCurrency(value, currency);
  }

  static getAccountBalance(account: Account): number {
    return BankService.getAccountBalance(account);
  }

  static getAccountCurrency(account: Account): Currency {
    return BankService.getAccountCurrency(account);
  }

  static getAccountDisplayName(account: Account): string {
    return BankService.getAccountDisplayName(account);
  }

  static getAccountBalances(accounts: Account[]): AccountBalance[] {
    return accounts.map(account => ({ 
      id: account.id, 
      saldo: this.getAccountBalance(account) 
    }));
  }

  static validateNewAccount(
    accountData: CreateAccountRequest | Omit<Account, 'id'>, 
    existingAccounts: Account[] = []
  ): ValidationResult {
    if (existingAccounts.length >= 10) {
      return { isValid: false, error: 'Limite máximo de 10 contas atingido' };
    }

    // Handle both new and legacy formats
    const nome = (accountData as any).nome || (accountData as any).bankName;
    const agencia = (accountData as any).agencia || (accountData as any).agency;
    const numeroConta = (accountData as any).numeroConta || (accountData as any).accountNumber;
    const bankId = (accountData as any).bankId;

    if (!nome?.trim()) {
      return { isValid: false, error: 'Nome da conta é obrigatório' };
    }

    if (!bankId?.trim()) {
      return { isValid: false, error: 'Banco é obrigatório' };
    }

    if (!agencia?.trim() || !numeroConta?.trim()) {
      return { isValid: false, error: 'Agência e número da conta são obrigatórios' };
    }

    const isDuplicate = existingAccounts.some(
      acc => {
        const existingAgencia = acc.agencia || acc.agency;
        const existingNumeroConta = acc.numeroConta || acc.accountNumber;
        const existingBankId = acc.bankId;
        
        return existingAgencia === agencia && 
               existingNumeroConta === numeroConta &&
               existingBankId === bankId;
      }
    );

    if (isDuplicate) {
      return { isValid: false, error: 'Esta conta já está cadastrada' };
    }

    return { isValid: true };
  }

  // Enhanced validation methods
  static getAccountValidation(account: Account, accounts: Account[]): AccountValidation {
    return {
      hasInsufficientFunds: (amount: number): boolean => {
        return this.getAccountBalance(account) < amount;
      },
      canTransfer: (amount: number, toAccountId: string): boolean => {
        const validation = this.validateTransfer(account, amount, accounts, toAccountId);
        return validation.isValid;
      },
      isValidCurrency: (currency: Currency): boolean => {
        return ['BRL', 'USD', 'EUR'].includes(currency);
      },
      canConvertCurrency: (fromCurrency: Currency, toCurrency: Currency): boolean => {
        // For now, only same currency transfers are supported
        return fromCurrency === toCurrency;
      }
    };
  }

  // Multi-currency support utilities
  static convertCurrency(
    amount: number, 
    fromCurrency: Currency, 
    toCurrency: Currency, 
    exchangeRate = 1
  ): number {
    if (fromCurrency === toCurrency) return amount;
    return amount * exchangeRate;
  }

  static getAccountSummary(accounts: Account[]) {
    return {
      totalAccounts: accounts.length,
      totalBalance: accounts.reduce((acc, account) => {
        const balance = this.getAccountBalance(account);
        const currency = this.getAccountCurrency(account);
        acc[currency] = (acc[currency] || 0) + balance;
        return acc;
      }, { BRL: 0, USD: 0, EUR: 0 } as Record<Currency, number>),
      bankDistribution: accounts.reduce((acc, account) => {
        const bankType = account.bank?.tipo || 'nacional';
        acc[bankType] = (acc[bankType] || 0) + 1;
        return acc;
      }, { nacional: 0, internacional: 0 }),
    };
  }

  // Clear any cached data
  static clearCache(): void {
    BankService.clearCache();
  }
}


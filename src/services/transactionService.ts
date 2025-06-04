import { ApiService } from './api';
import {
  Transaction,
  TransactionFilters,
  Account,
  Currency,
} from '../types/account';
import { BankService } from './bankService';

export class TransactionService {
  private static transactionsCache: Transaction[] | null = null;
  private static cacheExpiry: number = 0;
  private static readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

  // Get transactions with filtering and caching
  static async getTransactions(
    filters?: TransactionFilters,
    forceRefresh = false
  ): Promise<{ transactions: Transaction[]; pagination?: any }> {
    const now = Date.now();
    
    // Use cache for simple requests without complex filters
    const useCache = !forceRefresh && 
                    !filters?.page && 
                    !filters?.limit && 
                    !filters?.startDate && 
                    !filters?.endDate;

    if (useCache && this.transactionsCache && now < this.cacheExpiry) {
      return { transactions: this.filterTransactions(this.transactionsCache, filters) };
    }

    try {
      const response = await ApiService.getTransactions(filters);
      if (response.success && response.data) {
        const normalizedTransactions = response.data.map(this.normalizeTransaction);
        
        // Cache only if no pagination filters
        if (!filters?.page && !filters?.limit) {
          this.transactionsCache = normalizedTransactions;
          this.cacheExpiry = now + this.CACHE_DURATION;
        }
        
        return {
          transactions: normalizedTransactions,
          pagination: response.pagination,
        };
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }

    return { transactions: [] };
  }

  // Filter transactions locally
  private static filterTransactions(transactions: Transaction[], filters?: TransactionFilters): Transaction[] {
    if (!filters) return transactions;

    return transactions.filter(transaction => {
      // Type filter
      if (filters.tipo && transaction.tipo !== filters.tipo) {
        return false;
      }

      // Account filters
      if (filters.fromAccountId && transaction.fromAccountId !== filters.fromAccountId) {
        return false;
      }

      if (filters.toAccountId && transaction.toAccountId !== filters.toAccountId) {
        return false;
      }

      // Status filter
      if (filters.status && transaction.status !== filters.status) {
        return false;
      }

      // Date filters
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        if (new Date(transaction.data) < startDate) {
          return false;
        }
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        if (new Date(transaction.data) > endDate) {
          return false;
        }
      }

      return true;
    });
  }

  // Normalize transaction for backward compatibility
  private static normalizeTransaction(transaction: Transaction): Transaction {
    return {
      ...transaction,
      // Legacy compatibility
      type: transaction.tipo,
      description: transaction.descricao,
      date: transaction.data,
    };
  }

  // Get transaction summary
  static getTransactionSummary(transactions: Transaction[]) {
    return transactions.reduce(
      (acc, transaction) => {
        const amount = transaction.amount;
        
        switch (transaction.tipo) {
          case 'DEPOSIT':
            acc.deposits += amount;
            acc.totalDeposits++;
            break;
          case 'WITHDRAWAL':
            acc.withdrawals += amount;
            acc.totalWithdrawals++;
            break;
          case 'TRANSFER':
            acc.transfers += amount;
            acc.totalTransfers++;
            break;
        }
        
        return acc;
      },
      {
        deposits: 0,
        withdrawals: 0,
        transfers: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalTransfers: 0,
      }
    );
  }

  // Format transaction for display
  static formatTransaction(transaction: Transaction, accounts: Account[]) {
    const fromAccount = accounts.find(acc => acc.id === transaction.fromAccountId);
    const toAccount = transaction.toAccountId 
      ? accounts.find(acc => acc.id === transaction.toAccountId) 
      : null;

    return {
      ...transaction,
      fromAccountName: fromAccount 
        ? BankService.getAccountDisplayName(fromAccount) 
        : 'Conta não encontrada',
      toAccountName: toAccount 
        ? BankService.getAccountDisplayName(toAccount) 
        : null,
      formattedAmount: BankService.formatCurrency(
        transaction.amount, 
        transaction.moedaOrigem
      ),
      formattedDate: new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(transaction.data)),
    };
  }

  // Get transactions by account
  static async getAccountTransactions(
    accountId: string,
    limit = 10
  ): Promise<Transaction[]> {
    const { transactions } = await this.getTransactions({
      fromAccountId: accountId,
      limit,
    });
    
    // Also get transactions where this account is the recipient
    const { transactions: receivedTransactions } = await this.getTransactions({
      toAccountId: accountId,
      limit,
    });
    
    // Combine and sort by date
    const allTransactions = [...transactions, ...receivedTransactions]
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, limit);
    
    return allTransactions;
  }

  // Get transaction statistics
  static getTransactionStats(transactions: Transaction[]) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentTransactions = transactions.filter(
      t => new Date(t.data) >= thirtyDaysAgo
    );
    
    const weeklyTransactions = transactions.filter(
      t => new Date(t.data) >= sevenDaysAgo
    );
    
    return {
      total: transactions.length,
      last30Days: recentTransactions.length,
      last7Days: weeklyTransactions.length,
      totalValue: transactions.reduce((sum, t) => sum + t.amount, 0),
      averageValue: transactions.length > 0 
        ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length 
        : 0,
      byType: {
        transfers: transactions.filter(t => t.tipo === 'TRANSFER').length,
        deposits: transactions.filter(t => t.tipo === 'DEPOSIT').length,
        withdrawals: transactions.filter(t => t.tipo === 'WITHDRAWAL').length,
      },
    };
  }

  // Clear cache
  static clearCache(): void {
    this.transactionsCache = null;
    this.cacheExpiry = 0;
  }
}

export default TransactionService;


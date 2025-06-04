export type MoneyOperationType = 'deposit' | 'withdrawal' | 'transfer';
export type Currency = 'BRL' | 'USD' | 'EUR';
export type BankType = 'nacional' | 'internacional';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

// Re-export from banks data for convenience
export { BANKS_DATA, ACCOUNT_TYPES, CURRENCY_CONFIG, BANK_COLORS, DEFAULT_BANK_COLOR } from '../data/banks';

export interface Bank {
  id: string;
  nome: string;
  tipo: BankType;
  codigo?: string;
  logo?: string;
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Account {
  id: string;
  nome: string;
  saldo: number;
  moeda: Currency;
  tipo: string;
  agencia: string;
  numeroConta: string;
  bankId: string;
  userId?: string;
  cor?: string;
  ativo: boolean;
  bank?: Bank;
  createdAt?: Date;
  updatedAt?: Date;
  // Legacy compatibility
  bankName?: string;
  balance?: number;
  accountType?: string;
  agency?: string;
  accountNumber?: string;
  color?: string;
}

export interface Transaction {
  id: string;
  fromAccountId: string;
  toAccountId?: string;
  amount: number;
  tipo: 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL';
  descricao: string;
  status: TransactionStatus;
  taxas?: number;
  moedaOrigem: Currency;
  moedaDestino?: Currency;
  cotacao?: number;
  data: Date;
  fromAccount?: Account;
  toAccount?: Account;
  createdAt?: Date;
  updatedAt?: Date;
  // Legacy compatibility
  type?: 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL';
  description?: string;
  date?: Date;
}

export interface TransferData {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  descricao: string;
  // Legacy compatibility
  description?: string;
}

export interface DepositData {
  accountId: string;
  amount: number;
  descricao: string;
}

export interface WithdrawalData {
  accountId: string;
  amount: number;
  descricao: string;
}

export interface BankFilters {
  tipo?: BankType;
  search?: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  tipo?: 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL';
  fromAccountId?: string;
  toAccountId?: string;
  startDate?: string;
  endDate?: string;
  status?: TransactionStatus;
}

export interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  open: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
// Utility types
export type AccountFormData = {
  nome: string;
  bankId: string;
  tipo: string;
  agencia: string;
  numeroConta: string;
  saldo?: number;
  moeda?: Currency;
  cor?: string;
  // Legacy compatibility
  bankName?: string;
  balance?: number;
  accountType?: string;
  agency?: string;
  accountNumber?: string;
  color?: string;
};
export type AccountUpdateData = Partial<AccountFormData>;

export interface TransactionResponse extends Transaction {
  fromAccount: Account;
  toAccount?: Account;
}

// Currency exchange rates (for future international transfers)
export interface ExchangeRates {
  [key: string]: {
    [key: string]: number;
  };
}

// Multi-currency account summary
export interface AccountSummary {
  totalAccounts: number;
  totalBalance: {
    BRL: number;
    USD: number;
    EUR: number;
  };
  bankDistribution: {
    nacional: number;
    internacional: number;
  };
}

export type AccountBalance = Pick<Account, 'id' | 'saldo'>;

// Account creation/update interfaces
export interface CreateAccountRequest {
  nome: string;
  bankId: string;
  tipo: string;
  agencia: string;
  numeroConta: string;
  saldo?: number;
  moeda?: Currency;
  cor?: string;
}

export interface UpdateAccountRequest {
  nome?: string;
  tipo?: string;
  cor?: string;
}

export interface AccountValidation {
  hasInsufficientFunds: (amount: number) => boolean;
  canTransfer: (amount: number, toAccountId: string) => boolean;
  isValidCurrency: (currency: Currency) => boolean;
  canConvertCurrency: (fromCurrency: Currency, toCurrency: Currency) => boolean;
}

// Enhanced validation responses
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export type MoneyOperationType = 'deposit' | 'withdrawal' | 'transfer';

export interface Account {
  id: string;
  bankName: string;
  balance: number;
  accountType: string;
  agency: string;
  accountNumber: string;
  color?: string;
  logo?: string;
}

export interface Transaction {
  id: string;
  fromAccountId: string;
  toAccountId?: string;
  amount: number;
  type: 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL';
  description: string;
  date: Date;
}

export interface TransferData {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
}

export interface NotificationState {
  message: string;
  type: 'success' | 'error';
  open: boolean;
}
// Utility types
export type AccountFormData = Omit<Account, 'id'>;
export type AccountUpdateData = Partial<AccountFormData>;

export interface TransactionResponse extends Transaction {
  fromAccount: Account;
  toAccount?: Account;
}

export type AccountBalance = Pick<Account, 'id' | 'balance'>;

export interface AccountValidation {
  hasInsufficientFunds: (amount: number) => boolean;
  canTransfer: (amount: number, toAccountId: string) => boolean;
}

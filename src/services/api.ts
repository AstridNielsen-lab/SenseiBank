import axios from 'axios';
import {
  Bank,
  Account,
  Transaction,
  TransferData,
  DepositData,
  WithdrawalData,
  BankFilters,
  TransactionFilters,
  CreateAccountRequest,
  UpdateAccountRequest,
  ApiResponse,
} from '../types/account';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens (future implementation)
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export class ApiService {
  // Bank operations
  static async getBanks(filters?: BankFilters): Promise<ApiResponse<Bank[]>> {
    const params = new URLSearchParams();
    if (filters?.tipo) params.append('tipo', filters.tipo);
    if (filters?.search) params.append('search', filters.search);
    
    const response = await api.get(`/banks?${params.toString()}`);
    return response.data;
  }

  static async getBank(id: string): Promise<ApiResponse<Bank>> {
    const response = await api.get(`/banks/${id}`);
    return response.data;
  }

  static async createBank(bankData: Omit<Bank, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Bank>> {
    const response = await api.post('/banks', bankData);
    return response.data;
  }

  // Account operations
  static async getAccounts(): Promise<ApiResponse<Account[]>> {
    const response = await api.get('/accounts');
    return response.data;
  }

  static async getAccount(id: string): Promise<ApiResponse<Account>> {
    const response = await api.get(`/accounts/${id}`);
    return response.data;
  }

  static async createAccount(accountData: CreateAccountRequest): Promise<ApiResponse<Account>> {
    const response = await api.post('/accounts', accountData);
    return response.data;
  }

  static async updateAccount(id: string, accountData: UpdateAccountRequest): Promise<ApiResponse<Account>> {
    const response = await api.put(`/accounts/${id}`, accountData);
    return response.data;
  }

  static async deleteAccount(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/accounts/${id}`);
    return response.data;
  }

  // Transaction operations
  static async getTransactions(filters?: TransactionFilters): Promise<ApiResponse<Transaction[]>> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.tipo) params.append('tipo', filters.tipo);
    if (filters?.fromAccountId) params.append('fromAccountId', filters.fromAccountId);
    if (filters?.toAccountId) params.append('toAccountId', filters.toAccountId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.status) params.append('status', filters.status);
    
    const response = await api.get(`/transactions?${params.toString()}`);
    return response.data;
  }

  static async createTransfer(transferData: TransferData): Promise<ApiResponse<Transaction>> {
    const response = await api.post('/transactions/transfer', transferData);
    return response.data;
  }

  static async createDeposit(depositData: DepositData): Promise<ApiResponse<Transaction>> {
    const response = await api.post('/transactions/deposit', depositData);
    return response.data;
  }

  static async createWithdrawal(withdrawalData: WithdrawalData): Promise<ApiResponse<Transaction>> {
    const response = await api.post('/transactions/withdrawal', withdrawalData);
    return response.data;
  }

  // Health check
  static async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await api.get('/health');
    return response.data;
  }
}

export default ApiService;


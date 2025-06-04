import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
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

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const DEFAULT_TIMEOUT = 15000; // 15 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Error types
interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
  timestamp?: string;
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens and request metadata
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for metrics
    config.metadata = { 
      ...config.metadata,
      startTime: new Date().getTime()
    };
    
    return config;
  },
  (error) => {
    console.error('Request preparation failed:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and retry logic
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Add response time metrics
    const requestStartTime = response.config.metadata?.startTime;
    if (requestStartTime) {
      const endTime = new Date().getTime();
      const duration = endTime - requestStartTime;
      response.config.metadata = { ...response.config.metadata, duration };
      
      // Log slow requests (over 1 second)
      if (duration > 1000) {
        console.warn(`Slow API request to ${response.config.url}: ${duration}ms`);
      }
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & { 
      _retry?: number;
      metadata?: { startTime?: number; duration?: number }
    };
    
    // Calculate response time even for errors
    const requestStartTime = config?.metadata?.startTime;
    if (requestStartTime) {
      const endTime = new Date().getTime();
      const duration = endTime - requestStartTime;
      config.metadata = { ...config?.metadata, duration };
    }
    
    // Only retry idempotent requests (GET, PUT, DELETE, HEAD, OPTIONS)
    const idempotentMethods = ['get', 'put', 'delete', 'head', 'options'];
    const shouldRetry = idempotentMethods.includes(config?.method?.toLowerCase() || '');
    
    // Initialize retry count
    config._retry = config._retry || 0;
    
    // Check if we should retry (server errors 5xx or network errors, but not 4xx client errors)
    if (
      shouldRetry &&
      config._retry < MAX_RETRIES && 
      (
        !error.response || 
        (error.response.status >= 500 && error.response.status < 600) ||
        error.code === 'ECONNABORTED' || 
        error.message.includes('timeout')
      )
    ) {
      config._retry += 1;
      
      // Exponential backoff with jitter
      const delay = RETRY_DELAY * Math.pow(2, config._retry - 1) * (1 + Math.random() * 0.1);
      
      console.log(`Retrying request to ${config.url} (${config._retry}/${MAX_RETRIES}) after ${delay}ms`);
      
      // Wait for the delay before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Reset start time for the retry
      config.metadata = { ...config?.metadata, startTime: new Date().getTime() };
      
      // Retry the request
      return api(config);
    }
    
    // Format error response
    const apiError: ApiError = {
      message: error.message || 'Unknown error occurred',
      status: error.response?.status,
      code: error.code || 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString(),
      details: error.response?.data
    };
    
    // Log the error with details
    console.error('API Error:', apiError);
    
    // Specific handling for different error types
    if (error.response) {
      // The server responded with a status code outside of 2xx range
      console.error(`Server error: ${error.response.status}`, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network error: No response received from server');
    } else {
      // Something happened in setting up the request that triggered an error
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(apiError);
  }
);

// Add response timeout cancellation capability
const getCancelToken = () => {
  return axios.CancelToken.source();
};

export class ApiService {
  // Utility method to handle request cancellation
  static createCancelToken() {
    return getCancelToken();
  }
  
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
  // Error handling helper
  static handleApiError(error: any): never {
    let formattedError: ApiError;
    
    if (axios.isCancel(error)) {
      formattedError = {
        message: 'Request was cancelled',
        code: 'REQUEST_CANCELLED',
        timestamp: new Date().toISOString()
      };
    } else if (error.status) {
      // Already formatted by our interceptor
      formattedError = error;
    } else {
      // Format any other errors
      formattedError = {
        message: error.message || 'Unknown error occurred',
        code: error.code || 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString(),
        details: error.response?.data
      };
    }
    
    // Additional logging or error reporting can be added here
    
    throw formattedError;
  }
}

// Export the axios instance for direct use if needed
export { api };

export default ApiService;

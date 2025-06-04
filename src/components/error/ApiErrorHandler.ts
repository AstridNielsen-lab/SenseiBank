import axios, { AxiosError } from 'axios';

// Define common error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  VALIDATION = 'VALIDATION',
  UNEXPECTED = 'UNEXPECTED'
}

// Interface for structured error responses
export interface ApiError {
  type: ErrorType;
  message: string;
  status?: number;
  details?: any;
  originalError?: any;
}

/**
 * Formats API errors into a consistent structure
 */
export const formatApiError = (error: any): ApiError => {
  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // Network errors
    if (!axiosError.response) {
      return {
        type: ErrorType.NETWORK,
        message: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
        originalError: error
      };
    }
    
    // Server returned an error response
    const status = axiosError.response.status;
    
    // Auth errors
    if (status === 401 || status === 403) {
      return {
        type: ErrorType.AUTH,
        message: status === 401 
          ? 'Sua sessão expirou. Por favor, faça login novamente.' 
          : 'Você não tem permissão para acessar este recurso.',
        status,
        originalError: error
      };
    }
    
    // Not found
    if (status === 404) {
      return {
        type: ErrorType.NOT_FOUND,
        message: 'O recurso solicitado não foi encontrado.',
        status,
        originalError: error
      };
    }
    
    // Validation errors
    if (status === 400 || status === 422) {
      return {
        type: ErrorType.VALIDATION,
        message: 'Há um problema com os dados enviados. Verifique e tente novamente.',
        status,
        details: axiosError.response.data,
        originalError: error
      };
    }
    
    // Server errors
    if (status >= 500) {
      return {
        type: ErrorType.SERVER,
        message: 'Ocorreu um erro no servidor. Tente novamente mais tarde.',
        status,
        originalError: error
      };
    }
    
    // Other HTTP errors
    return {
      type: ErrorType.UNEXPECTED,
      message: `Erro inesperado (${status}). Por favor, tente novamente.`,
      status,
      originalError: error
    };
  }
  
  // Non-Axios errors
  if (error instanceof Error) {
    return {
      type: ErrorType.UNEXPECTED,
      message: error.message || 'Ocorreu um erro inesperado.',
      originalError: error
    };
  }
  
  // Unknown errors
  return {
    type: ErrorType.UNEXPECTED,
    message: 'Ocorreu um erro inesperado.',
    originalError: error
  };
};

/**
 * Get user-friendly message based on error type
 */
export const getUserFriendlyErrorMessage = (error: ApiError): string => {
  return error.message;
};

/**
 * Handle common API errors and perform side effects (like logout on auth errors)
 */
export const handleApiError = (error: any): ApiError => {
  const formattedError = formatApiError(error);
  
  // Handle authentication errors
  if (formattedError.type === ErrorType.AUTH) {
    // You might want to redirect to login or clear auth tokens
    console.log('Auth error - should handle logout');
    // Example: store.dispatch(logout());
  }
  
  return formattedError;
};

export default {
  formatApiError,
  getUserFriendlyErrorMessage,
  handleApiError,
  ErrorType
};


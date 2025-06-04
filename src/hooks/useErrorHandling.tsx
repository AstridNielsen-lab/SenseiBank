import { useState, useCallback } from 'react';
import { handleApiError, ApiError, ErrorType } from '../components/error/ApiErrorHandler';

interface ErrorHandlingHook {
  error: ApiError | null;
  isLoading: boolean;
  setError: (error: ApiError | null) => void;
  handleError: (error: any) => ApiError;
  clearError: () => void;
  withErrorHandling: <T>(promise: Promise<T>) => Promise<T>;
}

/**
 * Hook to manage API errors and loading state in components
 */
export const useErrorHandling = (initialLoading = false): ErrorHandlingHook => {
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading);

  const handleError = useCallback((err: any): ApiError => {
    const formattedError = handleApiError(err);
    setError(formattedError);
    return formattedError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Wraps promises with error handling and loading state management
   */
  const withErrorHandling = useCallback(async <T,>(promise: Promise<T>): Promise<T> => {
    setIsLoading(true);
    clearError();
    
    try {
      const result = await promise;
      return result;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  return {
    error,
    isLoading,
    setError,
    handleError,
    clearError,
    withErrorHandling
  };
};

export default useErrorHandling;


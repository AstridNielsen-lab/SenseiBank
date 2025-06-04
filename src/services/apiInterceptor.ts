import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { formatApiError, handleApiError, ErrorType } from '../components/error/ApiErrorHandler';

/**
 * Configuration for API retry mechanism
 */
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryStatusCodes: number[];
  retryMethods: string[];
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
  retryMethods: ['get', 'head', 'options']
};

/**
 * Setup API interceptors with advanced error handling and retry mechanism
 * @param api - The axios instance to apply interceptors to
 * @param retryConfig - Optional custom retry configuration
 */
export const setupApiInterceptors = (
  api: AxiosInstance,
  retryConfig: Partial<RetryConfig> = {}
): AxiosInstance => {
  // Merge default config with provided config
  const config: RetryConfig = {
    ...DEFAULT_RETRY_CONFIG,
    ...retryConfig
  };

  // Store for requests in progress to avoid duplicate retries
  const requestsInProgress = new Map<string, Promise<AxiosResponse>>();

  // Request interceptor
  api.interceptors.request.use(
    (reqConfig) => {
      // Add timestamp to help identify and deduplicate requests
      const requestKey = generateRequestKey(reqConfig);
      
      // Check if this exact request is already in progress
      if (requestsInProgress.has(requestKey)) {
        console.log('Duplicate request detected, using existing promise');
        return {
          ...reqConfig,
          adapter: () => requestsInProgress.get(requestKey) as Promise<AxiosResponse>
        };
      }

      // Add auth token if available
      const token = localStorage.getItem('auth_token');
      if (token) {
        reqConfig.headers = reqConfig.headers || {};
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }

      return reqConfig;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor with retry logic
  api.interceptors.response.use(
    (response) => {
      // Remove from in-progress requests
      const requestKey = generateRequestKey(response.config);
      requestsInProgress.delete(requestKey);
      return response;
    },
    async (error: AxiosError) => {
      const { config } = error;
      
      // If no config exists, or the request was cancelled, just reject
      if (!config || error.code === 'ECONNABORTED') {
        return Promise.reject(handleApiError(error));
      }

      // Remove from in-progress requests
      const requestKey = generateRequestKey(config);
      requestsInProgress.delete(requestKey);

      // Initialize retry count if not already set
      const retryCount = config.headers['x-retry-count'] ? 
        parseInt(config.headers['x-retry-count'] as string, 10) : 0;

      // Format the error using our error handler
      const formattedError = formatApiError(error);

      // Handle authentication errors (no retry for these)
      if (formattedError.type === ErrorType.AUTH) {
        // Potentially log the user out or redirect to login
        console.log('Auth error - handling logout or redirect');
        // Example: store.dispatch(logout());
        return Promise.reject(handleApiError(error));
      }
      
      // Check if we should retry this request
      const shouldRetry = 
        // Check retry count
        retryCount < config.maxRetries &&
        // Check if the method is retryable
        config.method && 
        config.retryMethods.includes(config.method.toLowerCase()) &&
        // Check if the status code is retryable or if it's a network error
        (
          !error.response || 
          config.retryStatusCodes.includes(error.response.status)
        );

      if (shouldRetry) {
        // Increment retry count
        const newConfig = {
          ...config,
          headers: {
            ...config.headers,
            'x-retry-count': (retryCount + 1).toString()
          }
        };

        // Delay before retry
        const delay = config.retryDelay * Math.pow(2, retryCount);
        console.log(`Retrying request (${retryCount + 1}/${config.maxRetries}) after ${delay}ms`);
        
        try {
          await new Promise(resolve => setTimeout(resolve, delay));
          return api(newConfig);
        } catch (retryError) {
          return Promise.reject(handleApiError(retryError));
        }
      }

      // If we shouldn't retry, process the error
      console.error('API Error:', formattedError.message, {
        type: formattedError.type,
        status: formattedError.status,
        details: formattedError.details
      });

      return Promise.reject(handleApiError(error));
    }
  );

  return api;
};

/**
 * Create a configured API instance with interceptors
 * @param baseURL - API base URL
 * @param options - Additional axios config options
 * @param retryConfig - Optional custom retry configuration
 */
export const createApiWithInterceptors = (
  baseURL: string,
  options: AxiosRequestConfig = {},
  retryConfig: Partial<RetryConfig> = {}
): AxiosInstance => {
  // Create the API instance
  const api = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
    // Add retry config to the axios instance so it's available in interceptors
    maxRetries: retryConfig.maxRetries || DEFAULT_RETRY_CONFIG.maxRetries,
    retryDelay: retryConfig.retryDelay || DEFAULT_RETRY_CONFIG.retryDelay,
    retryStatusCodes: retryConfig.retryStatusCodes || DEFAULT_RETRY_CONFIG.retryStatusCodes,
    retryMethods: retryConfig.retryMethods || DEFAULT_RETRY_CONFIG.retryMethods
  });

  // Setup interceptors
  return setupApiInterceptors(api, retryConfig);
};

/**
 * Generate a unique key for a request to identify duplicates
 */
const generateRequestKey = (config: AxiosRequestConfig): string => {
  const { method, url, params, data } = config;
  return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
};

export default {
  setupApiInterceptors,
  createApiWithInterceptors
};


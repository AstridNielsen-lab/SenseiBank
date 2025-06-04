# SenseiBank Frontend

Este é o frontend da aplicação SenseiBank, um sistema bancário moderno e intuitivo para gerenciamento de contas, transações e investimentos.

## Estrutura de Gerenciamento de Erros

O SenseiBank implementa uma estratégia abrangente de gerenciamento de erros em várias camadas:

### 1. ErrorBoundary

Um componente de alto nível que captura erros não tratados em componentes React:

- `ErrorBoundary.tsx`: Componente de classe que implementa métodos do ciclo de vida para capturar erros
- `ErrorFallback.tsx`: UI de fallback para exibir quando ocorre um erro

### 2. API Error Handling

- `ApiErrorHandler.ts`: Utilitário para formatar e classificar erros de API
- `useErrorHandling.tsx`: Hook personalizado para gerenciar estados de erro e loading

### 3. Componentes com Tratamento de Erros

- Todos os componentes que fazem chamadas à API usam o hook `useErrorHandling`
- UIs específicas para estados de erro em cada componente

### 4. Sistema de Notificação

- Snackbars para notificações de erro e sucesso
- Mensagens amigáveis para o usuário

## Como Usar o Sistema de Erros

### ErrorBoundary

Envolva componentes ou seções da aplicação:

```jsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Hook de Tratamento de Erros

```jsx
const { error, isLoading, handleError, withErrorHandling } = useErrorHandling();

// Use o wrapper para chamadas assíncronas
const fetchData = async () => {
  try {
    const data = await withErrorHandling(apiCall());
    // process data
  } catch (err) {
    // error already handled by the hook
  }
};

// Renderize UI baseada no estado
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

### API Error Handler

```js
import { formatApiError, ErrorType } from '../components/error/ApiErrorHandler';

try {
  // ...
} catch (error) {
  const formattedError = formatApiError(error);
  
  if (formattedError.type === ErrorType.AUTH) {
    // handle auth errors
  } else if (formattedError.type === ErrorType.NETWORK) {
    // handle network errors
  }
}
```


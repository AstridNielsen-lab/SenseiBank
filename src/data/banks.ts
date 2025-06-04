// Legacy bank data for backward compatibility
export const BANKS_DATA = [
  // Bancos Nacionais
  { nome: 'Banco do Brasil', tipo: 'nacional' as const, codigo: '001' },
  { nome: 'Caixa Econômica Federal', tipo: 'nacional' as const, codigo: '104' },
  { nome: 'Itaú Unibanco', tipo: 'nacional' as const, codigo: '341' },
  { nome: 'Bradesco', tipo: 'nacional' as const, codigo: '237' },
  { nome: 'Santander Brasil', tipo: 'nacional' as const, codigo: '033' },
  { nome: 'Nubank', tipo: 'nacional' as const, codigo: '260' },
  { nome: 'Banco Inter', tipo: 'nacional' as const, codigo: '077' },
  { nome: 'C6 Bank', tipo: 'nacional' as const, codigo: '336' },
  { nome: 'BTG Pactual', tipo: 'nacional' as const, codigo: '208' },
  { nome: 'PagBank', tipo: 'nacional' as const, codigo: '290' },
  
  // Bancos Internacionais
  { nome: 'JPMorgan Chase', tipo: 'internacional' as const, codigo: 'JPM' },
  { nome: 'Bank of America', tipo: 'internacional' as const, codigo: 'BAC' },
  { nome: 'Citigroup', tipo: 'internacional' as const, codigo: 'C' },
  { nome: 'HSBC', tipo: 'internacional' as const, codigo: 'HSBC' },
  { nome: 'BNP Paribas', tipo: 'internacional' as const, codigo: 'BNP' },
  { nome: 'Deutsche Bank', tipo: 'internacional' as const, codigo: 'DB' },
  { nome: 'Barclays', tipo: 'internacional' as const, codigo: 'BARC' },
  { nome: 'Royal Bank of Canada', tipo: 'internacional' as const, codigo: 'RBC' },
];

// Account types by bank type
export const ACCOUNT_TYPES = {
  nacional: [
    'Conta Corrente',
    'Conta Poupança',
    'Conta Pagamento',
    'Conta PJ',
    'Conta Salário',
    'Conta Universitária',
  ],
  internacional: [
    'Checking Account',
    'Savings Account',
    'Business Account',
    'Investment Account',
    'Student Account',
  ],
};

// Currency symbols and formatting
export const CURRENCY_CONFIG = {
  BRL: {
    symbol: 'R$',
    name: 'Real Brasileiro',
    locale: 'pt-BR',
    decimals: 2,
  },
  USD: {
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    decimals: 2,
  },
  EUR: {
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    decimals: 2,
  },
};

// Bank colors for better visual identification
export const BANK_COLORS = {
  'Banco do Brasil': '#FFBF00',
  'Caixa Econômica Federal': '#003B8E',
  'Itaú Unibanco': '#FF6600',
  'Bradesco': '#CC092F',
  'Santander Brasil': '#E30613',
  'Nubank': '#8A05BE',
  'Banco Inter': '#FF7A00',
  'C6 Bank': '#FFD700',
  'BTG Pactual': '#1C1C1C',
  'PagBank': '#00C853',
  'JPMorgan Chase': '#0066B2',
  'Bank of America': '#E31837',
  'Citigroup': '#DC143C',
  'HSBC': '#DB0011',
  'BNP Paribas': '#00915A',
  'Deutsche Bank': '#001F5F',
  'Barclays': '#00AEEF',
  'Royal Bank of Canada': '#005DAA',
};

// Default fallback color
export const DEFAULT_BANK_COLOR = '#1a73e8';


import { ApiService } from './api';
import {
  Bank,
  Account,
  BankType,
  Currency,
  CURRENCY_CONFIG,
  BANK_COLORS,
  DEFAULT_BANK_COLOR,
} from '../types/account';
import { BANKS_DATA } from '../data/banks';

export class BankService {
  private static banksCache: Bank[] | null = null;
  private static cacheExpiry: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Get all banks with caching
  static async getBanks(tipo?: BankType, forceRefresh = false): Promise<Bank[]> {
    const now = Date.now();
    
    // Check cache validity
    if (!forceRefresh && this.banksCache && now < this.cacheExpiry) {
      return this.filterBanksByType(this.banksCache, tipo);
    }

    try {
      const response = await ApiService.getBanks({ tipo });
      if (response.success && response.data) {
        this.banksCache = response.data;
        this.cacheExpiry = now + this.CACHE_DURATION;
        return response.data;
      }
    } catch (error) {
      console.warn('Failed to fetch banks from API, using fallback data:', error);
      // Fallback to static data if API fails
      return this.getFallbackBanks(tipo);
    }

    return [];
  }

  // Get fallback banks from static data
  private static getFallbackBanks(tipo?: BankType): Bank[] {
    const fallbackBanks: Bank[] = BANKS_DATA.map((bank, index) => ({
      id: `fallback-${index}`,
      nome: bank.nome,
      tipo: bank.tipo,
      codigo: bank.codigo,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return this.filterBanksByType(fallbackBanks, tipo);
  }

  private static filterBanksByType(banks: Bank[], tipo?: BankType): Bank[] {
    if (!tipo) return banks;
    return banks.filter(bank => bank.tipo === tipo);
  }

  // Get specific bank
  static async getBank(id: string): Promise<Bank | null> {
    try {
      const response = await ApiService.getBank(id);
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Failed to fetch bank:', error);
      return null;
    }
  }

  // Get bank by name (for legacy compatibility)
  static async getBankByName(name: string): Promise<Bank | null> {
    const banks = await this.getBanks();
    return banks.find(bank => bank.nome === name) || null;
  }

  // Get bank color
  static getBankColor(bankName: string): string {
    return BANK_COLORS[bankName as keyof typeof BANK_COLORS] || DEFAULT_BANK_COLOR;
  }

  // Currency utilities
  static formatCurrency(amount: number, currency: Currency = 'BRL'): string {
    const config = CURRENCY_CONFIG[currency];
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(amount);
  }

  static getCurrencySymbol(currency: Currency): string {
    return CURRENCY_CONFIG[currency].symbol;
  }

  static getCurrencyName(currency: Currency): string {
    return CURRENCY_CONFIG[currency].name;
  }

  // Account utilities
  static getAccountDisplayName(account: Account): string {
    const bankName = account.bank?.nome || account.bankName || 'Banco Desconhecido';
    const accountType = account.tipo || account.accountType || 'Conta';
    return `${bankName} - ${accountType}`;
  }

  static getAccountBalance(account: Account): number {
    return account.saldo ?? account.balance ?? 0;
  }

  static getAccountCurrency(account: Account): Currency {
    return account.moeda || 'BRL';
  }

  // Bank type utilities
  static getBanksByType(banks: Bank[]): { nacional: Bank[]; internacional: Bank[] } {
    return {
      nacional: banks.filter(bank => bank.tipo === 'nacional'),
      internacional: banks.filter(bank => bank.tipo === 'internacional'),
    };
  }

  // Validation utilities
  static validateBankData(bank: Partial<Bank>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!bank.nome?.trim()) {
      errors.push('Nome do banco é obrigatório');
    }

    if (!bank.tipo || !['nacional', 'internacional'].includes(bank.tipo)) {
      errors.push('Tipo do banco deve ser "nacional" ou "internacional"');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Clear cache
  static clearCache(): void {
    this.banksCache = null;
    this.cacheExpiry = 0;
  }
}

export default BankService;


export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface FinancialBot {
  id: string;
  name: string;
  description: string;
  specialization: string[];
  isActive: boolean;
}

export interface UserInvestmentProfile {
  age: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentGoals: string[];
  timeHorizon: string;
  monthlyInvestment: number;
  currentPortfolio?: {
    stocks: any[];
    totalValue: number;
    cashBalance: number;
  };
}

export interface MarketAlert {
  id: string;
  type: 'opportunity' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}


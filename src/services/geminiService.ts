import axios from 'axios';

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
const API_KEY = "AIzaSyAuFi5KtPsMJI5IC8c5FjvYD5IbuBdwH_U";

interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
    finishReason: string;
    index: number;
    safetyRatings: any[];
  }[];
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

interface Portfolio {
  totalValue: number;
  stocks: {
    symbol: string;
    shares: number;
    currentPrice: number;
    totalValue: number;
    allocation: number;
  }[];
  cashBalance: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  investmentGoals: string[];
}

interface FinancialAdvice {
  recommendation: string;
  reasoning: string;
  suggestedActions: string[];
  riskAssessment: string;
  confidence: number;
}

class GeminiFinancialService {
  private async callGeminiAPI(prompt: string): Promise<string> {
    try {
      const requestData: GeminiRequest = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      };

      const response = await axios.post<GeminiResponse>(
        `${API_URL}?key=${API_KEY}`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.candidates && response.data.candidates.length > 0) {
        return response.data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Nenhuma resposta válida da API');
      }
    } catch (error) {
      console.error('Erro ao chamar a API do Gemini:', error);
      throw new Error('Falha na comunicação com o assistente de IA');
    }
  }

  async analyzePortfolio(portfolio: Portfolio): Promise<FinancialAdvice> {
    const prompt = `
      Como especialista em finanças e gestão de carteiras, analise a seguinte carteira de investimentos e forneça recomendações detalhadas:

      DADOS DA CARTEIRA:
      - Valor Total: R$ ${portfolio.totalValue.toLocaleString('pt-BR')}
      - Saldo em Caixa: R$ ${portfolio.cashBalance.toLocaleString('pt-BR')}
      - Perfil de Risco: ${portfolio.riskProfile}
      - Objetivos: ${portfolio.investmentGoals.join(', ')}

      POSIÇÕES ATUAIS:
      ${portfolio.stocks.map(stock => 
        `- ${stock.symbol}: ${stock.shares} ações @ R$ ${stock.currentPrice.toFixed(2)} (${stock.allocation.toFixed(1)}% da carteira)`
      ).join('\n')}

      Por favor, forneça uma análise estruturada incluindo:
      1. Avaliação geral da carteira
      2. Recomendações específicas de rebalanceamento
      3. Ações sugeridas (comprar/vender/manter)
      4. Avaliação de risco atual
      5. Nível de confiança na sua análise (0-100%)

      Responda no formato JSON:
      {
        "recommendation": "sua recomendação principal",
        "reasoning": "raciocínio detalhado",
        "suggestedActions": ["ação 1", "ação 2", "ação 3"],
        "riskAssessment": "avaliação de risco",
        "confidence": número_de_0_a_100
      }
    `;

    try {
      const response = await this.callGeminiAPI(prompt);
      // Extrai JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        // Fallback se não conseguir parsear JSON
        return {
          recommendation: response.substring(0, 200) + '...',
          reasoning: 'Análise detalhada disponível na resposta completa',
          suggestedActions: ['Revisar análise detalhada', 'Consultar assessor financeiro'],
          riskAssessment: 'Risco moderado identificado',
          confidence: 75
        };
      }
    } catch (error) {
      console.error('Erro ao analisar carteira:', error);
      throw error;
    }
  }

  async answerFinancialQuestion(question: string, userContext?: any): Promise<string> {
    const contextPrompt = userContext ? 
      `\nCONTEXTO DO USUÁRIO:\n${JSON.stringify(userContext, null, 2)}\n` : '';

    const prompt = `
      Como especialista em finanças pessoais e investimentos, responda à seguinte pergunta de forma clara e didática:
      
      PERGUNTA: ${question}
      ${contextPrompt}
      
      Forneça uma resposta completa mas concisa, incluindo:
      - Explicação clara do conceito
      - Exemplos práticos quando relevante
      - Recomendações específicas se aplicável
      - Alertas sobre riscos se necessário
      
      Mantenha um tom profissional mas acessível, adequado para investidores iniciantes e intermediários.
    `;

    return await this.callGeminiAPI(prompt);
  }

  async generateInvestmentStrategy(userProfile: {
    age: number;
    riskTolerance: string;
    investmentGoals: string[];
    timeHorizon: string;
    monthlyInvestment: number;
  }): Promise<string> {
    const prompt = `
      Como consultor financeiro especializado, crie uma estratégia de investimento personalizada para o seguinte perfil:

      PERFIL DO INVESTIDOR:
      - Idade: ${userProfile.age} anos
      - Tolerância ao Risco: ${userProfile.riskTolerance}
      - Objetivos: ${userProfile.investmentGoals.join(', ')}
      - Horizonte de Investimento: ${userProfile.timeHorizon}
      - Valor Mensal para Investir: R$ ${userProfile.monthlyInvestment.toLocaleString('pt-BR')}

      Forneça uma estratégia detalhada incluindo:
      1. Alocação de ativos recomendada (percentuais)
      2. Tipos de investimentos específicos para o mercado brasileiro
      3. Cronograma de implementação
      4. Métricas para acompanhamento
      5. Alertas e considerações importantes

      Foque em produtos disponíveis no mercado brasileiro (Tesouro Direto, CDBs, LCIs, LCAs, Fundos, Ações, REITs, etc.).
    `;

    return await this.callGeminiAPI(prompt);
  }

  async analyzeMarketTrends(marketData: any): Promise<string> {
    const prompt = `
      Como analista de mercado, forneça uma análise das tendências atuais baseada nos seguintes dados:

      DADOS DE MERCADO:
      ${JSON.stringify(marketData, null, 2)}

      Analise:
      1. Tendências identificadas
      2. Oportunidades de investimento
      3. Riscos a serem observados
      4. Recomendações para diferentes perfis de investidor
      5. Perspectivas de curto e médio prazo

      Mantenha o foco no mercado brasileiro e forneça insights acionáveis.
    `;

    return await this.callGeminiAPI(prompt);
  }

  async suggestPortfolioRebalancing(currentPortfolio: Portfolio, targetAllocation: any): Promise<string> {
    const prompt = `
      Como gestor de carteiras, sugira um plano de rebalanceamento para alinhar a carteira atual com a alocação desejada:

      CARTEIRA ATUAL:
      ${JSON.stringify(currentPortfolio, null, 2)}

      ALOCAÇÃO DESEJADA:
      ${JSON.stringify(targetAllocation, null, 2)}

      Forneça:
      1. Plano detalhado de rebalanceamento
      2. Ordem de prioridade das operações
      3. Considerações sobre custos de transação
      4. Timeline recomendado para execução
      5. Riscos e benefícios do rebalanceamento

      Considere as melhores práticas de gestão de carteira e minimize custos de transação.
    `;

    return await this.callGeminiAPI(prompt);
  }
}

export const geminiFinancialService = new GeminiFinancialService();
export type { Portfolio, FinancialAdvice };


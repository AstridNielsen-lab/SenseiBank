import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  TrendingUp,
  AlertTriangle,
  Info,
  Loader,
  Settings,
  BarChart3,
  Target,
  DollarSign
} from 'lucide-react';
import { geminiFinancialService } from '../services/geminiService';
import { ChatMessage, UserInvestmentProfile, MarketAlert } from '../types/financial';

interface FinancialBotChatProps {
  userProfile?: UserInvestmentProfile;
  portfolioData?: any;
}

const FinancialBotChat: React.FC<FinancialBotChatProps> = ({ userProfile, portfolioData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'portfolio' | 'alerts'>('chat');
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mensagem de boas-vindas
    const welcomeMessage: ChatMessage = {
      id: '1',
      type: 'bot',
      content: `Olá! Sou o SenseiBot, seu assistente financeiro pessoal. Posso ajudá-lo com:\n\n📊 Análise de carteira de investimentos\n💡 Estratégias de investimento personalizadas\n📈 Análise de tendências de mercado\n❓ Dúvidas sobre produtos financeiros\n🎯 Rebalanceamento de portfólio\n\nComo posso ajudá-lo hoje?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);

    // Simular alguns alertas
    setAlerts([
      {
        id: '1',
        type: 'opportunity',
        title: 'Oportunidade de Rebalanceamento',
        message: 'Sua carteira pode se beneficiar de um rebalanceamento. Ações estão 15% acima da alocação ideal.',
        timestamp: new Date(Date.now() - 3600000),
        isRead: false
      },
      {
        id: '2',
        type: 'warning',
        title: 'Concentração de Risco',
        message: 'Mais de 40% da carteira está concentrada no setor de energia. Considere diversificar.',
        timestamp: new Date(Date.now() - 7200000),
        isRead: false
      }
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let response: string;
      
      // Detectar tipo de pergunta e usar o método apropriado
      if (inputMessage.toLowerCase().includes('carteira') || inputMessage.toLowerCase().includes('portfólio')) {
        if (portfolioData) {
          const analysis = await geminiFinancialService.analyzePortfolio(portfolioData);
          response = `📊 **Análise da Carteira**\n\n**Recomendação Principal:**\n${analysis.recommendation}\n\n**Raciocínio:**\n${analysis.reasoning}\n\n**Ações Sugeridas:**\n${analysis.suggestedActions.map(action => `• ${action}`).join('\n')}\n\n**Avaliação de Risco:**\n${analysis.riskAssessment}\n\n**Confiança:** ${analysis.confidence}%`;
        } else {
          response = 'Para analisar sua carteira, preciso de dados sobre seus investimentos atuais. Você pode fornecer informações sobre suas posições?';
        }
      } else if (inputMessage.toLowerCase().includes('estratégia') && userProfile) {
        response = await geminiFinancialService.generateInvestmentStrategy(userProfile);
      } else {
        response = await geminiFinancialService.answerFinancialQuestion(inputMessage, userProfile);
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente em alguns instantes.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { text: 'Analisar minha carteira', icon: BarChart3 },
    { text: 'Estratégia de investimento', icon: Target },
    { text: 'Tendências de mercado', icon: TrendingUp },
    { text: 'Como diversificar?', icon: DollarSign }
  ];

  const markAlertAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  return (
    <div className="bg-gray-900 text-white h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">SenseiBot - Assistente Financeiro</h2>
              <p className="text-gray-400 text-sm">Especialista em Investimentos e Gestão de Carteiras</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1 rounded text-sm ${
                activeTab === 'chat' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-3 py-1 rounded text-sm ${
                activeTab === 'portfolio' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Portfólio
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-3 py-1 rounded text-sm relative ${
                activeTab === 'alerts' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Alertas
              {alerts.filter(a => !a.isRead).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {alerts.filter(a => !a.isRead).length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' ? 'bg-green-600' : 'bg-blue-600'
                    }`}
                  >
                    {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div
                    className={`max-w-3xl p-4 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Analisando...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex flex-wrap gap-2 mb-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => setInputMessage(action.text)}
                      className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors duration-200"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{action.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua pergunta sobre finanças e investimentos..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Análise de Portfólio</h3>
            {portfolioData ? (
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Resumo da Carteira</h4>
                  <p>Valor Total: R$ {portfolioData.totalValue?.toLocaleString('pt-BR') || 'N/A'}</p>
                  <p>Saldo em Caixa: R$ {portfolioData.cashBalance?.toLocaleString('pt-BR') || 'N/A'}</p>
                </div>
                <button
                  onClick={() => setInputMessage('Analisar minha carteira')}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Solicitar Análise Completa
                </button>
              </div>
            ) : (
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Nenhum dados de portfólio disponíveis</p>
                <p className="text-sm text-gray-500">Conecte sua conta ou insira manualmente seus investimentos para análise personalizada</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Alertas de Mercado</h3>
            <div className="space-y-3">
              {alerts.map((alert) => {
                const Icon = alert.type === 'opportunity' ? TrendingUp : 
                           alert.type === 'warning' ? AlertTriangle : Info;
                const color = alert.type === 'opportunity' ? 'text-green-400' : 
                             alert.type === 'warning' ? 'text-yellow-400' : 'text-blue-400';
                
                return (
                  <div
                    key={alert.id}
                    className={`bg-gray-800 p-4 rounded-lg border-l-4 ${
                      alert.type === 'opportunity' ? 'border-green-500' :
                      alert.type === 'warning' ? 'border-yellow-500' : 'border-blue-500'
                    } ${!alert.isRead ? 'ring-1 ring-blue-500' : ''}`}
                    onClick={() => markAlertAsRead(alert.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`w-5 h-5 ${color} mt-0.5`} />
                      <div className="flex-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-gray-400 text-sm mt-1">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {alert.timestamp.toLocaleString()}
                        </p>
                      </div>
                      {!alert.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialBotChat;


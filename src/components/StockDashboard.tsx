import React, { useState, useEffect } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Plus,
  PieChart,
  Target,
  ChevronUp,
  ChevronDown,
  MessageCircle,
  X
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

const StockDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [currentTickerIndex, setCurrentTickerIndex] = useState(0);
  const [showBotChat, setShowBotChat] = useState(false);

  // Mock data para o gráfico de performance
  const performanceData = [
    { date: 'Mai 1', value: -2.5 },
    { date: 'Mai 8', value: -1.8 },
    { date: 'Mai 15', value: 1.2 },
    { date: 'Mai 22', value: 2.8 },
    { date: 'Mai 29', value: 1.5 },
    { date: 'Jun 5', value: 0.91 }
  ];

  const sectorData = [
    { name: 'Energy', value: 100, color: '#10b981' }
  ];

  const periods = ['1D', '5D', '1M', '3M', 'YTD', '1Y', '5Y', 'Max'];

  const topStocks = [
    { symbol: 'AAPL', name: 'Apple', price: '$185.42', change: '+0.78%', positive: true },
    { symbol: 'BTC', name: 'Bitcoin', price: '$42,350', change: '+0.03%', positive: true },
    { symbol: 'AMZN', name: 'Amazon', price: '$145.82', change: '-0.45%', positive: false },
    { symbol: 'TSLA', name: 'Tesla', price: '$248.73', change: '+1.24%', positive: true },
    { symbol: 'GOOGL', name: 'Google', price: '$141.25', change: '-0.32%', positive: false },
    { symbol: 'MSFT', name: 'Microsoft', price: '$378.92', change: '+0.58%', positive: true },
    { symbol: 'NVDA', name: 'NVIDIA', price: '$892.14', change: '+2.15%', positive: true },
    { symbol: 'META', name: 'Meta', price: '$485.67', change: '-0.73%', positive: false }
  ];

  // Efeito para rotacionar o ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTickerIndex((prevIndex) => (prevIndex + 1) % topStocks.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [topStocks.length]);

  const suggestedStocks = [
    { name: 'Mitsubishi', symbol: 'MUFG', trend: 'up' },
    { name: 'DOW', symbol: 'DOW', trend: 'down' },
    { name: 'Bitcoin', symbol: 'BTC', trend: 'up' },
    { name: 'Amazon', symbol: 'AMZN', trend: 'up' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header fixo */}
      <header className="fixed top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 z-50">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold">SenseiBank Trading</h1>
            {/* Ticker animado */}
            <div className="hidden lg:flex items-center space-x-6 overflow-hidden">
              <div className="flex items-center space-x-6 animate-pulse">
                {topStocks.slice(currentTickerIndex, currentTickerIndex + 4).map((stock, index) => (
                  <div key={`${stock.symbol}-${index}`} className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded">
                    <span className="text-gray-300 font-medium">{stock.symbol}</span>
                    <span className="text-gray-400 text-sm">{stock.price}</span>
                    <div className={`flex items-center space-x-1 ${stock.positive ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.positive ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      <span className="text-sm font-medium">{stock.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar ações, ETFs, e mais..."
              className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-64 lg:w-80 transition-all duration-200 focus:shadow-lg"
            />
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar esquerda */}
        <div className="hidden md:block w-80 bg-gray-800 border-r border-gray-700 p-6 overflow-y-auto">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg mb-6 flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-105">
            <Plus className="w-4 h-4" />
            <span>+ Nova Lista de Observação</span>
          </button>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Visão Geral</h2>
            <div className="space-y-3 bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Retorno diário:</span>
                <span className="text-red-400 font-medium flex items-center space-x-1">
                  <ChevronDown className="w-3 h-3" />
                  <span>-0.26%</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Retorno anual:</span>
                <span className="text-red-400 font-medium flex items-center space-x-1">
                  <ChevronDown className="w-3 h-3" />
                  <span>-11.04%</span>
                </span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-blue-500">
              <h3 className="font-medium mb-2 text-blue-400">PETR4 - Petrobras</h3>
              <div className="text-2xl font-bold text-white">R$ 30,18</div>
              <div className="text-red-400 text-sm flex items-center space-x-1 mt-1">
                <ChevronDown className="w-3 h-3" />
                <span>-0.26% (-R$ 0,08)</span>
              </div>
              {/* Mini gráfico */}
              <div className="mt-3 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData.slice(-5)}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#ef4444" 
                      strokeWidth={1}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Sugerido para você</h3>
            <div className="space-y-3">
              {suggestedStocks.map((stock) => (
                <div key={stock.symbol} className="bg-gray-700 rounded-lg p-3 flex items-center justify-between hover:bg-gray-600 transition-colors duration-200 cursor-pointer">
                  <div>
                    <div className="font-medium text-white">{stock.name}</div>
                    <div className="text-gray-400 text-sm">{stock.symbol}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performanceData.slice(-3)}>
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke={stock.trend === 'up' ? '#10b981' : '#ef4444'}
                            strokeWidth={1}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {stock.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Painel central */}
        <div className="flex-1 p-3 md:p-6">
          <div className="bg-gray-800 rounded-lg p-4 md:p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
              <h2 className="text-xl font-semibold">PETR4 Performance</h2>
              <div className="flex flex-wrap gap-1">
                {periods.map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
                      selectedPeriod === period
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[-6, 6]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fill="url(#colorGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabela de informações detalhadas */}
          <div className="bg-gray-800 rounded-lg p-4 md:p-6">
            <h3 className="text-lg font-semibold mb-4">PETR4 - Petrobras</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="text-gray-400 text-sm">Símbolo</div>
                <div className="text-blue-400 font-bold text-lg">PETR4</div>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="text-gray-400 text-sm">Preço atual</div>
                <div className="text-white font-bold text-lg">R$ 30,18</div>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="text-gray-400 text-sm">Variação</div>
                <div className="text-red-400 font-medium flex items-center space-x-1">
                  <span>-0,08 (-0,26%)</span>
                </div>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="text-gray-400 text-sm">Volume</div>
                <div className="text-white font-medium">59,77M</div>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="text-gray-400 text-sm">Faixa do dia</div>
                <div className="text-white font-medium">29,39 - 30,29</div>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="text-gray-400 text-sm">Faixa de 52 semanas</div>
                <div className="text-white font-medium">até 37,72</div>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="text-gray-400 text-sm">Valor de mercado</div>
                <div className="text-white font-medium">R$ 414,95B</div>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="text-gray-400 text-sm">Classificação de analista</div>
                <div className="text-green-400 font-medium">Neutra / Comprar</div>
              </div>
            </div>
          </div>
        </div>

        {/* Painel lateral direito */}
        <div className="hidden lg:block w-80 bg-gray-800 border-l border-gray-700 p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="font-medium mb-3">Retorno de 1 mês</h3>
              <div className="text-green-400 text-2xl font-bold mb-4 flex items-center space-x-2">
                <ChevronUp className="w-6 h-6" />
                <span>+0,91%</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">vs S&P 500:</span>
                  <span className="text-red-400 flex items-center space-x-1">
                    <ChevronDown className="w-3 h-3" />
                    <span>-4,08%</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">vs DOW:</span>
                  <span className="text-red-400 flex items-center space-x-1">
                    <ChevronDown className="w-3 h-3" />
                    <span>-2,00%</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">vs NASDAQ:</span>
                  <span className="text-red-400 flex items-center space-x-1">
                    <ChevronDown className="w-3 h-3" />
                    <span>-7,00%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Target className="w-5 h-5 text-yellow-400" />
                <h3 className="font-medium">Nível de risco</h3>
              </div>
              <div className="text-yellow-400 font-medium mb-3">Neutro</div>
              <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                <div className="bg-yellow-400 h-2 rounded-full w-1/2 transition-all duration-500 ease-out"></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Baixo</span>
                <span>Alto</span>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <PieChart className="w-5 h-5 text-blue-400" />
                <h3 className="font-medium">Setores</h3>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie data={sectorData} innerRadius={20} outerRadius={40} dataKey="value">
                        {sectorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-300">Energia</span>
                    </div>
                    <span className="text-sm font-medium text-white">100%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-1">
                    <div className="bg-green-500 h-1 rounded-full w-full transition-all duration-500"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <footer className="bg-gray-800 border-t border-gray-700 px-6 py-4 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 space-y-2 md:space-y-0">
          <div>
            © 2025 Microsoft
          </div>
          <div className="flex space-x-4">
            <a 
              href="/privacy-policy" 
              className="hover:text-white transition-colors duration-200"
            >
              Política de Privacidade
            </a>
            <a 
              href="/cookies" 
              className="hover:text-white transition-colors duration-200"
            >
              Cookies
            </a>
            <a 
              href="/terms" 
              className="hover:text-white transition-colors duration-200"
            >
              Termos de Uso
            </a>
            <a 
              href="/feedback" 
              className="hover:text-white transition-colors duration-200"
            >
              Feedback
            </a>
          </div>
        </div>
      </footer>

      {/* Botão flutuante do assistente */}
      <button
        onClick={() => setShowBotChat(!showBotChat)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 z-50"
      >
        {showBotChat ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Mini chat do bot (overlay) */}
      {showBotChat && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-40 overflow-hidden">
          <div className="bg-gray-700 p-3 border-b border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span className="text-white font-medium">SenseiBot</span>
              </div>
              <button
                onClick={() => setShowBotChat(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-4 h-full overflow-y-auto">
            <div className="space-y-3">
              <div className="bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-300">🤖 Olá! Sou o SenseiBot, seu assistente financeiro.</p>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-300">📊 Posso analisar suas ações da PETR4 e fornecer insights sobre o mercado.</p>
              </div>
              <div className="space-y-2">
                <button className="w-full text-left bg-blue-600 hover:bg-blue-700 p-2 rounded text-sm transition-colors duration-200">
                  💡 Analisar PETR4
                </button>
                <button className="w-full text-left bg-blue-600 hover:bg-blue-700 p-2 rounded text-sm transition-colors duration-200">
                  📈 Tendências do setor
                </button>
                <button className="w-full text-left bg-blue-600 hover:bg-blue-700 p-2 rounded text-sm transition-colors duration-200">
                  🎯 Sugestões de rebalanceamento
                </button>
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Digite sua pergunta..."
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDashboard;


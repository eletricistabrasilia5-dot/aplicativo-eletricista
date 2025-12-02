import React, { useState } from 'react';
import { Client, Quote, CatalogItem, QuoteStatus, ItemType } from './types';
import Dashboard from './components/Dashboard';
import QuoteBuilder from './components/QuoteBuilder';
import { LayoutDashboard, FileText, Users, ShoppingBag, Plus, Zap, User } from 'lucide-react';

// --- MOCK DATA FOR DEMO ---
const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Ana Silva', phone: '(11) 98765-4321', address: 'Rua das Flores, 123 - Centro' },
  { id: '2', name: 'Condomínio Solar', phone: '(11) 3333-4444', address: 'Av. Paulista, 1000' },
];

const MOCK_CATALOG: CatalogItem[] = [
  { id: 'c1', name: 'Instalação Chuveiro', type: ItemType.SERVICE, defaultPrice: 150.00, unit: 'un' },
  { id: 'c2', name: 'Troca de Tomada', type: ItemType.SERVICE, defaultPrice: 45.00, unit: 'un' },
  { id: 'c3', name: 'Fio 2.5mm', type: ItemType.MATERIAL, defaultPrice: 2.50, unit: 'm' },
  { id: 'c4', name: 'Disjuntor DIN 20A', type: ItemType.MATERIAL, defaultPrice: 25.00, unit: 'un' },
];

const MOCK_QUOTES: Quote[] = [
  {
    id: 'QT-101', clientId: '2', date: '2023-10-01', validUntil: '2023-10-15',
    items: [{...MOCK_CATALOG[0], quantity: 2, total: 300}],
    subtotal: 300, discount: 0, total: 300, status: QuoteStatus.APPROVED, description: 'Instalação chuveiros vestiário'
  }
];

type View = 'dashboard' | 'quotes' | 'clients' | 'catalog';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const [activeQuoteId, setActiveQuoteId] = useState<string | null>(null);

  // App State
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [quotes, setQuotes] = useState<Quote[]>(MOCK_QUOTES);
  const [catalog, setCatalog] = useState<CatalogItem[]>(MOCK_CATALOG);

  // Handlers
  const handleSaveQuote = (newQuote: Quote) => {
    const exists = quotes.find(q => q.id === newQuote.id);
    if (exists) {
      setQuotes(quotes.map(q => q.id === newQuote.id ? newQuote : q));
    } else {
      setQuotes([newQuote, ...quotes]);
    }
    setIsCreatingQuote(false);
    setActiveQuoteId(null);
    setCurrentView('quotes');
  };

  const handleEditQuote = (id: string) => {
    setActiveQuoteId(id);
    setIsCreatingQuote(true);
  };

  const handleDeleteQuote = (id: string) => {
    if(confirm('Tem certeza que deseja excluir?')) {
      setQuotes(quotes.filter(q => q.id !== id));
    }
  };

  // Render Content
  const renderContent = () => {
    if (isCreatingQuote) {
      const initialQuote = activeQuoteId ? quotes.find(q => q.id === activeQuoteId) : null;
      return (
        <QuoteBuilder 
          clients={clients}
          catalog={catalog}
          onSave={handleSaveQuote}
          onCancel={() => { setIsCreatingQuote(false); setActiveQuoteId(null); }}
          initialQuote={initialQuote}
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard quotes={quotes} />;
      
      case 'quotes':
        return (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Orçamentos</h2>
                <button 
                  onClick={() => setIsCreatingQuote(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm"
                >
                  <Plus size={20} /> Novo Orçamento
                </button>
             </div>
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               {quotes.length === 0 ? (
                 <div className="p-8 text-center text-gray-500">Nenhum orçamento encontrado.</div>
               ) : (
                 <table className="w-full text-left">
                   <thead className="bg-gray-50 border-b border-gray-200">
                     <tr>
                       <th className="p-4 font-medium text-gray-600">ID</th>
                       <th className="p-4 font-medium text-gray-600">Cliente</th>
                       <th className="p-4 font-medium text-gray-600">Data</th>
                       <th className="p-4 font-medium text-gray-600">Status</th>
                       <th className="p-4 font-medium text-gray-600 text-right">Total</th>
                       <th className="p-4 font-medium text-gray-600 text-center">Ações</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {quotes.map(q => (
                       <tr key={q.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleEditQuote(q.id)}>
                         <td className="p-4 text-gray-600 font-mono text-sm">{q.id}</td>
                         <td className="p-4 font-medium text-gray-800">{clients.find(c => c.id === q.clientId)?.name || 'Cliente removido'}</td>
                         <td className="p-4 text-gray-500">{new Date(q.date).toLocaleDateString('pt-BR')}</td>
                         <td className="p-4">
                           <span className={`px-2 py-1 rounded-full text-xs font-medium 
                             ${q.status === QuoteStatus.APPROVED ? 'bg-green-100 text-green-700' : 
                               q.status === QuoteStatus.SENT ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                             {q.status}
                           </span>
                         </td>
                         <td className="p-4 text-right font-semibold text-gray-800">
                           {q.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                         </td>
                         <td className="p-4 text-center">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteQuote(q.id); }}
                              className="text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                              Excluir
                            </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
             </div>
          </div>
        );

      case 'clients':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Meus Clientes</h2>
              <button 
                onClick={() => {
                  const name = prompt("Nome do cliente:");
                  if(name) setClients([...clients, { id: Date.now().toString(), name, phone: '', address: '' }]);
                }} 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={20} /> Adicionar
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map(c => (
                <div key={c.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{c.name}</h3>
                      <p className="text-xs text-gray-500">ID: {c.id}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>{c.phone || "Sem telefone"}</p>
                    <p>{c.address || "Sem endereço"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'catalog':
        return (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Catálogo de Preços</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus size={20} /> Novo Item
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-gray-600 font-medium">Item</th>
                      <th className="p-4 text-gray-600 font-medium">Tipo</th>
                      <th className="p-4 text-gray-600 font-medium text-right">Preço Padrão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {catalog.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-4 text-gray-800 font-medium">{item.name}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${item.type === ItemType.SERVICE ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="p-4 text-gray-800 text-right">
                          {item.defaultPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / {item.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )

      default:
        return <div>Em construção</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar - Hidden on Print */}
      <aside className="no-print w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <div className="p-2 bg-blue-600 rounded-lg">
             <Zap size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">EletroAI</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => { setIsCreatingQuote(false); setCurrentView('dashboard'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'dashboard' && !isCreatingQuote ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            onClick={() => { setIsCreatingQuote(false); setCurrentView('quotes'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${(currentView === 'quotes' || isCreatingQuote) ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <FileText size={20} /> Orçamentos
          </button>
          <button 
            onClick={() => { setIsCreatingQuote(false); setCurrentView('clients'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'clients' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Users size={20} /> Clientes
          </button>
          <button 
            onClick={() => { setIsCreatingQuote(false); setCurrentView('catalog'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'catalog' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <ShoppingBag size={20} /> Catálogo
          </button>
        </nav>

        <div className="p-6 border-t border-slate-800">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                 <User size={18} />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">Eletricista Pro</p>
                <p className="text-xs text-slate-400 truncate">Premium Plan</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Mobile Nav - Bottom */}
      <div className="no-print md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-50">
        <button onClick={() => { setIsCreatingQuote(false); setCurrentView('dashboard'); }} className="text-gray-600 p-2"><LayoutDashboard /></button>
        <button onClick={() => { setIsCreatingQuote(false); setCurrentView('quotes'); }} className="text-blue-600 p-2"><FileText /></button>
        <button onClick={() => { setIsCreatingQuote(false); setCurrentView('clients'); }} className="text-gray-600 p-2"><Users /></button>
      </div>

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto h-screen w-full">
         <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
            {renderContent()}
         </div>
      </main>
    </div>
  );
};

export default App;

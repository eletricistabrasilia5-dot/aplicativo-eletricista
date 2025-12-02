import React, { useState, useEffect } from 'react';
import { Client, Quote, QuoteItem, QuoteStatus, ItemType, CatalogItem } from '../types';
import { generateSmartEstimate } from '../services/geminiService';
import { Plus, Trash, Sparkles, Printer, Save, ArrowLeft, Loader2, DollarSign } from 'lucide-react';

interface QuoteBuilderProps {
  clients: Client[];
  catalog: CatalogItem[];
  onSave: (quote: Quote) => void;
  onCancel: () => void;
  initialQuote?: Quote | null;
}

const QuoteBuilder: React.FC<QuoteBuilderProps> = ({ clients, catalog, onSave, onCancel, initialQuote }) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(initialQuote?.clientId || '');
  const [description, setDescription] = useState<string>(initialQuote?.description || '');
  const [items, setItems] = useState<QuoteItem[]>(initialQuote?.items || []);
  const [discount, setDiscount] = useState<number>(initialQuote?.discount || 0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quoteDate] = useState(initialQuote?.date || new Date().toISOString().split('T')[0]);

  // Derived state
  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const total = Math.max(0, subtotal - discount);

  const handleAIAutoFill = async () => {
    if (!description || description.length < 10) {
      alert("Por favor, descreva o serviço com mais detalhes para a IA ajudar.");
      return;
    }

    setIsGenerating(true);
    try {
      const suggestions = await generateSmartEstimate(description);
      
      const newItems: QuoteItem[] = suggestions.map((s, idx) => ({
        id: `ai-${Date.now()}-${idx}`,
        name: s.name,
        type: s.type === 'Material' ? ItemType.MATERIAL : ItemType.SERVICE,
        quantity: s.quantity,
        unit: s.unit,
        defaultPrice: s.estimatedPrice,
        total: s.estimatedPrice * s.quantity
      }));

      setItems(prev => [...prev, ...newItems]);
    } catch (error) {
      alert("Erro ao gerar sugestões. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addItem = (catalogItem?: CatalogItem) => {
    const newItem: QuoteItem = catalogItem 
      ? { ...catalogItem, quantity: 1, total: catalogItem.defaultPrice }
      : { 
          id: `new-${Date.now()}`, 
          name: 'Novo Item', 
          type: ItemType.SERVICE, 
          defaultPrice: 0, 
          quantity: 1, 
          unit: 'un', 
          total: 0 
        };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items];
    const item = newItems[index];
    
    // Type casting needed for dynamic key access
    (item as any)[field] = value;

    if (field === 'quantity' || field === 'defaultPrice') {
      item.total = item.quantity * item.defaultPrice;
    }

    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!selectedClientId) {
      alert("Selecione um cliente.");
      return;
    }

    const quote: Quote = {
      id: initialQuote?.id || `QT-${Date.now()}`,
      clientId: selectedClientId,
      date: quoteDate,
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +15 days
      items,
      subtotal,
      discount,
      total,
      status: initialQuote?.status || QuoteStatus.DRAFT,
      description
    };
    onSave(quote);
  };

  const handlePrint = () => {
    window.print();
  };

  const client = clients.find(c => c.id === selectedClientId);

  return (
    <div className="bg-white min-h-screen pb-10">
      {/* Header / Actions - Hidden in Print */}
      <div className="no-print border-b border-gray-200 sticky top-0 bg-white z-10 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {initialQuote ? `Editar Orçamento #${initialQuote.id}` : 'Novo Orçamento'}
          </h2>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">
            <Printer size={18} /> Imprimir
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            <Save size={18} /> Salvar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">
        
        {/* Print Header */}
        <div className="hidden print-only mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ORÇAMENTO</h1>
          <div className="flex justify-between text-sm text-gray-600">
            <div>
              <p className="font-bold text-lg">EletroSmart Serviços Elétricos</p>
              <p>CNPJ: 00.000.000/0001-00</p>
              <p>Tel: (11) 99999-9999</p>
            </div>
            <div className="text-right">
              <p>Data: {new Date(quoteDate).toLocaleDateString('pt-BR')}</p>
              <p>Validade: 15 dias</p>
            </div>
          </div>
        </div>

        {/* Client & Job Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Cliente</label>
            <div className="no-print">
              <select 
                value={selectedClientId} 
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Selecione um cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {/* Print View for Client */}
            {client && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="font-semibold text-gray-900">{client.name}</p>
                <p className="text-gray-600">{client.address}</p>
                <p className="text-gray-600">{client.phone}</p>
                <p className="text-gray-600">{client.email}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Descrição do Serviço</label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg h-32 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: Instalação de ventilador de teto com passagem de fio novo..."
              />
              <button
                onClick={handleAIAutoFill}
                disabled={isGenerating}
                className="no-print absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                {isGenerating ? 'Gerando...' : 'IA Sugerir Itens'}
              </button>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-800">Itens e Serviços</h3>
            <div className="no-print flex gap-2">
              <button 
                onClick={() => addItem()}
                className="text-sm px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                + Manual
              </button>
              <select 
                className="text-sm px-3 py-1.5 border border-gray-300 rounded-md outline-none"
                onChange={(e) => {
                  const item = catalog.find(i => i.id === e.target.value);
                  if (item) addItem(item);
                  e.target.value = "";
                }}
              >
                <option value="">+ Do Catálogo</option>
                {catalog.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-3 font-medium text-gray-500 w-1/2">Descrição</th>
                  <th className="p-3 font-medium text-gray-500 w-20 text-center">Qtd</th>
                  <th className="p-3 font-medium text-gray-500 w-32 text-right">Preço Unit.</th>
                  <th className="p-3 font-medium text-gray-500 w-32 text-right">Total</th>
                  <th className="p-3 font-medium text-gray-500 w-12 no-print"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                      Nenhum item adicionado. Use a IA ou adicione manualmente.
                    </td>
                  </tr>
                )}
                {items.map((item, index) => (
                  <tr key={item.id} className="group hover:bg-gray-50">
                    <td className="p-3">
                      <input 
                        type="text" 
                        value={item.name} 
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        className="w-full bg-transparent outline-none focus:underline"
                      />
                      <span className="text-xs text-gray-400 block">{item.type} • {item.unit}</span>
                    </td>
                    <td className="p-3 text-center">
                      <input 
                        type="number" 
                        value={item.quantity} 
                        min="1"
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent outline-none text-center focus:bg-white focus:ring-1 ring-blue-300 rounded"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end items-center gap-1">
                        <span className="text-gray-400 text-xs">R$</span>
                        <input 
                          type="number" 
                          value={item.defaultPrice} 
                          step="0.01"
                          onChange={(e) => updateItem(index, 'defaultPrice', parseFloat(e.target.value) || 0)}
                          className="w-20 bg-transparent outline-none text-right focus:bg-white focus:ring-1 ring-blue-300 rounded"
                        />
                      </div>
                    </td>
                    <td className="p-3 text-right font-medium text-gray-800">
                      {item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="p-3 text-center no-print">
                      <button 
                        onClick={() => removeItem(index)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <div className="w-full md:w-1/3 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>Desconto (R$)</span>
              <input 
                type="number" 
                value={discount} 
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-24 p-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
              <span>Total</span>
              <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          </div>
        </div>

        <div className="hidden print-only pt-12 text-center text-gray-500 text-sm">
          <p>Orçamento sujeito a alterações caso haja mudanças no escopo do serviço.</p>
          <p className="mt-8 border-t border-gray-300 w-1/2 mx-auto pt-2">Assinatura do Responsável</p>
        </div>
      </div>
    </div>
  );
};

export default QuoteBuilder;

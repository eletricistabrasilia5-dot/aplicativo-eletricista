import React from 'react';
import { Quote, QuoteStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wallet, FileCheck, AlertCircle, TrendingUp } from 'lucide-react';

interface DashboardProps {
  quotes: Quote[];
}

const Dashboard: React.FC<DashboardProps> = ({ quotes }) => {
  const totalRevenue = quotes
    .filter(q => q.status === QuoteStatus.COMPLETED || q.status === QuoteStatus.APPROVED)
    .reduce((acc, curr) => acc + curr.total, 0);

  const pendingCount = quotes.filter(q => q.status === QuoteStatus.SENT || q.status === QuoteStatus.DRAFT).length;
  const completedCount = quotes.filter(q => q.status === QuoteStatus.COMPLETED).length;

  // Simulate monthly data based on current quotes (mock distribution for demo)
  const data = [
    { name: 'Jan', valor: totalRevenue * 0.1 },
    { name: 'Fev', valor: totalRevenue * 0.15 },
    { name: 'Mar', valor: totalRevenue * 0.12 },
    { name: 'Abr', valor: totalRevenue * 0.3 },
    { name: 'Mai', valor: totalRevenue * 0.2 },
    { name: 'Jun', valor: totalRevenue * 0.13 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 rounded-full bg-green-100 text-green-600 mr-4">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Receita Total</p>
            <p className="text-2xl font-bold text-gray-800">
              {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 rounded-full bg-blue-100 text-blue-600 mr-4">
            <FileCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Orçamentos Aprovados</p>
            <p className="text-2xl font-bold text-gray-800">{completedCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 rounded-full bg-yellow-100 text-yellow-600 mr-4">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pendentes</p>
            <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp size={20} />
            Desempenho Financeiro
          </h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value}`} />
              <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                 {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#3b82f6" />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

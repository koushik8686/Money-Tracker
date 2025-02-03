import React, { useEffect, useState } from 'react';
import { Wallet, Sun, Moon } from 'lucide-react';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { Dashboard } from './components/Dashboard';
import { Transaction } from './types';
import { ThemeProvider, useTheme } from './context/ThemeContext';

export default function MainApp() {
  const { isDark, toggleTheme } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: crypto.randomUUID(),
    };
    setTransactions((prev) => [transaction, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter(t => t.id !== id));
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gunmetal' : 'bg-antiflash-white'} transition-colors`}>
      <div className="container mx-auto px-4 py-6 lg:px-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Wallet className="text-tomato" size={28} />
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gunmetal'}`}>
              SmartSpend
            </h1>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg ${
              isDark ? 'bg-gunmetal-600 text-tomato' : 'bg-white text-tomato'
            } hover:bg-tomato hover:text-white transition-colors`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Dashboard transactions={transactions} />
          </div>
          <div className="space-y-6">
            <TransactionForm onSubmit={handleAddTransaction} />
            <TransactionList 
              transactions={transactions} 
              onDelete={handleDeleteTransaction}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
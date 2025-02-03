import React from 'react';
import { ArrowDownCircle, ArrowUpCircle, Trash2, Clock, AlertCircle, Tags } from 'lucide-react';
import { Transaction } from '../types';
import { useTheme } from '../context/ThemeContext';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
}

export function TransactionList({ transactions, onDelete }: TransactionListProps) {
  const { isDark } = useTheme();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg transition-colors`}>
      <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Recent Transactions
      </h2>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className={`flex flex-col p-4 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            } transition-colors group`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {transaction.type === 'income' ? (
                  <ArrowUpCircle className="text-teal-500" size={24} />
                ) : (
                  <ArrowDownCircle className="text-rose-500" size={24} />
                )}
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {transaction.description}
                  </p>
                  <div className="flex gap-2 text-sm">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                      {new Date(transaction.date).toLocaleDateString('en-IN')}
                    </span>
                    <span className={transaction.type === 'income' ? 'text-teal-500' : 'text-rose-500'}>
                      {transaction.category}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-semibold ${
                  transaction.type === 'income'
                    ? isDark ? 'text-teal-400' : 'text-teal-600'
                    : isDark ? 'text-rose-400' : 'text-rose-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}₹
                  {transaction.amount.toLocaleString('en-IN')}
                </span>
                {onDelete && (
                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>

            {(transaction.tags?.length || transaction.note || transaction.recurringType || transaction.priority) && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex flex-wrap gap-3">
                  {transaction.tags && transaction.tags.length > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <Tags size={14} className="text-gray-400" />
                      <div className="flex gap-1">
                        {transaction.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {transaction.recurringType && transaction.recurringType !== 'none' && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock size={14} />
                      <span>{transaction.recurringType}</span>
                    </div>
                  )}
                  
                  {transaction.priority && transaction.priority !== 'medium' && (
                    <div className={`flex items-center gap-1 text-sm ${getPriorityColor(transaction.priority)}`}>
                      <AlertCircle size={14} />
                      <span>{transaction.priority}</span>
                    </div>
                  )}
                </div>
                
                {transaction.note && (
                  <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {transaction.note}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
        {transactions.length === 0 && (
          <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No transactions yet
          </p>
        )}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { PlusCircle, Tags, AlertCircle } from 'lucide-react';
import { Transaction } from '../types';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Food', 'Transport', 'Shopping', 'Bills', 'Other'];
const RECURRING_TYPES = ['none', 'daily', 'weekly', 'monthly', 'yearly'] as const;
const PRIORITIES = ['low', 'medium', 'high'] as const;

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
}

export function TransactionForm({ onSubmit }: TransactionFormProps) {
  const { isDark } = useTheme();
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [recurringType, setRecurringType] = useState<typeof RECURRING_TYPES[number]>('none');
  const [priority, setPriority] = useState<typeof PRIORITIES[number]>('medium');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    onSubmit({
      type,
      amount: parseFloat(amount),
      description,
      category,
      date: new Date().toISOString(),
      tags: tags.length > 0 ? tags : undefined,
      note: note || undefined,
      recurringType: recurringType !== 'none' ? recurringType : undefined,
      priority: priority !== 'medium' ? priority : undefined,
    });

    setAmount('');
    setDescription('');
    setCategory('Other');
    setNote('');
    setTags([]);
    setNewTag('');
    setRecurringType('none');
    setPriority('medium');
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <form onSubmit={handleSubmit} className={`${isDark ? 'bg-gunmetal-400' : 'bg-white'} rounded-xl p-4 md:p-6 shadow-lg transition-colors`}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              type === 'income'
                ? 'bg-tomato text-white'
                : isDark ? 'bg-gunmetal-600 text-gray-300' : 'bg-antiflash-white text-gunmetal'
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              type === 'expense'
                ? 'bg-tomato text-white'
                : isDark ? 'bg-gunmetal-600 text-gray-300' : 'bg-antiflash-white text-gunmetal'
            }`}
          >
            Expense
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className={`px-3 py-2 rounded-lg border text-sm ${
              isDark 
                ? 'bg-gunmetal-600 border-gunmetal-500 text-white placeholder-gray-400' 
                : 'bg-white border-gray-200 text-gunmetal'
            } focus:ring-2 focus:ring-tomato focus:border-transparent transition-colors`}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`px-3 py-2 rounded-lg border text-sm ${
              isDark 
                ? 'bg-gunmetal-600 border-gunmetal-500 text-white' 
                : 'bg-white border-gray-200 text-gunmetal'
            } focus:ring-2 focus:ring-tomato focus:border-transparent transition-colors`}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this transaction for?"
          rows={2}
          className={`w-full px-3 py-2 rounded-lg border text-sm ${
            isDark 
              ? 'bg-gunmetal-600 border-gunmetal-500 text-white placeholder-gray-400' 
              : 'bg-white border-gray-200 text-gunmetal'
          } focus:ring-2 focus:ring-tomato focus:border-transparent transition-colors resize-none`}
        />

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`w-full py-2 px-3 rounded-lg text-sm font-medium ${
            isDark ? 'bg-gunmetal-600 text-gray-300' : 'bg-antiflash-white text-gunmetal'
          } hover:bg-tomato hover:text-white transition-colors flex items-center justify-center gap-2`}
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>

        {showAdvanced && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tags..."
                className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                  isDark 
                    ? 'bg-gunmetal-600 border-gunmetal-500 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-200 text-gunmetal'
                } focus:ring-2 focus:ring-tomato focus:border-transparent transition-colors`}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="p-2 rounded-lg bg-tomato text-white hover:bg-tomato-600 transition-colors"
              >
                <Tags size={18} />
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full bg-tomato-100 text-tomato-800 text-xs flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-tomato"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Additional notes..."
              rows={2}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                isDark 
                  ? 'bg-gunmetal-600 border-gunmetal-500 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-200 text-gunmetal'
              } focus:ring-2 focus:ring-tomato focus:border-transparent transition-colors resize-none`}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gunmetal'}`}>
                  Recurring
                </label>
                <select
                  value={recurringType}
                  onChange={(e) => setRecurringType(e.target.value as typeof RECURRING_TYPES[number])}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDark 
                      ? 'bg-gunmetal-600 border-gunmetal-500 text-white' 
                      : 'bg-white border-gray-200 text-gunmetal'
                  } focus:ring-2 focus:ring-tomato focus:border-transparent transition-colors`}
                >
                  {RECURRING_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gunmetal'}`}>
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as typeof PRIORITIES[number])}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDark 
                      ? 'bg-gunmetal-600 border-gunmetal-500 text-white' 
                      : 'bg-white border-gray-200 text-gunmetal'
                  } focus:ring-2 focus:ring-tomato focus:border-transparent transition-colors`}
                >
                  {PRIORITIES.map(p => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-tomato text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-tomato-600 transition-colors flex items-center justify-center gap-2"
        >
          <PlusCircle size={18} />
          Add Transaction
        </button>
      </div>
    </form>
  );
}
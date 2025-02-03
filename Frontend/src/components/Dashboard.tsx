import React, { useState } from 'react';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Transaction } from '../types';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ArcElement,
  Tooltip,
  Legend
);

interface DashboardProps {
  transactions: Transaction[];
}

type TimeRange = 'week' | 'month' | 'year';

export function Dashboard({ transactions }: DashboardProps) {
  const { isDark } = useTheme();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const textColor = isDark ? '#fff' : '#111';
  const primaryColor = '#6366f1'; // Indigo
  const secondaryColor = '#a855f7'; // Purple

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Time-based analysis
  const getDateRangeData = () => {
    const now = new Date();
    let dates: Date[] = [];
    let format: Intl.DateTimeFormatOptions = {};

    if (timeRange === 'week') {
      dates = [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date;
      }).reverse();
      format = { weekday: 'short' };
    } else if (timeRange === 'month') {
      dates = [...Array(30)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date;
      }).reverse();
      format = { day: 'numeric', month: 'short' };
    } else {
      dates = [...Array(12)].map((_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date;
      }).reverse();
      format = { month: 'short' };
    }

    const labels = dates.map(date => date.toLocaleDateString('en-IN', format));
    const incomeData = dates.map(date => {
      return transactions
        .filter(t => {
          const tDate = new Date(t.date);
          if (timeRange === 'week') {
            return tDate.toDateString() === date.toDateString();
          } else if (timeRange === 'month') {
            return tDate.toDateString() === date.toDateString();
          } else {
            return tDate.getMonth() === date.getMonth() && 
                   tDate.getFullYear() === date.getFullYear();
          }
        })
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    });

    const expenseData = dates.map(date => {
      return transactions
        .filter(t => {
          const tDate = new Date(t.date);
          if (timeRange === 'week') {
            return tDate.toDateString() === date.toDateString();
          } else if (timeRange === 'month') {
            return tDate.toDateString() === date.toDateString();
          } else {
            return tDate.getMonth() === date.getMonth() && 
                   tDate.getFullYear() === date.getFullYear();
          }
        })
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    });

    return { labels, incomeData, expenseData };
  };

  const { labels, incomeData, expenseData } = getDateRangeData();

  // Category analysis
  const categoryAnalysis = transactions.reduce((acc, t) => {
    if (!t.category) return acc;
    const key = `${t.type}-${t.category}`;
    acc[key] = (acc[key] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const doughnutData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        data: [totalIncome, totalExpenses],
        backgroundColor: [primaryColor, secondaryColor],
      },
    ],
  };

  const barData = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        backgroundColor: primaryColor,
      },
      {
        label: 'Expenses',
        data: expenseData,
        backgroundColor: secondaryColor,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: textColor,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: textColor,
          callback: (value: number) => `₹${value.toLocaleString('en-IN')}`,
        },
      },
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: textColor,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg transition-colors`}>
        <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Overview</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-indigo-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-indigo-600'}`}>Income</p>
            <p className={`text-xl font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
              ₹{totalIncome.toLocaleString('en-IN')}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-purple-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-purple-600'}`}>Expenses</p>
            <p className={`text-xl font-semibold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
              ₹{totalExpenses.toLocaleString('en-IN')}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-violet-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-violet-600'}`}>Balance</p>
            <p className={`text-xl font-semibold ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
              ₹{balance.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        <div className="h-64">
          <Doughnut data={doughnutData} options={chartOptions} />
        </div>
      </div>

      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg transition-colors`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Time Analysis</h2>
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-indigo-500 text-white'
                    : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="h-80">
          <Bar data={barData} options={chartOptions} />
        </div>
      </div>

      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg transition-colors`}>
        <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Category Analysis</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(categoryAnalysis).map(([key, amount]) => {
            const [type, category] = key.split('-');
            return (
              <div
                key={key}
                className={`p-4 rounded-lg ${
                  isDark ? 'bg-gray-700' : type === 'income' ? 'bg-indigo-50' : 'bg-purple-50'
                }`}
              >
                <p className={`text-sm ${
                  isDark ? 'text-gray-300' : type === 'income' ? 'text-indigo-600' : 'text-purple-600'
                }`}>
                  {category} ({type})
                </p>
                <p className={`text-lg font-semibold ${
                  isDark 
                    ? type === 'income' ? 'text-indigo-400' : 'text-purple-400'
                    : type === 'income' ? 'text-indigo-600' : 'text-purple-600'
                }`}>
                  ₹{amount.toLocaleString('en-IN')}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
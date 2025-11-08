'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/utils/storage';
import { calculateDailyBalance, calculateMonthlyTotals, formatCurrency, formatDate } from '@/utils/calculations';
import { PoshoMillRecord } from '@/types';

export default function PoshoMillPage() {
  const [records, setRecords] = useState<PoshoMillRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<PoshoMillRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'records'>('form');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    income: '',
    expenseDescription: '',
    expenseAmount: '',
    electricity: '',
    savings: '',
    notes: '',
  });

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const filtered = records.filter(record => record.date === selectedDate);
      setFilteredRecords(filtered);
    } else {
      setFilteredRecords(records);
    }
  }, [selectedDate, records]);

  const loadRecords = () => {
    const allRecords = storage.getPoshoMillRecords();
    allRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecords(allRecords);
    setFilteredRecords(allRecords);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const record: PoshoMillRecord = {
        id: Date.now().toString(),
        date: formData.date,
        income: parseFloat(formData.income) || 0,
        expenseDescription: formData.expenseDescription,
        expenseAmount: parseFloat(formData.expenseAmount) || 0,
        electricity: parseFloat(formData.electricity) || 0,
        savings: parseFloat(formData.savings) || 0,
        notes: formData.notes || undefined,
      };

      await new Promise(resolve => setTimeout(resolve, 500));
      storage.savePoshoMillRecord(record);
      
      // Reset form but keep the date
      setFormData({
        ...formData,
        income: '',
        expenseDescription: '',
        expenseAmount: '',
        electricity: '',
        savings: '',
        notes: '',
      });

      loadRecords();
      
      const successEvent = new CustomEvent('showToast', {
        detail: { message: 'Record added successfully!', type: 'success' }
      });
      window.dispatchEvent(successEvent);
    } catch (error) {
      const errorEvent = new CustomEvent('showToast', {
        detail: { message: 'Failed to add record', type: 'error' }
      });
      window.dispatchEvent(errorEvent);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickExpense = async (description: string, amount: string) => {
    if (!amount || parseFloat(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      const record: PoshoMillRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        income: 0,
        expenseDescription: description,
        expenseAmount: parseFloat(amount),
        electricity: 0,
        savings: 0,
        notes: 'Quick expense entry',
      };

      await new Promise(resolve => setTimeout(resolve, 300));
      storage.savePoshoMillRecord(record);
      loadRecords();
      
      const successEvent = new CustomEvent('showToast', {
        detail: { message: `Expense for ${description} recorded!`, type: 'success' }
      });
      window.dispatchEvent(successEvent);
    } catch (error) {
      const errorEvent = new CustomEvent('showToast', {
        detail: { message: 'Failed to record expense', type: 'error' }
      });
      window.dispatchEvent(errorEvent);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthlyTotals = calculateMonthlyTotals(records, currentMonth, currentYear);

  // Calculate selected date totals
  const selectedDateTotals = selectedDate ? 
    filteredRecords.reduce((totals, record) => ({
      income: totals.income + record.income,
      expenses: totals.expenses + record.expenseAmount + record.electricity,
      savings: totals.savings + record.savings,
      balance: totals.balance + calculateDailyBalance(record)
    }), { income: 0, expenses: 0, savings: 0, balance: 0 })
    : null;

  // Get unique dates for calendar
  const recordDates = new Set(records.map(record => record.date));

  // Calendar functions
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const [calendarMonth, setCalendarMonth] = useState(currentDate.getMonth());
  const [calendarYear, setCalendarYear] = useState(currentDate.getFullYear());

  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
    const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
    const calendar = [];

    // Previous month days
    const prevMonthDays = getDaysInMonth(calendarYear, calendarMonth - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      calendar.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(calendarYear, calendarMonth - 1, prevMonthDays - i).toISOString().split('T')[0]
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calendarYear, calendarMonth, day).toISOString().split('T')[0];
      calendar.push({
        day,
        isCurrentMonth: true,
        date,
        hasRecords: recordDates.has(date),
        isToday: date === new Date().toISOString().split('T')[0],
        isSelected: date === selectedDate
      });
    }

    // Next month days
    const totalCells = 42; // 6 weeks
    const nextMonthDays = totalCells - calendar.length;
    for (let day = 1; day <= nextMonthDays; day++) {
      calendar.push({
        day,
        isCurrentMonth: false,
        date: new Date(calendarYear, calendarMonth + 1, day).toISOString().split('T')[0]
      });
    }

    return calendar;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (calendarMonth === 0) {
        setCalendarMonth(11);
        setCalendarYear(calendarYear - 1);
      } else {
        setCalendarMonth(calendarMonth - 1);
      }
    } else {
      if (calendarMonth === 11) {
        setCalendarMonth(0);
        setCalendarYear(calendarYear + 1);
      } else {
        setCalendarMonth(calendarMonth + 1);
      }
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const quickExpenses = [
    { name: 'Charcoal', emoji: '🔥', average: '500' },
    { name: 'Maize', emoji: '🌽', average: '2000' },
    { name: 'Maintenance', emoji: '🔧', average: '1000' },
    { name: 'Transport', emoji: '🚚', average: '300' },
    { name: 'Packaging', emoji: '📦', average: '200' },
    { name: 'Other', emoji: '📋', average: '' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl shadow-2xl mb-4">
          <span className="text-3xl">🌾</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
          Posho Mill Tracker
        </h1>
        <p className="text-gray-600 text-lg">Track income, expenses, and daily operations</p>
        <div className="mt-4 bg-gradient-to-r from-green-500 to-green-600 h-1 w-24 mx-auto rounded-full"></div>
      </div>

      {/* Date Filter with Calendar */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 w-full">
            <label className="label">📅 Select Date to View Records</label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex-1 input-field text-left flex items-center justify-between"
              >
                <span>
                  {selectedDate ? formatDate(selectedDate) : 'Select a date...'}
                </span>
                <span>📅</span>
              </button>
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate('')}
                  className="btn-secondary whitespace-nowrap"
                >
                  ❌ Clear
                </button>
              )}
            </div>
          </div>
          
          {/* Quick Date Buttons */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="btn-secondary flex-1 sm:flex-none"
            >
              📅 Today
            </button>
            <button
              onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setSelectedDate(yesterday.toISOString().split('T')[0]);
              }}
              className="btn-secondary flex-1 sm:flex-none"
            >
              📅 Yesterday
            </button>
          </div>
        </div>

        {/* Calendar Popup */}
        {showCalendar && (
          <div className="mt-4 p-4 bg-white border-2 border-primary-200 rounded-2xl shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ◀️
              </button>
              <h3 className="text-lg font-bold text-gray-800">
                {new Date(calendarYear, calendarMonth).toLocaleDateString('en-KE', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h3>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ▶️
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {generateCalendar().map((day, index) => (
                <button
                  key={index}
                  onClick={() => day.isCurrentMonth && handleDateSelect(day.date)}
                  disabled={!day.isCurrentMonth}
                  className={`
                    p-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${!day.isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : ''}
                    ${day.isToday ? 'bg-primary-100 text-primary-700 border-2 border-primary-300' : ''}
                    ${day.isSelected ? 'bg-primary-600 text-white shadow-lg scale-105' : ''}
                    ${day.hasRecords && !day.isSelected ? 'bg-green-50 text-green-700 border border-green-200' : ''}
                    ${day.isCurrentMonth && !day.isToday && !day.isSelected && !day.hasRecords ? 
                      'hover:bg-gray-100 text-gray-700' : ''}
                  `}
                >
                  <div className="flex flex-col items-center">
                    <span>{day.day}</span>
                    {day.hasRecords && (
                      <span className="w-1 h-1 bg-green-500 rounded-full mt-1"></span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Date Summary */}
        {selectedDate && selectedDateTotals && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">📊</span>
              Summary for {formatDate(selectedDate)}
              <span className="ml-2 text-sm font-normal text-gray-600 bg-white px-2 py-1 rounded-full">
                {new Date(selectedDate).toLocaleDateString('en-KE', { weekday: 'long' })}
              </span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Income</p>
                <p className="text-xl font-bold text-success-600">
                  {formatCurrency(selectedDateTotals.income)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Expenses</p>
                <p className="text-xl font-bold text-danger-600">
                  {formatCurrency(selectedDateTotals.expenses)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Savings</p>
                <p className="text-xl font-bold text-primary-600">
                  {formatCurrency(selectedDateTotals.savings)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Net Balance</p>
                <p className={`text-xl font-bold ${
                  selectedDateTotals.balance >= 0 ? 'text-success-600' : 'text-danger-600'
                }`}>
                  {formatCurrency(selectedDateTotals.balance)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Tabs */}
      <div className="lg:hidden">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'form'
                ? 'bg-white text-green-700 shadow-lg'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📝 Add Record
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'records'
                ? 'bg-white text-green-700 shadow-lg'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📊 View Records
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className={`lg:col-span-2 space-y-6 ${activeTab === 'records' ? 'hidden lg:block' : 'block'}`}>
          {/* Quick Expenses - Improved Mobile Responsive */}
          <div className="card group hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-2 text-white text-xl">
                ⚡
              </div>
              <h2 className="text-xl font-bold text-gray-800 ml-3">Quick Expenses</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">Tap to record common expenses quickly</p>
            
            {/* Mobile Carousel Style for Small Screens */}
            <div className="lg:hidden">
              <div className="flex space-x-3 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
                {quickExpenses.map((expense, index) => (
                  <div key={index} className="flex-shrink-0 w-32">
                    <QuickExpenseButton
                      name={expense.name}
                      emoji={expense.emoji}
                      averageAmount={expense.average}
                      onAdd={handleQuickExpense}
                      disabled={isSubmitting}
                      compact={true}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Grid Layout for Larger Screens */}
            <div className="hidden lg:grid grid-cols-2 md:grid-cols-3 gap-3">
              {quickExpenses.map((expense, index) => (
                <QuickExpenseButton
                  key={index}
                  name={expense.name}
                  emoji={expense.emoji}
                  averageAmount={expense.average}
                  onAdd={handleQuickExpense}
                  disabled={isSubmitting}
                  compact={false}
                />
              ))}
            </div>
          </div>

          {/* Detailed Form */}
          <div className="card group hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-3 text-white text-2xl shadow-lg">
                📝
              </div>
              <h2 className="text-2xl font-bold text-gray-800 ml-4">Detailed Record</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">📅 Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label">💰 Income from Grinding (Ksh)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.income}
                    onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                    className="input-field"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty if no income today</p>
                </div>

                <div className="md:col-span-2">
                  <label className="label">📋 Expense Description</label>
                  <input
                    type="text"
                    value={formData.expenseDescription}
                    onChange={(e) => setFormData({ ...formData, expenseDescription: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Maize purchase, Charcoal, Maintenance..."
                  />
                </div>

                <div>
                  <label className="label">💸 Expense Amount (Ksh)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.expenseAmount}
                    onChange={(e) => setFormData({ ...formData, expenseAmount: e.target.value })}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="label">⚡ Electricity (Ksh)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.electricity}
                    onChange={(e) => setFormData({ ...formData, electricity: e.target.value })}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="label">🏦 Savings (Ksh)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.savings}
                    onChange={(e) => setFormData({ ...formData, savings: e.target.value })}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">📝 Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Additional notes about today's operations..."
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-success flex-1 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Save Record</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      date: new Date().toISOString().split('T')[0],
                      income: '',
                      expenseDescription: '',
                      expenseAmount: '',
                      electricity: '',
                      savings: '',
                      notes: '',
                    });
                  }}
                  className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                >
                  <span>🔄</span>
                  <span>Clear Form</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Summary Card and Records Table remain the same */}
        {/* ... (Previous summary card and records table code) ... */}
      </div>
    </div>
  );
}

// Enhanced Quick Expense Button Component with Mobile Support
function QuickExpenseButton({ 
  name, 
  emoji, 
  averageAmount, 
  onAdd, 
  disabled,
  compact = false
}: { 
  name: string;
  emoji: string;
  averageAmount: string;
  onAdd: (description: string, amount: string) => void;
  disabled: boolean;
  compact?: boolean;
}) {
  const [amount, setAmount] = useState(averageAmount);
  const [showInput, setShowInput] = useState(false);

  const handleSubmit = () => {
    if (amount && parseFloat(amount) > 0) {
      onAdd(name, amount);
      setAmount(averageAmount);
      setShowInput(false);
    }
  };

  if (showInput) {
    return (
      <div className={`bg-white border-2 border-orange-300 rounded-xl p-3 animate-slide-up ${
        compact ? 'w-full' : ''
      }`}>
        <div className="flex items-center space-x-2 mb-2">
          <span>{emoji}</span>
          <span className="text-sm font-medium text-gray-700">{name}</span>
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
          autoFocus
        />
        <div className="flex space-x-1">
          <button
            onClick={handleSubmit}
            disabled={disabled}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs py-1 rounded transition-colors disabled:opacity-50"
          >
            ✅
          </button>
          <button
            onClick={() => setShowInput(false)}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-xs py-1 rounded transition-colors"
          >
            ❌
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowInput(true)}
      disabled={disabled}
      className={`
        bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl 
        hover:border-orange-300 hover:shadow-md transition-all duration-200 disabled:opacity-50 group
        ${compact ? 'w-full p-2' : 'p-3'}
      `}
    >
      <div className={`flex items-center space-x-2 ${compact ? 'justify-center' : ''}`}>
        <span className={compact ? 'text-base' : 'text-lg'}>{emoji}</span>
        <span className={`font-medium text-gray-700 group-hover:text-orange-700 ${
          compact ? 'text-xs' : 'text-sm'
        }`}>
          {compact ? name.split(' ')[0] : name}
        </span>
      </div>
      {averageAmount && !compact && (
        <p className="text-xs text-gray-500 mt-1">Avg: Ksh {averageAmount}</p>
      )}
    </button>
  );
}
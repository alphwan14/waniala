'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/utils/storage';
import { calculateMonthlyTotals, calculateRentalTotals, formatCurrency } from '@/utils/calculations';
import { PoshoMillRecord, RentalRecord } from '@/types';
import Link from 'next/link';

export default function Dashboard() {
  const [poshoMillRecords, setPoshoMillRecords] = useState<PoshoMillRecord[]>([]);
  const [rentalRecords, setRentalRecords] = useState<RentalRecord[]>([]);
  const [repairFund, setRepairFund] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const pmRecords = storage.getPoshoMillRecords();
      const rentRecords = storage.getRentalRecords();
      const fund = storage.getRepairFund();
      
      setPoshoMillRecords(pmRecords);
      setRentalRecords(rentRecords);
      setRepairFund(fund);
      setIsLoading(false);
    };

    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthlyTotals = calculateMonthlyTotals(
    poshoMillRecords,
    currentMonth,
    currentYear
  );

  const rentalTotals = calculateRentalTotals(rentalRecords);

  const stats = [
    {
      title: 'Posho Mill Income',
      value: formatCurrency(monthlyTotals.totalIncome),
      icon: '💰',
      color: 'from-success-500 to-success-600',
      textColor: 'text-success-700',
      link: '/posho-mill',
    },
    {
      title: 'Posho Mill Expenses',
      value: formatCurrency(monthlyTotals.totalExpenses),
      icon: '📊',
      color: 'from-danger-500 to-danger-600',
      textColor: 'text-danger-700',
      link: '/posho-mill',
    },
    {
      title: 'Total Savings',
      value: formatCurrency(monthlyTotals.totalSavings),
      icon: '💵',
      color: 'from-primary-500 to-primary-600',
      textColor: 'text-primary-700',
      link: '/posho-mill',
    },
    {
      title: 'Rental Income',
      value: formatCurrency(rentalTotals.totalCollected),
      icon: '🏠',
      color: 'from-warning-500 to-warning-600',
      textColor: 'text-warning-700',
      link: '/rentals',
    },
    {
      title: 'Pending Rentals',
      value: formatCurrency(rentalTotals.pending),
      icon: '⏳',
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-700',
      link: '/rentals',
    },
    {
      title: 'Repair Fund',
      value: formatCurrency(repairFund),
      icon: '🔧',
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-700',
      link: '/posho-mill',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 text-lg">Your business performance at a glance</p>
        <div className="mt-4 bg-gradient-to-r from-primary-500 to-primary-600 h-1 w-24 mx-auto rounded-full"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Link key={index} href={stat.link}>
            <div className="stat-card border-l-4 border-l-transparent hover:border-l-current group animate-slide-up" 
                 style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.textColor} group-hover:scale-105 transition-transform duration-200`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 text-3xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4 bg-gradient-to-r from-gray-200 to-transparent h-1 rounded-full group-hover:from-current transition-all duration-300"></div>
            </div>
          </Link>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Monthly Summary */}
        <div className="card group hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-success-500 to-success-600 rounded-xl p-3 text-white text-2xl shadow-lg">
              📈
            </div>
            <h2 className="text-2xl font-bold text-gray-800 ml-4">Monthly Summary</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 group-hover:border-primary-200 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${monthlyTotals.netBalance >= 0 ? 'bg-success-500' : 'bg-danger-500'} animate-pulse`}></div>
                <span className="text-gray-700 font-medium">Net Balance</span>
              </div>
              <span className={`text-xl font-bold ${monthlyTotals.netBalance >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {formatCurrency(monthlyTotals.netBalance)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-purple-50 to-white rounded-xl border border-purple-200 group-hover:border-purple-300 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-gray-700 font-medium">Repair Fund</span>
              </div>
              <span className="text-xl font-bold text-purple-600">
                {formatCurrency(monthlyTotals.repairFund)}
              </span>
            </div>
          </div>
        </div>

        {/* Rental Summary */}
        <div className="card group hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-warning-500 to-warning-600 rounded-xl p-3 text-white text-2xl shadow-lg">
              🏘️
            </div>
            <h2 className="text-2xl font-bold text-gray-800 ml-4">Rental Summary</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 group-hover:border-warning-200 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                <span className="text-gray-700 font-medium">Total Expected</span>
              </div>
              <span className="text-xl font-bold text-gray-800">
                {formatCurrency(rentalTotals.totalExpected)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-primary-50 to-white rounded-xl border border-primary-200 group-hover:border-primary-300 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-primary-500 animate-pulse"></div>
                <span className="text-gray-700 font-medium">Collection Rate</span>
              </div>
              <span className="text-xl font-bold text-primary-600">
                {rentalTotals.totalExpected > 0
                  ? `${((rentalTotals.totalCollected / rentalTotals.totalExpected) * 100).toFixed(1)}%`
                  : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
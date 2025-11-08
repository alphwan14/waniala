import { PoshoMillRecord, RentalRecord } from '@/types';

export const calculateDailyBalance = (record: PoshoMillRecord): number => {
  const totalExpenses = record.expenseAmount + record.electricity;
  return record.income - (totalExpenses + record.savings);
};

export const calculateMonthlyTotals = (
  records: PoshoMillRecord[],
  month: number,
  year: number
) => {
  const monthRecords = records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getMonth() === month && recordDate.getFullYear() === year;
  });

  const totalIncome = monthRecords.reduce((sum, r) => sum + r.income, 0);
  const totalExpenses = monthRecords.reduce(
    (sum, r) => sum + r.expenseAmount + r.electricity,
    0
  );
  const totalSavings = monthRecords.reduce((sum, r) => sum + r.savings, 0);
  const netBalance = totalIncome - totalExpenses - totalSavings;
  const repairFund = totalIncome * 0.1; // 10% of total income (only from actual income)

  return {
    totalIncome,
    totalExpenses,
    totalSavings,
    netBalance,
    repairFund,
  };
};

export const calculateRentalTotals = (records: RentalRecord[]) => {
  const totalExpected = records.reduce((sum, r) => sum + r.rentAmount, 0);
  const totalCollected = records
    .filter(r => r.paymentStatus === 'Paid')
    .reduce((sum, r) => sum + r.rentAmount, 0);
  const pending = totalExpected - totalCollected;

  return {
    totalExpected,
    totalCollected,
    pending,
  };
};

export const formatCurrency = (amount: number): string => {
  return `Ksh ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};


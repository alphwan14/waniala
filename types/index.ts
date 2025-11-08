export interface PoshoMillRecord {
  id: string;
  date: string;
  income: number;
  expenseDescription: string;
  expenseAmount: number;
  electricity: number;
  savings: number;
  notes?: string;
  type?: 'income' | 'expense'; 
}

export interface RentalRecord {
  id: string;
  roomNumber: string;
  tenantName: string;
  rentAmount: number;
  datePaid: string;
  paymentStatus: 'Paid' | 'Pending';
}

export interface MonthlySummary {
  month: string;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  netBalance: number;
  repairFund: number;
}

export interface DashboardData {
  poshoMillIncome: number;
  poshoMillExpenses: number;
  poshoMillSavings: number;
  rentalIncome: number;
  rentalExpected: number;
  rentalPending: number;
  repairFund: number;
}


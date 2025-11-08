import { PoshoMillRecord, RentalRecord, MonthlySummary } from '@/types';

const STORAGE_KEYS = {
  POSHO_MILL: 'waniala_posho_mill',
  RENTALS: 'waniala_rentals',
  REPAIR_FUND: 'waniala_repair_fund',
  MONTHLY_SUMMARIES: 'waniala_monthly_summaries',
};

export const storage = {
  // Posho Mill Records
  getPoshoMillRecords: (): PoshoMillRecord[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.POSHO_MILL);
    return data ? JSON.parse(data) : [];
  },

  savePoshoMillRecord: (record: PoshoMillRecord): void => {
    const records = storage.getPoshoMillRecords();
    records.push(record);
    localStorage.setItem(STORAGE_KEYS.POSHO_MILL, JSON.stringify(records));
  },

  // Rental Records
  getRentalRecords: (): RentalRecord[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.RENTALS);
    return data ? JSON.parse(data) : [];
  },

  saveRentalRecord: (record: RentalRecord): void => {
    const records = storage.getRentalRecords();
    const index = records.findIndex(r => r.id === record.id);
    if (index >= 0) {
      records[index] = record;
    } else {
      records.push(record);
    }
    localStorage.setItem(STORAGE_KEYS.RENTALS, JSON.stringify(records));
  },

  deleteRentalRecord: (id: string): void => {
    const records = storage.getRentalRecords();
    const filtered = records.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RENTALS, JSON.stringify(filtered));
  },

  // Repair Fund
  getRepairFund: (): number => {
    if (typeof window === 'undefined') return 0;
    const data = localStorage.getItem(STORAGE_KEYS.REPAIR_FUND);
    return data ? parseFloat(data) : 0;
  },

  addToRepairFund: (amount: number): void => {
    const current = storage.getRepairFund();
    localStorage.setItem(STORAGE_KEYS.REPAIR_FUND, String(current + amount));
  },

  // Monthly Summaries
  getMonthlySummaries: (): MonthlySummary[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.MONTHLY_SUMMARIES);
    return data ? JSON.parse(data) : [];
  },

  saveMonthlySummary: (summary: MonthlySummary): void => {
    const summaries = storage.getMonthlySummaries();
    const index = summaries.findIndex(
      s => s.month === summary.month && s.year === summary.year
    );
    if (index >= 0) {
      summaries[index] = summary;
    } else {
      summaries.push(summary);
    }
    localStorage.setItem(STORAGE_KEYS.MONTHLY_SUMMARIES, JSON.stringify(summaries));
  },
};




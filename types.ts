export interface Employee {
  id: string;
  staffId: string;
  name: string;
  department: string;
  title: string;
  gender?: string;
  tableId?: string; // ID of the table they are assigned to
  isWinner: boolean;
  prizeWon?: string; // Name of the prize won
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
}

export interface Prize {
  id: string;
  name: string;
  count: number;
  image?: string; // Optional URL for prize image
}

export interface WinnerRecord {
  id: string;
  employeeId: string;
  prizeId: string;
  timestamp: number;
}

export interface AppState {
  employees: Employee[];
  tables: Table[];
  prizes: Prize[];
  winners: WinnerRecord[];
}

export type SortMode = 'department' | 'random' | 'none';

export const LOCAL_STORAGE_KEY = 'party_manager_db_v1';

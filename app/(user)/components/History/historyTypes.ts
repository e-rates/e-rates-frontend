// Type definitions for payment history
export interface HistoryRecord {
  year: number;
  amount: number;
  date: string;
  status: string;
}

export const columns = [
  {
    accessorKey: 'year',
    header: 'Year',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
  },
  {
    accessorKey: 'date',
    header: 'Date',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
];

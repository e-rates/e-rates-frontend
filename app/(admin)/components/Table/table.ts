interface TableData {
  plotOwner: string;
  plotnumber: string;
  isPaid: boolean;
  paymentPending: number;
  plotLocation: string;
}

export const columns = [
  {
    accessorKey: 'plotOwner',
    header: 'Plot Owner',
  },
  {
    accessorKey: 'plotnumber',
    header: 'Plot Number',
  },
  {
    accessorKey: 'isPaid',
    header: 'Is Paid',
  },
  {
    accessorKey: 'paymentPending',
    header: 'Payment Pending',
  },
  {
    accessorKey: 'plotLocation',
    header: 'Payment Location',
  },
];

export const data: TableData[] = [
  {
    plotOwner: 'Mike Kareu',
    plotnumber: '456',
    plotLocation: 'Kiawara',
    isPaid: false,
    paymentPending: 4500,
  },
  {
    plotOwner: 'Joan Wanjiru',
    plotnumber: '676',
    plotLocation: 'Nyeri Town Municipality',
    isPaid: false,
    paymentPending: 4500,
  },
  {
    plotOwner: 'Mike Kareu',
    plotnumber: '456',
    plotLocation: 'Kiawara',
    isPaid: false,
    paymentPending: 4500,
  },
];

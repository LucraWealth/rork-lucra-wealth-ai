export interface BillHistory {
  date: string;
  amount: number;
  status: string;
}

export interface AutoPaySettings {
  enabled: boolean;
  paymentMethod: string;
  paymentDate: number; // Day of month (1-31)
  nextPaymentDate?: string;
  lastPaymentDate?: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
  isOverdue: boolean;
  logoUrl: string;
  description?: string;
  billNumber?: string;
  accountNumber?: string;
  billingPeriod?: string;
  paymentMethod?: string;
  history?: BillHistory[];
  autoPay?: AutoPaySettings;
}

export const bills: Bill[] = [
  {
    id: "1",
    name: "Electricity Bill",
    amount: 89.99,
    dueDate: "May 15, 2023",
    category: "Utilities",
    isPaid: false,
    isOverdue: false,
    logoUrl: "https://cdn-icons-png.flaticon.com/512/2917/2917995.png",
    description: "Monthly electricity bill for residential address",
    billNumber: "EB-123456",
    accountNumber: "ACC-78901234",
    billingPeriod: "May 1 - May 31, 2023",
    paymentMethod: "Visa •••• 4242",
    autoPay: {
      enabled: false,
      paymentMethod: "Visa •••• 4242",
      paymentDate: 10,
      nextPaymentDate: "June 10, 2023"
    },
    history: [
      {
        date: "April 15, 2023",
        amount: 78.50,
        status: "Paid"
      },
      {
        date: "March 15, 2023",
        amount: 82.75,
        status: "Paid"
      },
      {
        date: "February 15, 2023",
        amount: 95.20,
        status: "Paid"
      }
    ]
  },
  {
    id: "2",
    name: "Water Bill",
    amount: 45.50,
    dueDate: "May 20, 2023",
    category: "Utilities",
    isPaid: false,
    isOverdue: false,
    logoUrl: "https://cdn-icons-png.flaticon.com/512/1040/1040230.png",
    description: "Monthly water and sewage bill",
    billNumber: "WB-789012",
    accountNumber: "ACC-34567890",
    billingPeriod: "May 1 - May 31, 2023",
    paymentMethod: "Visa •••• 4242",
    autoPay: {
      enabled: true,
      paymentMethod: "Visa •••• 4242",
      paymentDate: 15,
      nextPaymentDate: "June 15, 2023",
      lastPaymentDate: "May 15, 2023"
    },
    history: [
      {
        date: "April 20, 2023",
        amount: 42.30,
        status: "Paid"
      },
      {
        date: "March 20, 2023",
        amount: 39.75,
        status: "Paid"
      }
    ]
  },
  {
    id: "3",
    name: "Internet",
    amount: 79.99,
    dueDate: "May 5, 2023",
    category: "Internet",
    isPaid: true,
    isOverdue: false,
    logoUrl: "https://cdn-icons-png.flaticon.com/512/1006/1006771.png",
    description: "High-speed fiber internet subscription",
    billNumber: "IN-345678",
    accountNumber: "ACC-12345678",
    billingPeriod: "May 1 - May 31, 2023",
    paymentMethod: "Visa •••• 4242",
    autoPay: {
      enabled: true,
      paymentMethod: "Visa •••• 4242",
      paymentDate: 5,
      nextPaymentDate: "June 5, 2023",
      lastPaymentDate: "May 5, 2023"
    },
    history: [
      {
        date: "May 5, 2023",
        amount: 79.99,
        status: "Paid"
      },
      {
        date: "April 5, 2023",
        amount: 79.99,
        status: "Paid"
      },
      {
        date: "March 5, 2023",
        amount: 79.99,
        status: "Paid"
      }
    ]
  },
  {
    id: "4",
    name: "Netflix",
    amount: 15.99,
    dueDate: "May 10, 2023",
    category: "Subscription",
    isPaid: false,
    isOverdue: false,
    logoUrl: "https://cdn-icons-png.flaticon.com/512/5977/5977590.png",
    description: "Monthly streaming service subscription",
    billNumber: "NF-567890",
    accountNumber: "ACC-23456789",
    billingPeriod: "May 1 - May 31, 2023",
    paymentMethod: "Visa •••• 4242",
    autoPay: {
      enabled: true,
      paymentMethod: "Visa •••• 4242",
      paymentDate: 10,
      nextPaymentDate: "June 10, 2023",
      lastPaymentDate: "April 10, 2023"
    },
    history: [
      {
        date: "April 10, 2023",
        amount: 15.99,
        status: "Paid"
      },
      {
        date: "March 10, 2023",
        amount: 15.99,
        status: "Paid"
      },
      {
        date: "February 10, 2023",
        amount: 15.99,
        status: "Late"
      }
    ]
  },
  {
    id: "5",
    name: "Rent",
    amount: 1200.00,
    dueDate: "May 1, 2023",
    category: "Rent",
    isPaid: true,
    isOverdue: false,
    logoUrl: "https://cdn-icons-png.flaticon.com/512/1946/1946436.png",
    description: "Monthly apartment rent payment",
    billNumber: "RT-901234",
    accountNumber: "ACC-45678901",
    billingPeriod: "May 1 - May 31, 2023",
    paymentMethod: "Visa •••• 4242",
    autoPay: {
      enabled: false,
      paymentMethod: "Visa •••• 4242",
      paymentDate: 1,
      nextPaymentDate: "June 1, 2023"
    },
    history: [
      {
        date: "May 1, 2023",
        amount: 1200.00,
        status: "Paid"
      },
      {
        date: "April 1, 2023",
        amount: 1200.00,
        status: "Paid"
      },
      {
        date: "March 1, 2023",
        amount: 1200.00,
        status: "Paid"
      }
    ]
  },
  {
    id: "6",
    name: "Phone Bill",
    amount: 65.00,
    dueDate: "May 18, 2023",
    category: "Phone",
    isPaid: false,
    isOverdue: false,
    logoUrl: "https://cdn-icons-png.flaticon.com/512/664/664681.png",
    description: "Monthly mobile phone service payment",
    billNumber: "PB-123789",
    accountNumber: "ACC-56789012",
    billingPeriod: "May 1 - May 31, 2023",
    paymentMethod: "Visa •••• 4242",
    autoPay: {
      enabled: false,
      paymentMethod: "Visa •••• 4242",
      paymentDate: 18,
      nextPaymentDate: "June 18, 2023"
    },
    history: [
      {
        date: "April 18, 2023",
        amount: 65.00,
        status: "Paid"
      },
      {
        date: "March 18, 2023",
        amount: 65.00,
        status: "Paid"
      },
      {
        date: "February 18, 2023",
        amount: 70.25,
        status: "Paid"
      }
    ]
  },
  {
    id: "7",
    name: "Gym Membership",
    amount: 49.99,
    dueDate: "May 25, 2023",
    category: "Subscription",
    isPaid: false,
    isOverdue: false,
    logoUrl: "https://cdn-icons-png.flaticon.com/512/1377/1377048.png",
    description: "Monthly fitness center membership",
    billNumber: "GM-456123",
    accountNumber: "ACC-67890123",
    billingPeriod: "May 1 - May 31, 2023",
    paymentMethod: "Visa •••• 4242",
    autoPay: {
      enabled: false,
      paymentMethod: "Visa •••• 4242",
      paymentDate: 25,
      nextPaymentDate: "June 25, 2023"
    },
    history: [
      {
        date: "April 25, 2023",
        amount: 49.99,
        status: "Paid"
      },
      {
        date: "March 25, 2023",
        amount: 49.99,
        status: "Paid"
      }
    ]
  },
  {
    id: "8",
    name: "Car Insurance",
    amount: 120.50,
    dueDate: "May 30, 2023",
    category: "Insurance",
    isPaid: false,
    isOverdue: false,
    logoUrl: "https://cdn-icons-png.flaticon.com/512/3774/3774299.png",
    description: "Monthly auto insurance premium",
    billNumber: "CI-789456",
    accountNumber: "ACC-78901234",
    billingPeriod: "May 1 - May 31, 2023",
    paymentMethod: "Visa •••• 4242",
    autoPay: {
      enabled: true,
      paymentMethod: "Visa •••• 4242",
      paymentDate: 30,
      nextPaymentDate: "June 30, 2023",
      lastPaymentDate: "April 30, 2023"
    },
    history: [
      {
        date: "April 30, 2023",
        amount: 120.50,
        status: "Paid"
      },
      {
        date: "March 30, 2023",
        amount: 120.50,
        status: "Paid"
      }
    ]
  }
];
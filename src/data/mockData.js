export const mockUsers = [
  { id: 1, username: 'admin', password: 'password', role: 'admin', name: 'School Admin' },
  { id: 2, username: 'parent1', password: 'password', role: 'parent', name: 'John Doe Sr.', childrenIds: ['S001', 'S002'] },
  { id: 3, username: 'parent2', password: 'password', role: 'parent', name: 'Jane Smith Sr.', childrenIds: ['S003'] },
];

export const feeStructure = {
  tuition: 50000,
  transport: 15000,
  lunch: 10000,
  total: 75000
};

export const studentsData = [
  {
    id: "S001",
    name: "John Doe",
    grade: "Grade 5",
    totalFees: 75000,
    paidFees: 50000,
    transactions: [
      { id: "TX001", date: "2023-01-10", amount: 20000, type: "credit", description: "Term 1 Tuition" },
      { id: "TX002", date: "2023-01-12", amount: 10000, type: "credit", description: "Term 1 Transport" },
      { id: "TX003", date: "2023-02-15", amount: 20000, type: "credit", description: "Term 2 Tuition" },
      { id: "TX004", date: "2023-01-01", amount: 75000, type: "debit", description: "Annual Fees Billed" }
    ]
  },
  {
    id: "S002",
    name: "Jane Smith",
    grade: "Grade 3",
    totalFees: 75000,
    paidFees: 75000,
    transactions: [
      { id: "TX005", date: "2023-01-05", amount: 75000, type: "credit", description: "Full Year Payment" },
      { id: "TX006", date: "2023-01-01", amount: 75000, type: "debit", description: "Annual Fees Billed" }
    ]
  },
  {
    id: "S003",
    name: "Michael Johnson",
    grade: "Grade 8",
    totalFees: 75000,
    paidFees: 20000,
    transactions: [
      { id: "TX007", date: "2023-02-10", amount: 20000, type: "credit", description: "Partial Payment" },
      { id: "TX008", date: "2023-01-01", amount: 75000, type: "debit", description: "Annual Fees Billed" }
    ]
  }
];

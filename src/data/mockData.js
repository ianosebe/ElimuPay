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
    paidFees: 0,
    transactions: []
  },
  {
    id: "S002",
    name: "Jane Smith",
    grade: "Grade 3",
    totalFees: 75000,
    paidFees: 0,
    transactions: []
  },
  {
    id: "S003",
    name: "Michael Johnson",
    grade: "Grade 8",
    totalFees: 75000,
    paidFees: 0,
    transactions: []
  }
];

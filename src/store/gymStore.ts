
import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: 'basic' | 'premium' | 'vip';
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
  emergencyContact: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  duration?: number;
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
  membershipType: string;
}

interface GymStore {
  users: User[];
  attendance: AttendanceRecord[];
  payments: Payment[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addAttendance: (attendance: Omit<AttendanceRecord, 'id'>) => void;
  updateAttendance: (id: string, attendance: Partial<AttendanceRecord>) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
}

// Sample data
const sampleUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    membershipType: 'premium',
    joinDate: '2024-01-15',
    status: 'active',
    emergencyContact: '+1234567891'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1234567892',
    membershipType: 'basic',
    joinDate: '2024-02-01',
    status: 'active',
    emergencyContact: '+1234567893'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+1234567894',
    membershipType: 'vip',
    joinDate: '2024-01-10',
    status: 'active',
    emergencyContact: '+1234567895'
  }
];

const sampleAttendance: AttendanceRecord[] = [
  {
    id: '1',
    userId: '1',
    userName: 'John Doe',
    date: new Date().toISOString().split('T')[0],
    checkIn: '08:00',
    checkOut: '10:00',
    duration: 120
  },
  {
    id: '2',
    userId: '2',
    userName: 'Jane Smith',
    date: new Date().toISOString().split('T')[0],
    checkIn: '18:00',
    duration: 0
  }
];

const samplePayments: Payment[] = [
  {
    id: '1',
    userId: '1',
    userName: 'John Doe',
    amount: 79.99,
    dueDate: '2024-06-01',
    paidDate: '2024-05-28',
    status: 'paid',
    membershipType: 'premium'
  },
  {
    id: '2',
    userId: '2',
    userName: 'Jane Smith',
    amount: 49.99,
    dueDate: '2024-06-01',
    status: 'pending',
    membershipType: 'basic'
  },
  {
    id: '3',
    userId: '3',
    userName: 'Mike Johnson',
    amount: 99.99,
    dueDate: '2024-06-01',
    status: 'pending',
    membershipType: 'vip'
  }
];

export const useGymStore = create<GymStore>((set) => ({
  users: sampleUsers,
  attendance: sampleAttendance,
  payments: samplePayments,
  
  addUser: (user) =>
    set((state) => ({
      users: [...state.users, { ...user, id: Date.now().toString() }],
    })),
    
  updateUser: (id, updatedUser) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, ...updatedUser } : user
      ),
    })),
    
  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
    })),
    
  addAttendance: (attendance) =>
    set((state) => ({
      attendance: [...state.attendance, { ...attendance, id: Date.now().toString() }],
    })),
    
  updateAttendance: (id, updatedAttendance) =>
    set((state) => ({
      attendance: state.attendance.map((record) =>
        record.id === id ? { ...record, ...updatedAttendance } : record
      ),
    })),
    
  addPayment: (payment) =>
    set((state) => ({
      payments: [...state.payments, { ...payment, id: Date.now().toString() }],
    })),
    
  updatePayment: (id, updatedPayment) =>
    set((state) => ({
      payments: state.payments.map((payment) =>
        payment.id === id ? { ...payment, ...updatedPayment } : payment
      ),
    })),
}));

import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: 'basic' | 'premium' | 'vip';
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
  emergencyContact: string;
  barcode?: string;
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
  loading: boolean;
  fetchUsers: () => Promise<void>;
  fetchAttendance: () => Promise<void>;
  fetchPayments: () => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addAttendance: (attendance: Omit<AttendanceRecord, 'id'>) => Promise<void>;
  updateAttendance: (id: string, attendance: Partial<AttendanceRecord>) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<void>;
  generateBarcode: (userId: string) => Promise<string>;
}

export const useGymStore = create<GymStore>((set, get) => ({
  users: [],
  attendance: [],
  payments: [],
  loading: false,

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const users: User[] = data?.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        membershipType: member.membership_type as 'basic' | 'premium' | 'vip',
        joinDate: member.join_date,
        status: member.status as 'active' | 'inactive' | 'suspended',
        emergencyContact: member.emergency_contact || '',
        barcode: member.barcode || undefined
      })) || [];

      set({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchAttendance: async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          members (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const attendance: AttendanceRecord[] = data?.map(record => ({
        id: record.id,
        userId: record.member_id,
        userName: record.members?.name || 'Unknown',
        date: record.date,
        checkIn: record.check_in,
        checkOut: record.check_out || undefined,
        duration: record.duration || undefined
      })) || [];

      set({ attendance });
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  },

  fetchPayments: async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          members (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const payments: Payment[] = data?.map(payment => ({
        id: payment.id,
        userId: payment.member_id,
        userName: payment.members?.name || 'Unknown',
        amount: payment.amount,
        dueDate: payment.due_date,
        paidDate: payment.paid_date || undefined,
        status: payment.status as 'pending' | 'paid' | 'overdue',
        membershipType: payment.membership_type
      })) || [];

      set({ payments });
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  },

  addUser: async (user) => {
    try {
      const { error } = await supabase
        .from('members')
        .insert({
          name: user.name,
          email: user.email,
          phone: user.phone,
          membership_type: user.membershipType,
          join_date: user.joinDate,
          status: user.status,
          emergency_contact: user.emergencyContact,
          barcode: user.barcode
        });

      if (error) throw error;
      
      await get().fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  },

  updateUser: async (id, updatedUser) => {
    try {
      const { error } = await supabase
        .from('members')
        .update({
          ...(updatedUser.name && { name: updatedUser.name }),
          ...(updatedUser.email && { email: updatedUser.email }),
          ...(updatedUser.phone && { phone: updatedUser.phone }),
          ...(updatedUser.membershipType && { membership_type: updatedUser.membershipType }),
          ...(updatedUser.status && { status: updatedUser.status }),
          ...(updatedUser.emergencyContact !== undefined && { emergency_contact: updatedUser.emergencyContact }),
          ...(updatedUser.barcode !== undefined && { barcode: updatedUser.barcode })
        })
        .eq('id', id);

      if (error) throw error;
      
      await get().fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await get().fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  addAttendance: async (attendance) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .insert({
          member_id: attendance.userId,
          date: attendance.date,
          check_in: attendance.checkIn,
          check_out: attendance.checkOut || null,
          duration: attendance.duration || null
        });

      if (error) throw error;
      
      await get().fetchAttendance();
    } catch (error) {
      console.error('Error adding attendance:', error);
      throw error;
    }
  },

  updateAttendance: async (id, updatedAttendance) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .update({
          ...(updatedAttendance.checkOut && { check_out: updatedAttendance.checkOut }),
          ...(updatedAttendance.duration !== undefined && { duration: updatedAttendance.duration })
        })
        .eq('id', id);

      if (error) throw error;
      
      await get().fetchAttendance();
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  },

  addPayment: async (payment) => {
    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          member_id: payment.userId,
          amount: payment.amount,
          due_date: payment.dueDate,
          paid_date: payment.paidDate || null,
          status: payment.status,
          membership_type: payment.membershipType
        });

      if (error) throw error;
      
      await get().fetchPayments();
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  },

  updatePayment: async (id, updatedPayment) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          ...(updatedPayment.status && { status: updatedPayment.status }),
          ...(updatedPayment.paidDate && { paid_date: updatedPayment.paidDate })
        })
        .eq('id', id);

      if (error) throw error;
      
      await get().fetchPayments();
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  },

  generateBarcode: async (userId: string) => {
    try {
      // Generate a unique barcode using timestamp and random number
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      const barcode = `GYM${timestamp}${random}`;
      
      // Update the user with the new barcode
      const { error } = await supabase
        .from('members')
        .update({ barcode })
        .eq('id', userId);

      if (error) throw error;
      
      await get().fetchUsers();
      return barcode;
    } catch (error) {
      console.error('Error generating barcode:', error);
      throw error;
    }
  },
}));

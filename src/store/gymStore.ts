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
  gymId?: string;
}

export interface Gym {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  gymQrCode: string;
  ownerId: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  duration?: number;
  gymId?: string;
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
  gymId?: string;
}

interface GymStore {
  users: User[];
  attendance: AttendanceRecord[];
  payments: Payment[];
  gyms: Gym[];
  currentGym: Gym | null;
  loading: boolean;
  fetchGyms: () => Promise<void>;
  fetchCurrentGym: () => Promise<void>;
  createGym: (gym: Omit<Gym, 'id' | 'gymQrCode' | 'ownerId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGym: (id: string, gym: Partial<Gym>) => Promise<void>;
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
  checkInWithGymQR: (gymQrCode: string) => Promise<void>;
}

export const useGymStore = create<GymStore>((set, get) => ({
  users: [],
  attendance: [],
  payments: [],
  gyms: [],
  currentGym: null,
  loading: false,

  fetchGyms: async () => {
    try {
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const gyms: Gym[] = data?.map(gym => ({
        id: gym.id,
        name: gym.name,
        email: gym.email,
        phone: gym.phone || '',
        address: gym.address || '',
        gymQrCode: gym.gym_qr_code,
        ownerId: gym.owner_id,
        status: gym.status as 'active' | 'inactive' | 'suspended',
        createdAt: gym.created_at,
        updatedAt: gym.updated_at
      })) || [];

      set({ gyms });
    } catch (error) {
      console.error('Error fetching gyms:', error);
    }
  },

  fetchCurrentGym: async () => {
    try {
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      if (!data) return;

      const gym: Gym = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        address: data.address || '',
        gymQrCode: data.gym_qr_code,
        ownerId: data.owner_id,
        status: data.status as 'active' | 'inactive' | 'suspended',
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      set({ currentGym: gym });
    } catch (error) {
      console.error('Error fetching current gym:', error);
    }
  },

  createGym: async (gymData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Generate a gym QR code using the database function
      const { data: qrCodeData, error: qrError } = await supabase
        .rpc('generate_gym_qr_code');

      if (qrError) throw qrError;

      const { error } = await supabase
        .from('gyms')
        .insert({
          name: gymData.name,
          email: gymData.email,
          phone: gymData.phone,
          address: gymData.address,
          owner_id: user.id,
          status: gymData.status,
          gym_qr_code: qrCodeData
        });

      if (error) throw error;
      
      await get().fetchGyms();
      await get().fetchCurrentGym();
    } catch (error) {
      console.error('Error creating gym:', error);
      throw error;
    }
  },

  updateGym: async (id, updatedGym) => {
    try {
      const { error } = await supabase
        .from('gyms')
        .update({
          ...(updatedGym.name && { name: updatedGym.name }),
          ...(updatedGym.email && { email: updatedGym.email }),
          ...(updatedGym.phone !== undefined && { phone: updatedGym.phone }),
          ...(updatedGym.address !== undefined && { address: updatedGym.address }),
          ...(updatedGym.status && { status: updatedGym.status })
        })
        .eq('id', id);

      if (error) throw error;
      
      await get().fetchGyms();
      await get().fetchCurrentGym();
    } catch (error) {
      console.error('Error updating gym:', error);
      throw error;
    }
  },

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const { currentGym } = get();
      if (!currentGym) return;

      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('gym_id', currentGym.id)
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
        barcode: member.barcode || undefined,
        gymId: member.gym_id
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
      const { currentGym } = get();
      if (!currentGym) return;

      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          members (name)
        `)
        .eq('gym_id', currentGym.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const attendance: AttendanceRecord[] = data?.map(record => ({
        id: record.id,
        userId: record.member_id,
        userName: record.members?.name || 'Unknown',
        date: record.date,
        checkIn: record.check_in,
        checkOut: record.check_out || undefined,
        duration: record.duration || undefined,
        gymId: record.gym_id
      })) || [];

      set({ attendance });
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  },

  fetchPayments: async () => {
    try {
      const { currentGym } = get();
      if (!currentGym) return;

      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          members (name)
        `)
        .eq('gym_id', currentGym.id)
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
        membershipType: payment.membership_type,
        gymId: payment.gym_id
      })) || [];

      set({ payments });
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  },

  addUser: async (user) => {
    try {
      const { currentGym } = get();
      if (!currentGym) throw new Error('No current gym selected');

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
          barcode: user.barcode,
          gym_id: currentGym.id
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
      const { currentGym } = get();
      if (!currentGym) throw new Error('No current gym selected');

      const { error } = await supabase
        .from('attendance')
        .insert({
          member_id: attendance.userId,
          date: attendance.date,
          check_in: attendance.checkIn,
          check_out: attendance.checkOut || null,
          duration: attendance.duration || null,
          gym_id: currentGym.id
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
      const { currentGym } = get();
      if (!currentGym) throw new Error('No current gym selected');

      const { error } = await supabase
        .from('payments')
        .insert({
          member_id: payment.userId,
          amount: payment.amount,
          due_date: payment.dueDate,
          paid_date: payment.paidDate || null,
          status: payment.status,
          membership_type: payment.membershipType,
          gym_id: currentGym.id
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
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      const barcode = `GYM${timestamp}${random}`;
      
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

  checkInWithGymQR: async (gymQrCode: string) => {
    try {
      // Find the gym by QR code
      const { data: gymData, error: gymError } = await supabase
        .from('gyms')
        .select('*')
        .eq('gym_qr_code', gymQrCode)
        .single();

      if (gymError) throw gymError;

      // This would be used when a member scans the gym QR code
      // For now, just return success - this can be expanded based on your needs
      console.log('Gym found for QR code:', gymData);
    } catch (error) {
      console.error('Error checking in with gym QR:', error);
      throw error;
    }
  },
}));

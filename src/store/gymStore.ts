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
  username?: string;
  password?: string;
  gymId?: string;
  membershipPlanId?: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
}

export interface Gym {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  gymQrCode: string;
  ownerId?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  username?: string;
  adminName?: string;
  adminEmail?: string;
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
  membershipPlanId?: string;
}

export interface MembershipPlan {
  id: string;
  gymId: string;
  planName: string;
  planType: 'daily' | 'monthly' | '3_month' | '6_month' | 'yearly';
  price: number;
  durationDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GymStore {
  users: User[];
  attendance: AttendanceRecord[];
  payments: Payment[];
  gyms: Gym[];
  currentGym: Gym | null;
  membershipPlans: MembershipPlan[];
  loading: boolean;
  fetchGyms: () => Promise<void>;
  fetchCurrentGym: (gymId: string) => Promise<void>;
  createGym: (gym: Omit<Gym, 'id' | 'gymQrCode' | 'ownerId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGym: (id: string, gym: Partial<Gym>) => Promise<void>;
  fetchUsers: (gymId: string) => Promise<void>;
  fetchAttendance: (gymId: string) => Promise<void>;
  fetchPayments: (gymId: string) => Promise<void>;
  fetchMembershipPlans: (gymId: string) => Promise<void>;
  updateMembershipPlan: (id: string, plan: Partial<MembershipPlan>) => Promise<void>;
  addUser: (user: Omit<User, 'id'>, gymId: string) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addAttendance: (attendance: Omit<AttendanceRecord, 'id'>) => Promise<void>;
  updateAttendance: (id: string, attendance: Partial<AttendanceRecord>) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<void>;
  generateBarcode: (userId: string) => Promise<string>;
  authenticateGymAdmin: (username: string, password: string) => Promise<{gymId: string, gymName: string} | null>;
  authenticateMember: (username: string, password: string) => Promise<{memberId: string, memberName: string, gymId: string} | null>;
  memberCheckInWithQR: (memberId: string, gymQrCode: string) => Promise<{success: boolean, message: string, gymName: string}>;
}

export const useGymStore = create<GymStore>((set, get) => ({
  users: [],
  attendance: [],
  payments: [],
  gyms: [],
  currentGym: null,
  membershipPlans: [],
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
        ownerId: gym.owner_id || undefined,
        status: gym.status as 'active' | 'inactive' | 'suspended',
        createdAt: gym.created_at,
        updatedAt: gym.updated_at,
        username: gym.username || undefined,
        adminName: gym.admin_name || undefined,
        adminEmail: gym.admin_email || undefined
      })) || [];

      set({ gyms });
    } catch (error) {
      console.error('Error fetching gyms:', error);
    }
  },

  fetchCurrentGym: async (gymId: string) => {
    try {
      console.log('Fetching gym with ID:', gymId);
      
      // First try to fetch by ID
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .eq('id', gymId)
        .maybeSingle();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      if (data) {
        const gym: Gym = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          address: data.address || '',
          gymQrCode: data.gym_qr_code,
          ownerId: data.owner_id || undefined,
          status: data.status as 'active' | 'inactive' | 'suspended',
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          username: data.username || undefined,
          adminName: data.admin_name || undefined,
          adminEmail: data.admin_email || undefined
        };

        console.log('Gym fetched successfully by ID:', gym);
        set({ currentGym: gym });
        return;
      }

      console.warn('No gym found with ID:', gymId);
      
      // If not found by ID, try by username (in case gymId is actually a username)
      const { data: gymByUsername, error: usernameError } = await supabase
        .from('gyms')
        .select('*')
        .eq('username', gymId)
        .maybeSingle();
        
      if (usernameError) {
        console.error('Error searching by username:', usernameError);
        set({ currentGym: null });
        return;
      }
      
      if (gymByUsername) {
        console.log('Found gym by username:', gymByUsername);
        const gym: Gym = {
          id: gymByUsername.id,
          name: gymByUsername.name,
          email: gymByUsername.email,
          phone: gymByUsername.phone || '',
          address: gymByUsername.address || '',
          gymQrCode: gymByUsername.gym_qr_code,
          ownerId: gymByUsername.owner_id || undefined,
          status: gymByUsername.status as 'active' | 'inactive' | 'suspended',
          createdAt: gymByUsername.created_at,
          updatedAt: gymByUsername.updated_at,
          username: gymByUsername.username || undefined,
          adminName: gymByUsername.admin_name || undefined,
          adminEmail: gymByUsername.admin_email || undefined
        };
        
        console.log('Gym fetched successfully by username:', gym);
        set({ currentGym: gym });
        
        // Update localStorage with correct gym ID
        const storedData = localStorage.getItem('gymAdmin');
        if (storedData) {
          try {
            const parsed = JSON.parse(storedData);
            parsed.gymId = gym.id;
            localStorage.setItem('gymAdmin', JSON.stringify(parsed));
          } catch (e) {
            console.error('Error updating localStorage:', e);
          }
        }
        return;
      }
      
      set({ currentGym: null });
    } catch (error) {
      console.error('Error fetching current gym:', error);
      set({ currentGym: null });
    }
  },

  createGym: async (gymData) => {
    try {
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
          status: gymData.status,
          gym_qr_code: qrCodeData,
          username: gymData.username,
          admin_name: gymData.adminName,
          admin_email: gymData.adminEmail
        });

      if (error) throw error;
      
      await get().fetchGyms();
    } catch (error) {
      console.error('Error creating gym:', error);
      throw error;
    }
  },

  updateGym: async (id, updatedGym) => {
    try {
      const updateData: any = {};
      
      if (updatedGym.name) updateData.name = updatedGym.name;
      if (updatedGym.email) updateData.email = updatedGym.email;
      if (updatedGym.phone !== undefined) updateData.phone = updatedGym.phone;
      if (updatedGym.address !== undefined) updateData.address = updatedGym.address;
      if (updatedGym.status) updateData.status = updatedGym.status;
      if (updatedGym.username) updateData.username = updatedGym.username;
      if (updatedGym.adminName !== undefined) updateData.admin_name = updatedGym.adminName;
      if (updatedGym.adminEmail !== undefined) updateData.admin_email = updatedGym.adminEmail;

      const { error } = await supabase
        .from('gyms')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      await get().fetchGyms();
    } catch (error) {
      console.error('Error updating gym:', error);
      throw error;
    }
  },

  fetchMembershipPlans: async (gymId: string) => {
    try {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('gym_id', gymId)
        .order('duration_days', { ascending: true });

      if (error) throw error;

      const membershipPlans: MembershipPlan[] = data?.map(plan => ({
        id: plan.id,
        gymId: plan.gym_id,
        planName: plan.plan_name,
        planType: plan.plan_type as 'daily' | 'monthly' | '3_month' | '6_month' | 'yearly',
        price: parseFloat(plan.price.toString()),
        durationDays: plan.duration_days,
        isActive: plan.is_active,
        createdAt: plan.created_at,
        updatedAt: plan.updated_at
      })) || [];

      set({ membershipPlans });
    } catch (error) {
      console.error('Error fetching membership plans:', error);
    }
  },

  updateMembershipPlan: async (id: string, updatedPlan: Partial<MembershipPlan>) => {
    try {
      const updateData: any = {};
      
      if (updatedPlan.planName) updateData.plan_name = updatedPlan.planName;
      if (updatedPlan.price !== undefined) updateData.price = updatedPlan.price;
      if (updatedPlan.isActive !== undefined) updateData.is_active = updatedPlan.isActive;

      const { error } = await supabase
        .from('membership_plans')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      // Refresh membership plans for the current gym
      const { currentGym } = get();
      if (currentGym) {
        await get().fetchMembershipPlans(currentGym.id);
      }
    } catch (error) {
      console.error('Error updating membership plan:', error);
      throw error;
    }
  },

  fetchUsers: async (gymId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          membership_plans (
            id,
            plan_name,
            plan_type,
            price
          )
        `)
        .eq('gym_id', gymId)
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
        username: member.username || undefined,
        password: undefined, // Don't expose password in the store
        gymId: member.gym_id,
        membershipPlanId: member.membership_plan_id,
        membershipStartDate: member.membership_start_date,
        membershipEndDate: member.membership_end_date
      })) || [];

      set({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchAttendance: async (gymId: string) => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          members (name)
        `)
        .eq('gym_id', gymId)
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

  fetchPayments: async (gymId: string) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          members (name),
          membership_plans (plan_name, plan_type)
        `)
        .eq('gym_id', gymId)
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
        gymId: payment.gym_id,
        membershipPlanId: payment.membership_plan_id
      })) || [];

      set({ payments });
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  },

  addUser: async (user, gymId) => {
    try {
      // Hash the password before storing
      const { data: hashedPassword, error: hashError } = await supabase
        .rpc('hash_password', { password: user.password || 'defaultpass123' });

      if (hashError) throw hashError;

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
          username: user.username,
          password_hash: hashedPassword,
          gym_id: gymId,
          membership_plan_id: user.membershipPlanId,
          membership_start_date: user.membershipStartDate,
          membership_end_date: user.membershipEndDate
        });

      if (error) throw error;
      
      await get().fetchUsers(gymId);
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  },

  updateUser: async (id, updatedUser) => {
    try {
      const updateData: any = {};
      
      if (updatedUser.name) updateData.name = updatedUser.name;
      if (updatedUser.email) updateData.email = updatedUser.email;
      if (updatedUser.phone) updateData.phone = updatedUser.phone;
      if (updatedUser.membershipType) updateData.membership_type = updatedUser.membershipType;
      if (updatedUser.status) updateData.status = updatedUser.status;
      if (updatedUser.emergencyContact !== undefined) updateData.emergency_contact = updatedUser.emergencyContact;
      if (updatedUser.barcode !== undefined) updateData.barcode = updatedUser.barcode;
      if (updatedUser.username) updateData.username = updatedUser.username;
      if (updatedUser.membershipPlanId) updateData.membership_plan_id = updatedUser.membershipPlanId;
      if (updatedUser.membershipStartDate) updateData.membership_start_date = updatedUser.membershipStartDate;
      if (updatedUser.membershipEndDate) updateData.membership_end_date = updatedUser.membershipEndDate;
      
      // Only update password if a new one is provided
      if (updatedUser.password && updatedUser.password.trim() !== '') {
        const { data: hashedPassword, error: hashError } = await supabase
          .rpc('hash_password', { password: updatedUser.password });

        if (hashError) throw hashError;
        updateData.password_hash = hashedPassword;
      }

      const { error } = await supabase
        .from('members')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      // Refresh users for the current gym
      const { currentGym } = get();
      if (currentGym) {
        await get().fetchUsers(currentGym.id);
      }
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
      
      // Refresh users for the current gym
      const { currentGym } = get();
      if (currentGym) {
        await get().fetchUsers(currentGym.id);
      }
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
          duration: attendance.duration || null,
          gym_id: attendance.gymId
        });

      if (error) throw error;
      
      if (attendance.gymId) {
        await get().fetchAttendance(attendance.gymId);
      }
    } catch (error) {
      console.error('Error adding attendance:', error);
      throw error;
    }
  },

  updateAttendance: async (id, updatedAttendance) => {
    try {
      const updateData: any = {};
      
      if (updatedAttendance.checkOut) updateData.check_out = updatedAttendance.checkOut;
      if (updatedAttendance.duration !== undefined) updateData.duration = updatedAttendance.duration;

      const { error } = await supabase
        .from('attendance')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      // Refresh attendance for the current gym
      const { currentGym } = get();
      if (currentGym) {
        await get().fetchAttendance(currentGym.id);
      }
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
          membership_type: payment.membershipType,
          gym_id: payment.gymId,
          membership_plan_id: payment.membershipPlanId
        });

      if (error) throw error;
      
      if (payment.gymId) {
        await get().fetchPayments(payment.gymId);
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  },

  updatePayment: async (id, updatedPayment) => {
    try {
      const updateData: any = {};
      
      if (updatedPayment.status) updateData.status = updatedPayment.status;
      if (updatedPayment.paidDate) updateData.paid_date = updatedPayment.paidDate;

      const { error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      // Refresh payments for the current gym
      const { currentGym } = get();
      if (currentGym) {
        await get().fetchPayments(currentGym.id);
      }
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
      
      // Refresh users for the current gym
      const { currentGym } = get();
      if (currentGym) {
        await get().fetchUsers(currentGym.id);
      }
      
      return barcode;
    } catch (error) {
      console.error('Error generating barcode:', error);
      throw error;
    }
  },

  authenticateGymAdmin: async (username: string, password: string) => {
    try {
      console.log('Authenticating gym admin:', username);
      
      const { data, error } = await supabase
        .rpc('authenticate_gym_admin', {
          input_username: username,
          input_password: password
        });

      if (error) {
        console.error('Authentication error:', error);
        throw error;
      }

      console.log('Authentication response:', data);

      if (data && data.length > 0 && data[0].is_authenticated) {
        console.log('Authentication successful for gym:', data[0].gym_name);
        
        // Fetch the complete gym data immediately after authentication
        const { data: gymData, error: gymError } = await supabase
          .from('gyms')
          .select('*')
          .eq('id', data[0].gym_id)
          .maybeSingle();

        if (gymError) {
          console.error('Error fetching gym data:', gymError);
        } else if (gymData) {
          // Set the current gym data in the store
          const gym: Gym = {
            id: gymData.id,
            name: gymData.name,
            email: gymData.email,
            phone: gymData.phone || '',
            address: gymData.address || '',
            gymQrCode: gymData.gym_qr_code,
            ownerId: gymData.owner_id || undefined,
            status: gymData.status as 'active' | 'inactive' | 'suspended',
            createdAt: gymData.created_at,
            updatedAt: gymData.updated_at,
            username: gymData.username || undefined,
            adminName: gymData.admin_name || undefined,
            adminEmail: gymData.admin_email || undefined
          };
          
          console.log('Setting current gym in store:', gym);
          set({ currentGym: gym });
        }
        
        return {
          gymId: data[0].gym_id,
          gymName: data[0].gym_name
        };
      }
      
      console.log('Authentication failed - invalid credentials');
      return null;
    } catch (error) {
      console.error('Error authenticating gym admin:', error);
      throw error;
    }
  },

  authenticateMember: async (username: string, password: string) => {
    try {
      const { data, error } = await supabase
        .rpc('authenticate_member', {
          input_username: username,
          input_password: password
        });

      if (error) throw error;

      if (data && data.length > 0 && data[0].is_authenticated) {
        return {
          memberId: data[0].member_id,
          memberName: data[0].member_name,
          gymId: data[0].gym_id
        };
      }
      return null;
    } catch (error) {
      console.error('Error authenticating member:', error);
      throw error;
    }
  },

  memberCheckInWithQR: async (memberId: string, gymQrCode: string) => {
    try {
      const { data, error } = await supabase
        .rpc('member_checkin_with_qr', {
          member_id: memberId,
          gym_qr_code: gymQrCode
        });

      if (error) throw error;

      if (data && data.length > 0) {
        return {
          success: data[0].success,
          message: data[0].message,
          gymName: data[0].gym_name
        };
      }
      
      return {
        success: false,
        message: 'Unknown error occurred',
        gymName: ''
      };
    } catch (error) {
      console.error('Error checking in with QR:', error);
      throw error;
    }
  },
}));

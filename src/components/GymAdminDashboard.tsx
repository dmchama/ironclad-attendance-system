
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Building2, Plus, Edit, Trash2, LogOut, User, Users, Calendar, Key, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  membership_type: string;
  join_date: string;
  status: string;
  emergency_contact: string;
  username: string;
  barcode: string;
}

interface GymAdminDashboardProps {
  gymId: string;
  gymName: string;
  onLogout: () => void;
}

const GymAdminDashboard = ({ gymId, gymName, onLogout }: GymAdminDashboardProps) => {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [gymQrCode, setGymQrCode] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    membership_type: 'basic',
    emergency_contact: '',
    username: '',
    password: '',
    status: 'active'
  });

  useEffect(() => {
    fetchMembers();
    fetchGymDetails();
  }, [gymId]);

  const fetchGymDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('gyms')
        .select('gym_qr_code')
        .eq('id', gymId)
        .single();

      if (error) throw error;
      setGymQrCode(data.gym_qr_code);
    } catch (error: any) {
      console.error('Error fetching gym details:', error);
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('gym_id', gymId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch members",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.username || (!selectedMember && !formData.password)) {
      toast({
        title: "Error",
        description: "Name, email, username and password are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (selectedMember) {
        // Update existing member
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          membership_type: formData.membership_type,
          emergency_contact: formData.emergency_contact || null,
          username: formData.username,
          status: formData.status
        };

        // Only update password if provided
        if (formData.password) {
          const { data: hashedPassword, error: hashError } = await supabase
            .rpc('hash_password', { password: formData.password });
          
          if (hashError) throw hashError;
          updateData.password_hash = hashedPassword;
        }

        const { error } = await supabase
          .from('members')
          .update(updateData)
          .eq('id', selectedMember.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Member updated successfully"
        });
      } else {
        // Create new member
        const { data: hashedPassword, error: hashError } = await supabase
          .rpc('hash_password', { password: formData.password });
        
        if (hashError) throw hashError;

        // Generate barcode
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const barcode = `MBR${timestamp}${random}`;

        const { error } = await supabase
          .from('members')
          .insert({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            membership_type: formData.membership_type,
            emergency_contact: formData.emergency_contact || null,
            username: formData.username,
            password_hash: hashedPassword,
            status: formData.status,
            gym_id: gymId,
            barcode: barcode,
            join_date: new Date().toISOString().split('T')[0]
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Member created successfully"
        });
      }

      await fetchMembers();
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save member",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      membership_type: member.membership_type,
      emergency_contact: member.emergency_contact || '',
      username: member.username || '',
      password: '',
      status: member.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Member deleted successfully"
      });
      
      await fetchMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete member",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setSelectedMember(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      membership_type: 'basic',
      emergency_contact: '',
      username: '',
      password: '',
      status: 'active'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{gymName}</h1>
              <p className="text-gray-600">Gym Admin Dashboard</p>
            </div>
          </div>
          <Button onClick={onLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {gymQrCode && (
          <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <QrCode className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-lg">Gym QR Code</h3>
                  <p className="text-sm text-gray-600">Members scan this code to mark attendance</p>
                  <p className="font-mono text-lg font-bold text-green-700">{gymQrCode}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Members ({members.length})
          </h2>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedMember ? 'Edit Member' : 'Create New Member'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="member@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="membership_type">Membership Type</Label>
                    <select
                      id="membership_type"
                      value={formData.membership_type}
                      onChange={(e) => setFormData({ ...formData, membership_type: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="emergency_contact">Emergency Contact</Label>
                  <Input
                    id="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                    placeholder="Emergency contact details"
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Login Credentials
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="member_username"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="password">
                        Password {!selectedMember && '*'}
                        {selectedMember && <span className="text-sm text-gray-500">(leave empty to keep current)</span>}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Enter password"
                        required={!selectedMember}
                      />
                    </div>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Saving...' : (selectedMember ? 'Update Member' : 'Create Member')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                  </div>
                  <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                    {member.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Email:</p>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone:</p>
                  <p className="text-sm text-gray-600">{member.phone}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Membership:</p>
                  <p className="text-sm text-gray-600 capitalize">{member.membership_type}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Username:</p>
                  <p className="text-sm text-gray-600 font-mono">{member.username}</p>
                </div>

                {member.barcode && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Barcode:</p>
                    <p className="text-sm text-gray-600 font-mono">{member.barcode}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Join Date:</p>
                  <p className="text-sm text-gray-600">{new Date(member.join_date).toLocaleDateString()}</p>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(member)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" className="flex-1">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Member</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{member.name}"? This action cannot be undone and will remove all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(member.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {members.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first member.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GymAdminDashboard;

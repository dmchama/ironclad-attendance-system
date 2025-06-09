
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Building2, Plus, Edit, Trash2, LogOut, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Gym {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  gym_qr_code: string;
  status: string;
  created_at: string;
}

interface SuperAdminDashboardProps {
  onLogout: () => void;
}

const SuperAdminDashboard = ({ onLogout }: SuperAdminDashboardProps) => {
  const { toast } = useToast();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active'
  });

  useEffect(() => {
    fetchGyms();
  }, []);

  const fetchGyms = async () => {
    try {
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGyms(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch gyms",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (selectedGym) {
        // Update existing gym
        const { error } = await supabase
          .from('gyms')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            address: formData.address || null,
            status: formData.status
          })
          .eq('id', selectedGym.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Gym updated successfully"
        });
      } else {
        // Create new gym
        const { data: qrCodeData, error: qrError } = await supabase
          .rpc('generate_gym_qr_code');

        if (qrError) throw qrError;

        const { error } = await supabase
          .from('gyms')
          .insert({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            address: formData.address || null,
            status: formData.status,
            gym_qr_code: qrCodeData
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Gym created successfully"
        });
      }

      await fetchGyms();
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save gym",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (gym: Gym) => {
    setSelectedGym(gym);
    setFormData({
      name: gym.name,
      email: gym.email,
      phone: gym.phone || '',
      address: gym.address || '',
      status: gym.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (gymId: string) => {
    try {
      const { error } = await supabase
        .from('gyms')
        .delete()
        .eq('id', gymId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Gym deleted successfully"
      });
      
      await fetchGyms();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete gym",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setSelectedGym(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      status: 'active'
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-red-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-red-600 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
              <p className="text-gray-600">Manage all gyms in the system</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Gyms ({gyms.length})</h2>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Gym
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {selectedGym ? 'Edit Gym' : 'Create New Gym'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Gym Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter gym name"
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
                    placeholder="gym@example.com"
                    required
                  />
                </div>
                
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
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Fitness Street, City, State 12345"
                    className="min-h-[80px]"
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Saving...' : (selectedGym ? 'Update Gym' : 'Create Gym')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gyms.map((gym) => (
            <Card key={gym.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    <CardTitle className="text-lg">{gym.name}</CardTitle>
                  </div>
                  <Badge variant={gym.status === 'active' ? 'default' : 'secondary'}>
                    {gym.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Email:</p>
                  <p className="text-sm text-gray-600">{gym.email}</p>
                </div>
                
                {gym.phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone:</p>
                    <p className="text-sm text-gray-600">{gym.phone}</p>
                  </div>
                )}
                
                {gym.address && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Address:</p>
                    <p className="text-sm text-gray-600">{gym.address}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-700">QR Code:</p>
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-mono text-gray-600">{gym.gym_qr_code}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(gym)}
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
                        <AlertDialogTitle>Delete Gym</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{gym.name}"? This action cannot be undone and will remove all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(gym.id)}>
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

        {gyms.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No gyms found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first gym.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

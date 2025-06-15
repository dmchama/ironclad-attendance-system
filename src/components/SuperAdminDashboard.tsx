import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Building2, Plus, Edit, Trash2, LogOut, QrCode, Shield, User, Key, Search, LayoutGrid, LayoutList } from 'lucide-react';
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
  username?: string;
  admin_name?: string;
  admin_email?: string;
}

interface SuperAdminDashboardProps {
  onLogout: () => void;
}

const SuperAdminDashboard = ({ onLogout }: SuperAdminDashboardProps) => {
  const { toast } = useToast();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    username: '',
    password: '',
    admin_name: '',
    admin_email: ''
  });

  useEffect(() => {
    fetchGyms();
  }, []);

  useEffect(() => {
    // Filter gyms based on search query
    const filtered = gyms.filter(gym => 
      gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gym.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (gym.admin_name && gym.admin_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (gym.username && gym.username.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredGyms(filtered);
  }, [gyms, searchQuery]);

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
    
    if (!formData.name || !formData.email || !formData.username || (!selectedGym && !formData.password)) {
      toast({
        title: "Error",
        description: "Name, email, username and password are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (selectedGym) {
        // Update existing gym
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          address: formData.address || null,
          status: formData.status,
          username: formData.username,
          admin_name: formData.admin_name || null,
          admin_email: formData.admin_email || null
        };

        // Only update password if provided
        if (formData.password) {
          const { data: hashedPassword, error: hashError } = await supabase
            .rpc('hash_password', { password: formData.password });
          
          if (hashError) throw hashError;
          updateData.password_hash = hashedPassword;
        }

        const { error } = await supabase
          .from('gyms')
          .update(updateData)
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

        const { data: hashedPassword, error: hashError } = await supabase
          .rpc('hash_password', { password: formData.password });
        
        if (hashError) throw hashError;

        const { error } = await supabase
          .from('gyms')
          .insert({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            address: formData.address || null,
            status: formData.status,
            gym_qr_code: qrCodeData,
            username: formData.username,
            password_hash: hashedPassword,
            admin_name: formData.admin_name || null,
            admin_email: formData.admin_email || null
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
      status: gym.status,
      username: gym.username || '',
      password: '',
      admin_name: gym.admin_name || '',
      admin_email: gym.admin_email || ''
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
      status: 'active',
      username: '',
      password: '',
      admin_name: '',
      admin_email: ''
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredGyms.map((gym) => (
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

            {gym.username && (
              <div>
                <p className="text-sm font-medium text-gray-700">Admin Username:</p>
                <p className="text-sm text-gray-600 font-mono">{gym.username}</p>
              </div>
            )}

            {gym.admin_name && (
              <div>
                <p className="text-sm font-medium text-gray-700">Admin Name:</p>
                <p className="text-sm text-gray-600">{gym.admin_name}</p>
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
  );

  const renderListView = () => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gym Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Admin Username</TableHead>
              <TableHead>Admin Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>QR Code</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGyms.map((gym) => (
              <TableRow key={gym.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    {gym.name}
                  </div>
                </TableCell>
                <TableCell>{gym.email}</TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{gym.username}</span>
                </TableCell>
                <TableCell>{gym.admin_name || '-'}</TableCell>
                <TableCell>
                  <Badge variant={gym.status === 'active' ? 'default' : 'secondary'}>
                    {gym.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <QrCode className="w-3 h-3 text-gray-400" />
                    <span className="font-mono text-xs">{gym.gym_qr_code}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(gym)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-3 h-3" />
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

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

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Gyms ({filteredGyms.length})</h2>
            
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'list')}>
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <LayoutList className="w-4 h-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search gyms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            
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
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedGym ? 'Edit Gym' : 'Create New Gym'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Label htmlFor="email">Gym Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="gym@example.com"
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
                      <Label htmlFor="status">Status</Label>
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
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

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Admin Credentials
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="admin_name">Admin Name</Label>
                        <Input
                          id="admin_name"
                          value={formData.admin_name}
                          onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                          placeholder="Admin full name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="admin_email">Admin Email</Label>
                        <Input
                          id="admin_email"
                          type="email"
                          value={formData.admin_email}
                          onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                          placeholder="admin@gym.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="username">Username * <Key className="w-4 h-4 inline ml-1" /></Label>
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          placeholder="admin_username"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="password">
                          Password {!selectedGym && '*'} <Key className="w-4 h-4 inline ml-1" />
                          {selectedGym && <span className="text-sm text-gray-500">(leave empty to keep current)</span>}
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Enter password"
                          required={!selectedGym}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Saving...' : (selectedGym ? 'Update Gym' : 'Create Gym')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {viewMode === 'grid' ? renderGridView() : renderListView()}

        {filteredGyms.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No gyms found matching your search' : 'No gyms found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'Try adjusting your search terms.' : 'Get started by creating your first gym.'}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

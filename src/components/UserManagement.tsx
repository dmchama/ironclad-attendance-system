import React, { useState, useEffect } from 'react';
import { useGymStore, User } from '@/store/gymStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, UserCircle, AlertCircle, Search, Grid2x2, LayoutList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserManagementProps {
  gymId: string;
}

const UserManagement = ({ gymId }: UserManagementProps) => {
  const { users, addUser, updateUser, deleteUser, generateBarcode, loading, membershipPlans, fetchMembershipPlans, currentGym } = useGymStore();
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    membershipType: 'basic' as 'basic' | 'premium' | 'vip',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    emergencyContact: '',
    username: '',
    password: '',
    membershipPlanId: ''
  });

  useEffect(() => {
    if (gymId) {
      fetchMembershipPlans(gymId);
    }
  }, [gymId, fetchMembershipPlans]);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      membershipType: 'basic',
      status: 'active',
      emergencyContact: '',
      username: '',
      password: '',
      membershipPlanId: ''
    });
    setShowAddForm(false);
    setEditingUser(null);
  };

  const checkForDuplicates = (email: string, username: string) => {
    const existingEmailUser = users.find(user => 
      user.email.toLowerCase() === email.toLowerCase() && 
      (!editingUser || user.id !== editingUser.id)
    );
    
    const existingUsernameUser = users.find(user => 
      user.username?.toLowerCase() === username.toLowerCase() && 
      (!editingUser || user.id !== editingUser.id)
    );

    return { existingEmailUser, existingUsernameUser };
  };

  const sendMemberSMS = async (phone: string, memberName: string, username: string, password: string) => {
    try {
      console.log('Sending SMS to new member...');
      
      const { data, error } = await supabase.functions.invoke('send-member-sms', {
        body: {
          phone: phone,
          memberName: memberName,
          username: username,
          password: password,
          gymName: currentGym?.name || 'Your Gym'
        }
      });

      if (error) {
        console.error('SMS sending error:', error);
        throw error;
      }

      if (data?.success) {
        console.log('SMS sent successfully:', data.messageSid);
        toast({
          title: "SMS Sent",
          description: "Login details have been sent to the member's phone number",
        });
      } else {
        throw new Error(data?.error || 'Failed to send SMS');
      }
    } catch (error: any) {
      console.error('Error sending member SMS:', error);
      toast({
        title: "SMS Failed",
        description: error.message || "Failed to send login details via SMS. Please provide the details manually.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started with data:', formData);
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.username || !formData.password || !formData.membershipPlanId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Name, Email, Phone, Username, Password, Membership Plan)",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicates
    const { existingEmailUser, existingUsernameUser } = checkForDuplicates(formData.email, formData.username);
    
    if (existingEmailUser) {
      toast({
        title: "Email Already Exists",
        description: `A member with email "${formData.email}" already exists. Please use a different email address.`,
        variant: "destructive"
      });
      return;
    }

    if (existingUsernameUser) {
      toast({
        title: "Username Already Exists",
        description: `A member with username "${formData.username}" already exists. Please choose a different username.`,
        variant: "destructive"
      });
      return;
    }

    // Calculate membership dates based on selected plan
    let membershipStartDate;
    let membershipEndDate;
    
    const selectedPlan = membershipPlans.find(plan => plan.id === formData.membershipPlanId);
    if (selectedPlan) {
      membershipStartDate = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + selectedPlan.durationDays);
      membershipEndDate = endDate.toISOString().split('T')[0];
    }

    try {
      console.log('Attempting to save member...');
      
      if (editingUser) {
        await updateUser(editingUser.id, {
          ...formData,
          joinDate: editingUser.joinDate,
          membershipStartDate,
          membershipEndDate,
          membershipPlanId: formData.membershipPlanId
        });
        toast({
          title: "Success",
          description: "Member updated successfully"
        });
      } else {
        await addUser({
          ...formData,
          joinDate: new Date().toISOString().split('T')[0],
          membershipStartDate,
          membershipEndDate,
          membershipPlanId: formData.membershipPlanId
        }, gymId);
        
        toast({
          title: "Success",
          description: "Member added successfully"
        });

        // Send SMS with login details for new members only
        try {
          await sendMemberSMS(formData.phone, formData.name, formData.username, formData.password);
        } catch (smsError) {
          // SMS failure shouldn't prevent member creation, just log it
          console.warn('SMS sending failed, but member was created successfully');
        }
      }
      
      console.log('Member saved successfully');
      resetForm();
    } catch (error: any) {
      console.error('Error saving member:', error);
      
      // Handle specific database errors
      if (error.code === '23505') {
        if (error.message.includes('members_email_key')) {
          toast({
            title: "Email Already Exists",
            description: "A member with this email address already exists. Please use a different email address.",
            variant: "destructive"
          });
        } else if (error.message.includes('members_username_key')) {
          toast({
            title: "Username Already Exists", 
            description: "A member with this username already exists. Please choose a different username.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Duplicate Entry",
            description: "This information is already being used by another member. Please check email and username.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to save member",
          variant: "destructive"
        });
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      membershipType: user.membershipType,
      status: user.status,
      emergencyContact: user.emergencyContact || '',
      username: user.username || '',
      password: '',
      membershipPlanId: user.membershipPlanId || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast({
        title: "Success",
        description: "Member deleted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete member",
        variant: "destructive"
      });
    }
  };

  const handleGenerateBarcode = async (userId: string) => {
    try {
      const barcode = await generateBarcode(userId);
      toast({
        title: "Success",
        description: `Barcode generated: ${barcode}`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate barcode",
        variant: "destructive"
      });
    }
  };

  const getMembershipColor = (type: string) => {
    switch (type) {
      case 'premium': return 'bg-yellow-100 text-yellow-800';
      case 'vip': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanName = (planId?: string) => {
    if (!planId) return 'No plan assigned';
    const plan = membershipPlans.find(p => p.id === planId);
    return plan ? plan.planName : 'Unknown plan';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Member Management</h2>
        <Button 
          onClick={() => {
            console.log('Add Member button clicked');
            setShowAddForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {membershipPlans.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              <p>No membership plans found. Please create membership plans first before adding members.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search members by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid2x2 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <LayoutList className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingUser ? 'Edit Member' : 'Add New Member'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      console.log('Name changed:', e.target.value);
                      setFormData({ ...formData, name: e.target.value });
                    }}
                    required
                    placeholder="Enter member's full name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      console.log('Email changed:', e.target.value);
                      setFormData({ ...formData, email: e.target.value });
                    }}
                    required
                    placeholder="Enter email address"
                  />
                  {formData.email && checkForDuplicates(formData.email, formData.username).existingEmailUser && (
                    <p className="text-sm text-red-600 mt-1">⚠️ This email is already being used by another member</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      console.log('Phone changed:', e.target.value);
                      setFormData({ ...formData, phone: e.target.value });
                    }}
                    required
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="membershipPlanId">Membership Plan *</Label>
                  <Select 
                    value={formData.membershipPlanId} 
                    onValueChange={(value) => {
                      console.log('Membership plan changed:', value);
                      setFormData({ ...formData, membershipPlanId: value });
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a membership plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {membershipPlans
                        .filter(plan => plan.isActive)
                        .map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.planName} - ${plan.price}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: 'active' | 'inactive' | 'suspended') => {
                      console.log('Status changed:', value);
                      setFormData({ ...formData, status: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="Emergency contact number"
                  />
                </div>

                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Member login username"
                    required
                  />
                  {formData.username && checkForDuplicates(formData.email, formData.username).existingUsernameUser && (
                    <p className="text-sm text-red-600 mt-1">⚠️ This username is already being used by another member</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? "Leave blank to keep current password" : "Member login password"}
                    required={!editingUser}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={loading || membershipPlans.length === 0}>
                  {loading ? 'Saving...' : (editingUser ? 'Update Member' : 'Add Member')}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Members Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-8 h-8 text-blue-600" />
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Member</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this member? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(user.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-600">{user.phone}</p>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </div>
                <div className="bg-green-50 p-2 rounded text-sm">
                  <strong>Plan:</strong> {getPlanName(user.membershipPlanId)}
                  {user.membershipEndDate && (
                    <div className="text-xs text-gray-600 mt-1">
                      Expires: {new Date(user.membershipEndDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                {user.username && (
                  <div className="bg-blue-50 p-2 rounded text-sm">
                    <strong>Login Username:</strong> {user.username}
                  </div>
                )}
                <p className="text-xs text-gray-500">Joined: {new Date(user.joinDate).toLocaleDateString()}</p>
                {user.barcode && (
                  <p className="text-xs text-gray-500">Barcode: {user.barcode}</p>
                )}
                {!user.barcode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateBarcode(user.id)}
                    className="w-full mt-2"
                  >
                    Generate Barcode
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-5 h-5 text-blue-600" />
                      {user.name}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      {getPlanName(user.membershipPlanId)}
                      {user.membershipEndDate && (
                        <div className="text-xs text-gray-500">
                          Expires: {new Date(user.membershipEndDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this member? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(user.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      {!user.barcode && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateBarcode(user.id)}
                        >
                          Generate Barcode
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {filteredUsers.length === 0 && users.length > 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No members found matching "{searchTerm}".</p>
          </CardContent>
        </Card>
      )}

      {users.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <UserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No members found. Add your first member to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagement;

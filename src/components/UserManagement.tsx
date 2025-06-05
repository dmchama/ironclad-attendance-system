import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Mail, Phone, Calendar, Loader2, QrCode, Share } from "lucide-react";
import { useGymStore, User } from "@/store/gymStore";
import { useToast } from "@/hooks/use-toast";
import BarcodeShareDialog from "./BarcodeShareDialog";

const UserManagement = () => {
  const { users, addUser, updateUser, deleteUser, generateBarcode, loading } = useGymStore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [generatingBarcode, setGeneratingBarcode] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    membershipType: 'basic' as 'basic' | 'premium' | 'vip',
    emergencyContact: '',
    status: 'active' as 'active' | 'inactive' | 'suspended'
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      membershipType: 'basic',
      emergencyContact: '',
      status: 'active'
    });
    setEditingUser(null);
  };

  const handleGenerateBarcode = async (userId: string) => {
    setGeneratingBarcode(userId);
    try {
      const barcode = await generateBarcode(userId);
      toast({
        title: "Success",
        description: `Barcode generated: ${barcode}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate barcode. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingBarcode(null);
    }
  };

  const handleShareBarcode = (user: User) => {
    setSelectedUser(user);
    setShareDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
        toast({
          title: "Success",
          description: "Member updated successfully"
        });
      } else {
        // Generate unique barcode for new user
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const barcode = `GYM${timestamp}${random}`;

        await addUser({
          ...formData,
          joinDate: new Date().toISOString().split('T')[0],
          barcode
        });
        toast({
          title: "Success",
          description: "New member added successfully with unique barcode"
        });
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save member. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      membershipType: user.membershipType,
      emergencyContact: user.emergencyContact,
      status: user.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await deleteUser(id);
        toast({
          title: "Success",
          description: "Member deleted successfully"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete member. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const getMembershipColor = (type: string) => {
    switch (type) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'vip': return 'bg-gold-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading members...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Member Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit Member' : 'Add New Member'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="emergency">Emergency Contact</Label>
                <Input
                  id="emergency"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="Enter emergency contact"
                />
              </div>
              <div>
                <Label htmlFor="membership">Membership Type</Label>
                <Select value={formData.membershipType} onValueChange={(value: 'basic' | 'premium' | 'vip') => setFormData({ ...formData, membershipType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select membership type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic ($49.99/month)</SelectItem>
                    <SelectItem value="premium">Premium ($79.99/month)</SelectItem>
                    <SelectItem value="vip">VIP ($99.99/month)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'suspended') => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingUser ? 'Update' : 'Add'} Member
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{user.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className={getMembershipColor(user.membershipType)}>
                  {user.membershipType.toUpperCase()}
                </Badge>
                <Badge className={getStatusColor(user.status)}>
                  {user.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                {user.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                {user.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                Joined: {new Date(user.joinDate).toLocaleDateString()}
              </div>
              
              {/* Enhanced Barcode Section */}
              <div className="pt-3 border-t">
                {user.barcode ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {user.barcode}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShareBarcode(user)}
                      className="w-full"
                    >
                      <Share className="h-3 w-3 mr-2" />
                      Share Barcode
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateBarcode(user.id)}
                    disabled={generatingBarcode === user.id}
                    className="w-full"
                  >
                    {generatingBarcode === user.id ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <QrCode className="h-3 w-3 mr-2" />
                        Generate Barcode
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-gray-500 mb-4">No members found</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Member
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Barcode Share Dialog */}
      {selectedUser && (
        <BarcodeShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          barcode={selectedUser.barcode || ''}
          memberName={selectedUser.name}
          memberEmail={selectedUser.email}
        />
      )}
    </div>
  );
};

export default UserManagement;

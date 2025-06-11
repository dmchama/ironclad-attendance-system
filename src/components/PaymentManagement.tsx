
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DollarSign, CreditCard, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useGymStore } from "@/store/gymStore";
import { useToast } from "@/hooks/use-toast";

interface PaymentManagementProps {
  gymId: string;
}

const PaymentManagement = ({ gymId }: PaymentManagementProps) => {
  const { users, payments, addPayment, updatePayment } = useGymStore();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  const membershipPrices = {
    basic: 49.99,
    premium: 79.99,
    vip: 99.99
  };

  const handleAddPayment = async () => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a member",
        variant: "destructive"
      });
      return;
    }

    const user = users.find(u => u.id === selectedUser);
    if (!user) return;

    const amount = paymentAmount ? parseFloat(paymentAmount) : membershipPrices[user.membershipType];
    
    // Calculate next due date (next month)
    const nextDueDate = new Date();
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);

    try {
      await addPayment({
        userId: selectedUser,
        userName: user.name,
        amount,
        dueDate: nextDueDate.toISOString().split('T')[0],
        status: 'pending',
        membershipType: user.membershipType,
        gymId
      });

      toast({
        title: "Success",
        description: `Payment record added for ${user.name}`
      });

      setSelectedUser("");
      setPaymentAmount("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add payment record",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      await updatePayment(paymentId, {
        status: 'paid',
        paidDate: new Date().toISOString().split('T')[0]
      });

      toast({
        title: "Success",
        description: "Payment marked as paid"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const overduePayments = payments.filter(p => {
    const dueDate = new Date(p.dueDate);
    const today = new Date();
    return p.status === 'pending' && dueDate < today;
  });
  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Management</h2>
        <p className="text-gray-600">Track and manage member payments</p>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Payments</p>
                <p className="text-2xl font-bold">{payments.length}</p>
              </div>
              <CreditCard className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Pending</p>
                <p className="text-2xl font-bold">{pendingPayments.length}</p>
              </div>
              <Clock className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Overdue</p>
                <p className="text-2xl font-bold">{overduePayments.length}</p>
              </div>
              <AlertCircle className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Payment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Add Payment Record
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Member</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a member" />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter(user => user.status === 'active')
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} - {user.membershipType} (${membershipPrices[user.membershipType]})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Amount (Optional)</label>
              <Input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Leave blank for membership price"
              />
            </div>
            <Button 
              onClick={handleAddPayment}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overdue Payments Alert */}
      {overduePayments.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Overdue Payments ({overduePayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overduePayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                  <div>
                    <p className="font-semibold text-red-800">{payment.userName}</p>
                    <p className="text-sm text-red-600">
                      Due: {new Date(payment.dueDate).toLocaleDateString()} • ${payment.amount}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleMarkAsPaid(payment.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Mark as Paid
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="space-y-3">
              {payments
                .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
                .map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold">{payment.userName}</p>
                        <p className="text-sm text-gray-600">
                          {payment.membershipType.toUpperCase()} • Due: {new Date(payment.dueDate).toLocaleDateString()}
                          {payment.paidDate && ` • Paid: ${new Date(payment.paidDate).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                      <Badge className={getStatusColor(payment.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(payment.status)}
                          {payment.status.toUpperCase()}
                        </div>
                      </Badge>
                      {payment.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsPaid(payment.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Mark as Paid
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No payment records found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentManagement;

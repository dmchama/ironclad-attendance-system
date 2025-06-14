
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MembershipPlan {
  id: string;
  gymId: string;
  planName: string;
  planType: 'daily' | 'monthly' | '3_month' | '6_month' | 'yearly';
  price: number;
  durationDays: number;
  isActive: boolean;
}

interface MembershipPlansProps {
  gymId: string;
}

const MembershipPlans = ({ gymId }: MembershipPlansProps) => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const planTypeLabels = {
    daily: 'Daily Pass',
    monthly: 'Monthly Membership',
    '3_month': '3-Month Membership',
    '6_month': '6-Month Membership',
    yearly: 'Yearly Membership'
  };

  const fetchPlans = async () => {
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
        isActive: plan.is_active
      })) || [];

      setPlans(membershipPlans);
    } catch (error) {
      console.error('Error fetching membership plans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch membership plans",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gymId) {
      fetchPlans();
    }
  }, [gymId]);

  const handleEditPrice = (planId: string, currentPrice: number) => {
    setEditingPlan(planId);
    setEditPrice(currentPrice.toString());
  };

  const handleSavePrice = async (planId: string) => {
    try {
      const priceValue = parseFloat(editPrice);
      if (isNaN(priceValue) || priceValue < 0) {
        toast({
          title: "Error",
          description: "Please enter a valid price",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('membership_plans')
        .update({ price: priceValue })
        .eq('id', planId);

      if (error) throw error;

      setPlans(plans.map(plan => 
        plan.id === planId ? { ...plan, price: priceValue } : plan
      ));

      setEditingPlan(null);
      toast({
        title: "Success",
        description: "Membership plan price updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update price",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingPlan(null);
    setEditPrice('');
  };

  const togglePlanStatus = async (planId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('membership_plans')
        .update({ is_active: !currentStatus })
        .eq('id', planId);

      if (error) throw error;

      setPlans(plans.map(plan => 
        plan.id === planId ? { ...plan, isActive: !currentStatus } : plan
      ));

      toast({
        title: "Success",
        description: `Plan ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update plan status",
        variant: "destructive"
      });
    }
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
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Membership Plans</h2>
        <p className="text-gray-600">Manage your gym's membership plans and pricing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={`${!plan.isActive ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  {planTypeLabels[plan.planType]}
                </CardTitle>
                <Badge variant={plan.isActive ? "default" : "secondary"}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                {editingPlan === plan.id ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`price-${plan.id}`}>Price ($)</Label>
                      <Input
                        id={`price-${plan.id}`}
                        type="number"
                        step="0.01"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="text-center"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSavePrice(plan.id)}
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-blue-600">
                      ${plan.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {plan.durationDays} day{plan.durationDays !== 1 ? 's' : ''}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditPrice(plan.id, plan.price)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit Price
                      </Button>
                      <Button
                        size="sm"
                        variant={plan.isActive ? "destructive" : "default"}
                        onClick={() => togglePlanStatus(plan.id, plan.isActive)}
                        className="flex-1"
                      >
                        {plan.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No membership plans found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MembershipPlans;

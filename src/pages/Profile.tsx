import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Upload, User as UserIcon, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

const profileSchema = z.object({
  full_name: z.string().trim().max(100, 'Name must be less than 100 characters').optional(),
  address: z.string().trim().max(500, 'Address must be less than 500 characters').optional(),
  contact_number: z.string().trim().max(20, 'Contact number must be less than 20 characters').optional(),
  bio: z.string().trim().max(500, 'Bio must be less than 500 characters').optional(),
});

interface ProfileData {
  full_name: string;
  email: string;
  avatar_url: string | null;
  address: string | null;
  contact_number: string | null;
  bio: string | null;
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  recipient_name: string;
  delivery_address: string;
  order_items: {
    id: string;
    quantity: number;
    price: number;
    product_id: string;
  }[];
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    email: '',
    avatar_url: null,
    address: null,
    contact_number: null,
    bio: null,
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
    fetchOrders();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: data.email || user.email || '',
          avatar_url: data.avatar_url,
          address: data.address,
          contact_number: data.contact_number,
          bio: data.bio,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;

    setOrdersLoading(true);
    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total_amount,
          status,
          recipient_name,
          delivery_address,
          order_items (
            id,
            quantity,
            price,
            product_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load order history');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;

    const file = e.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success('Profile picture updated');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate form data
    try {
      profileSchema.parse({
        full_name: profile.full_name,
        address: profile.address,
        contact_number: profile.contact_number,
        bio: profile.bio,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name.trim() || null,
          address: profile.address?.trim() || null,
          contact_number: profile.contact_number?.trim() || null,
          bio: profile.bio?.trim() || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'processing':
        return 'text-blue-500';
      case 'completed':
        return 'text-green-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <Card className="gold-border">
          <CardHeader>
            <CardTitle className="text-3xl font-display">My Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="profile">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="orders">
                  <Package className="h-4 w-4 mr-2" />
                  Order History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-32 w-32 gold-border">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback className="bg-accent/20">
                        <UserIcon className="h-16 w-16 text-accent" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Label htmlFor="avatar" className="cursor-pointer">
                        <div className="flex items-center space-x-2 text-accent hover:text-accent/80">
                          {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          <span>Change Profile Picture</span>
                        </div>
                      </Label>
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                      />
                    </div>
                  </div>

                  {/* Email (read-only) */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      type="text"
                      placeholder="Enter your full name"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      maxLength={100}
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-2">
                    <Label htmlFor="contact_number">Contact Number</Label>
                    <Input
                      id="contact_number"
                      type="tel"
                      placeholder="Enter your contact number"
                      value={profile.contact_number || ''}
                      onChange={(e) => setProfile({ ...profile, contact_number: e.target.value })}
                      maxLength={20}
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your address"
                      value={profile.address || ''}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      maxLength={500}
                      rows={3}
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself"
                      value={profile.bio || ''}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      maxLength={500}
                      rows={4}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="orders">
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground">Your order history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="border-border">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Order ID</p>
                              <p className="font-mono text-sm">{order.id.slice(0, 8)}...</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Date</p>
                              <p className="text-sm">{formatDate(order.created_at)}</p>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Recipient</p>
                              <p className="font-medium">{order.recipient_name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Delivery Address</p>
                              <p className="text-sm">{order.delivery_address}</p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-4 border-t border-border">
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <p className={`font-semibold capitalize ${getStatusColor(order.status)}`}>
                                {order.status}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Total</p>
                              <p className="text-xl font-bold text-accent">₱{order.total_amount.toFixed(2)}</p>
                            </div>
                          </div>

                          {order.order_items && order.order_items.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <p className="text-sm text-muted-foreground mb-2">Items ({order.order_items.length})</p>
                              <div className="space-y-1">
                                {order.order_items.map((item) => (
                                  <div key={item.id} className="flex justify-between text-sm">
                                    <span>{item.quantity}x Product</span>
                                    <span>₱{item.price.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;

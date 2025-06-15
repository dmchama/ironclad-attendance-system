import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Mail, Phone, MapPin, QrCode, Copy, Download, Share, Loader2 } from 'lucide-react';
import { useGymStore } from '@/store/gymStore';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

const GymProfile = () => {
  const { currentGym, fetchCurrentGym } = useGymStore();
  const { toast } = useToast();
  const [copying, setCopying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Try to get gymId from localStorage if currentGym is null
  useEffect(() => {
    if (!currentGym) {
      const gymData = localStorage.getItem('gymAdmin');
      if (gymData) {
        try {
          const { gymId } = JSON.parse(gymData);
          if (gymId) {
            console.log('GymProfile: Loading gym data for identifier:', gymId);
            setLoading(true);
            fetchCurrentGym(gymId).finally(() => setLoading(false));
          }
        } catch (error) {
          console.error('Error parsing gym data from localStorage:', error);
          // Clear invalid data
          localStorage.removeItem('gymAdmin');
        }
      }
    }
  }, [currentGym, fetchCurrentGym]);

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Loading gym data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentGym) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No gym data available</p>
          <p className="text-sm text-gray-400">
            Please ensure you're logged in as a gym administrator
          </p>
          <Button 
            onClick={() => {
              const gymData = localStorage.getItem('gymAdmin');
              if (gymData) {
                try {
                  const { gymId } = JSON.parse(gymData);
                  if (gymId) {
                    setLoading(true);
                    fetchCurrentGym(gymId).finally(() => setLoading(false));
                  }
                } catch (error) {
                  console.error('Error parsing gym data:', error);
                }
              }
            }}
            variant="outline"
            className="mt-4"
          >
            <Loader2 className="w-4 h-4 mr-2" />
            Retry Loading
          </Button>
        </CardContent>
      </Card>
    );
  }

  const generateQRCodeURL = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentGym.gymQrCode)}`;
  };

  const copyQRCode = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(currentGym.gymQrCode);
      toast({
        title: "Copied!",
        description: "Gym QR code copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy QR code",
        variant: "destructive"
      });
    } finally {
      setCopying(false);
    }
  };

  const downloadQRCode = async () => {
    setDownloading(true);
    try {
      const qrCodeUrl = generateQRCodeURL();
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentGym.name.replace(/\s+/g, '_')}_Gym_QR_Code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded!",
        description: "Gym QR code downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  const shareQRCode = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${currentGym.name} Gym QR Code`,
          text: `Scan this QR code to check in at ${currentGym.name}: ${currentGym.gymQrCode}`,
        });
        
        toast({
          title: "Shared!",
          description: "Gym QR code shared successfully"
        });
      } else {
        await copyQRCode();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share QR code",
        variant: "destructive"
      });
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{currentGym.name}</CardTitle>
                <Badge className={getStatusColor(currentGym.status)}>
                  {currentGym.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{currentGym.email}</span>
              </div>
              {currentGym.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{currentGym.phone}</span>
                </div>
              )}
              {currentGym.address && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{currentGym.address}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-600" />
            Gym Check-in QR Code
          </CardTitle>
          <p className="text-sm text-gray-600">
            Members can scan this QR code to mark their attendance at your gym
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2 font-mono mb-4">
              {currentGym.gymQrCode}
            </Badge>
            
            <div className="flex justify-center mb-4">
              <img 
                src={generateQRCodeURL()} 
                alt="Gym Check-in QR Code"
                className="border-2 border-gray-200 rounded-lg"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button
                onClick={copyQRCode}
                disabled={copying}
                variant="outline"
                size="sm"
              >
                <Copy className="h-4 w-4 mr-2" />
                {copying ? 'Copied!' : 'Copy Code'}
              </Button>
              
              <Button
                onClick={downloadQRCode}
                disabled={downloading}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                {downloading ? 'Downloaded' : 'Download'}
              </Button>
              
              <Button
                onClick={shareQRCode}
                variant="outline"
                size="sm"
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Display this QR code at your gym entrance for easy member check-ins
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GymProfile;

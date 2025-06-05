
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Copy, Share, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BarcodeDisplayProps {
  barcode: string;
  memberName: string;
  memberEmail: string;
}

const BarcodeDisplay = ({ barcode, memberName, memberEmail }: BarcodeDisplayProps) => {
  const [copying, setCopying] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(barcode);
      toast({
        title: "Copied!",
        description: "Barcode copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy barcode",
        variant: "destructive"
      });
    } finally {
      setCopying(false);
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Your Gym Barcode - ${memberName}`);
    const body = encodeURIComponent(
      `Hi ${memberName},\n\nYour gym membership barcode is: ${barcode}\n\nPlease save this barcode and use it to check in at the gym.\n\nBest regards,\nFitTrack Pro Gym`
    );
    window.open(`mailto:${memberEmail}?subject=${subject}&body=${body}`);
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi ${memberName}! Your gym membership barcode is: ${barcode}. Use this to check in at the gym.`
    );
    window.open(`https://wa.me/?text=${message}`);
  };

  const generateQRCodeURL = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(barcode)}`;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <QrCode className="h-5 w-5 text-blue-600" />
          Member Barcode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2 font-mono">
            {barcode}
          </Badge>
        </div>

        {/* QR Code Display */}
        <div className="flex justify-center">
          <img 
            src={generateQRCodeURL()} 
            alt="Barcode QR Code"
            className="border-2 border-gray-200 rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Button
            onClick={copyToClipboard}
            disabled={copying}
            className="w-full"
            variant="outline"
          >
            {copying ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Barcode
              </>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={shareViaEmail}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Button>
            <Button
              onClick={shareViaWhatsApp}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              WhatsApp
            </Button>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Share this barcode with {memberName} for gym access
        </div>
      </CardContent>
    </Card>
  );
};

export default BarcodeDisplay;

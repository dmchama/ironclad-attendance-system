
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, QrCode, X } from 'lucide-react';
import QrScanner from 'qr-scanner';
import { useToast } from '@/hooks/use-toast';

interface QRScannerProps {
  onScanSuccess: (result: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const QRScannerComponent = ({ onScanSuccess, onClose, isOpen }: QRScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && videoRef.current) {
      initializeScanner();
    }

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
    };
  }, [isOpen]);

  const initializeScanner = async () => {    
    try {
      // Check if camera is available
      const hasCamera = await QrScanner.hasCamera();
      setHasCamera(hasCamera);

      if (!hasCamera) {
        toast({
          title: "Camera not found",
          description: "No camera found on this device",
          variant: "destructive"
        });
        return;
      }

      if (videoRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            console.log('QR Code detected:', result.data);
            onScanSuccess(result.data);
            stopScanning();
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: 'environment' // Use back camera on mobile
          }
        );

        await qrScannerRef.current.start();
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Error initializing QR scanner:', error);
      toast({
        title: "Scanner Error",
        description: "Failed to initialize QR scanner. Please check camera permissions.",
        variant: "destructive"
      });
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Scan QR Code
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Point your camera at the gym's QR code
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasCamera ? (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover rounded-lg border-2 border-dashed border-gray-300"
                playsInline
                muted
              />
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-green-500 rounded-lg animate-pulse" />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Camera not available</p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button onClick={handleClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            {hasCamera && !isScanning && (
              <Button onClick={initializeScanner} className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScannerComponent;

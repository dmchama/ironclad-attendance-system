
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
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      checkCameraAndInitialize();
    }

    return () => {
      cleanupScanner();
    };
  }, [isOpen]);

  const checkCameraAndInitialize = async () => {
    try {
      console.log('Checking for camera availability...');
      
      // First check if camera is available
      const cameraAvailable = await QrScanner.hasCamera();
      console.log('Camera available:', cameraAvailable);
      setHasCamera(cameraAvailable);

      if (!cameraAvailable) {
        toast({
          title: "No Camera Found",
          description: "No camera found on this device",
          variant: "destructive"
        });
        return;
      }

      // Initialize scanner if camera is available
      await initializeScanner();
    } catch (error) {
      console.error('Error checking camera:', error);
      setHasCamera(false);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const initializeScanner = async () => {
    if (!videoRef.current || !hasCamera) return;

    try {
      console.log('Initializing QR scanner...');
      
      // Clean up any existing scanner
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }

      // Create new scanner
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
          preferredCamera: 'environment', // Use back camera on mobile
          maxScansPerSecond: 5,
        }
      );

      // Start scanning
      await qrScannerRef.current.start();
      setIsScanning(true);
      setPermissionDenied(false);
      
      console.log('QR scanner started successfully');
      
      toast({
        title: "Camera Ready",
        description: "Point your camera at the gym's QR code"
      });

    } catch (error: any) {
      console.error('Error initializing QR scanner:', error);
      setIsScanning(false);
      
      if (error.name === 'NotAllowedError' || error.message?.includes('permission')) {
        setPermissionDenied(true);
        toast({
          title: "Camera Permission Denied",
          description: "Please allow camera access to scan QR codes",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Scanner Error",
          description: "Failed to start camera. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      setIsScanning(false);
    }
  };

  const cleanupScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    cleanupScanner();
    onClose();
  };

  const handleRetryCamera = () => {
    setPermissionDenied(false);
    setHasCamera(null);
    checkCameraAndInitialize();
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
          {hasCamera === null ? (
            <div className="text-center py-8">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-500">Checking camera...</p>
            </div>
          ) : hasCamera === false ? (
            <div className="text-center py-8">
              <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Camera not available</p>
              <Button onClick={handleRetryCamera} variant="outline">
                <Camera className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : permissionDenied ? (
            <div className="text-center py-8">
              <Camera className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <p className="text-red-500 mb-2">Camera permission denied</p>
              <p className="text-sm text-gray-500 mb-4">
                Please allow camera access in your browser settings and try again
              </p>
              <Button onClick={handleRetryCamera} variant="outline">
                <Camera className="w-4 h-4 mr-2" />
                Retry Camera Access
              </Button>
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover rounded-lg border-2 border-dashed border-gray-300 bg-black"
                playsInline
                muted
                autoPlay
              />
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-green-500 rounded-lg animate-pulse bg-transparent" />
                </div>
              )}
              {!isScanning && hasCamera && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                  <Button onClick={initializeScanner} className="bg-green-600 hover:bg-green-700">
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button onClick={handleClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            {hasCamera && !isScanning && !permissionDenied && (
              <Button onClick={initializeScanner} className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            )}
            {isScanning && (
              <Button onClick={stopScanning} variant="destructive" className="flex-1">
                Stop Scanning
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScannerComponent;

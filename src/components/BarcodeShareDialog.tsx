
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BarcodeDisplay from './BarcodeDisplay';

interface BarcodeShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barcode: string;
  memberName: string;
  memberEmail: string;
}

const BarcodeShareDialog = ({ 
  open, 
  onOpenChange, 
  barcode, 
  memberName, 
  memberEmail 
}: BarcodeShareDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Member Barcode</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <BarcodeDisplay 
            barcode={barcode}
            memberName={memberName}
            memberEmail={memberEmail}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeShareDialog;

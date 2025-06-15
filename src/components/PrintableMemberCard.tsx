
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, QrCode, User, Calendar, CreditCard } from 'lucide-react';

interface PrintableMemberCardProps {
  member: {
    id: string;
    name: string;
    email: string;
    phone: string;
    membershipType: string;
    joinDate: string;
    membershipEndDate?: string;
    username?: string;
    barcode?: string;
  };
  gymName: string;
  onPrint: () => void;
}

const PrintableMemberCard = ({ member, gymName, onPrint }: PrintableMemberCardProps) => {
  const generateQRData = () => {
    return JSON.stringify({
      memberId: member.id,
      username: member.username || member.id,
      gymName: gymName
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Member Card Preview</h3>
        <Button onClick={onPrint} className="print:hidden">
          <Printer className="w-4 h-4 mr-2" />
          Print Card
        </Button>
      </div>
      
      {/* Printable Card */}
      <div className="print-area">
        <Card className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-xl font-bold">{gymName}</h2>
                <p className="text-blue-100 text-sm">Member Card</p>
              </div>
              
              {/* Member Info */}
              <div className="bg-white/10 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="font-semibold">{member.name}</span>
                </div>
                
                <div className="text-sm space-y-1">
                  <p>Email: {member.email}</p>
                  <p>Phone: {member.phone}</p>
                  <p>Member ID: {member.id.slice(0, 8)}</p>
                </div>
              </div>
              
              {/* Membership Details */}
              <div className="flex justify-between items-center">
                <div>
                  <Badge className="bg-white/20 text-white hover:bg-white/30">
                    {member.membershipType.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-right text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Joined: {new Date(member.joinDate).toLocaleDateString()}</span>
                  </div>
                  {member.membershipEndDate && (
                    <div className="flex items-center gap-1 mt-1">
                      <CreditCard className="w-3 h-3" />
                      <span>Expires: {new Date(member.membershipEndDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* QR Code Area */}
              <div className="bg-white rounded-lg p-3 text-center">
                <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                <p className="text-xs text-gray-500">Member QR Code</p>
                <p className="text-xs text-gray-400 mt-1 break-all font-mono">
                  {member.barcode || 'Scan for access'}
                </p>
              </div>
              
              {/* Login Details */}
              {member.username && (
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-xs font-semibold mb-1">Login Details</p>
                  <p className="text-xs">Username: {member.username}</p>
                  <p className="text-xs opacity-75">Check app for password</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <style>{`
        @media print {
          .print-area {
            page-break-inside: avoid;
            margin: 0;
            padding: 0;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          body {
            margin: 0;
            padding: 20px;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintableMemberCard;

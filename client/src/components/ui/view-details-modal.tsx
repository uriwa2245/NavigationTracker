import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, Building, Phone, Mail, MapPin, Package, TestTube, FileText } from "lucide-react";

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: Array<{ 
    label: string; 
    value: string | React.ReactNode; 
    highlight?: boolean;
    type?: 'header' | 'field' | 'section';
    icon?: React.ReactNode;
  }>;
  additionalContent?: React.ReactNode;
}

export default function ViewDetailsModal({
  isOpen,
  onClose,
  title,
  data,
  additionalContent,
}: ViewDetailsModalProps) {
  const getIconForLabel = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('request') || lowerLabel.includes('no')) return <FileText className="w-4 h-4" />;
    if (lowerLabel.includes('date') || lowerLabel.includes('วันที่')) return <Calendar className="w-4 h-4" />;
    if (lowerLabel.includes('time') || lowerLabel.includes('เวลา')) return <Clock className="w-4 h-4" />;
    if (lowerLabel.includes('contact') || lowerLabel.includes('ผู้ติดต่อ')) return <User className="w-4 h-4" />;
    if (lowerLabel.includes('company') || lowerLabel.includes('บริษัท')) return <Building className="w-4 h-4" />;
    if (lowerLabel.includes('phone') || lowerLabel.includes('เบอร์')) return <Phone className="w-4 h-4" />;
    if (lowerLabel.includes('email') || lowerLabel.includes('อีเมล')) return <Mail className="w-4 h-4" />;
    if (lowerLabel.includes('address') || lowerLabel.includes('ที่อยู่')) return <MapPin className="w-4 h-4" />;
    if (lowerLabel.includes('storage') || lowerLabel.includes('เก็บ')) return <Package className="w-4 h-4" />;
    if (lowerLabel.includes('sample') || lowerLabel.includes('ตัวอย่าง')) return <TestTube className="w-4 h-4" />;
    return null;
  };

  const renderValue = (item: any) => {
    if (item.highlight) {
      return (
        <Badge variant="outline" className="thai-font bg-blue-50 text-blue-700 border-blue-200">
          {item.value}
        </Badge>
      );
    }
    
    if (typeof item.value === 'string' && item.value.includes('\n')) {
      return (
        <div className="text-sm text-gray-900 dark:text-gray-100 thai-font whitespace-pre-line bg-gray-50 dark:bg-gray-800 p-3 rounded-md border">
          {item.value}
        </div>
      );
    }
    
    return (
      <div className="text-sm text-gray-900 dark:text-gray-100 thai-font break-words">
        {item.value || "-"}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold thai-font flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
            {title}
          </DialogTitle>
          <DialogDescription className="thai-font text-gray-600 dark:text-gray-400">
            ข้อมูลรายละเอียดทั้งหมดของตัวอย่าง
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {data.map((item, index) => {
              // Handle section headers
              if (item.type === 'header' || item.label.startsWith('📝') || item.label.startsWith('👤') || item.label.startsWith('📦') || item.label.startsWith('🧪')) {
                return (
                  <Card key={index} className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold thai-font flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        {item.icon || getIconForLabel(item.label)}
                        {item.label.replace(/^[📝👤📦🧪]\s*/, '')}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                );
              }

              // Handle regular fields
              return (
                <div key={index} className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="sm:w-1/3 flex-shrink-0">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 thai-font flex items-center gap-2">
                      {item.icon || getIconForLabel(item.label)}
                      {item.label}:
                    </label>
                  </div>
                  <div className="sm:w-2/3 flex-grow">
                    {renderValue(item)}
                  </div>
                </div>
              );
            })}
            
            {additionalContent && (
              <>
                <Separator className="my-6" />
                {additionalContent}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
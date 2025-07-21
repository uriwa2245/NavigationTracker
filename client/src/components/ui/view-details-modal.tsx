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

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: Array<{ label: string; value: string | React.ReactNode; highlight?: boolean }>;
}

export default function ViewDetailsModal({
  isOpen,
  onClose,
  title,
  data,
}: ViewDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold thai-font flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-lab-primary"></div>
            {title}
          </DialogTitle>
          <DialogDescription className="thai-font">
            รายละเอียดข้อมูลทั้งหมด
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 p-1">
            {data.map((item, index) => (
              <div key={index}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                  <div className="sm:w-1/3 flex-shrink-0">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 thai-font">
                      {item.label}:
                    </label>
                  </div>
                  <div className="sm:w-2/3 flex-grow">
                    {item.highlight ? (
                      <Badge variant="outline" className="thai-font">
                        {item.value}
                      </Badge>
                    ) : (
                      <div className="text-sm text-gray-900 dark:text-gray-100 thai-font break-words">
                        {item.value || "-"}
                      </div>
                    )}
                  </div>
                </div>
                {index < data.length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
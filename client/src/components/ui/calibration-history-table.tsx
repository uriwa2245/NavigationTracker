import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface CalibrationRecord {
  id: number;
  calibrationDate: string | Date;
  result: string;
  certificateNumber?: string | null;
  calibratedBy?: string | null;
  method?: string | null;
  remarks?: string | null;
  nextCalibrationDate?: string | Date | null;
}

interface CalibrationHistoryTableProps {
  data: CalibrationRecord[];
  title?: string;
}

const getResultBadgeStyle = (result: string) => {
  switch (result) {
    case "ผ่าน":
      return {
        variant: "default" as const,
        className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800",
        icon: <CheckCircle className="w-3 h-3" />
      };
    case "ไม่ผ่าน":
      return {
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800",
        icon: <XCircle className="w-3 h-3" />
      };
    default:
      return {
        variant: "outline" as const,
        className: "",
        icon: null
      };
  }
};

export default function CalibrationHistoryTable({ data, title = "ประวัติการสอบเทียบ" }: CalibrationHistoryTableProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg thai-font flex items-center gap-2">
            <Calendar className="w-5 h-5 text-lab-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 thai-font">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>ยังไม่มีประวัติการสอบเทียบ</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg thai-font flex items-center gap-2">
          <Calendar className="w-5 h-5 text-lab-primary" />
          {title} ({data.length} รายการ)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="thai-font text-xs">วันที่สอบเทียบ</TableHead>
                <TableHead className="thai-font text-xs">ผลการสอบเทียบ</TableHead>
                <TableHead className="thai-font text-xs">วันครบรอบถัดไป</TableHead>
                <TableHead className="thai-font text-xs">หมายเหตุ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((record) => {
                const badgeStyle = getResultBadgeStyle(record.result);
                return (
                  <TableRow key={record.id}>
                    <TableCell className="thai-font text-xs">
                      {record.calibrationDate 
                        ? format(new Date(record.calibrationDate), "dd/MM/yyyy")
                        : "-"
                      }
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={badgeStyle.variant}
                        className={`text-xs thai-font flex items-center gap-1 w-fit ${badgeStyle.className}`}
                      >
                        {badgeStyle.icon}
                        {record.result}
                      </Badge>
                    </TableCell>
                    <TableCell className="thai-font text-xs">
                      {record.nextCalibrationDate 
                        ? format(new Date(record.nextCalibrationDate), "dd/MM/yyyy")
                        : "-"
                      }
                    </TableCell>
                    <TableCell className="thai-font text-xs max-w-[200px] truncate" title={record.remarks || ""}>
                      {record.remarks || "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ToolCalibrationHistory } from "@shared/schema";

interface CalibrationHistoryTableProps {
  history: ToolCalibrationHistory[];
}

export function CalibrationHistoryTable({ history }: CalibrationHistoryTableProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">ประวัติการสอบเทียบ (5 ปีย้อนหลัง)</h3>
      {history.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          ไม่มีประวัติการสอบเทียบ
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>วันที่สอบเทียบ</TableHead>
              <TableHead>ผลการสอบเทียบ</TableHead>
              <TableHead>เลขที่ใบรับรอง</TableHead>
              <TableHead>ผู้สอบเทียบ</TableHead>
              <TableHead>วิธีการ</TableHead>
              <TableHead>หมายเหตุ</TableHead>
              <TableHead>วันครบกำหนดถัดไป</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {format(new Date(record.calibrationDate), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={record.result === "ผ่าน" ? "default" : "destructive"}
                    className={record.result === "ผ่าน" 
                      ? "bg-green-500 hover:bg-green-600" 
                      : "bg-red-500 hover:bg-red-600"
                    }
                  >
                    {record.result}
                  </Badge>
                </TableCell>
                <TableCell>{record.certificateNumber || "-"}</TableCell>
                <TableCell>{record.calibratedBy || "-"}</TableCell>
                <TableCell>{record.method || "-"}</TableCell>
                <TableCell>{record.remarks || "-"}</TableCell>
                <TableCell>
                  {record.nextCalibrationDate 
                    ? format(new Date(record.nextCalibrationDate), "dd/MM/yyyy")
                    : "-"
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
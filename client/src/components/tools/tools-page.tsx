import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import DataTable from "@/components/ui/data-table";
import ToolFormModal from "./tool-form-modal";
import ViewDetailsModal from "@/components/ui/view-details-modal";
import CalibrationHistoryTable from "@/components/ui/calibration-history-table";
import { Tool, ToolCalibrationHistory } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function ToolsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [viewingTool, setViewingTool] = useState<Tool | null>(null);
  const { toast } = useToast();

  const { data: tools, isLoading } = useQuery({
    queryKey: ["/api/tools"],
  });

  const { data: calibrationHistory } = useQuery({
    queryKey: [`/api/tools/${viewingTool?.id}/calibration-history-by-name`],
    enabled: !!viewingTool?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tools/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      toast({
        title: "สำเร็จ",
        description: "ลบเครื่องมือเรียบร้อยแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบเครื่องมือได้",
        variant: "destructive",
      });
    },
  });

  const getCalibrationStatus = (tool: Tool) => {
    if (!tool.nextCalibration) return "ไม่ระบุ";
    
    const now = new Date();
    const nextCalibration = new Date(tool.nextCalibration);
    const daysUntil = Math.ceil((nextCalibration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return "เลยกำหนด";
    if (daysUntil <= 30) return "ใกล้ครบกำหนด";
    return "ปกติ";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "เลยกำหนด":
        return <Badge className="lab-badge-error">{status}</Badge>;
      case "ใกล้ครบกำหนด":
        return <Badge className="lab-badge-warning">{status}</Badge>;
      case "ปกติ":
        return <Badge className="lab-badge-success">{status}</Badge>;
      default:
        return <Badge className="lab-badge-info">{status}</Badge>;
    }
  };

  const getToolStatus = (tool: Tool) => {
    if (tool.status === "repair") {
      return <Badge className="lab-badge-error">ส่งซ่อม</Badge>;
    }
    if (tool.status === "active") {
      return <Badge className="lab-badge-success">ใช้งานได้</Badge>;
    }
    return <Badge className="lab-badge-info">{tool.status || "ไม่ระบุ"}</Badge>;
  };

  const columns = [
    {
      key: "code",
      label: "รหัสเครื่องมือ",
    },
    {
      key: "name",
      label: "ชื่อเครื่องมือ",
    },
    {
      key: "brand",
      label: "ยี่ห้อ/รุ่น",
    },
    {
      key: "location",
      label: "สถานที่ตั้ง",
    },
    {
      key: "lastCalibration",
      label: "วันที่สอบเทียบล่าสุด",
      render: (value: string) => value ? format(new Date(value), "dd/MM/yyyy") : "-",
    },
    {
      key: "nextCalibration",
      label: "วันที่สอบเทียบครั้งถัดไป",
      render: (value: string) => value ? format(new Date(value), "dd/MM/yyyy") : "-",
    },
    {
      key: "status",
      label: "สถานะเครื่องมือ",
      render: (value: string, tool: Tool) => {
        const statusBadges = {
          "active": <Badge className="lab-badge-success">ใช้งานได้</Badge>,
          "inactive": <Badge className="lab-badge-warning">ไม่ใช้งาน</Badge>,
          "repair": <Badge className="lab-badge-error">ซ่อมแซม</Badge>
        };
        return statusBadges[tool.status as keyof typeof statusBadges] || <Badge className="lab-badge-info">{tool.status}</Badge>;
      },
    },
  ];

  const handleAdd = () => {
    setEditingTool(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool);
    setIsModalOpen(true);
  };

  const handleView = (tool: Tool) => {
    setViewingTool(tool);
    setViewDetailsModalOpen(true);
  };

  const handleDelete = (tool: Tool) => {
    if (confirm(`คุณต้องการลบเครื่องมือ "${tool.name}" หรือไม่?`)) {
      deleteMutation.mutate(tool.id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 thai-font">
          เครื่องมือ
        </h2>
        <p className="text-gray-600 dark:text-gray-400 thai-font">
          จัดการเครื่องมือและการสอบเทียบ
        </p>
      </div>

      <DataTable
        title="รายการเครื่องมือ"
        data={Array.isArray(tools) ? tools : []}
        columns={columns}
        searchPlaceholder="ค้นหาเครื่องมือ..."
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        statusFilters={[
          { key: "active", label: "ใช้งานได้", count: Array.isArray(tools) ? tools.filter((tool: Tool) => tool.status === "active").length : 0 },
          { key: "inactive", label: "ไม่ใช้งาน", count: Array.isArray(tools) ? tools.filter((tool: Tool) => tool.status === "inactive").length : 0 },
          { key: "repair", label: "ซ่อมแซม", count: Array.isArray(tools) ? tools.filter((tool: Tool) => tool.status === "repair").length : 0 },
        ]}
        getItemStatus={(tool: Tool) => {
          // Return status that matches DataTable color mapping
          if (tool.status === "repair") return "ส่งซ่อม";
          if (tool.status === "active") return "ใช้งานได้";
          if (tool.status === "inactive") return "ไม่ใช้งาน";
          
          // Check calibration status for expired items
          if (tool.nextCalibration) {
            const now = new Date();
            const nextCalibration = new Date(tool.nextCalibration);
            const daysUntil = Math.ceil((nextCalibration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntil < 0) return "เลยกำหนด";
            if (daysUntil <= 30) return "ใกล้หมดอายุ";
          }
          
          // Check calibration result
          if (tool.calibrationResult === "ไม่ผ่าน") return "ไม่ผ่าน";
          
          return "ปกติ";
        }}
      />

      <ToolFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tool={editingTool}
      />

      <ViewDetailsModal
        isOpen={viewDetailsModalOpen}
        onClose={() => setViewDetailsModalOpen(false)}
        title="รายละเอียดเครื่องมือ"
        data={viewingTool ? [
          { label: "รหัสเครื่องมือ", value: viewingTool.code },
          { label: "ชื่อเครื่องมือ", value: viewingTool.name },
          { label: "ยี่ห้อ / รุ่น", value: viewingTool.brand || "-" },
          { label: "Serial Number", value: viewingTool.serialNumber || "-" },
          { label: "พิสัยการใช้งาน", value: viewingTool.range || "-" },
          { label: "สถานที่ตั้ง", value: viewingTool.location || "-" },
          { label: "ผู้รับผิดชอบ", value: viewingTool.responsible || "-" },
          { label: "หมายเหตุ", value: viewingTool.notes || "-" },
          { label: "สถานะเครื่องมือ", value: getToolStatus(viewingTool), highlight: true },
          // Add repair information if status is repair
          ...(viewingTool.status === "repair" ? [
            { label: "วันที่ส่งซ่อม", value: viewingTool.repairDate ? format(new Date(viewingTool.repairDate), "dd/MM/yyyy") : "-", highlight: true },
            { label: "วันที่คาดว่าจะได้รับคืน", value: viewingTool.expectedReturnDate ? format(new Date(viewingTool.expectedReturnDate), "dd/MM/yyyy") : "-", highlight: true },
            { label: "หมายเหตุการซ่อม", value: viewingTool.repairRemarks || "-", highlight: true },
          ] : []),
        ] : []}
        additionalContent={
          <CalibrationHistoryTable 
            data={calibrationHistory as ToolCalibrationHistory[] || []} 
            title={`ประวัติการสอบเทียบ ${viewingTool?.name || 'เครื่องมือ'} (รวมทุกเครื่อง)`}
            isConsolidated={true}
          />
        }
      />
    </div>
  );
}

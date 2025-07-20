import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import DataTable from "@/components/ui/data-table";
import GlasswareFormModal from "./glassware-form-modal";
import { Glassware } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function GlasswarePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGlassware, setEditingGlassware] = useState<Glassware | null>(null);
  const { toast } = useToast();

  const { data: glassware, isLoading } = useQuery({
    queryKey: ["/api/glassware"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/glassware/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/glassware"] });
      toast({
        title: "สำเร็จ",
        description: "ลบเครื่องแก้วเรียบร้อยแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบเครื่องแก้วได้",
        variant: "destructive",
      });
    },
  });

  const getCalibrationStatus = (item: Glassware) => {
    if (!item.nextCalibration) return "ไม่ระบุ";
    
    const now = new Date();
    const nextCalibration = new Date(item.nextCalibration);
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

  const columns = [
    {
      key: "code",
      label: "รหัส",
    },
    {
      key: "type",
      label: "ประเภทเครื่องแก้ว",
    },
    {
      key: "class",
      label: "Class",
    },
    {
      key: "brand",
      label: "ยี่ห้อ",
    },
    {
      key: "location",
      label: "สถานที่จัดเก็บ",
    },
    {
      key: "nextCalibration",
      label: "วันที่สอบเทียบครั้งถัดไป",
      render: (value: string) => value ? format(new Date(value), "dd/MM/yyyy") : "-",
    },
    {
      key: "status",
      label: "สถานะ",
      render: (value: string, item: Glassware) => getStatusBadge(getCalibrationStatus(item)),
    },
  ];

  const handleAdd = () => {
    setEditingGlassware(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Glassware) => {
    setEditingGlassware(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item: Glassware) => {
    if (confirm(`คุณต้องการลบเครื่องแก้ว "${item.type}" หรือไม่?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 thai-font">
          เครื่องแก้ว
        </h2>
        <p className="text-gray-600 dark:text-gray-400 thai-font">
          จัดการเครื่องแก้วและการสอบเทียบ
        </p>
      </div>

      <DataTable
        title="รายการเครื่องแก้ว"
        data={glassware || []}
        columns={columns}
        searchPlaceholder="ค้นหาเครื่องแก้ว..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <GlasswareFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        glassware={editingGlassware}
      />
    </div>
  );
}

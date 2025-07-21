import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import DataTable from "@/components/ui/data-table";
import MsdsFormModal from "./msds-form-modal";
import ViewDetailsModal from "@/components/ui/view-details-modal";
import { Msds } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText } from "lucide-react";

export default function MsdsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMsds, setEditingMsds] = useState<Msds | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [viewingMsds, setViewingMsds] = useState<Msds | null>(null);
  const { toast } = useToast();

  const { data: msds, isLoading } = useQuery({
    queryKey: ["/api/msds", selectedCategory],
    queryFn: () => {
      const url = selectedCategory === "all" 
        ? "/api/msds" 
        : `/api/msds?category=${selectedCategory}`;
      return fetch(url).then(res => res.json());
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/msds/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/msds"] });
      toast({
        title: "สำเร็จ",
        description: "ลบ MSDS เรียบร้อยแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบ MSDS ได้",
        variant: "destructive",
      });
    },
  });

  const categoryOptions = [
    { value: "all", label: "ทั้งหมด" },
    { value: "sds_lab", label: "SDS-LAB" },
    { value: "sds_product", label: "SDS-Product" },
    { value: "sds_rm", label: "SDS-RM" },
  ];

  const getCategoryLabel = (category: string) => {
    const option = categoryOptions.find(opt => opt.value === category);
    return option ? option.label : category;
  };

  const columns = [
    {
      key: "sequence",
      label: "ลำดับ",
    },
    {
      key: "title",
      label: "ชื่อเอกสาร",
    },
    {
      key: "documentCode",
      label: "รหัสเอกสาร",
    },
    {
      key: "category",
      label: "หมวดหมู่",
      render: (value: string) => getCategoryLabel(value),
    },
    {
      key: "effectiveDate",
      label: "วันที่เริ่มใช้",
      render: (value: string) => value ? format(new Date(value), "dd/MM/yyyy") : "-",
    },
    {
      key: "revision",
      label: "ปรับปรุงครั้งที่",
      render: (value: number) => value || "0",
    },
    {
      key: "filePath",
      label: "ไฟล์",
      render: (value: string) => (
        value ? (
          <FileText className="w-4 h-4 text-blue-500" />
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
  ];

  const handleAdd = () => {
    setEditingMsds(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Msds) => {
    setEditingMsds(item);
    setIsModalOpen(true);
  };

  const handleView = (item: Msds) => {
    setViewingMsds(item);
    setViewDetailsModalOpen(true);
  };

  const handleDelete = (item: Msds) => {
    if (confirm(`คุณต้องการลบ MSDS "${item.title}" หรือไม่?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  const handleDownload = (item: Msds) => {
    if (item.filePath) {
      // In a real implementation, this would handle file download
      toast({
        title: "ดาวน์โหลด",
        description: `กำลังดาวน์โหลดไฟล์ ${item.title}`,
      });
    }
  };

  // Dashboard stats
  const totalMsds = msds?.length || 0;
  const recentMsds = msds?.filter((item: Msds) => {
    if (!item.effectiveDate) return false;
    const docDate = new Date(item.effectiveDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return docDate >= thirtyDaysAgo;
  }).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 thai-font">
          MSDS
        </h2>
        <p className="text-gray-600 dark:text-gray-400 thai-font">
          จัดการเอกสาร Material Safety Data Sheet
        </p>
      </div>

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="lab-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 thai-font">
              สรุป MSDS
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400 thai-font">จำนวน MSDS ทั้งหมด:</span>
                <span className="font-semibold">{totalMsds}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400 thai-font">MSDS ที่ปรับปรุงล่าสุด (30 วัน):</span>
                <span className="font-semibold">{recentMsds}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lab-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 thai-font">
              หมวดหมู่ MSDS
            </h3>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <DataTable
        title={`รายการ MSDS${selectedCategory !== "all" ? ` - ${getCategoryLabel(selectedCategory)}` : ""}`}
        data={msds || []}
        columns={columns}
        searchPlaceholder="ค้นหา MSDS..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        isLoading={isLoading}
      />

      <MsdsFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        msds={editingMsds}
      />

      <ViewDetailsModal
        isOpen={viewDetailsModalOpen}
        onClose={() => setViewDetailsModalOpen(false)}
        title="รายละเอียด MSDS"
        data={viewingMsds ? [
          { label: "ลำดับ", value: viewingMsds.sequence?.toString() || "-" },
          { label: "ชื่อเอกสาร", value: viewingMsds.title },
          { label: "รหัสเอกสาร", value: viewingMsds.documentCode },
          { label: "หมวดหมู่", value: getCategoryLabel(viewingMsds.category), highlight: true },
          { label: "วันที่เริ่มใช้", value: viewingMsds.effectiveDate ? format(new Date(viewingMsds.effectiveDate), "dd/MM/yyyy") : "-" },
          { label: "ปรับปรุงครั้งที่", value: viewingMsds.revision?.toString() || "0" },
          { label: "ไฟล์", value: viewingMsds.filePath ? "✓ มีไฟล์แนบ" : "ไม่มีไฟล์" },
          { label: "หมายเหตุ", value: viewingMsds.notes || "-" },
        ] : []}
      />
    </div>
  );
}

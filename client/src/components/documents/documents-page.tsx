import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import DataTable from "@/components/ui/data-table";
import DocumentFormModal from "./document-form-modal";
import { Document } from "@shared/schema";
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

export default function DocumentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  const { data: documents, isLoading } = useQuery({
    queryKey: ["/api/documents", selectedCategory],
    queryFn: () => {
      const url = selectedCategory === "all" 
        ? "/api/documents" 
        : `/api/documents?category=${selectedCategory}`;
      return fetch(url).then(res => res.json());
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "สำเร็จ",
        description: "ลบเอกสารเรียบร้อยแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบเอกสารได้",
        variant: "destructive",
      });
    },
  });

  const categoryOptions = [
    { value: "all", label: "ทั้งหมด" },
    { value: "quality_manual", label: "คู่มือคุณภาพ17025" },
    { value: "procedures", label: "ระเบียบปฏิบัติ" },
    { value: "work_manual", label: "คู่มือปฏิบัติงาน" },
    { value: "forms", label: "เอกสารแบบฟอร์ม" },
    { value: "support", label: "เอกสารสนับสนุน" },
    { value: "announcements", label: "ประกาศแผนก" },
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
    setEditingDocument(null);
    setIsModalOpen(true);
  };

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setIsModalOpen(true);
  };

  const handleDelete = (document: Document) => {
    if (confirm(`คุณต้องการลบเอกสาร "${document.title}" หรือไม่?`)) {
      deleteMutation.mutate(document.id);
    }
  };

  const handleDownload = (document: Document) => {
    if (document.filePath) {
      // In a real implementation, this would handle file download
      toast({
        title: "ดาวน์โหลด",
        description: `กำลังดาวน์โหลดไฟล์ ${document.title}`,
      });
    }
  };

  // Dashboard stats
  const totalDocuments = documents?.length || 0;
  const recentDocuments = documents?.filter((doc: Document) => {
    if (!doc.effectiveDate) return false;
    const docDate = new Date(doc.effectiveDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return docDate >= thirtyDaysAgo;
  }).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 thai-font">
          เอกสาร
        </h2>
        <p className="text-gray-600 dark:text-gray-400 thai-font">
          จัดการเอกสารและไฟล์ต่างๆ
        </p>
      </div>

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="lab-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 thai-font">
              สรุปเอกสาร
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400 thai-font">จำนวนเอกสารทั้งหมด:</span>
                <span className="font-semibold">{totalDocuments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400 thai-font">เอกสารที่ปรับปรุงล่าสุด (30 วัน):</span>
                <span className="font-semibold">{recentDocuments}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lab-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 thai-font">
              หมวดหมู่เอกสาร
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
        title={`รายการเอกสาร${selectedCategory !== "all" ? ` - ${getCategoryLabel(selectedCategory)}` : ""}`}
        data={documents || []}
        columns={columns}
        searchPlaceholder="ค้นหาเอกสาร..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleDownload}
        isLoading={isLoading}
      />

      <DocumentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        document={editingDocument}
      />
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import DataTable from "@/components/ui/data-table";
import QaSampleFormModal from "./qa-sample-form-modal";
import ViewDetailsModal from "@/components/ui/view-details-modal";
import { QaSample } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function QaSampleReceiving() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQaSample, setEditingQaSample] = useState<QaSample | null>(null);
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [viewingSample, setViewingSample] = useState<QaSample | null>(null);
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/qa-samples"],
    initialData: [],
  });
  const qaSamples: QaSample[] = Array.isArray(data) ? data : [];

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/qa-samples/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qa-samples"] });
      toast({
        title: "สำเร็จ",
        description: "ลบตัวอย่าง QA เรียบร้อยแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบตัวอย่าง QA ได้",
        variant: "destructive",
      });
    },
  });

  const getDeliveryMethodLabel = (method: string) => {
    switch (method) {
      case "pickup":
        return "รับด้วยตนเอง";
      case "address_report":
        return "จัดส่งตามที่อยู่ในรายงาน";
      case "address_invoice":
        return "จัดส่งตามที่อยู่ใบกำกับภาษี";
      case "other":
        return "อื่นๆ";
      default:
        return method;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const columns = [
    {
      key: "requestNo",
      label: "Request No",
    },
    {
      key: "companyName",
      label: "บริษัท",
    },
    {
      key: "contactPerson",
      label: "ผู้ติดต่อ",
    },
    {
      key: "receivedDate",
      label: "วันที่รับตัวอย่าง",
      render: (value: string) => format(new Date(value), "dd/MM/yyyy"),
    },
    {
      key: "dueDate",
      label: "วันครบกำหนด",
      render: (value: string) => {
        const daysUntil = getDaysUntilDue(value);
        const dueDateStr = format(new Date(value), "dd/MM/yyyy");
        return (
          <div>
            <div>{dueDateStr}</div>
            <div className={`text-xs ${daysUntil < 0 ? 'text-red-500' : daysUntil <= 3 ? 'text-orange-500' : 'text-gray-500'}`}>
              {daysUntil < 0 ? `เลย ${Math.abs(daysUntil)} วัน` : daysUntil === 0 ? 'วันนี้' : `อีก ${daysUntil} วัน`}
            </div>
          </div>
        );
      },
    },
    {
      key: "deliveryMethod",
      label: "การจัดส่ง",
      render: (value: string) => getDeliveryMethodLabel(value),
    },
  ];

  const handleAdd = () => {
    setEditingQaSample(null);
    setIsModalOpen(true);
  };

  const handleEdit = (qaSample: QaSample) => {
    setEditingQaSample(qaSample);
    setIsModalOpen(true);
  };

  const handleDelete = (qaSample: QaSample) => {
    if (confirm(`คุณต้องการลบตัวอย่าง QA "${qaSample.requestNo}" หรือไม่?`)) {
      deleteMutation.mutate(qaSample.id);
    }
  };

  const handleView = (qaSample: QaSample) => {
    setViewingSample(qaSample);
    setViewDetailsModalOpen(true);
  };

  // Dashboard stats
  const totalSamples = qaSamples?.length || 0;

  return (
    <div className="space-y-6">
      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 gap-6">
        <div className="lab-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 thai-font">
              ตัวอย่างทั้งหมด
            </h3>
            <p className="text-3xl font-bold text-blue-600">{totalSamples}</p>
          </div>
        </div>
      </div>

      <DataTable
        title="รายการตัวอย่าง QA"
        data={qaSamples || []}
        columns={columns}
        searchPlaceholder="ค้นหาตัวอย่าง QA..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        isLoading={isLoading}
        statusFilters={[
          { key: "received", label: "รับแล้ว", count: qaSamples?.filter((sample: QaSample) => sample.status === "received").length || 0 },
          { key: "testing", label: "กำลังทดสอบ", count: qaSamples?.filter((sample: QaSample) => sample.status === "testing").length || 0 },
          { key: "completed", label: "เสร็จแล้ว", count: qaSamples?.filter((sample: QaSample) => sample.status === "completed").length || 0 },
          { key: "delivered", label: "ส่งแล้ว", count: qaSamples?.filter((sample: QaSample) => sample.status === "delivered").length || 0 },
        ]}
        getItemStatus={(sample: QaSample) => sample.status || "received"}
      />

      <QaSampleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        qaSample={editingQaSample}
      />

      <ViewDetailsModal
        isOpen={viewDetailsModalOpen}
        onClose={() => setViewDetailsModalOpen(false)}
        title="รายละเอียดตัวอย่าง QA"
        data={viewingSample ? [
          { label: "Request No", value: viewingSample.requestNo },
          { label: "ชื่อบริษัท", value: viewingSample.companyName },
          { label: "ผู้ติดต่อ", value: viewingSample.contactPerson || "-" },
          { label: "วันที่รับตัวอย่าง", value: viewingSample.receivedDate ? format(new Date(viewingSample.receivedDate), "dd/MM/yyyy") : "-" },
          { label: "วันครบกำหนด", value: viewingSample.dueDate ? format(new Date(viewingSample.dueDate), "dd/MM/yyyy") : "-" },
          { label: "การจัดส่ง", value: getDeliveryMethodLabel(viewingSample.deliveryMethod), highlight: true },
          { label: "สภาพตัวอย่าง", value: viewingSample.condition === "normal" ? "ปกติ" : "ผิดปกติ" },
        ] : []}
      />
    </div>
  );
} 
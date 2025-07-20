import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import DataTable from "@/components/ui/data-table";
import QaSampleFormModal from "./qa-sample-form-modal";
import { QaSample } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { FileText } from "lucide-react";

export default function QaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQaSample, setEditingQaSample] = useState<QaSample | null>(null);
  const { toast } = useToast();

  const { data: qaSamples, isLoading } = useQuery({
    queryKey: ["/api/qa-samples"],
  });

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "received":
        return <Badge className="lab-badge-info">รับตัวอย่าง</Badge>;
      case "testing":
        return <Badge className="lab-badge-warning">กำลังทดสอบ</Badge>;
      case "completed":
        return <Badge className="lab-badge-success">เสร็จสิ้น</Badge>;
      case "delivered":
        return <Badge className="lab-badge-success">ส่งมอบแล้ว</Badge>;
      default:
        return <Badge className="lab-badge-info">{status}</Badge>;
    }
  };

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
      key: "status",
      label: "สถานะ",
      render: (value: string) => getStatusBadge(value),
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

  const handleExportPdf = (qaSample: QaSample) => {
    // In a real implementation, this would generate and download a PDF report
    toast({
      title: "Export PDF",
      description: `กำลังสร้างรายงาน PDF สำหรับ ${qaSample.requestNo}`,
    });
  };

  // Dashboard stats
  const totalSamples = qaSamples?.length || 0;
  const receivedSamples = qaSamples?.filter((s: QaSample) => s.status === "received").length || 0;
  const testingSamples = qaSamples?.filter((s: QaSample) => s.status === "testing").length || 0;
  const completedSamples = qaSamples?.filter((s: QaSample) => s.status === "completed").length || 0;
  const overdueSamples = qaSamples?.filter((s: QaSample) => {
    if (s.status === "completed" || s.status === "delivered") return false;
    return new Date(s.dueDate) < new Date();
  }).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 thai-font">
          QA
        </h2>
        <p className="text-gray-600 dark:text-gray-400 thai-font">
          จัดการตัวอย่างและรายงานผลการทดสอบ
        </p>
      </div>

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="lab-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 thai-font">
              ตัวอย่างทั้งหมด
            </h3>
            <p className="text-3xl font-bold text-blue-600">{totalSamples}</p>
          </div>
        </div>

        <div className="lab-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 thai-font">
              รับตัวอย่าง
            </h3>
            <p className="text-3xl font-bold text-green-600">{receivedSamples}</p>
          </div>
        </div>

        <div className="lab-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 thai-font">
              กำลังทดสอบ
            </h3>
            <p className="text-3xl font-bold text-orange-600">{testingSamples}</p>
          </div>
        </div>

        <div className="lab-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 thai-font">
              เสร็จสิ้น
            </h3>
            <p className="text-3xl font-bold text-green-600">{completedSamples}</p>
          </div>
        </div>

        <div className="lab-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 thai-font">
              เกินกำหนด
            </h3>
            <p className="text-3xl font-bold text-red-600">{overdueSamples}</p>
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
        onView={handleExportPdf}
        isLoading={isLoading}
      />

      <QaSampleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        qaSample={editingQaSample}
      />
    </div>
  );
}

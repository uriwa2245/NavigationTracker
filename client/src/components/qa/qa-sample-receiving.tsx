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
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const handleExportPdf = (qaSample: QaSample) => {
    toast({
      title: "Export PDF",
      description: `กำลังสร้างรายงานการรับตัวอย่าง สำหรับ ${qaSample.requestNo}`,
    });
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
        customActions={(item: QaSample) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportPdf(item)}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        )}
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
          // กลุ่มข้อมูลการรับตัวอย่าง
          {
            label: "📝 ข้อมูลการรับตัวอย่าง",
            value: ""
          },
          { label: "Request No", value: viewingSample.requestNo },
          { label: "เลขที่ใบเสนอราคา", value: viewingSample.quotationNo || "-" },
          { 
            label: "วันที่และเวลารับตัวอย่าง", 
            value: `${viewingSample.receivedDate ? format(new Date(viewingSample.receivedDate), "dd/MM/yyyy") : "-"} ${viewingSample.receivedTime || ""}`
          },
          { 
            label: "วันครบกำหนด", 
            value: viewingSample.dueDate ? format(new Date(viewingSample.dueDate), "dd/MM/yyyy") : "-"
          },

          // กลุ่มข้อมูลผู้ใช้บริการ
          {
            label: "👤 ข้อมูลผู้ใช้บริการ",
            value: ""
          },
          { label: "ชื่อบริษัท", value: viewingSample.companyName },
          { label: "ผู้ติดต่อ", value: viewingSample.contactPerson },
          { label: "เบอร์โทรศัพท์", value: viewingSample.phone },
          { label: "อีเมล", value: viewingSample.email },
          { label: "ที่อยู่", value: viewingSample.address || "-" },
          { 
            label: "การจัดส่งผลการทดสอบ", 
            value: getDeliveryMethodLabel(viewingSample.deliveryMethod)
          },

          // กลุ่มข้อมูลการจัดการตัวอย่าง
          {
            label: "📦 การจัดการตัวอย่าง",
            value: ""
          },
          { 
            label: "การเก็บรักษา", 
            value: viewingSample.storage === "room_temp" ? "Room temperature" : 
                   viewingSample.storage === "chilled" ? "Refrigerated" : 
                   viewingSample.storage === "frozen" ? "Frozen" : "-"
          },
          { 
            label: "ตัวอย่างหลังการทดสอบ", 
            value: viewingSample.postTesting === "return" ? "รับคืน" : "ไม่รับคืน"
          },
          { 
            label: "สภาพตัวอย่าง", 
            value: viewingSample.condition === "normal" ? "ปกติ" : "ผิดปกติ"
          },

          // กลุ่มรายละเอียดตัวอย่าง
          {
            label: "🧪 รายละเอียดตัวอย่าง",
            value: ""
          },
          { 
            label: "จำนวนตัวอย่าง", 
            value: Array.isArray(viewingSample.samples) ? viewingSample.samples.length : 0
          },
          ...((Array.isArray(viewingSample.samples) ? viewingSample.samples : [])?.map((sample, index) => ({
            label: `ตัวอย่างที่ ${index + 1}`,
            value: [
              `🏷️ Sample No: ${sample.sampleNo}`,
              `📋 Sample Name: ${sample.name}`,
              `🔍 Id_No/Batch_No: ${sample.analysisRequest || "-"}`,
              `📊 รายการทดสอบ:`,
              sample.itemTests?.map((test: { itemTest: any; specification: any; unit: any; }) => 
                `   • ${test.itemTest} (${test.specification || "-"}) ${test.unit || "-"}`
              ).join("\n") || "-"
            ].join("\n")
          })) || [])
        ] : []}
      />
    </div>
  );
}
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import DataTable from "@/components/ui/data-table";
import QaTestResultFormModal from "./qa-test-result-form-modal";
import ViewDetailsModal from "@/components/ui/view-details-modal";
import { QaTestResult } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QaTestResults() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestResult, setEditingTestResult] = useState<QaTestResult | null>(null);
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [viewingResult, setViewingResult] = useState<QaTestResult | null>(null);
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/qa-test-results"],
    initialData: [],
  });
  const testResults: QaTestResult[] = Array.isArray(data) ? data : [];

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log("deleteMutation.mutationFn called with ID:", id);
      await apiRequest("DELETE", `/api/qa-test-results/${id}`);
    },
    onSuccess: () => {
      console.log("deleteMutation.onSuccess called.");
      queryClient.invalidateQueries({ queryKey: ["/api/qa-test-results"] });
      toast({
        title: "สำเร็จ",
        description: "ลบผลการทดสอบเรียบร้อยแล้ว",
      });
    },
    onError: (error) => {
      console.error("deleteMutation.onError called with error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบผลการทดสอบได้",
        variant: "destructive",
      });
    },
  });

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const columns = [
    {
      key: "sampleNo",
      label: "Sample No",
    },
    {
      key: "requestNo",
      label: "Request No",
    },
    {
      key: "product",
      label: "Product",
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


  ];

  const handleAdd = () => {
    setEditingTestResult(null);
    setIsModalOpen(true);
  };

  const handleEdit = (testResult: QaTestResult) => {
    setEditingTestResult(testResult);
    setIsModalOpen(true);
  };

  const handleDelete = (testResult: QaTestResult) => {
    console.log("Attempting to delete test result with ID:", testResult.id);
    if (confirm(`คุณต้องการลบผลการทดสอบ "${testResult.sampleNo}" หรือไม่?`)) {
      deleteMutation.mutate(testResult.id);
    }
  };

  const handleView = (testResult: QaTestResult) => {
    setViewingResult(testResult);
    setViewDetailsModalOpen(true);
  };

  const handleExportPdf = (testResult: QaTestResult) => {
    toast({
      title: "Export PDF",
      description: `กำลังสร้างรายงาน TEST REPORT สำหรับ ${testResult.sampleNo}`,
    });
  };

  // Dashboard stats
  const totalTests = testResults?.length || 0;

  return (
    <div className="space-y-6">
      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 gap-6">
        <div className="lab-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 thai-font">
              การทดสอบทั้งหมด
            </h3>
            <p className="text-3xl font-bold text-blue-600">{totalTests}</p>
          </div>
        </div>
      </div>

      <DataTable
        title="สรุปรายการลงผลการทดสอบ"
        data={testResults || []}
        columns={columns}
        searchPlaceholder="ค้นหาผลการทดสอบ..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        isLoading={isLoading}

        customActions={(item: QaTestResult) => (
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

      <QaTestResultFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        testResult={editingTestResult}
      />

      <ViewDetailsModal
        isOpen={viewDetailsModalOpen}
        onClose={() => setViewDetailsModalOpen(false)}
        title="รายละเอียดผลการทดสอบ"
        data={viewingResult ? (() => {
          // Parse testItems if it's a string
          let testItems = [];
          if (viewingResult.testItems) {
            try {
              if (typeof viewingResult.testItems === 'string') {
                testItems = JSON.parse(viewingResult.testItems);
              } else if (Array.isArray(viewingResult.testItems)) {
                testItems = viewingResult.testItems;
              }
            } catch (error) {
              testItems = [];
            }
          }

          const baseData = [
            // ข้อมูลพื้นฐาน
            { label: "Sample No", value: viewingResult.sampleNo },
            { label: "Request No", value: viewingResult.requestNo },
            { label: "Product", value: viewingResult.product },
            { label: "วันครบกำหนด", value: viewingResult.dueDate ? format(new Date(viewingResult.dueDate), "dd/MM/yyyy") : "-" },
            { label: "หมายเหตุ", value: viewingResult.notes || "-" },
            { label: "จำนวนรายการทดสอบ", value: testItems.length },
          ];

          // Add test items details
          const testItemsData = testItems.map((item: any, index: number) => {
            let testDetails = `ประเภท: ${item.testType}\nวันที่ทดสอบ: ${item.recordDate ? format(new Date(item.recordDate), "dd/MM/yyyy") : "-"}`;
            
            if (item.testType === "pH") {
              testDetails += `\n\npH1: ${item.ph1 || "-"}\npH2: ${item.ph2 || "-"}\npH Average: ${item.phAverage || "-"}`;
            } else if (item.testType === "ActiveIngredient") {
              testDetails += `\n\nSample Name: ${item.sampleName || "-"}\nActive Ingredient 1: ${item.activeIngredient1 || "-"}\nActive Ingredient 2: ${item.activeIngredient2 || "-"}\nActive Ingredient 3: ${item.activeIngredient3 || "-"}\nActive Ingredient Average: ${item.activeIngredientAverage || "-"}`;
            } else if (item.testType === "Density") {
              testDetails += `\n\nDensity: ${item.result || "-"} g/cm³`;
            } else if (item.testType === "Reemulsification") {
              testDetails += `\n\nRe-emulsification: ${item.result || "-"} cm³`;
            } else if (item.testType === "PersistanceFoaming") {
              testDetails += `\n\nPersistance foaming: ${item.result || "-"}`;
            } else if (item.testType === "AgingTest") {
              testDetails += `\n\nAging test: ${item.result || "-"}`;
            } else if (item.testType === "Moisture") {
              testDetails += `\n\nMoisture: ${item.result || "-"} %`;
            } else if (item.testType === "Viscosity") {
              testDetails += `\n\nViscosity: ${item.result || "-"} mPa.s`;
            } else if (item.testType === "FormulaTest") {
              testDetails += `\n\nFormula test: ${item.result || "-"}`;
            } else {
              testDetails += `\n\nผลการทดสอบ: ${item.result || "-"}`;
            }
            
            return {
              label: `Test Item ${index + 1}`,
              value: testDetails,
              multiline: true
            };
          });

          return [...baseData, ...testItemsData];
        })() : []}
      />
    </div>
  );
} 
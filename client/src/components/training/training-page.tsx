import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import DataTable from "@/components/ui/data-table";
import TrainingFormModal from "./training-form-modal";
import ViewDetailsModal from "@/components/ui/view-details-modal";
import { Training } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function TrainingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [viewingTraining, setViewingTraining] = useState<Training | null>(null);
  const { toast } = useToast();

  const { data: training = [], isLoading } = useQuery<Training[]>({
    queryKey: ["/api/training"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/training/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training"] });
      toast({
        title: "สำเร็จ",
        description: "ลบการฝึกอบรมเรียบร้อยแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบการฝึกอบรมได้",
        variant: "destructive",
      });
    },
  });

  const getResultBadge = (result: string | null) => {
    switch (result) {
      case "passed":
        return <Badge className="lab-badge-success">ผ่าน</Badge>;
      case "failed":
        return <Badge className="lab-badge-error">ไม่ผ่าน</Badge>;
      default:
        return <Badge className="lab-badge-info">ยังไม่ประเมิน</Badge>;
    }
  };

  const getAssessmentLevel = (level: number | null) => {
    if (!level) return "-";
    return `ระดับ ${level}`;
  };

  const columns = [
    {
      key: "sequence",
      label: "ลำดับ",
    },
    {
      key: "course",
      label: "รายละเอียด/หลักสูตร",
    },
    {
      key: "trainee",
      label: "ผู้เข้าอบรม",
    },
    {
      key: "startDate",
      label: "วันที่เริ่มต้น",
      render: (value: string) => value ? format(new Date(value), "dd/MM/yyyy") : "-",
    },
    {
      key: "endDate",
      label: "วันที่สิ้นสุด",
      render: (value: string) => value ? format(new Date(value), "dd/MM/yyyy") : "-",
    },
    {
      key: "assessmentLevel",
      label: "การประเมิน",
      render: (value: number | null) => getAssessmentLevel(value),
    },
    {
      key: "result",
      label: "ผลการฝึกอบรม",
      render: (value: string | null) => getResultBadge(value),
    },
    {
      key: "trainer",
      label: "ผู้ฝึกอบรม",
    },
  ];

  const handleAdd = () => {
    setEditingTraining(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Training) => {
    setEditingTraining(item);
    setIsModalOpen(true);
  };

  const handleView = (item: Training) => {
    setViewingTraining(item);
    setViewDetailsModalOpen(true);
  };

  const handleDelete = (item: Training) => {
    if (confirm(`คุณต้องการลบการฝึกอบรม "${item.course}" หรือไม่?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  // Dashboard stats
  const totalTraining = training?.length || 0;
  const completedTraining = training?.filter((t: Training) => t.result === "passed").length || 0;
  const inProgressTraining = training?.filter((t: Training) => {
    if (!t.startDate || !t.endDate) return false;
    const now = new Date();
    const start = new Date(t.startDate);
    const end = new Date(t.endDate);
    return start <= now && now <= end;
  }).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 thai-font">
          การฝึกอบรม
        </h2>
        <p className="text-gray-600 dark:text-gray-400 thai-font">
          จัดการการฝึกอบรมและประเมินผล
        </p>
      </div>

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="lab-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 thai-font">
              สรุปผลการฝึกอบรม
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400 thai-font">ทั้งหมด:</span>
                <span className="font-semibold">{totalTraining}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400 thai-font">เสร็จสิ้น:</span>
                <span className="font-semibold text-green-600">{completedTraining}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400 thai-font">กำลังดำเนินการ:</span>
                <span className="font-semibold text-blue-600">{inProgressTraining}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lab-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 thai-font">
              การฝึกอบรมล่าสุด
            </h3>
            <div className="text-center py-4">
              {training && training.length > 0 ? (
                <div className="text-left">
                  <p className="font-medium">{training[0]?.course}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {training[0]?.trainee}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 thai-font">
                  ไม่มีการฝึกอบรมล่าสุด
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="lab-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 thai-font">
              การดำเนินการด่วน
            </h3>
            <div className="space-y-2">
              <button
                onClick={handleAdd}
                className="w-full px-4 py-2 text-sm lab-button-primary rounded-lg transition-colors thai-font"
              >
                เพิ่มการฝึกอบรมใหม่
              </button>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        title="รายการฝึกอบรม"
        data={training || []}
        columns={columns}
        searchPlaceholder="ค้นหาการฝึกอบรม..."
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <TrainingFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        training={editingTraining}
      />

      <ViewDetailsModal
        isOpen={viewDetailsModalOpen}
        onClose={() => setViewDetailsModalOpen(false)}
        title="รายละเอียดการฝึกอบรม"
        data={viewingTraining ? [
          { label: "หลักสูตร/รายละเอียด", value: viewingTraining.course },
          { label: "ผู้เข้าอบรม", value: viewingTraining.trainee },
          { label: "ผู้ฝึกอบรม", value: viewingTraining.trainer || "-" },
          { label: "วันที่เริ่มต้น", value: viewingTraining.startDate ? format(new Date(viewingTraining.startDate), "dd/MM/yyyy") : "-" },
          { label: "วันที่สิ้นสุด", value: viewingTraining.endDate ? format(new Date(viewingTraining.endDate), "dd/MM/yyyy") : "-" },
          { label: "การประเมิน", value: getAssessmentLevel(viewingTraining.assessmentLevel), highlight: true },
          { label: "ผลการฝึกอบรม", value: getResultBadge(viewingTraining.result), highlight: true },
          { label: "หมายเหตุ", value: viewingTraining.notes || "-" },
        ] : []}
      />
    </div>
  );
}

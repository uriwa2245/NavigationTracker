import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import DataTable from "@/components/ui/data-table";
import TaskFormModal from "./task-form-modal";
import { Task } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

export default function TaskTrackerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    initialData: [],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "สำเร็จ",
        description: "ลบงานเรียบร้อยแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบงานได้",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Task> }) => {
      return await apiRequest("PATCH", `/api/tasks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "สำเร็จ",
        description: "อัปเดตสถานะงานเรียบร้อยแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตสถานะงานได้",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="lab-badge-warning">รอดำเนินการ</Badge>;
      case "in_progress":
        return <Badge className="lab-badge-info">กำลังดำเนินการ</Badge>;
      case "completed":
        return <Badge className="lab-badge-success">เสร็จสิ้น</Badge>;
      case "cancelled":
        return <Badge className="lab-badge-error">ยกเลิก</Badge>;
      default:
        return <Badge className="lab-badge-info">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="lab-badge-error">สูง</Badge>;
      case "medium":
        return <Badge className="lab-badge-warning">กลาง</Badge>;
      case "low":
        return <Badge className="lab-badge-success">ต่ำ</Badge>;
      default:
        return <Badge className="lab-badge-info">{priority}</Badge>;
    }
  };

  const getDaysUntilDue = (dueDate: string | null) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const columns = [
    {
      key: "title",
      label: "ชื่องาน",
    },
    {
      key: "responsible",
      label: "ผู้รับผิดชอบ",
    },
    {
      key: "dueDate",
      label: "กำหนดส่ง",
      render: (value: string, task: Task) => {
        if (!value) return "-";
        const daysUntil = getDaysUntilDue(value);
        const dueDateStr = format(new Date(value), "dd/MM/yyyy");
        return (
          <div>
            <div>{dueDateStr}</div>
            {daysUntil !== null && (
              <div className={`text-xs ${daysUntil < 0 ? 'text-red-500' : daysUntil <= 3 ? 'text-orange-500' : 'text-gray-500'}`}>
                {daysUntil < 0 ? `เลย ${Math.abs(daysUntil)} วัน` : daysUntil === 0 ? 'วันนี้' : `อีก ${daysUntil} วัน`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "priority",
      label: "ความสำคัญ",
      render: (value: string) => getPriorityBadge(value),
    },
    {
      key: "status",
      label: "สถานะ",
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: "progress",
      label: "ความคืบหน้า",
      render: (value: number) => (
        <div className="w-20">
          <Progress value={value || 0} className="h-2" />
          <span className="text-xs text-gray-500">{value || 0}%</span>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleView = (task: Task) => {
    const statusText = {
      'pending': 'รอดำเนินการ',
      'in_progress': 'กำลังดำเนินการ', 
      'completed': 'เสร็จสิ้น',
      'cancelled': 'ยกเลิก'
    };
    const priorityText = {
      'high': 'สูง',
      'medium': 'กลาง',
      'low': 'ต่ำ'
    };
    alert(`ดูรายละเอียดงาน: ${task.title}\nผู้รับผิดชอบ: ${task.responsible}\nสถานะ: ${statusText[task.status as keyof typeof statusText] || task.status}\nความสำคัญ: ${priorityText[task.priority as keyof typeof priorityText] || task.priority}\nความคืบหน้า: ${task.progress || 0}%\nคำอธิบาย: ${task.description || 'ไม่มี'}`);
  };

  const handleDelete = (task: Task) => {
    if (confirm(`คุณต้องการลบงาน "${task.title}" หรือไม่?`)) {
      deleteMutation.mutate(task.id);
    }
  };

  const handleApprove = (task: Task) => {
    updateTaskMutation.mutate({
      id: task.id,
      data: { status: "in_progress" }
    });
  };

  // Dashboard stats
  const totalTasks = tasks?.length || 0;
  const pendingTasks = tasks?.filter((t: Task) => t.status === "pending").length || 0;
  const inProgressTasks = tasks?.filter((t: Task) => t.status === "in_progress").length || 0;
  const completedTasks = tasks?.filter((t: Task) => t.status === "completed").length || 0;
  const overdueTasks = tasks?.filter((t: Task) => {
    if (!t.dueDate || t.status === "completed") return false;
    return new Date(t.dueDate) < new Date();
  }).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 thai-font">
          Task Tracker
        </h2>
        <p className="text-gray-600 dark:text-gray-400 thai-font">
          จัดการงานและติดตามความคืบหน้า
        </p>
      </div>

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="lab-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 thai-font">
              งานทั้งหมด
            </h3>
            <p className="text-3xl font-bold text-blue-600">{totalTasks}</p>
          </div>
        </div>

        <div className="lab-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 thai-font">
              รอดำเนินการ
            </h3>
            <p className="text-3xl font-bold text-orange-600">{pendingTasks}</p>
          </div>
        </div>

        <div className="lab-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 thai-font">
              กำลังดำเนินการ
            </h3>
            <p className="text-3xl font-bold text-blue-600">{inProgressTasks}</p>
          </div>
        </div>

        <div className="lab-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 thai-font">
              เสร็จสิ้น
            </h3>
            <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
          </div>
        </div>

        <div className="lab-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 thai-font">
              เกินกำหนด
            </h3>
            <p className="text-3xl font-bold text-red-600">{overdueTasks}</p>
          </div>
        </div>
      </div>

      <DataTable
        title="รายการงาน"
        data={tasks || []}
        columns={columns}
        searchPlaceholder="ค้นหางาน..."
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
      />
    </div>
  );
}

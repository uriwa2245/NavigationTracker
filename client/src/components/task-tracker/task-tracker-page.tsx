import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import DataTable from "@/components/ui/data-table";
import TaskFormModal from "./task-form-modal";
import ViewDetailsModal from "@/components/ui/view-details-modal";
import ApprovalModal from "./approval-modal";
import { Task } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

export default function TaskTrackerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvingTask, setApprovingTask] = useState<Task | null>(null);
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
        return <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">รอดำเนินการ</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800 border border-blue-200">กำลังดำเนินการ</Badge>;
      case "completed":
        return <Badge className="bg-purple-100 text-purple-800 border border-purple-200">เสร็จสิ้น</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 border border-red-200">ยกเลิก</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border border-gray-200">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800 border border-red-200">สูง</Badge>;
      case "medium":
        return <Badge className="bg-amber-100 text-amber-800 border border-amber-200">กลาง</Badge>;
      case "low":
        return <Badge className="bg-cyan-100 text-cyan-800 border border-cyan-200">ต่ำ</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border border-gray-200">{priority}</Badge>;
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
      render: (value: string, task: Task) => {
        const statusBadges = {
          "pending": <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">รอดำเนินการ</Badge>,
          "in_progress": <Badge className="bg-blue-100 text-blue-800 border border-blue-200">กำลังดำเนินการ</Badge>,
          "completed": <Badge className="bg-purple-100 text-purple-800 border border-purple-200">เสร็จแล้ว</Badge>,
          "cancelled": <Badge className="bg-red-100 text-red-800 border border-red-200">ยกเลิก</Badge>
        };
        
        const subtasks = task.subtasks && Array.isArray(task.subtasks) ? task.subtasks : [];
        const approvedSubtasks = subtasks.filter((subtask: any) => subtask.approved).length;
        const totalSubtasks = subtasks.length;
        
        return (
          <div className="space-y-1">
            {statusBadges[value as keyof typeof statusBadges] || <Badge className="bg-gray-100 text-gray-800 border border-gray-200">{value}</Badge>}
            {totalSubtasks > 0 && (
              <div className="text-xs text-gray-500">
                อนุมัติแล้ว: {approvedSubtasks}/{totalSubtasks} ขั้นตอน
              </div>
            )}
          </div>
        );
      },
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
    setViewingTask(task);
    setViewDetailsModalOpen(true);
  };

  const handleDelete = (task: Task) => {
    if (confirm(`คุณต้องการลบงาน "${task.title}" หรือไม่?`)) {
      deleteMutation.mutate(task.id);
    }
  };

  const handleApprove = (task: Task) => {
    setApprovingTask(task);
    setApprovalModalOpen(true);
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
        onApprove={handleApprove}
        isLoading={isLoading}
        statusFilters={[
          { key: "pending", label: "รอดำเนินการ", count: tasks?.filter((task: Task) => task.status === "pending").length || 0 },
          { key: "in_progress", label: "กำลังดำเนินการ", count: tasks?.filter((task: Task) => task.status === "in_progress").length || 0 },
          { key: "completed", label: "เสร็จแล้ว", count: tasks?.filter((task: Task) => task.status === "completed").length || 0 },
          { key: "cancelled", label: "ยกเลิก", count: tasks?.filter((task: Task) => task.status === "cancelled").length || 0 },
        ]}
        getItemStatus={(task: Task) => task.status || "pending"}
      />

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
      />

      <ViewDetailsModal
        isOpen={viewDetailsModalOpen}
        onClose={() => setViewDetailsModalOpen(false)}
        title="รายละเอียดงาน"
        data={viewingTask ? [
          { label: "ชื่องาน", value: viewingTask.title || "-" },
          { label: "ผู้รับผิดชอบ", value: viewingTask.responsible || "-" },
          { label: "สถานะ", value: getStatusBadge(viewingTask.status || "pending"), highlight: true },
          { label: "ความสำคัญ", value: getPriorityBadge(viewingTask.priority || "medium"), highlight: true },
          { label: "ความคืบหน้า", value: `${viewingTask.progress || 0}%` },
          { label: "วันที่เริ่มต้น", value: viewingTask.startDate ? format(new Date(viewingTask.startDate), "dd/MM/yyyy") : "-" },
          { label: "กำหนดส่ง", value: viewingTask.dueDate ? format(new Date(viewingTask.dueDate), "dd/MM/yyyy") : "-" },
          { label: "ผู้อนุมัติ/ไม่อนุมัติ", value: viewingTask.approvedBy || "-" },
          { label: "วันที่อนุมัติ/ไม่อนุมัติ", value: viewingTask.approvedDate ? format(new Date(viewingTask.approvedDate), "dd/MM/yyyy HH:mm") : "-" },
          { label: "หมายเหตุการอนุมัติ/ไม่อนุมัติ", value: viewingTask.approvalNotes || "-" },
          { label: "คำอธิบาย", value: viewingTask.description || "-" },
        ] : []}
        additionalContent={viewingTask?.subtasks && Array.isArray(viewingTask.subtasks) && viewingTask.subtasks.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 thai-font">
              ขั้นตอนการทำงาน
            </h3>
            <div className="space-y-3">
              {viewingTask.subtasks.map((subtask: any, index: number) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="thai-font">
                        ขั้นตอน {index + 1}
                      </Badge>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 thai-font">
                        {subtask.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        // Determine approval status
                        if (subtask.approved === true) {
                          return <Badge className="bg-green-100 text-green-800 border border-green-200 thai-font">อนุมัติแล้ว</Badge>;
                        } else if (subtask.approved === false && subtask.approvedBy) {
                          return <Badge className="bg-red-100 text-red-800 border border-red-200 thai-font">ไม่อนุมัติ</Badge>;
                        } else {
                          return <Badge className="bg-orange-100 text-orange-800 border border-orange-200 thai-font">รออนุมัติ</Badge>;
                        }
                      })()}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 thai-font space-y-1">
                    {subtask.approvedBy && (
                      <div>ผู้อนุมัติ/ไม่อนุมัติ: {subtask.approvedBy}</div>
                    )}
                    {subtask.approvedDate && (
                      <div>อนุมัติ/ไม่อนุมัติเมื่อ: {format(new Date(subtask.approvedDate), "dd/MM/yyyy HH:mm")}</div>
                    )}
                    {subtask.approvalNotes && (
                      <div>หมายเหตุ: {subtask.approvalNotes}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      />

      <ApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        task={approvingTask}
        onApprove={(approvalData: { approvedBy: string; notes?: string; subtaskIndex?: number; action?: 'approve' | 'reject'; approvals?: Array<{ subtaskIndex: number; action: 'approve' | 'reject'; notes: string; }> }) => {
          if (approvalData.approvals && approvalData.approvals.length > 0) {
            // Handle batch approvals for multiple subtasks
            const updatedSubtasks = [...(approvingTask!.subtasks as any[] || [])];
            
            approvalData.approvals.forEach(approval => {
              updatedSubtasks[approval.subtaskIndex] = {
                ...updatedSubtasks[approval.subtaskIndex],
                approved: approval.action === 'approve',
                approvedBy: approvalData.approvedBy,
                approvedDate: new Date(),
                approvalNotes: approval.notes
              };
            });
            
            updateTaskMutation.mutate({
              id: approvingTask!.id,
              data: { subtasks: updatedSubtasks }
            });
            setApprovalModalOpen(false);
            setApprovingTask(null);
          } else if (approvalData.action === 'reject') {
            // Reject task
            updateTaskMutation.mutate({
              id: approvingTask!.id,
              data: { 
                status: "cancelled",
                approvedBy: approvalData.approvedBy,
                approvedDate: new Date(),
                approvalNotes: approvalData.notes || ""
              }
            });
            setApprovalModalOpen(false);
            setApprovingTask(null);
          } else if (approvalData.subtaskIndex !== undefined) {
            // Approve specific subtask (legacy support)
            const updatedSubtasks = [...(approvingTask!.subtasks as any[] || [])];
            updatedSubtasks[approvalData.subtaskIndex] = {
              ...updatedSubtasks[approvalData.subtaskIndex],
              approved: approvalData.action === 'approve',
              approvedBy: approvalData.approvedBy,
              approvedDate: new Date(),
              approvalNotes: approvalData.notes || ""
            };
            
            updateTaskMutation.mutate({
              id: approvingTask!.id,
              data: { subtasks: updatedSubtasks }
            });
          } else {
            // Approve entire task
            const newStatus = approvingTask!.status === "cancelled" ? "pending" : "in_progress";
            updateTaskMutation.mutate({
              id: approvingTask!.id,
              data: { 
                status: newStatus,
                approvedBy: approvalData.approvedBy,
                approvedDate: new Date(),
                approvalNotes: approvalData.notes || ""
              }
            });
            setApprovalModalOpen(false);
            setApprovingTask(null);
          }
        }}
      />
    </div>
  );
}

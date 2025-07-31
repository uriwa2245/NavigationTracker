import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Task } from "@shared/schema";
import { format } from "date-fns";

interface ApprovalData {
  approvedBy: string;
  notes?: string;
  subtaskIndex?: number;
  action?: 'approve' | 'reject';
  approvals?: Array<{
    subtaskIndex: number;
    action: 'approve' | 'reject';
    notes: string;
  }>;
}

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onApprove: (data: ApprovalData) => void;
}

interface StepApproval {
  index: number;
  approval: 'pending' | 'approved' | 'rejected';
  remarks: string;
}

export default function ApprovalModal({ isOpen, onClose, task, onApprove }: ApprovalModalProps) {
  const [approvedBy, setApprovedBy] = useState("");
  const [stepApprovals, setStepApprovals] = useState<StepApproval[]>([]);

  const subtasks = task?.subtasks && Array.isArray(task.subtasks) ? task.subtasks : [];

  // Get stored approver name for this task
  const getStoredApproverName = (taskId: number) => {
    try {
      const stored = localStorage.getItem(`approver_${taskId}`);
      return stored || "";
    } catch (error) {
      console.error("Error reading stored approver name:", error);
      return "";
    }
  };

  // Store approver name for this task
  const storeApproverName = (taskId: number, approverName: string) => {
    try {
      localStorage.setItem(`approver_${taskId}`, approverName);
    } catch (error) {
      console.error("Error storing approver name:", error);
    }
  };

  // Initialize step approvals when task changes
  useEffect(() => {
    if (task && subtasks.length > 0) {
      const initialApprovals = subtasks.map((subtask: any, index) => {
        let approvalStatus: 'pending' | 'approved' | 'rejected' = 'pending';
        
        // Check if subtask has approval information
        if (subtask.approved !== undefined) {
          if (subtask.approved === true) {
            approvalStatus = 'approved';
          } else if (subtask.approved === false && subtask.approvedBy) {
            // If not approved but has approver, it was rejected
            approvalStatus = 'rejected';
          } else {
            approvalStatus = 'pending';
          }
        }
        
        return {
          index,
          approval: approvalStatus,
          remarks: subtask.approvalNotes || ''
        };
      });
      setStepApprovals(initialApprovals);

      // Auto-fill approver name if available
      const storedApproverName = getStoredApproverName(task.id);
      if (storedApproverName) {
        setApprovedBy(storedApproverName);
      }
    } else {
      setStepApprovals([]);
    }
  }, [task, subtasks]);

  const handleStepApprovalChange = (index: number, approval: 'pending' | 'approved' | 'rejected') => {
    setStepApprovals(prev => 
      prev.map(step => 
        step.index === index ? { ...step, approval } : step
      )
    );
  };

  const handleStepRemarksChange = (index: number, remarks: string) => {
    setStepApprovals(prev => 
      prev.map(step => 
        step.index === index ? { ...step, remarks } : step
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSubmit called");
    console.log("approvedBy:", approvedBy);
    console.log("stepApprovals:", stepApprovals);
    
    if (!approvedBy.trim()) {
      console.log("No approver name provided");
      return;
    }

    // Store the approver name for this task
    if (task) {
      storeApproverName(task.id, approvedBy.trim());
    }

    // Collect all approvals that need to be processed
    const approvalsToProcess = stepApprovals.filter(stepApproval => 
      stepApproval.approval !== 'pending'
    );

    console.log("approvalsToProcess:", approvalsToProcess);

    if (approvalsToProcess.length === 0) {
      // No approvals to process, just close the modal
      console.log("No approvals to process, closing modal");
      handleClose();
      return;
    }

    // Send all approvals as a single batch
    const approvalBatch = {
      approvedBy: approvedBy.trim(),
      approvals: approvalsToProcess.map(stepApproval => ({
        subtaskIndex: stepApproval.index,
        action: stepApproval.approval === 'approved' ? 'approve' : 'reject' as 'approve' | 'reject',
        notes: stepApproval.remarks
      }))
    };

    console.log("approvalBatch:", approvalBatch);

    // Call onApprove with the batch
    onApprove(approvalBatch as any);

    // Reset form
    setApprovedBy("");
    setStepApprovals([]);
    onClose();
  };

  const handleClose = () => {
    // Don't clear approvedBy to keep the stored name
    setStepApprovals([]);
    onClose();
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          {/* <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            onClick={handleClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button> */}
          
          <h3 className="text-lg font-semibold text-gray-800 thai-font pr-8">
            อนุมัติงาน: {task.title}
          </h3>
        </div>

        <form id="approval-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Task Information */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div><span className="font-medium thai-font">รหัสงาน:</span> {task.id}</div>
              <div><span className="font-medium thai-font">ผู้รับผิดชอบ:</span> {task.responsible}</div>
              <div><span className="font-medium thai-font">กำหนดส่ง:</span> {task.dueDate ? format(new Date(task.dueDate), "dd/MM/yyyy") : "ไม่ระบุ"}</div>
              <div><span className="font-medium thai-font">สถานะ:</span> {
                task.status === "pending" ? "รอดำเนินการ" : 
                task.status === "in_progress" ? "กำลังดำเนินการ" :
                task.status === "completed" ? "เสร็จสิ้น" : "ยกเลิก"
              }</div>
              <div><span className="font-medium thai-font">ความคืบหน้า:</span> {task.progress || 0}%</div>
            </div>

            {/* Approver Information */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 thai-font">
                ผู้อนุมัติ *
              </label>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                placeholder="กรอกชื่อผู้อนุมัติ"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 thai-font"
                required
              />
            </div>

            {/* Steps Approval Section */}
            {subtasks.length > 0 ? (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700 thai-font">ขั้นตอนที่ต้องอนุมัติ</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {subtasks.map((subtask: any, idx) => {
                    const stepApproval = stepApprovals.find(step => step.index === idx);
                    return (
                      <div key={idx} className="bg-white border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={stepApproval?.approval === 'approved'}
                              readOnly
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className={`thai-font ${
                              stepApproval?.approval === 'approved' ? "line-through text-gray-500" : 
                              stepApproval?.approval === 'rejected' ? "line-through text-red-500" : ""
                            }`}>
                              {subtask.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Completion Status */}
                            <div className={`px-2 py-1 rounded text-xs thai-font ${
                              subtask.completed 
                                ? "bg-green-100 text-green-800 border border-green-200" 
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}>
                              {subtask.completed ? "ทำแล้ว" : "ยังไม่ทำ"}
                            </div>
                            {/* Approval Status */}
                            <select
                              className="border border-gray-300 rounded-lg px-3 py-1.5 thai-font"
                              value={stepApproval?.approval || 'pending'}
                              onChange={(e) => handleStepApprovalChange(idx, e.target.value as 'pending' | 'approved' | 'rejected')}
                            >
                              <option value="pending">รออนุมัติ</option>
                              <option value="approved">อนุมัติ</option>
                              <option value="rejected">ไม่อนุมัติ</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 thai-font"
                            placeholder="หมายเหตุ (ถ้ามี)"
                            value={stepApproval?.remarks || ''}
                            onChange={(e) => handleStepRemarksChange(idx, e.target.value)}
                          />
                        </div>
                        {subtask.description && (
                          <div className="text-sm text-gray-600 thai-font">
                            {subtask.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 thai-font">
                  งานนี้ไม่มีขั้นตอนการทำงานที่กำหนดไว้
                </p>
              </div>
            )}
          </div>
        </form>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 thai-font"
              onClick={handleClose}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              form="approval-form"
              className="px-4 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg thai-font"
            >
              บันทึกการอนุมัติ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
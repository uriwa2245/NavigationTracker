import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertTaskSchema, Task, InsertTask } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
}

const statusOptions = [
  { value: "pending", label: "รอดำเนินการ" },
  { value: "in_progress", label: "กำลังดำเนินการ" },
  { value: "completed", label: "เสร็จสิ้น" },
  { value: "cancelled", label: "ยกเลิก" },
];

const priorityOptions = [
  { value: "low", label: "ต่ำ" },
  { value: "medium", label: "กลาง" },
  { value: "high", label: "สูง" },
];

const responsibleOptions = [
  { value: "staff1", label: "นาย ก. ใจดี" },
  { value: "staff2", label: "นาง ข. มานะ" },
  { value: "staff3", label: "นาย ค. รู้ดี" },
  { value: "staff4", label: "นาง ง. ขยัน" },
  { value: "staff5", label: "นาย จ. สมาร์ท" },
];

export default function TaskFormModal({ isOpen, onClose, task }: TaskFormModalProps) {
  const { toast } = useToast();
  const isEditing = !!task;

  const form = useForm<InsertTask>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: task
      ? {
          // Exclude 'id' and ensure 'subtasks' is not unknown
          title: task.title ?? "",
          description: task.description ?? "",
          responsible: task.responsible ?? "",
          startDate: task.startDate ?? null,
          dueDate: task.dueDate ?? null,
          status: task.status ?? "pending",
          priority: task.priority ?? "medium",
          progress: task.progress ?? 0,
          subtasks: (task.subtasks ?? null) as any, // Cast to any if needed, or use correct type
        }
      : {
          title: "",
          description: "",
          responsible: "",
          startDate: null,
          dueDate: null,
          status: "pending",
          priority: "medium",
          progress: 0,
          subtasks: null,
        },
  });

  // เพิ่ม useFieldArray สำหรับ subtasks
  const { fields: subtaskFields, append, remove, update } = useFieldArray<InsertTask>({
    control: form.control,
    name: "subtasks",
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertTask) => {
      if (isEditing) {
        return await apiRequest("PATCH", `/api/tasks/${task.id}`, data);
      } else {
        return await apiRequest("POST", "/api/tasks", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "สำเร็จ",
        description: isEditing ? "แก้ไขงานเรียบร้อยแล้ว" : "เพิ่มงานเรียบร้อยแล้ว",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertTask) => {
    // Clean data by converting empty strings to null for optional fields
    const cleanedData = {
      ...data,
      description: data.description || null,
      startDate: data.startDate || null,
      dueDate: data.dueDate || null,
      status: data.status || null,
      priority: data.priority || null,
      progress: data.progress || null,
      subtasks: data.subtasks || null,
    };
    
    mutation.mutate(cleanedData);
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  const progressValue = form.watch("progress") || 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="thai-font">
            {isEditing ? "แก้ไขงาน" : "เพิ่มงานใหม่"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="thai-font">ชื่องาน *</FormLabel>
                    <FormControl>
                      <Input placeholder="ชื่องาน" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="thai-font">รายละเอียด</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="รายละเอียดงาน..."
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsible"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">ผู้รับผิดชอบ *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกผู้รับผิดชอบ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {responsibleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">ความสำคัญ</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "medium"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกความสำคัญ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">วันที่เริ่มต้น</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">กำหนดส่ง</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">สถานะ</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "pending"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกสถานะ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">ความคืบหน้า ({progressValue}%)</FormLabel>
                    <FormControl>
                      <div className="px-3">
                        <Slider
                          min={0}
                          max={100}
                          step={5}
                          value={[field.value || 0]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="w-full"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* เพิ่มส่วนของขั้นตอนย่อย */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <FormLabel className="thai-font">ขั้นตอนย่อยของงาน</FormLabel>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => append({ title: "", approved: false })}
                  >
                    เพิ่มขั้นตอน
                  </Button>
                </div>
                {subtaskFields.length === 0 && (
                  <div className="text-gray-400 text-sm mb-2">ยังไม่มีขั้นตอนย่อย</div>
                )}
                <div className="space-y-3">
                  {subtaskFields.map((subtask, idx) => (
                    <div key={subtask.id} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`subtasks.${idx}.title`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder={`ขั้นตอนที่ ${idx + 1}`}
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`subtasks.${idx}.approved`}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-1">
                            <FormLabel className="thai-font text-xs">อนุมัติ</FormLabel>
                            <Select
                              value={field.value === true ? "approved" : field.value === false ? "not_approved" : ""}
                              onValueChange={(val) => field.onChange(val === "approved")}
                            >
                              <FormControl>
                                <SelectTrigger className="w-24 h-8 text-xs">
                                  <SelectValue placeholder="เลือก" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="approved">อนุมัติ</SelectItem>
                                <SelectItem value="not_approved">ไม่อนุมัติ</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => remove(idx)}
                        title="ลบขั้นตอน"
                      >
                        <span className="text-lg text-red-500">&times;</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={handleClose}>
                ยกเลิก
              </Button>
              <Button
                type="submit"
                className="lab-button-primary"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { insertTaskSchema, Task, InsertTask } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
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

const priorityOptions = [
  { value: "low", label: "ต่ำ" },
  { value: "medium", label: "กลาง" },
  { value: "high", label: "สูง" },
];

const LOCAL_STORAGE_KEY = "taskFormData"; // Define a unique key for local storage

// Form schema for frontend (using strings for dates)
const formSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่องาน"),
  description: z.string().optional(),
  responsible: z.string().min(1, "กรุณาเลือกผู้รับผิดชอบ"),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.string().default("pending"),
  priority: z.string().default("medium"),
  progress: z.number().min(0).max(100).default(0),
  subtasks: z.array(z.object({
    title: z.string().min(1, "กรุณากรอกชื่องานย่อย"),
    completed: z.boolean().default(false),
    approved: z.boolean().default(false), // Add new approved field
  })).optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

export default function TaskFormModal({ isOpen, onClose, task }: TaskFormModalProps) {
  const { toast } = useToast();
  const isEditing = !!task;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      responsible: "",
      startDate: "",
      dueDate: "",
      status: "pending",
      priority: "medium",
      progress: 0,
      subtasks: [],
    },
  });

  // Reset form when task prop changes
  useEffect(() => {
    if (isOpen) {
      if (task) {
        const formData = {
          title: task.title ?? "",
          description: task.description ?? "",
          responsible: task.responsible ?? "",
          startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : "",
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
          status: task.status ?? "pending",
          priority: task.priority ?? "medium",
          progress: task.progress ?? 0,
          subtasks: Array.isArray(task.subtasks) ? task.subtasks.map(sub => ({
            ...sub,
            completed: sub.completed ?? false,
            approved: sub.approved ?? false, // Initialize approved field
          })) : [],
        };
        form.reset(formData);
      } else {
        // Load data from local storage if no task is being edited
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            form.reset(parsedData);
          } catch (error) {
            console.error("Failed to parse stored form data:", error);
            localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear invalid data
          }
        } else {
          form.reset({
            title: "",
            description: "",
            responsible: "",
            startDate: "",
            dueDate: "",
            status: "pending",
            priority: "medium",
            progress: 0,
            subtasks: [],
          });
        }
      }
    }
  }, [task, isOpen, form]);

  // Save form data to local storage on change
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      // Only save if the modal is open and not in editing mode
      if (isOpen && !isEditing) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isOpen, isEditing]);

  // เพิ่ม useFieldArray สำหรับ subtasks
  const { fields: subtaskFields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "subtasks",
  });

  const calculateProgress = () => {
    const subtasks = form.getValues("subtasks");
    if (!subtasks || subtasks.length === 0) {
      return 0;
    }
    const completedSubtasks = subtasks.filter(sub => sub.completed).length;
    return Math.round((completedSubtasks / subtasks.length) * 100);
  };

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith("subtasks") || name === "subtasks") {
        form.setValue("progress", calculateProgress(), { shouldDirty: true, shouldValidate: true });
        
        // Update status based on progress
        const newProgress = calculateProgress();
        let newStatus = "pending";
        if (newProgress === 100) {
          newStatus = "completed";
        } else if (newProgress > 0) {
          newStatus = "in_progress";
        }
        form.setValue("status", newStatus, { shouldDirty: true, shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, calculateProgress]);

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
      localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear local storage on successful submission
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    // Transform form data to API format
    const apiData = {
      title: data.title,
      responsible: data.responsible,
      status: data.status || "pending",
      priority: data.priority || "medium", 
      progress: data.progress || 0,
      description: data.description || null,
      startDate: data.startDate && data.startDate !== "" ? `${data.startDate}T00:00:00Z` : null,
      dueDate: data.dueDate && data.dueDate !== "" ? `${data.dueDate}T00:00:00Z` : null,
      subtasks: Array.isArray(data.subtasks) && data.subtasks.length > 0 ? data.subtasks : null,
    };
    
    mutation.mutate(apiData as any);
  };

  const handleClose = () => {
    onClose();
    form.reset();
    localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear local storage on modal close
  };

  const progressValue = form.watch("progress") || 0;

  const subtasks = form.watch("subtasks");
  const stepTotal = subtasks ? subtasks.length : 0;
  const stepDone = subtasks ? subtasks.filter(sub => sub.completed).length : 0;
  const stepPercent = stepTotal === 0 ? 0 : Math.round((stepDone / stepTotal) * 100);

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
                    <FormControl>
                      <Input
                        placeholder="กรอกชื่อผู้รับผิดชอบ"
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
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
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
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
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
                    <FormControl>
                      <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 flex items-center justify-center text-gray-600 thai-font">
                        {stepPercent === 0 ? "รอดำเนินการ" : 
                         stepPercent === 100 ? "เสร็จสิ้น" : 
                         stepPercent > 0 ? "กำลังดำเนินการ" : "รอดำเนินการ"}
                      </div>
                    </FormControl>
                    <input
                      type="hidden"
                      {...field}
                      value={stepPercent === 0 ? "pending" : 
                             stepPercent === 100 ? "completed" : 
                             stepPercent > 0 ? "in_progress" : "pending"}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">ความคืบหน้า</FormLabel>
                    <FormControl>
                      <div className="px-3">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${stepPercent}%` }}></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{stepDone}/{stepTotal} ขั้นตอน</div>
                        {/* Hidden slider to keep form data synchronized */}
                        <Input
                          type="hidden"
                          {...field}
                          value={field.value || 0}
                          onChange={(e) => field.onChange(Number(e.target.value))}
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
                    onClick={() => append({ title: "", completed: false, approved: false })}
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
                        name={`subtasks.${idx}.completed`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={(e) => {
                                  field.onChange(e.target.checked);
                                  form.trigger("progress"); // Trigger validation for progress after checkbox change
                                }}
                                className="form-checkbox h-4 w-4 text-blue-600"
                              />
                            </FormControl>
                            <FormLabel className="thai-font text-sm font-normal">สำเร็จ</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`subtasks.${idx}.approved`}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-1">
                            <div className="w-28 h-8 text-xs border border-gray-300 rounded-lg px-3 py-1.5 bg-gray-100 flex items-center justify-center text-gray-600">
                              {field.value ? "อนุมัติแล้ว" : "รออนุมัติ"}
                            </div>
                          </FormItem>
                        )}
                      />
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

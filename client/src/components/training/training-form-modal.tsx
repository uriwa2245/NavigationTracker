import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertTrainingSchema, Training, InsertTraining } from "@shared/schema";
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

interface TrainingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  training?: Training | null;
}

const assessmentLevelOptions = [
  { value: 1, label: "ระดับ 1" },
  { value: 2, label: "ระดับ 2" },
  { value: 3, label: "ระดับ 3" },
];

const resultOptions = [
  { value: "passed", label: "ผ่าน" },
  { value: "failed", label: "ไม่ผ่าน" },
];

const traineeOptions = [
  { value: "staff1", label: "นาย ก. ใจดี" },
  { value: "staff2", label: "นาง ข. มานะ" },
  { value: "staff3", label: "นาย ค. รู้ดี" },
  { value: "staff4", label: "นาง ง. ขยัน" },
  { value: "staff5", label: "นาย จ. สมาร์ท" },
];

const trainerOptions = [
  { value: "trainer1", label: "อ.ดร. สมศักดิ์ ใจดี" },
  { value: "trainer2", label: "ผศ.ดร. สมปอง มานะ" },
  { value: "trainer3", label: "อ.สมชาย รู้ดี" },
];

export default function TrainingFormModal({ isOpen, onClose, training }: TrainingFormModalProps) {
  const { toast } = useToast();
  const isEditing = !!training;

  const form = useForm<InsertTraining>({
    resolver: zodResolver(insertTrainingSchema),
    defaultValues: training || {
      sequence: "",
      course: "",
      startDate: null,
      endDate: null,
      assessmentLevel: null,
      result: null,
      trainee: "",
      acknowledgedDate: null,
      trainer: "",
      signedDate: null,
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertTraining) => {
      if (isEditing) {
        return await apiRequest("PATCH", `/api/training/${training.id}`, data);
      } else {
        return await apiRequest("POST", "/api/training", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training"] });
      toast({
        title: "สำเร็จ",
        description: isEditing ? "แก้ไขการฝึกอบรมเรียบร้อยแล้ว" : "เพิ่มการฝึกอบรมเรียบร้อยแล้ว",
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

  const onSubmit = (data: InsertTraining) => {
    mutation.mutate(data);
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="thai-font">
            {isEditing ? "แก้ไขการฝึกอบรม" : "เพิ่มการฝึกอบรมใหม่"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="sequence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">ลำดับ</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น TR-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="course"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="thai-font">รายละเอียด/หลักสูตร *</FormLabel>
                    <FormControl>
                      <Input placeholder="ชื่อหลักสูตรหรือรายละเอียดการฝึกอบรม" {...field} />
                    </FormControl>
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
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">วันที่สิ้นสุด</FormLabel>
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
                name="assessmentLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">การประเมิน</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกระดับ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assessmentLevelOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
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
                name="result"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">ผลการฝึกอบรม</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกผล" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {resultOptions.map((option) => (
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
                name="trainee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">ชื่อผู้เข้าอบรม (รับทราบ) *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกผู้เข้าอบรม" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {traineeOptions.map((option) => (
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
                name="acknowledgedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">วันที่รับทราบ</FormLabel>
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
                name="trainer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">ชื่อผู้ฝึกอบรม (ลงนาม)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกผู้ฝึกอบรม" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {trainerOptions.map((option) => (
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
                name="signedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">วันที่ลงนาม</FormLabel>
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
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 lg:col-span-3">
                    <FormLabel className="thai-font">หมายเหตุ</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="ข้อมูลเพิ่มเติม..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertMsdsSchema, Msds, InsertMsds } from "@shared/schema";
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

interface MsdsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  msds?: Msds | null;
}

const categoryOptions = [
  { value: "sds_lab", label: "SDS-LAB" },
  { value: "sds_product", label: "SDS-Product" },
  { value: "sds_rm", label: "SDS-RM" },
];

export default function MsdsFormModal({ isOpen, onClose, msds }: MsdsFormModalProps) {
  const { toast } = useToast();
  const isEditing = !!msds;

  const form = useForm<InsertMsds>({
    resolver: zodResolver(insertMsdsSchema),
    defaultValues: msds || {
      sequence: "",
      title: "",
      documentCode: "",
      effectiveDate: null,
      revision: 0,
      category: "",
      filePath: "",
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertMsds) => {
      if (isEditing) {
        return await apiRequest("PATCH", `/api/msds/${msds.id}`, data);
      } else {
        return await apiRequest("POST", "/api/msds", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/msds"] });
      toast({
        title: "สำเร็จ",
        description: isEditing ? "แก้ไข MSDS เรียบร้อยแล้ว" : "เพิ่ม MSDS เรียบร้อยแล้ว",
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

  const onSubmit = (data: InsertMsds) => {
    // Clean data by converting empty strings to null for optional fields
    const cleanedData = {
      ...data,
      sequence: data.sequence || null,
      effectiveDate: data.effectiveDate || null,
      revision: data.revision || null,
      filePath: data.filePath || null,
      notes: data.notes || null,
    };
    
    mutation.mutate(cleanedData);
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="thai-font">
            {isEditing ? "แก้ไข MSDS" : "เพิ่ม MSDS ใหม่"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="sequence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">ลำดับ</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น 001" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documentCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">รหัสเอกสาร *</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น MSDS-2024-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="thai-font">ชื่อเอกสาร *</FormLabel>
                    <FormControl>
                      <Input placeholder="ชื่อเอกสาร MSDS" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">หมวดหมู่ *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกหมวดหมู่" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((option) => (
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
                name="effectiveDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">วันที่เริ่มใช้</FormLabel>
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
                name="revision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">ปรับปรุงครั้งที่</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="filePath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">แนบไฟล์</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // In a real implementation, you would upload the file
                            field.onChange(`/uploads/msds/${file.name}`);
                          }
                        }}
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
                  <FormItem className="md:col-span-2">
                    <FormLabel className="thai-font">หมายเหตุ</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="ข้อมูลเพิ่มเติม..."
                        {...field}
                        value={field.value ?? ""}
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

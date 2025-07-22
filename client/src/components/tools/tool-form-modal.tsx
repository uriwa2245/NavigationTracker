import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { insertToolSchema, Tool, InsertTool } from "@shared/schema";
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

interface ToolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool?: Tool | null;
}

const locationOptions = [
  { value: "lab-a-101", label: "ห้องแลป A-101" },
  { value: "lab-b-205", label: "ห้องแลป B-205" },
  { value: "lab-c-301", label: "ห้องแลป C-301" },
];

const responsibleOptions = [
  { value: "staff1", label: "นาย ก. ใจดี" },
  { value: "staff2", label: "นาง ข. มานะ" },
  { value: "staff3", label: "นาย ค. รู้ดี" },
];

export default function ToolFormModal({ isOpen, onClose, tool }: ToolFormModalProps) {
  const { toast } = useToast();
  const isEditing = !!tool;

  const form = useForm<InsertTool>({
    resolver: zodResolver(insertToolSchema),
    defaultValues: {
      code: "",
      name: "",
      brand: "",
      serialNumber: "",
      range: "",
      location: "",
      lastCalibration: null,
      nextCalibration: null,
      calibrationStatus: "",
      responsible: "",
      notes: "",
      status: "active",
    },
  });

  // Reset form when tool changes
  useEffect(() => {
    if (tool) {
      form.reset({
        code: tool.code || "",
        name: tool.name || "",
        brand: tool.brand || "",
        serialNumber: tool.serialNumber || "",
        range: tool.range || "",
        location: tool.location || "",
        lastCalibration: tool.lastCalibration || null,
        nextCalibration: tool.nextCalibration || null,
        calibrationStatus: tool.calibrationStatus || "",
        responsible: tool.responsible || "",
        notes: tool.notes || "",
        status: tool.status || "active",
      });
    } else {
      form.reset({
        code: "",
        name: "",
        brand: "",
        serialNumber: "",
        range: "",
        location: "",
        lastCalibration: null,
        nextCalibration: null,
        calibrationStatus: "",
        responsible: "",
        notes: "",
        status: "active",
      });
    }
  }, [tool, form]);

  const mutation = useMutation({
    mutationFn: async (data: InsertTool) => {
      if (isEditing) {
        return await apiRequest("PATCH", `/api/tools/${tool.id}`, data);
      } else {
        return await apiRequest("POST", "/api/tools", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      toast({
        title: "สำเร็จ",
        description: isEditing ? "แก้ไขเครื่องมือเรียบร้อยแล้ว" : "เพิ่มเครื่องมือเรียบร้อยแล้ว",
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

  const onSubmit = (data: InsertTool) => {
    // Clean data by converting empty strings and "-" to null for optional fields
    const cleanedData = {
      ...data,
      serialNumber: (data.serialNumber && data.serialNumber !== "-") ? data.serialNumber : null,
      range: (data.range && data.range !== "-") ? data.range : null,
      responsible: (data.responsible && data.responsible !== "-") ? data.responsible : null,
      notes: (data.notes && data.notes !== "-") ? data.notes : null,
      calibrationStatus: (data.calibrationStatus && data.calibrationStatus !== "-") ? data.calibrationStatus : null,
      calibrationResult: (data.calibrationResult && data.calibrationResult !== "-") ? data.calibrationResult : null,
      calibrationCertificate: (data.calibrationCertificate && data.calibrationCertificate !== "-") ? data.calibrationCertificate : null,
      calibrationBy: (data.calibrationBy && data.calibrationBy !== "-") ? data.calibrationBy : null,
      calibrationMethod: (data.calibrationMethod && data.calibrationMethod !== "-") ? data.calibrationMethod : null,
      calibrationRemarks: (data.calibrationRemarks && data.calibrationRemarks !== "-") ? data.calibrationRemarks : null,
      lastCalibration: data.lastCalibration || null,
      nextCalibration: data.nextCalibration || null,
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
            {isEditing ? "แก้ไขเครื่องมือ" : "เพิ่มเครื่องมือใหม่"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">รหัสเครื่องมือ *</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น SCALE-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">ยี่ห้อ / รุ่น *</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น Mettler Toledo / ME204" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">ชื่อเครื่องมือ *</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น เครื่องชั่งดิจิตอล" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">Serial Number</FormLabel>
                    <FormControl>
                      <Input placeholder="หมายเลขผลิต" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">พิสัยการใช้งาน</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น 0-200g" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">สถานที่ตั้ง *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกสถานที่ตั้ง" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locationOptions.map((option) => (
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
                name="lastCalibration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">วันที่สอบเทียบล่าสุด</FormLabel>
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
                name="nextCalibration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">วันที่สอบเทียบครั้งถัดไป</FormLabel>
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
                  name="calibrationResult"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="thai-font">ผลการสอบเทียบ</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกผลการสอบเทียบ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ผ่าน">ผ่าน</SelectItem>
                          <SelectItem value="ไม่ผ่าน">ไม่ผ่าน</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responsible"
                  render={({ field }) => (
                    <FormItem >
                      <FormLabel className="thai-font">ผู้รับผิดชอบ</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
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

            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
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

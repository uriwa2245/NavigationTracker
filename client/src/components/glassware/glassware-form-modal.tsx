import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { insertGlasswareSchema, Glassware, InsertGlassware } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

interface GlasswareFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  glassware?: Glassware | null;
}

const typeOptions = [
  { value: "volumetric_flask", label: "Volumetric Flask" },
  { value: "pipette", label: "Pipette" },
  { value: "burette", label: "Burette" },
  { value: "beaker", label: "Beaker" },
  { value: "graduated_cylinder", label: "Graduated Cylinder" },
];

const classOptions = [
  { value: "A", label: "Class A" },
  { value: "B", label: "Class B" },
  { value: "AS", label: "Class AS" },
];

const locationOptions = [
  { value: "storage-a", label: "ห้องเก็บ A" },
  { value: "storage-b", label: "ห้องเก็บ B" },
  { value: "lab-a-101", label: "ห้องแลป A-101" },
  { value: "lab-b-205", label: "ห้องแลป B-205" },
];

export default function GlasswareFormModal({ isOpen, onClose, glassware }: GlasswareFormModalProps) {
  const { toast } = useToast();
  const isEditing = !!glassware;

  const form = useForm<InsertGlassware>({
    resolver: zodResolver(insertGlasswareSchema),
    defaultValues: {
      code: "",
      lotNumber: "",
      type: "",
      class: "",
      brand: "",
      receivedDate: null,
      location: "",
      lastCalibration: null,
      nextCalibration: null,
      calibrationStatus: "",
      calibrationResult: "",
      responsible: "",
      notes: "",
    },
  });

  // Reset form when glassware prop changes
  useEffect(() => {
    if (isOpen) {
      if (glassware) {
        // Convert dates to strings for form inputs
        const formData = {
          ...glassware,
          receivedDate: glassware.receivedDate ? new Date(glassware.receivedDate).toISOString().split('T')[0] : null,
          lastCalibration: glassware.lastCalibration ? new Date(glassware.lastCalibration).toISOString().split('T')[0] : null,
          nextCalibration: glassware.nextCalibration ? new Date(glassware.nextCalibration).toISOString().split('T')[0] : null,
          // Ensure all fields have string values or null
          lotNumber: glassware.lotNumber || "",
          class: glassware.class || "",
          brand: glassware.brand || "",
          calibrationStatus: glassware.calibrationStatus || "",
          calibrationResult: glassware.calibrationResult || "",
          responsible: glassware.responsible || "",
          notes: glassware.notes || "",
        };
        form.reset(formData as InsertGlassware);
      } else {
        form.reset({
          code: "",
          lotNumber: "",
          type: "",
          class: "",
          brand: "",
          receivedDate: null,
          location: "",
          lastCalibration: null,
          nextCalibration: null,
          calibrationStatus: "",
          calibrationResult: "",
          responsible: "",
          notes: "",
        });
      }
    }
  }, [glassware, isOpen, form]);

  const mutation = useMutation({
    mutationFn: async (data: InsertGlassware) => {
      if (isEditing) {
        return await apiRequest("PATCH", `/api/glassware/${glassware.id}`, data);
      } else {
        return await apiRequest("POST", "/api/glassware", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/glassware"] });
      toast({
        title: "สำเร็จ",
        description: isEditing ? "แก้ไขเครื่องแก้วเรียบร้อยแล้ว" : "เพิ่มเครื่องแก้วเรียบร้อยแล้ว",
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

  const onSubmit = (data: InsertGlassware) => {
    // Clean data by converting empty strings to null for optional fields
    const cleanedData = {
      ...data,
      lotNumber: data.lotNumber || null,
      class: data.class || null,
      brand: data.brand || null,
      receivedDate: data.receivedDate || null,
      lastCalibration: data.lastCalibration || null,
      nextCalibration: data.nextCalibration || null,
      calibrationStatus: data.calibrationStatus || null,
      calibrationResult: data.calibrationResult || null,
      responsible: data.responsible || null,
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
            {isEditing ? "แก้ไขเครื่องแก้ว" : "เพิ่มเครื่องแก้วใหม่"}
          </DialogTitle>
          <DialogDescription className="thai-font">
            กรอกข้อมูลเครื่องแก้วเพื่อจัดการเครื่องแก้วในระบบ
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">รหัส *</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น VF-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lotNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">Lot No./Batch No.</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="หมายเลข Lot/Batch"
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">ประเภทเครื่องแก้ว *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกประเภท" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {typeOptions.map((option) => (
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
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">Class</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือก Class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classOptions.map((option) => (
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
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">ยี่ห้อ</FormLabel>
                    <FormControl>
                      <Input placeholder="ยี่ห้อ" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="receivedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">วันที่รับ</FormLabel>
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
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">สถานที่จัดเก็บ *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกสถานที่" />
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
                    <FormItem>
                      <FormLabel className="thai-font">ผู้รับผิดชอบ</FormLabel>
                      <FormControl>
                        <Input placeholder="ชื่อผู้รับผิดชอบ" {...field} value={field.value ?? ""} />
                      </FormControl>
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

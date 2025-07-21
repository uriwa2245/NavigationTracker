import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertChemicalSchema, Chemical, InsertChemical } from "@shared/schema";
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

interface ChemicalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  chemical?: Chemical | null;
  defaultCategory?: string;
}

const categoryOptions = [
  { value: "qa", label: "สารเคมี QA" },
  { value: "standard", label: "สารมาตรฐาน" },
  { value: "rd", label: "สารเคมี RD" },
];

const gradeOptions = [
  { value: "ACS", label: "ACS" },
  { value: "AR", label: "AR" },
  { value: "GR", label: "GR" },
  { value: "LR", label: "LR" },
  { value: "Standard", label: "Standard" },
];

const locationOptions = [
  { value: "storage-a", label: "ห้องเก็บ A" },
  { value: "storage-b", label: "ห้องเก็บ B" },
  { value: "storage-c", label: "ห้องเก็บ C" },
  { value: "fridge-1", label: "ตู้เย็น 1" },
  { value: "fridge-2", label: "ตู้เย็น 2" },
];

export default function ChemicalFormModal({ 
  isOpen, 
  onClose, 
  chemical, 
  defaultCategory = "qa" 
}: ChemicalFormModalProps) {
  const { toast } = useToast();
  const isEditing = !!chemical;

  const form = useForm<InsertChemical>({
    resolver: zodResolver(insertChemicalSchema),
    defaultValues: chemical || {
      chemicalNo: "",
      code: "",
      casNo: "",
      name: "",
      brand: "",
      grade: "",
      packageSize: "",
      lotNumber: "",
      molecularFormula: "",
      molecularWeight: "",
      receivedDate: null,
      expiryDate: null,
      location: "",
      category: defaultCategory,
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertChemical) => {
      if (isEditing) {
        return await apiRequest("PATCH", `/api/chemicals/${chemical.id}`, data);
      } else {
        return await apiRequest("POST", "/api/chemicals", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chemicals"] });
      toast({
        title: "สำเร็จ",
        description: isEditing ? "แก้ไขสารเคมีเรียบร้อยแล้ว" : "เพิ่มสารเคมีเรียบร้อยแล้ว",
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

  const onSubmit = (data: InsertChemical) => {
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
            {isEditing ? "แก้ไขสารเคมี" : "เพิ่มสารเคมีใหม่"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="chemicalNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">Chemical No *</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น CHEM-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">Code</FormLabel>
                    <FormControl>
                      <Input placeholder="รหัสภายใน" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="casNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">CAS No</FormLabel>
                    <FormControl>
                      <Input placeholder="หมายเลข CAS" {...field} value={field.value ?? ""}  />
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
                    <FormLabel className="thai-font">ชื่อสารเคมี *</FormLabel>
                    <FormControl>
                      <Input placeholder="ชื่อสารเคมี" {...field} />
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
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">เกรด</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกเกรด" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {gradeOptions.map((option) => (
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
                name="packageSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">ขนาดบรรจุ</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น 500g, 1L" {...field} value={field.value ?? ""} />
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
                    <FormLabel className="thai-font">Lot No./Batch No</FormLabel>
                    <FormControl>
                      <Input placeholder="หมายเลข Lot/Batch" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="molecularFormula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">สูตรโมเลกุล</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น H2SO4" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="molecularWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">มวลโมเลกุล</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น 98.08" {...field} value={field.value ?? ""} />
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
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="thai-font">วันที่หมดอายุ</FormLabel>
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
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 lg:col-span-3">
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

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertQaSampleSchema, QaSample, InsertQaSample } from "@shared/schema";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";

interface QaSampleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  qaSample?: QaSample | null;
}

// Enhanced schema for form validation with samples array
const qaSampleFormSchema = insertQaSampleSchema.extend({
  samples: z.array(z.object({
    sampleNo: z.string().min(1, "Sample No จำเป็นต้องระบุ"),
    name: z.string().min(1, "ชื่อตัวอย่างจำเป็นต้องระบุ"),
    description: z.string().optional(),
    analysisRequest: z.string().optional(),
    unit: z.string().optional(),
  })).min(1, "ต้องมีตัวอย่างอย่างน้อย 1 รายการ"),
});

type QaSampleFormData = z.infer<typeof qaSampleFormSchema>;

const deliveryMethodOptions = [
  { value: "pickup", label: "รับด้วยตนเอง" },
  { value: "address_report", label: "จัดส่งตามที่อยู่ระบุในรายงานผลทดสอบ" },
  { value: "address_invoice", label: "จัดส่งตามที่อยู่ระบุในใบกำกับภาษี" },
  { value: "other", label: "อื่นๆ" },
];

const storageOptions = [
  { value: "room_temp", label: "อุณหภูมิห้อง" },
  { value: "chilled", label: "แช่เย็น" },
  { value: "frozen", label: "แช่แข็ง" },
];

const postTestingOptions = [
  { value: "return", label: "รับคืน" },
  { value: "dispose", label: "ไม่รับคืน" },
];

const conditionOptions = [
  { value: "normal", label: "ปกติ" },
  { value: "abnormal", label: "ไม่ปกติ" },
];

export default function QaSampleFormModal({ isOpen, onClose, qaSample }: QaSampleFormModalProps) {
  const { toast } = useToast();
  const isEditing = !!qaSample;

  const defaultSamples = qaSample?.samples || [
    {
      sampleNo: "",
      name: "",
      description: "",
      analysisRequest: "",
      unit: "",
    },
  ];

  const form = useForm<QaSampleFormData>({
    resolver: zodResolver(qaSampleFormSchema),
    defaultValues: qaSample ? {
      ...qaSample,
      samples: defaultSamples,
    } : {
      requestNo: "",
      receivedTime: "",
      receivedDate: new Date(),
      dueDate: new Date(),
      quotationNo: "",
      contactPerson: "",
      phone: "",
      email: "",
      companyName: "",
      address: "",
      deliveryMethod: "",
      samples: defaultSamples,
      storage: "",
      postTesting: "",
      condition: "",
      status: "received",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "samples",
  });

  const mutation = useMutation({
    mutationFn: async (data: QaSampleFormData) => {
      const submitData: InsertQaSample = {
        ...data,
        samples: data.samples,
      };

      if (isEditing) {
        return await apiRequest("PATCH", `/api/qa-samples/${qaSample.id}`, submitData);
      } else {
        return await apiRequest("POST", "/api/qa-samples", submitData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qa-samples"] });
      toast({
        title: "สำเร็จ",
        description: isEditing ? "แก้ไขตัวอย่าง QA เรียบร้อยแล้ว" : "เพิ่มตัวอย่าง QA เรียบร้อยแล้ว",
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

  const saveDraftMutation = useMutation({
    mutationFn: async (data: QaSampleFormData) => {
      const submitData: InsertQaSample = {
        ...data,
        samples: data.samples,
        status: "draft",
      };

      if (isEditing) {
        return await apiRequest("PATCH", `/api/qa-samples/${qaSample.id}`, submitData);
      } else {
        return await apiRequest("POST", "/api/qa-samples", submitData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qa-samples"] });
      toast({
        title: "สำเร็จ",
        description: "บันทึกแบบร่างเรียบร้อยแล้ว",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกแบบร่างได้",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QaSampleFormData) => {
    mutation.mutate(data);
  };

  const onSaveDraft = () => {
    const data = form.getValues();
    saveDraftMutation.mutate(data);
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  const addSample = () => {
    append({
      sampleNo: "",
      name: "",
      description: "",
      analysisRequest: "",
      unit: "",
    });
  };

  const removeSample = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="thai-font">
            {isEditing ? "แก้ไขฟอร์มรับตัวอย่าง QA" : "ฟอร์มรับตัวอย่าง QA"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Staff Information */}
            <Card>
              <CardHeader>
                <CardTitle className="thai-font">ข้อมูลเจ้าหน้าที่</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="requestNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="thai-font">Request No *</FormLabel>
                        <FormControl>
                          <Input placeholder="QA-2024-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="receivedTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="thai-font">เวลารับตัวอย่าง *</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
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
                        <FormLabel className="thai-font">วันที่รับตัวอย่าง *</FormLabel>
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
                        <FormLabel className="thai-font">วันครบกำหนด *</FormLabel>
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
                    name="quotationNo"
                    render={({ field }) => (
                      <FormItem className="lg:col-span-4">
                        <FormLabel className="thai-font">Quotation No</FormLabel>
                        <FormControl>
                          <Input placeholder="เลขที่ใบเสนอราคา" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="thai-font">ข้อมูลผู้ใช้บริการ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="thai-font">ผู้ติดต่อ *</FormLabel>
                        <FormControl>
                          <Input placeholder="ชื่อผู้ติดต่อ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="thai-font">เบอร์โทรศัพท์ *</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="เบอร์โทรศัพท์" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="thai-font">E-mail *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="อีเมล" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Report Information */}
            <Card>
              <CardHeader>
                <CardTitle className="thai-font">ข้อมูลสำหรับรายงานผล</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="thai-font">ชื่อบริษัท *</FormLabel>
                        <FormControl>
                          <Input placeholder="ชื่อบริษัท" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="thai-font">การจัดส่งผลการทดสอบ *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกวิธีการจัดส่ง" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {deliveryMethodOptions.map((option) => (
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

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="thai-font">ที่อยู่</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="ที่อยู่บริษัท..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Sample Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between thai-font">
                  รายละเอียดตัวอย่าง
                  <Button
                    type="button"
                    onClick={addSample}
                    size="sm"
                    className="lab-button-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มตัวอย่าง
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border relative">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name={`samples.${index}.sampleNo`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="thai-font">Sample No *</FormLabel>
                              <FormControl>
                                <Input placeholder="เช่น S001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`samples.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="thai-font">ชื่อตัวอย่าง *</FormLabel>
                              <FormControl>
                                <Input placeholder="ชื่อตัวอย่าง" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`samples.${index}.analysisRequest`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="thai-font">การวิเคราะห์ที่ต้องการ</FormLabel>
                              <FormControl>
                                <Input placeholder="การวิเคราะห์" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`samples.${index}.unit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="thai-font">หน่วย</FormLabel>
                              <FormControl>
                                <Input placeholder="หน่วย" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name={`samples.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="thai-font">รายละเอียดตัวอย่าง</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={2}
                                  placeholder="รายละเอียดเพิ่มเติม..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {fields.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeSample(index)}
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sample Management */}
            <Card>
              <CardHeader>
                <CardTitle className="thai-font">การจัดการตัวอย่าง</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="storage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="thai-font">การเก็บรักษา *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกวิธีการเก็บรักษา" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {storageOptions.map((option) => (
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
                    name="postTesting"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="thai-font">ตัวอย่างหลังการทดสอบ *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกการจัดการ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {postTestingOptions.map((option) => (
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
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="thai-font">สภาพตัวอย่าง *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกสภาพ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {conditionOptions.map((option) => (
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
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={handleClose}>
                ยกเลิก
              </Button>
              <Button
                type="button"
                onClick={onSaveDraft}
                className="lab-button-warning"
                disabled={saveDraftMutation.isPending}
              >
                {saveDraftMutation.isPending ? "กำลังบันทึก..." : "บันทึกแบบร่าง"}
              </Button>
              <Button
                type="submit"
                className="lab-button-primary"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "กำลังส่ง..." : "ส่งรายการ"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

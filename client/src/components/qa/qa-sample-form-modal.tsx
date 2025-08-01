import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
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

// Mockup ข้อมูลฐานข้อมูลสำหรับ Item Test details
const itemTestDatabase = [
  {
    sampleName: "Xylene",
    itemTest: "Appearance",
    specification: "Clear to pale off-white transparent liquid",
    unit: "-",
    method: "In house method : W-QA-13"
  },
  {
    sampleName: "Xylene",
    itemTest: "pH",
    specification: "5.0-8.0",
    unit: "-",
    method: "In house method : W-QA-09 based on Collaborative International Pesticide Analytical Council, CIPAC, F(MT-75), page 205-206	"
  },
  {
    sampleName: "Xylene",
    itemTest: "Moisture",
    specification: "-",
    unit: "%",
    method: "In house method : W-QA-25"
  },
  {
    sampleName: "Imidacloprid 10%EC",
    itemTest: "Appearance",
    specification: "Sulphur yellow /Butter cup/ sundae transparent liquid",
    unit: "-",
    method: "In house method : W-QA-13"
  },
  {
    sampleName: "Imidacloprid 10%EC",
    itemTest: "ActiveIngredient",
    specification: "9.00-11.00",
    unit: "%w/w",
    method: "In house method : W-QA-07 based on Collaborative International Pesticide Analytical Council, CIPAC, Vol.K, page 70-76"
  },
  {
    sampleName: "Imidacloprid 10%EC",
    itemTest: "pH",
    specification: "4.0-9.0",
    unit: "",
    method: "In house method : W-QA-09 based on Collaborative International Pesticide Analytical Council, CIPAC, F(MT-75), page 205-206"
  },
  {
    sampleName: "Imidacloprid 10%EC",
    itemTest: "Accelerated storage",
    specification: "Pass",
    unit: "-",
    method: "In house method : W-QA-10 based on Collaborative International Pesticide Analytical Council,CIPAC,Vol. J(MT-46.3),page 128-130"
  },
  {
    sampleName: "Imidacloprid 10%EC",
    itemTest: "Moisture",
    specification: "Pass",
    unit: "%",
    method: "In house method : W-QA-25"
  },
  {
    sampleName: "Cypermethrin 3.0%WP",
    itemTest: "Appearance",
    specification: "Pearl white powder",
    unit: "-",
    method: "In house method : W-QA-13"
  },
  {
    sampleName: "Cypermethrin 3.0%WP",
    itemTest: "ActiveIngredient",
    specification: "2.70-3.30",
    unit: "%w/w",
    method: "In house method : W-QA-03 based on Collaborative International Pesticide Analytical Council, CIPAC, Vol.1C, page 2052-2059"
  },
  {
    sampleName: "Cypermethrin 3.0%WP",
    itemTest: "pH",
    specification: "4.0-9.0",
    unit: "-",
    method: "In house method : W-QA-09 based on Collaborative International Pesticide Analytical Council, CIPAC, F(MT-75), page 205-206"
  },
  {
    sampleName: "Cypermethrin 3.0%WP",
    itemTest: "AcceleratedStorage",
    specification: "Pass",
    unit: "-",
    method: "In house method : W-QA-10 based on Collaborative International Pesticide Analytical Council,CIPAC,Vol. J(MT-46.3),page 128-130"
  },
  {
    sampleName: "Cypermethrin 3.0%WP",
    itemTest: "Moisture",
    specification: "Pass",
    unit: "%",
    method: "In house method : W-QA-25"
  }
];

// รายชื่อตัวอย่างที่มีในระบบ
const sampleNameOptions = [
  { value: "Xylene", label: "Xylene" },
  { value: "Imidacloprid 10%EC", label: "Imidacloprid 10%EC" },
  { value: "Cypermethrin 3.0%WP", label: "Cypermethrin 3.0%WP" },
  { value: "Deltamethrin 5%", label: "Deltamethrin 5%" },
  { value: "Jasoxx A26", label: "Jasoxx A26" },
  { value: "Fipronil 25%", label: "Fipronil 25%" }
];

// ฟังก์ชันค้นหาข้อมูล Item Test details
function getItemTestDetails(sampleName: string, itemTest: string) {
  return itemTestDatabase.find(
    (item) => item.sampleName === sampleName && item.itemTest === itemTest
  );
}

interface QaSampleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  qaSample?: QaSample | null;
}

// Form validation schema (separate from server schema)
const qaSampleFormSchema = z.object({
  requestNo: z.string().min(1, "Request No จำเป็นต้องระบุ"),
  receivedTime: z.string().min(1, "Time จำเป็นต้องระบุ"),
  receivedDate: z.date(),
  dueDate: z.date(),
  quotationNo: z.string().optional(),
  contactPerson: z.string().min(1, "ผู้ติดต่อจำเป็นต้องระบุ"),
  phone: z.string().min(1, "เบอร์โทรศัพท์จำเป็นต้องระบุ"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").min(1, "อีเมลจำเป็นต้องระบุ"),
  companyName: z.string().min(1, "ชื่อบริษัทจำเป็นต้องระบุ"),
  address: z.string().optional(),
  deliveryMethod: z.string().min(1, "การจัดส่งจำเป็นต้องเลือก"),
  samples: z.array(z.object({
    sampleNo: z.string().min(1, "Sample No จำเป็นต้องระบุ"),
    names: z.array(z.string().min(1, "ชื่อตัวอย่างไม่สามารถเป็นค่าว่างได้")).min(1, "ต้องระบุชื่อตัวอย่างอย่างน้อย 1 ชื่อ"),
    description: z.string().optional(),
    analysisRequest: z.string().optional(),
    itemTests: z.array(z.object({
      itemTest: z.string().min(1, "Item Test จำเป็นต้องเลือก"),
      specification: z.string().optional(),
      unit: z.string().min(1, "Unit จำเป็นต้องระบุ"),
      method: z.string().optional(),
      sampleName: z.string().optional(),
    })).min(1, "ต้องมี Item Test อย่างน้อย 1 รายการ"),
  })).min(1, "ต้องมีตัวอย่างอย่างน้อย 1 รายการ"),
  storage: z.string().min(1, "Sample storage จำเป็นต้องเลือก"),
  postTesting: z.string().min(1, "ตัวอย่างหลังการทดสอบจำเป็นต้องเลือก"),
  condition: z.string().min(1, "สภาพตัวอย่างจำเป็นต้องเลือก"),
  status: z.string().optional(),
  notes: z.string().optional(),
});

type QaSampleFormData = z.infer<typeof qaSampleFormSchema>;

const deliveryMethodOptions = [
  { value: "pickup", label: "รับด้วยตนเอง" },
  { value: "address_report", label: "จัดส่งตามที่อยู่ระบุในรายงานผลทดสอบ" },
  { value: "address_invoice", label: "จัดส่งตามที่อยู่ระบุในใบกำกับภาษี" },
  { value: "other", label: "อื่นๆ" },
];

const storageOptions = [
  { value: "room_temp", label: "Room temperature" },
  { value: "chilled", label: "Refrigerated" },
  { value: "frozen", label: "Frozen" },
];

const postTestingOptions = [
  { value: "return", label: "รับคืน" },
  { value: "dispose", label: "ไม่รับคืน" },
];

const conditionOptions = [
  { value: "normal", label: "ปกติ" },
  { value: "abnormal", label: "ไม่ปกติ" },
];

const itemTestOptions = [
  { value: "Appearance", label: "Appearance" },
  { value: "ActiveIngredient", label: "% Active Ingredient" },
  { value: "Density", label: "Density" },
  { value: "pH", label: "pH" },
  { value: "Reemulsification", label: "Re-emulsification" },
  { value: "PersistanceFoaming", label: "Persistance foaming" },
  { value: "AcceleratedStorage", label: "Accelerated storage" },
  { value: "Moisture", label: "Moisture" },
  { value: "Viscosity", label: "Viscosity" },
  { value: "FormulaTest", label: "Formula test" },
];

const LOCAL_STORAGE_KEY = "qaSampleFormData"; // Define a unique key for local storage

export default function QaSampleFormModal({ isOpen, onClose, qaSample }: QaSampleFormModalProps) {
  const { toast } = useToast();
  const isEditing = !!qaSample;

  const defaultSamples = Array.isArray(qaSample?.samples) && qaSample?.samples.length > 0
    ? qaSample.samples.map((sample: any) => ({
      ...sample,
      names: Array.isArray(sample.names) && sample.names.length > 0 && sample.names.some((name: string) => name.trim() !== "") 
        ? sample.names.filter((name: string) => name.trim() !== "")
        : [sample.name || ""].filter((name: string) => name.trim() !== ""),
      itemTests: sample.itemTests && Array.isArray(sample.itemTests) && sample.itemTests.length > 0
        ? sample.itemTests
        : [{ itemTest: "", unit: "", specification: "", method: "", sampleName: "" }],
    }))
    : [
      {
        sampleNo: "",
        names: [], // Initialize with empty array - will be handled by form validation
        description: "",
        analysisRequest: "",
        itemTests: [{ itemTest: "", unit: "", specification: "", method: "", sampleName: "" }],
      },
    ];

  const form = useForm<QaSampleFormData>({
    resolver: zodResolver(qaSampleFormSchema),
    mode: "onChange",
    defaultValues: {
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

  // Reset form when qaSample prop changes
  useEffect(() => {
    if (isOpen) {
      if (qaSample) {
        const formSamples = Array.isArray(qaSample?.samples) && qaSample?.samples.length > 0
          ? qaSample.samples.map((sample: any) => ({
              ...sample,
              names: Array.isArray(sample.names) && sample.names.length > 0 && sample.names.some((name: string) => name.trim() !== "") 
                ? sample.names.filter((name: string) => name.trim() !== "")
                : [sample.name || ""].filter((name: string) => name.trim() !== ""),
              itemTests: sample.itemTests && Array.isArray(sample.itemTests) && sample.itemTests.length > 0
                ? sample.itemTests
                : [{ itemTest: "", unit: "", specification: "", method: "", sampleName: "" }],
            }))
          : [
              {
                sampleNo: "",
                names: [], // Initialize with empty array
                description: "",
                analysisRequest: "",
                itemTests: [{ itemTest: "", unit: "", specification: "", method: "", sampleName: "" }],
              },
            ];
        
        const formData: QaSampleFormData = {
          requestNo: qaSample.requestNo || "",
          receivedTime: qaSample.receivedTime || "",
          receivedDate: qaSample.receivedDate ? new Date(qaSample.receivedDate) : new Date(),
          dueDate: qaSample.dueDate ? new Date(qaSample.dueDate) : new Date(),
          quotationNo: qaSample.quotationNo || "",
          contactPerson: qaSample.contactPerson || "",
          phone: qaSample.phone || "",
          email: qaSample.email || "",
          companyName: qaSample.companyName || "",
          address: qaSample.address || "",
          deliveryMethod: qaSample.deliveryMethod || "",
          samples: formSamples,
          storage: qaSample.storage || "",
          postTesting: qaSample.postTesting || "",
          condition: qaSample.condition || "",
          status: qaSample.status || "received",
          notes: qaSample.notes || "",
        };
        form.reset(formData);
      } else {
        // Load data from local storage if no qaSample is being edited
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            // Ensure dates are correctly re-instantiated as Date objects
            parsedData.receivedDate = parsedData.receivedDate ? new Date(parsedData.receivedDate) : new Date();
            parsedData.dueDate = parsedData.dueDate ? new Date(parsedData.dueDate) : new Date();
            form.reset(parsedData);
          } catch (error) {
            console.error("Failed to parse stored form data:", error);
            localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear invalid data
          }
        } else {
          form.reset({
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
          });
        }
      }
    }
  }, [qaSample, isOpen, form]);

  // Save form data to local storage on change
  useEffect(() => {
    const subscription = form.watch((value: any, { name, type }: any) => {
      // Only save if the modal is open and not in editing mode
      if (isOpen && !isEditing) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isOpen, isEditing]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "samples",
  });

  const mutation = useMutation({
    mutationFn: async (data: QaSampleFormData) => {
      // Transform form data to match server schema
      const submitData: InsertQaSample = {
        requestNo: data.requestNo,
        receivedTime: data.receivedTime,
        receivedDate: data.receivedDate,
        dueDate: data.dueDate,
        quotationNo: data.quotationNo || null,
        contactPerson: data.contactPerson,
        phone: data.phone,
        email: data.email,
        companyName: data.companyName,
        address: data.address || null,
        deliveryMethod: data.deliveryMethod,
        samples: data.samples, // This will be stored as JSON
        storage: data.storage,
        postTesting: data.postTesting,
        condition: data.condition,
        status: data.status || "received",
        notes: data.notes || null,
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
      localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear local storage on successful submission
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QaSampleFormData) => {

    mutation.mutate(data);
  };

  const onError = (errors: any) => {
    console.error("Form validation errors:", errors);
  };

  const handleClose = () => {
    onClose();
    form.reset();
    localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear local storage on modal close
  };

  const addSample = () => {
    append({
      sampleNo: "",
      names: [], // Start with empty array
      description: "",
      analysisRequest: "",
      itemTests: [{ itemTest: "", unit: "", specification: "", method: "", sampleName: "" }],
    });
  };

  const removeSample = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="thai-font">
            {isEditing ? "แก้ไขฟอร์มรับตัวอย่าง QA" : "ฟอร์มรับตัวอย่าง QA"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8">
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
                        <FormLabel className="thai-font">Time *</FormLabel>
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
                        <FormLabel className="thai-font">Received date *</FormLabel>
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
                        <FormLabel className="thai-font">Due date *</FormLabel>
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
                          <Input placeholder="เลขที่ใบเสนอราคา" {...field} value={field.value ?? ""} />
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
                            {deliveryMethodOptions.map((option, optionIndex) => (
                              <SelectItem key={`delivery-method-${optionIndex}-${option.value}`} value={option.value}>
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
                          value={field.value ?? ""}
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
                    <div
                      key={`sample-${index}-${field.id}`}
                      className="p-6 bg-white dark:bg-gray-900 rounded-xl border shadow-sm relative space-y-4"
                    >
                      {/* Remove Sample Button - move to top right */}
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeSample(index)}
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 z-10"
                          aria-label="ลบตัวอย่าง"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      )}
                      {/* Sample Header */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                        {/* Sample Name Dropdown */}
                        <div className="space-y-2">
                          <FormLabel className="thai-font">Sample Name *</FormLabel>
                          <div className="space-y-2">
                            {(form.watch(`samples.${index}.names`) || []).length === 0 && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  form.setValue(`samples.${index}.names`, [""]);
                                }}
                                className="w-full"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                เพิ่มชื่อตัวอย่าง
                              </Button>
                            )}
                            {(form.watch(`samples.${index}.names`) || []).map((_: string, nameIdx: number) => (
                              <div key={`sample-name-${index}-${nameIdx}`} className="flex items-center gap-2">
                                <FormField
                                  control={form.control}
                                  name={`samples.${index}.names.${nameIdx}`}
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <Select
                                        onValueChange={(value) => {
                                          field.onChange(value);
                                          
                                          // Auto-fill Item Test details เมื่อเปลี่ยน Sample Name
                                          const itemTests = form.getValues(`samples.${index}.itemTests`);
                                          
                                          if (Array.isArray(itemTests)) {
                                            itemTests.forEach((itemTest, testIdx) => {
                                              if (itemTest.itemTest) {
                                                const details = getItemTestDetails(value, itemTest.itemTest);
                                                if (details) {
                                                  form.setValue(`samples.${index}.itemTests.${testIdx}.specification`, details.specification || "");
                                                  form.setValue(`samples.${index}.itemTests.${testIdx}.unit`, details.unit || "");
                                                  form.setValue(`samples.${index}.itemTests.${testIdx}.method`, details.method || "");
                                                }
                                              }
                                            });
                                          }
                                        }}
                                        value={field.value || ""}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="เลือกชื่อตัวอย่าง" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {sampleNameOptions.map((option, optionIndex) => (
                                            <SelectItem key={`sample-name-option-${optionIndex}-${option.value}`} value={option.value}>
                                              {option.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="flex items-center gap-1">
                                  {/* Add name button */}
                                  {nameIdx === (form.watch(`samples.${index}.names`) || []).length - 1 && (
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="outline"
                                      onClick={() => {
                                        const current = form.getValues(`samples.${index}.names`) || [];
                                        form.setValue(`samples.${index}.names`, [...current, ""]);
                                      }}
                                      className="h-8 w-8"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {/* Remove name button */}
                                  {(form.watch(`samples.${index}.names`) || []).length > 1 && (
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => {
                                        const current = form.getValues(`samples.${index}.names`) || [];
                                        if (current.length > 1) {
                                          form.setValue(
                                            `samples.${index}.names`,
                                            current.filter((_: string, i: number) => i !== nameIdx)
                                          );
                                        }
                                      }}
                                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <FormField
                          control={form.control}
                          name={`samples.${index}.analysisRequest`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="thai-font">Id_No/Batch_No</FormLabel>
                              <FormControl>
                                <Input placeholder="Id_No/Batch_No" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                      </div>

                      {/* Item Test Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <FormLabel className="thai-font text-lg font-semibold">รายการทดสอบ (Item Test) *</FormLabel>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => form.setValue(`samples.${index}.itemTests`, [
                              ...form.getValues(`samples.${index}.itemTests`),
                              { itemTest: "", unit: "", specification: "", method: "", sampleName: "" },
                            ])}
                            className="lab-button-primary"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            เพิ่ม Item Test
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {form.watch(`samples.${index}.itemTests`)?.map((_: any, itemIdx: number) => (
                            <div key={`item-test-${index}-${itemIdx}`} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-700 dark:text-gray-300 thai-font">
                                  Item Test {itemIdx + 1}
                                </h4>
                                {form.watch(`samples.${index}.itemTests`)?.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const current = form.getValues(`samples.${index}.itemTests`);
                                      form.setValue(
                                        `samples.${index}.itemTests`,
                                        current.filter((_: any, i: number) => i !== itemIdx)
                                      );
                                    }}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Item Test Selection */}
                                <FormField
                                  control={form.control}
                                  name={`samples.${index}.itemTests.${itemIdx}.itemTest`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="thai-font">Item Test *</FormLabel>
                                      <Select
                                        onValueChange={(value) => {
                                          field.onChange(value);

                                          // ดึง sampleName ที่เลือก (เอาอันแรกใน names array)
                                          const sampleNames = form.getValues(`samples.${index}.names`);
                                          const sampleName = Array.isArray(sampleNames) && sampleNames.length > 0 ? sampleNames[0] : "";

                                          // ค้นหาข้อมูลในฐานข้อมูล
                                          const details = getItemTestDetails(sampleName, value);

                                          if (details) {
                                            form.setValue(`samples.${index}.itemTests.${itemIdx}.specification`, details.specification || "");
                                            form.setValue(`samples.${index}.itemTests.${itemIdx}.unit`, details.unit || "");
                                            form.setValue(`samples.${index}.itemTests.${itemIdx}.method`, details.method || "");
                                          } else {
                                            // ถ้าไม่เจอ ให้เคลียร์ค่า
                                            form.setValue(`samples.${index}.itemTests.${itemIdx}.specification`, "");
                                            form.setValue(`samples.${index}.itemTests.${itemIdx}.unit`, "");
                                            form.setValue(`samples.${index}.itemTests.${itemIdx}.method`, "");
                                          }
                                        }}
                                        value={field.value || ""}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="เลือก Item Test" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {itemTestOptions.map((option, optionIndex) => (
                                            <SelectItem key={`item-test-option-${optionIndex}-${option.value}`} value={option.value}>
                                              {option.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {/* Unit */}
                                <FormField
                                  control={form.control}
                                  name={`samples.${index}.itemTests.${itemIdx}.unit`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="thai-font">Unit *</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Unit" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {/* Specification */}
                                <FormField
                                  control={form.control}
                                  name={`samples.${index}.itemTests.${itemIdx}.specification`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="thai-font">Specification</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Specification"
                                          rows={2}
                                          className="resize-none"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {/* Method */}
                                <FormField
                                  control={form.control}
                                  name={`samples.${index}.itemTests.${itemIdx}.method`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="thai-font">Method</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Method"
                                          rows={3}
                                          className="resize-none"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

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
                        <FormLabel className="thai-font">Sample storage *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกวิธีการเก็บรักษา" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {storageOptions.map((option, optionIndex) => (
                              <SelectItem key={`storage-${optionIndex}-${option.value}`} value={option.value}>
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
                            {postTestingOptions.map((option, optionIndex) => (
                              <SelectItem key={`post-testing-${optionIndex}-${option.value}`} value={option.value}>
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
                            {conditionOptions.map((option, optionIndex) => (
                              <SelectItem key={`condition-${optionIndex}-${option.value}`} value={option.value}>
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

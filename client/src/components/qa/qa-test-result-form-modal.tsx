import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertQaTestResultSchema, QaTestResult, InsertQaTestResult } from "@shared/schema";
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
import { Plus, Trash2, Calculator } from "lucide-react";
import { z } from "zod";
import { format } from "date-fns";

interface QaTestResultFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  testResult?: QaTestResult | null;
}

// Test item schema with specific fields for each test type
const testItemSchema = z.object({
  testType: z.enum([
    "Appearance",
    "pH",
    "ActiveIngredient",
    "Density",
    "Reemulsification",
    "PersistanceFoaming",
    "AgingTest",
    "Moisture",
    "Viscosity",
    "FormulaTest"
  ]),
  recordDate: z.string(),
  // pH specific fields
  ph1: z.string().optional(),
  ph2: z.string().optional(),
  phAverage: z.string().optional(),
  // Active Ingredient specific fields
  activeIngredient1: z.string().optional(),
  activeIngredient2: z.string().optional(),
  activeIngredient3: z.string().optional(),
  activeIngredientAverage: z.string().optional(),
  // General result field
  result: z.string().optional(),
});

// Enhanced schema for form validation with string dates
const qaTestResultFormSchema = z.object({
  sampleNo: z.string().min(1, "Sample No จำเป็นต้องระบุ"),
  requestNo: z.string().min(1, "Request No จำเป็นต้องระบุ"),
  product: z.string().min(1, "Product จำเป็นต้องระบุ"),
  dueDate: z.string().min(1, "Due Date จำเป็นต้องระบุ"),
  testItems: z.array(testItemSchema).min(1, "ต้องมี Test Items อย่างน้อย 1 รายการ"),
  notes: z.string().optional(),
});

type QaTestResultFormData = z.infer<typeof qaTestResultFormSchema>;

const testTypeOptions = [
  { value: "Appearance", label: "Appearance" },
  { value: "pH", label: "pH" },
  { value: "ActiveIngredient", label: "Active Ingredient" },
  { value: "Density", label: "Density (g/cm³)" },
  { value: "Reemulsification", label: "Re-emulsification (cm³)" },
  { value: "PersistanceFoaming", label: "Persistance foaming" },
  { value: "AgingTest", label: "Aging test" },
  { value: "Moisture", label: "Moisture (%)" },
  { value: "Viscosity", label: "Viscosity (mPa.s)" },
  { value: "FormulaTest", label: "Formula Test" },
];

export default function QaTestResultFormModal({ isOpen, onClose, testResult }: QaTestResultFormModalProps) {
  const { toast } = useToast();
  const isEditing = !!testResult;

  const form = useForm<QaTestResultFormData>({
    resolver: zodResolver(qaTestResultFormSchema),
    defaultValues: {
      sampleNo: testResult?.sampleNo || "",
      requestNo: testResult?.requestNo || "",
      product: testResult?.product || "",
      dueDate: testResult?.dueDate ? format(new Date(testResult.dueDate), "yyyy-MM-dd") : "",
      testItems: testResult?.testItems ? 
        (testResult.testItems as any[]).map((item: any) => ({
          testType: item.testType,
          recordDate: item.recordDate ? format(new Date(item.recordDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
          ph1: item.ph1 || "",
          ph2: item.ph2 || "",
          phAverage: item.phAverage || "",
          activeIngredient1: item.activeIngredient1 || "",
          activeIngredient2: item.activeIngredient2 || "",
          activeIngredient3: item.activeIngredient3 || "",
          activeIngredientAverage: item.activeIngredientAverage || "",
          result: item.result || "",
        })) : [
          {
            testType: "Appearance" as const,
            recordDate: format(new Date(), "yyyy-MM-dd"),
            result: "",
          }
        ],
      notes: testResult?.notes || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "testItems",
  });

  const mutation = useMutation({
    mutationFn: async (data: QaTestResultFormData) => {
      const payload = {
        ...data,
        dueDate: new Date(data.dueDate),
        testItems: data.testItems.map(item => ({
          ...item,
          recordDate: new Date(item.recordDate),
        })),
      };

      if (isEditing && testResult) {
        await apiRequest("PUT", `/api/qa-test-results/${testResult.id}`, payload);
      } else {
        await apiRequest("POST", "/api/qa-test-results", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qa-test-results"] });
      toast({
        title: "สำเร็จ",
        description: isEditing ? "อัปเดตผลการทดสอบเรียบร้อยแล้ว" : "เพิ่มผลการทดสอบเรียบร้อยแล้ว",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: isEditing ? "ไม่สามารถอัปเดตผลการทดสอบได้" : "ไม่สามารถเพิ่มผลการทดสอบได้",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QaTestResultFormData) => {
    mutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const addTestItem = () => {
    append({
      testType: "Appearance" as const,
      recordDate: format(new Date(), "yyyy-MM-dd"),
      result: "",
    });
  };

  const removeTestItem = (index: number) => {
    remove(index);
  };

  // Calculate pH average
  const calculatePhAverage = (ph1: string, ph2: string) => {
    const ph1Num = parseFloat(ph1);
    const ph2Num = parseFloat(ph2);
    if (!isNaN(ph1Num) && !isNaN(ph2Num)) {
      return ((ph1Num + ph2Num) / 2).toFixed(2);
    }
    return "";
  };

  // Calculate Active Ingredient average
  const calculateActiveIngredientAverage = (ai1: string, ai2: string, ai3: string) => {
    const values = [ai1, ai2, ai3].map(v => parseFloat(v)).filter(v => !isNaN(v));
    if (values.length > 0) {
      return (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2);
    }
    return "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="thai-font">
            {isEditing ? "แก้ไขผลการทดสอบ" : "เพิ่มผลการทดสอบ"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="thai-font">ข้อมูลพื้นฐาน</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sampleNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="thai-font">Sample No</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requestNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="thai-font">Request No</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="product"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="thai-font">Product</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel className="thai-font">Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


              </CardContent>
            </Card>

            {/* Test Items */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="thai-font">Test Items</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTestItem}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    เพิ่ม Test Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium thai-font">Test Item {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTestItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`testItems.${index}.testType`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="thai-font">Test Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="เลือกประเภทการทดสอบ" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {testTypeOptions.map((option) => (
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
                        name={`testItems.${index}.recordDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="thai-font">Record Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />


                    </div>

                    {/* pH specific fields */}
                    {form.watch(`testItems.${index}.testType`) === "pH" && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name={`testItems.${index}.ph1`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="thai-font">pH1</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  onChange={(e) => {
                                    field.onChange(e);
                                    const ph2 = form.getValues(`testItems.${index}.ph2`) || "";
                                    const average = calculatePhAverage(e.target.value, ph2);
                                    form.setValue(`testItems.${index}.phAverage`, average);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`testItems.${index}.ph2`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="thai-font">pH2</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  onChange={(e) => {
                                    field.onChange(e);
                                    const ph1 = form.getValues(`testItems.${index}.ph1`) || "";
                                    const average = calculatePhAverage(ph1, e.target.value);
                                    form.setValue(`testItems.${index}.phAverage`, average);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`testItems.${index}.phAverage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="thai-font flex items-center gap-2">
                                ค่าเฉลี่ย pH
                                <Calculator className="h-4 w-4 text-blue-600" />
                              </FormLabel>
                              <FormControl>
                                <Input {...field} readOnly className="bg-gray-50" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Active Ingredient specific fields */}
                    {form.watch(`testItems.${index}.testType`) === "ActiveIngredient" && (
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <FormField
                          control={form.control}
                          name={`testItems.${index}.activeIngredient1`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="thai-font">Active Ingredient 1</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  onChange={(e) => {
                                    field.onChange(e);
                                    const ai2 = form.getValues(`testItems.${index}.activeIngredient2`) || "";
                                    const ai3 = form.getValues(`testItems.${index}.activeIngredient3`) || "";
                                    const average = calculateActiveIngredientAverage(e.target.value, ai2, ai3);
                                    form.setValue(`testItems.${index}.activeIngredientAverage`, average);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`testItems.${index}.activeIngredient2`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="thai-font">Active Ingredient 2</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  onChange={(e) => {
                                    field.onChange(e);
                                    const ai1 = form.getValues(`testItems.${index}.activeIngredient1`) || "";
                                    const ai3 = form.getValues(`testItems.${index}.activeIngredient3`) || "";
                                    const average = calculateActiveIngredientAverage(ai1, e.target.value, ai3);
                                    form.setValue(`testItems.${index}.activeIngredientAverage`, average);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`testItems.${index}.activeIngredient3`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="thai-font">Active Ingredient 3</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  onChange={(e) => {
                                    field.onChange(e);
                                    const ai1 = form.getValues(`testItems.${index}.activeIngredient1`) || "";
                                    const ai2 = form.getValues(`testItems.${index}.activeIngredient2`) || "";
                                    const average = calculateActiveIngredientAverage(ai1, ai2, e.target.value);
                                    form.setValue(`testItems.${index}.activeIngredientAverage`, average);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`testItems.${index}.activeIngredientAverage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="thai-font flex items-center gap-2">
                                ค่าเฉลี่ย Active Ingredient
                                <Calculator className="h-4 w-4 text-blue-600" />
                              </FormLabel>
                              <FormControl>
                                <Input {...field} readOnly className="bg-gray-50" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* General result field for other test types */}
                    {form.watch(`testItems.${index}.testType`) !== "pH" && 
                     form.watch(`testItems.${index}.testType`) !== "ActiveIngredient" && (
                      <FormField
                        control={form.control}
                        name={`testItems.${index}.result`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="thai-font">ผลการทดสอบ</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="thai-font">หมายเหตุ</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "กำลังบันทึก..." : isEditing ? "อัปเดต" : "บันทึก"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 
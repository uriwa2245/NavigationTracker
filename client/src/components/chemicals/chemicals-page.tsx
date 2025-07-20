import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import DataTable from "@/components/ui/data-table";
import ChemicalFormModal from "./chemical-form-modal";
import { Chemical } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ChemicalsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChemical, setEditingChemical] = useState<Chemical | null>(null);
  const [activeCategory, setActiveCategory] = useState("qa");
  const { toast } = useToast();

  const { data: chemicals, isLoading } = useQuery({
    queryKey: ["/api/chemicals", activeCategory],
    queryFn: () => fetch(`/api/chemicals?category=${activeCategory}`).then(res => res.json()),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/chemicals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chemicals"] });
      toast({
        title: "สำเร็จ",
        description: "ลบสารเคมีเรียบร้อยแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบสารเคมีได้",
        variant: "destructive",
      });
    },
  });

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return "ไม่ระบุ";
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return "หมดอายุ";
    if (daysUntil <= 30) return "ใกล้หมดอายุ";
    return "ปกติ";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "หมดอายุ":
        return <Badge className="lab-badge-error">{status}</Badge>;
      case "ใกล้หมดอายุ":
        return <Badge className="lab-badge-warning">{status}</Badge>;
      case "ปกติ":
        return <Badge className="lab-badge-success">{status}</Badge>;
      default:
        return <Badge className="lab-badge-info">{status}</Badge>;
    }
  };

  const columns = [
    {
      key: "chemicalNo",
      label: "Chemical No",
    },
    {
      key: "name",
      label: "ชื่อสารเคมี",
    },
    {
      key: "brand",
      label: "ยี่ห้อ",
    },
    {
      key: "grade",
      label: "เกรด",
    },
    {
      key: "expiryDate",
      label: "วันที่หมดอายุ",
      render: (value: string) => value ? format(new Date(value), "dd/MM/yyyy") : "-",
    },
    {
      key: "location",
      label: "สถานที่จัดเก็บ",
    },
    {
      key: "status",
      label: "สถานะ",
      render: (value: string, chemical: Chemical) => getStatusBadge(getExpiryStatus(chemical.expiryDate)),
    },
  ];

  const handleAdd = () => {
    setEditingChemical(null);
    setIsModalOpen(true);
  };

  const handleEdit = (chemical: Chemical) => {
    setEditingChemical(chemical);
    setIsModalOpen(true);
  };

  const handleDelete = (chemical: Chemical) => {
    if (confirm(`คุณต้องการลบสารเคมี "${chemical.name}" หรือไม่?`)) {
      deleteMutation.mutate(chemical.id);
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "qa":
        return "สารเคมี QA";
      case "standard":
        return "สารมาตรฐาน";
      case "rd":
        return "สารเคมี RD";
      default:
        return category;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 thai-font">
          สารเคมี
        </h2>
        <p className="text-gray-600 dark:text-gray-400 thai-font">
          จัดการสารเคมีและวันหมดอายุ
        </p>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="qa" className="thai-font">สารเคมี QA</TabsTrigger>
          <TabsTrigger value="standard" className="thai-font">สารมาตรฐาน</TabsTrigger>
          <TabsTrigger value="rd" className="thai-font">สารเคมี RD</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeCategory} className="space-y-4">
          <DataTable
            title={getCategoryLabel(activeCategory)}
            data={chemicals || []}
            columns={columns}
            searchPlaceholder="ค้นหาสารเคมี..."
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      <ChemicalFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        chemical={editingChemical}
        defaultCategory={activeCategory}
      />
    </div>
  );
}

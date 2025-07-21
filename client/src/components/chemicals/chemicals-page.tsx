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
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ChemicalsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChemical, setEditingChemical] = useState<Chemical | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();

  const { data: allChemicals, isLoading } = useQuery({
    queryKey: ["/api/chemicals"],
    queryFn: () => fetch("/api/chemicals").then(res => res.json()),
  });

  // Filter chemicals based on search query and category
  const filteredChemicals = allChemicals?.filter((chemical: Chemical) => {
    const matchesSearch = 
      chemical.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chemical.chemicalNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chemical.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chemical.casNo?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || chemical.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

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
      key: "category",
      label: "หมวดหมู่",
      render: (value: string) => (
        <Badge variant="outline" className="thai-font">
          {getCategoryLabel(value)}
        </Badge>
      ),
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
      render: (_value: string, chemical: Chemical) => getStatusBadge(getExpiryStatus(typeof chemical.expiryDate === "string" ? chemical.expiryDate : (chemical.expiryDate ? chemical.expiryDate.toISOString() : null))),
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

  const handleView = (chemical: Chemical) => {
    alert(`ดูรายละเอียดสารเคมี: ${chemical.name}\nรหัส: ${chemical.chemicalNo}\nยี่ห้อ: ${chemical.brand}\nเกรด: ${chemical.grade}\nสถานที่เก็บ: ${chemical.location}`);
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

  const categoryOptions = [
    { value: "all", label: "ทุกหมวดหมู่" },
    { value: "qa", label: "สารเคมี QA" },
    { value: "standard", label: "สารมาตรฐาน" },
    { value: "rd", label: "สารเคมี RD" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 thai-font">
            สารเคมี
          </h2>
          <p className="text-gray-600 dark:text-gray-400 thai-font">
            จัดการสารเคมีและวันหมดอายุ
          </p>
        </div>
        <Button 
          onClick={handleAdd}
          className="lab-button-primary px-6 py-3 thai-font"
        >
          <Plus className="w-5 h-5 mr-2" />
          เพิ่มสารเคมี
        </Button>
      </div>

      <div className="lab-card p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="ค้นหาสารเคมี (ชื่อ, Chemical No, ยี่ห้อ, CAS No)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 thai-font"
            />
          </div>
          <div className="w-full sm:w-64">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="thai-font">
                <SelectValue placeholder="เลือกหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="thai-font">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable
          title={`รายการสารเคมี (${filteredChemicals.length} รายการ)`}
          data={filteredChemicals}
          columns={columns}
          searchPlaceholder=""
          hideSearch={true}
          hideAddButton={true}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      </div>

      <ChemicalFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        chemical={editingChemical}
      />
    </div>
  );
}

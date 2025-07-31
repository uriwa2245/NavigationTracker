import { useQuery, useMutation, UseQueryResult } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Tool, InsertTool,
  Glassware, InsertGlassware,
  Chemical, InsertChemical,
  Document, InsertDocument,
  Training, InsertTraining,
  Msds, InsertMsds,
  Task, InsertTask,
  QaSample, InsertQaSample
} from "@shared/schema";

interface DashboardStats {
  overdueCount: number;
  calibrationDue: number;
  pendingTasks: number;
  completedTraining: number;
}

// Custom hook for lab data management
export function useLabData() {
  const { toast } = useToast();

  // Dashboard stats
  const useDashboardStats = (): UseQueryResult<DashboardStats> => {
    return useQuery({
      queryKey: ["/api/dashboard/stats"],
    });
  };

  // Tools hooks
  const useTools = () => {
    return useQuery<Tool[]>({
      queryKey: ["/api/tools"],
    });
  };

  const useCreateTool = () => {
    return useMutation({
      mutationFn: async (data: InsertTool) => {
        return await apiRequest("POST", "/api/tools", data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        toast({
          title: "สำเร็จ",
          description: "เพิ่มเครื่องมือเรียบร้อยแล้ว",
        });
      },
      onError: () => {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถเพิ่มเครื่องมือได้",
          variant: "destructive",
        });
      },
    });
  };

  const useUpdateTool = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: number; data: Partial<InsertTool> }) => {
        return await apiRequest("PATCH", `/api/tools/${id}`, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        toast({
          title: "สำเร็จ",
          description: "แก้ไขเครื่องมือเรียบร้อยแล้ว",
        });
      },
      onError: () => {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถแก้ไขเครื่องมือได้",
          variant: "destructive",
        });
      },
    });
  };

  const useDeleteTool = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        return await apiRequest("DELETE", `/api/tools/${id}`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        toast({
          title: "สำเร็จ",
          description: "ลบเครื่องมือเรียบร้อยแล้ว",
        });
      },
      onError: () => {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถลบเครื่องมือได้",
          variant: "destructive",
        });
      },
    });
  };

  // Glassware hooks
  const useGlassware = () => {
    return useQuery<Glassware[]>({
      queryKey: ["/api/glassware"],
    });
  };

  const useCreateGlassware = () => {
    return useMutation({
      mutationFn: async (data: InsertGlassware) => {
        return await apiRequest("POST", "/api/glassware", data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/glassware"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        toast({
          title: "สำเร็จ",
          description: "เพิ่มเครื่องแก้วเรียบร้อยแล้ว",
        });
      },
    });
  };

  // Chemicals hooks
  const useChemicals = (category?: string) => {
    return useQuery<Chemical[]>({
      queryKey: ["/api/chemicals", category],
      queryFn: () => {
        const url = category ? `/api/chemicals?category=${category}` : "/api/chemicals";
        return apiRequest("GET", url);
      },
    });
  };

  const useCreateChemical = () => {
    return useMutation({
      mutationFn: async (data: InsertChemical) => {
        return await apiRequest("POST", "/api/chemicals", data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/chemicals"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        toast({
          title: "สำเร็จ",
          description: "เพิ่มสารเคมีเรียบร้อยแล้ว",
        });
      },
    });
  };

  // Documents hooks
  const useDocuments = (category?: string) => {
    return useQuery<Document[]>({
      queryKey: ["/api/documents", category],
      queryFn: () => {
        const url = category && category !== "all" 
          ? `/api/documents?category=${category}` 
          : "/api/documents";
        return apiRequest("GET", url);
      },
    });
  };

  const useCreateDocument = () => {
    return useMutation({
      mutationFn: async (data: InsertDocument) => {
        return await apiRequest("POST", "/api/documents", data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
        toast({
          title: "สำเร็จ",
          description: "เพิ่มเอกสารเรียบร้อยแล้ว",
        });
      },
    });
  };

  // Training hooks
  const useTraining = () => {
    return useQuery<Training[]>({
      queryKey: ["/api/training"],
      queryFn: () => apiRequest("GET", "/api/training"),
    });
  };

  const useCreateTraining = () => {
    return useMutation({
      mutationFn: async (data: InsertTraining) => {
        return await apiRequest("POST", "/api/training", data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/training"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        toast({
          title: "สำเร็จ",
          description: "เพิ่มการฝึกอบรมเรียบร้อยแล้ว",
        });
      },
    });
  };

  // MSDS hooks
  const useMsds = (category?: string) => {
    return useQuery<Msds[]>({
      queryKey: ["/api/msds", category],
      queryFn: () => {
        const url = category && category !== "all" 
          ? `/api/msds?category=${category}` 
          : "/api/msds";
        return apiRequest("GET", url);
      },
    });
  };

  const useCreateMsds = () => {
    return useMutation({
      mutationFn: async (data: InsertMsds) => {
        return await apiRequest("POST", "/api/msds", data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/msds"] });
        toast({
          title: "สำเร็จ",
          description: "เพิ่ม MSDS เรียบร้อยแล้ว",
        });
      },
    });
  };

  // Tasks hooks
  const useTasks = () => {
    return useQuery<Task[]>({
      queryKey: ["/api/tasks"],
      queryFn: () => apiRequest("GET", "/api/tasks"),
    });
  };

  const useCreateTask = () => {
    return useMutation({
      mutationFn: async (data: InsertTask) => {
        return await apiRequest("POST", "/api/tasks", data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        toast({
          title: "สำเร็จ",
          description: "เพิ่มงานเรียบร้อยแล้ว",
        });
      },
    });
  };

  const useUpdateTask = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: number; data: Partial<InsertTask> }) => {
        return await apiRequest("PATCH", `/api/tasks/${id}`, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        toast({
          title: "สำเร็จ",
          description: "อัปเดตงานเรียบร้อยแล้ว",
        });
      },
    });
  };

  // QA Samples hooks
  const useQaSamples = () => {
    return useQuery<QaSample[]>({
      queryKey: ["/api/qa-samples"],
      queryFn: () => apiRequest("GET", "/api/qa-samples"),
    });
  };

  const useCreateQaSample = () => {
    return useMutation({
      mutationFn: async (data: InsertQaSample) => {
        return await apiRequest("POST", "/api/qa-samples", data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/qa-samples"] });
        toast({
          title: "สำเร็จ",
          description: "เพิ่มตัวอย่าง QA เรียบร้อยแล้ว",
        });
      },
    });
  };

  const useUpdateQaSample = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: number; data: Partial<InsertQaSample> }) => {
        return await apiRequest("PATCH", `/api/qa-samples/${id}`, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/qa-samples"] });
        toast({
          title: "สำเร็จ",
          description: "แก้ไขตัวอย่าง QA เรียบร้อยแล้ว",
        });
      },
    });
  };

  // Utility functions
  const getCalibrationStatus = (nextCalibration: string | null) => {
    if (!nextCalibration) return "ไม่ระบุ";
    
    const now = new Date();
    const calibrationDate = new Date(nextCalibration);
    const daysUntil = Math.ceil((calibrationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return "เลยกำหนด";
    if (daysUntil <= 30) return "ใกล้ครบกำหนด";
    return "ปกติ";
  };

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return "ไม่ระบุ";
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return "หมดอายุ";
    if (daysUntil <= 30) return "ใกล้หมดอายุ";
    return "ปกติ";
  };

  const getDaysUntilDue = (dueDate: string | null) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return {
    // Dashboard
    useDashboardStats,
    
    // Tools
    useTools,
    useCreateTool,
    useUpdateTool,
    useDeleteTool,
    
    // Glassware
    useGlassware,
    useCreateGlassware,
    
    // Chemicals
    useChemicals,
    useCreateChemical,
    
    // Documents
    useDocuments,
    useCreateDocument,
    
    // Training
    useTraining,
    useCreateTraining,
    
    // MSDS
    useMsds,
    useCreateMsds,
    
    // Tasks
    useTasks,
    useCreateTask,
    useUpdateTask,
    
    // QA Samples
    useQaSamples,
    useCreateQaSample,
    useUpdateQaSample,
    
    // Utilities
    getCalibrationStatus,
    getExpiryStatus,
    getDaysUntilDue,
  };
}

// Export individual hooks for convenience
export const {
  useDashboardStats,
  useTools,
  useCreateTool,
  useUpdateTool,
  useDeleteTool,
  useGlassware,
  useCreateGlassware,
  useChemicals,
  useCreateChemical,
  useDocuments,
  useCreateDocument,
  useTraining,
  useCreateTraining,
  useMsds,
  useCreateMsds,
  useTasks,
  useCreateTask,
  useUpdateTask,
  useQaSamples,
  useCreateQaSample,
  useUpdateQaSample,
  getCalibrationStatus,
  getExpiryStatus,
  getDaysUntilDue,
} = useLabData();

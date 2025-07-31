import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Download, Edit, Eye, Trash2, CheckCircle } from "lucide-react";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface StatusFilter {
  key: string;
  label: string;
  count: number;
}

interface DataTableProps {
  title: string;
  data: any[];
  columns: Column[];
  searchPlaceholder?: string;
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onView?: (item: any) => void;
  onDelete?: (item: any) => void;
  onApprove?: (item: any) => void;
  onExport?: () => void;
  isLoading?: boolean;
  customActions?: (item: any) => React.ReactNode;
  hideSearch?: boolean;
  hideAddButton?: boolean;
  statusFilters?: StatusFilter[];
  getItemStatus?: (item: any) => string | null;
}

// Helper function to get status chip styles
const getStatusChipStyle = (status: string) => {
  switch (status) {
    case "หมดอายุ":
    case "overdue":
    case "failed":
    case "cancelled":
    case "ส่งซ่อม":
    case "ไม่ผ่าน":
    case "เลยกำหนด":
      return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700";
    case "ใกล้หมดอายุ":
    case "due_soon":
    case "pending":
    case "in_progress":
      return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700";
    case "ปกติ":
    case "active":
    case "completed":
    case "passed":
    case "ผ่าน":
      return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700";
    case "inactive":
    case "received":
    case "testing":
      return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700";
    default:
      return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700";
  }
};

// Helper function to get row background color class
const getRowColorClass = (status: string | null) => {
  if (!status) return "";
  
  switch (status) {
    case "หมดอายุ":
    case "overdue":
    case "failed":
    case "cancelled":
    case "ไม่ผ่าน":
    case "ส่งซ่อม":
    case "เลยกำหนด":
      return "table-row-error";
    case "ใกล้หมดอายุ":
    case "due_soon":
    case "pending":
    case "รอ":
    case "ไม่ใช้งาน":
      return "table-row-warning";
    case "ปกติ":
    case "active":
    case "completed":
    case "passed":
    case "ผ่าน":
    case "ใช้งานได้":
    case "เสร็จสิ้น":
      return "table-row-success";
    case "inactive":
    case "received":
    case "testing":
    case "กำลังดำเนินการ":
    case "รับแล้ว":
    case "ซ่อมแซม":
      return "table-row-info";
    default:
      return "";
  }
};

export default function DataTable({
  title,
  data,
  columns,
  searchPlaceholder = "ค้นหา...",
  onAdd,
  onEdit,
  onView,
  onDelete,
  onApprove,
  onExport,
  isLoading = false,
  customActions,
  hideSearch = false,
  hideAddButton = false,
  statusFilters = [],
  getItemStatus,
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStatusFilters, setActiveStatusFilters] = useState<string[]>(["all"]);
  const itemsPerPage = 10;

  // Filter data based on search term and status
  let filteredData = data;

  // Apply search filter
  if (!hideSearch && searchTerm) {
    filteredData = filteredData.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }

  // Apply status filter - support multiple selections
  if (!activeStatusFilters.includes("all") && getItemStatus) {
    filteredData = filteredData.filter((item) => {
      const status = getItemStatus(item);
      return status && activeStatusFilters.includes(status);
    });
  }

  // Paginate data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading) {
    return (
      <div className="lab-card">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lab-card">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 thai-font">
            {title}
          </h3>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            {onAdd && !hideAddButton && (
              <Button onClick={onAdd} className="lab-button-primary">
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มรายการใหม่
              </Button>
            )}
            {onExport && (
              <Button onClick={onExport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        {!hideSearch && (
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Status Filter Chips */}
        {statusFilters.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={activeStatusFilters.includes("all") ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  activeStatusFilters.includes("all") 
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => setActiveStatusFilters(["all"])}
              >
                ทั้งหมด ({data.length})
              </Badge>
              {statusFilters.map((filter) => (
                <Badge
                  key={filter.key}
                  variant={activeStatusFilters.includes(filter.key) ? "default" : "outline"}
                  className={`cursor-pointer transition-all thai-font ${
                    activeStatusFilters.includes(filter.key)
                      ? getStatusChipStyle(filter.key)
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => {
                    if (activeStatusFilters.includes(filter.key)) {
                      // Remove this filter
                      const newFilters = activeStatusFilters.filter(f => f !== filter.key);
                      setActiveStatusFilters(newFilters.length === 0 ? ["all"] : newFilters);
                    } else {
                      // Add this filter and remove "all"
                      const newFilters = activeStatusFilters.filter(f => f !== "all");
                      setActiveStatusFilters([...newFilters, filter.key]);
                    }
                  }}
                >
                  {filter.label} ({filter.count})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className="thai-font">
                  {column.label}
                </TableHead>
              ))}
              {(onEdit || onView || onDelete || customActions) && (
                <TableHead className="thai-font">การดำเนินการ</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (onEdit || onView || onDelete || customActions ? 1 : 0)}
                  className="text-center py-8 text-gray-500 dark:text-gray-400 thai-font"
                >
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => {
                const status = getItemStatus ? getItemStatus(item) : null;
                const rowColorClass = getRowColorClass(status);
                return (
                  <TableRow key={item.id || index} className={rowColorClass}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {column.render
                          ? column.render(item[column.key], item)
                          : item[column.key]}
                      </TableCell>
                    ))}
                    {(onEdit || onView || onDelete || onApprove || customActions) && (
                      <TableCell>
                        <div className="flex space-x-2">
                          {onView && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onView(item)}
                              title="ดูรายละเอียด"
                              className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(item)}
                              title="แก้ไข"
                              className="hover:bg-green-50 dark:hover:bg-green-900/20"
                            >
                              <Edit className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </Button>
                          )}
                          {onApprove && (item.status === "pending" || item.status === "in_progress" || item.status === "cancelled" || item.status === "completed") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onApprove(item)}
                              title={item.status === "cancelled" ? "อนุมัติงานใหม่" : "อนุมัติงาน"}
                              className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            >
                              <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(item)}
                              title="ลบ"
                              className="hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </Button>
                          )}
                          {customActions && customActions(item)}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })

            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300 thai-font">
              แสดง <span className="font-medium">{startIndex + 1}</span> ถึง{" "}
              <span className="font-medium">
                {Math.min(startIndex + itemsPerPage, filteredData.length)}
              </span>{" "}
              จาก <span className="font-medium">{filteredData.length}</span> รายการ
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                ก่อนหน้า
              </Button>
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className={currentPage === i + 1 ? "lab-button-primary" : ""}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                ถัดไป
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

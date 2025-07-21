import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Download, Edit, Eye, Trash2 } from "lucide-react";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
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
  onExport?: () => void;
  isLoading?: boolean;
  customActions?: (item: any) => React.ReactNode;
}

export default function DataTable({
  title,
  data,
  columns,
  searchPlaceholder = "ค้นหา...",
  onAdd,
  onEdit,
  onView,
  onDelete,
  onExport,
  isLoading = false,
  customActions,
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter data based on search term
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
            {onAdd && (
              <Button onClick={onAdd} className="lab-button-primary">
                <Plus className="w-4 h-4 mr-2" />
                เพิ่ม
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
              paginatedData.map((item, index) => (
                <TableRow key={item.id || index}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render
                        ? column.render(item[column.key], item)
                        : item[column.key]}
                    </TableCell>
                  ))}
                  {(onEdit || onView || onDelete || customActions) && (
                    <TableCell>
                      <div className="flex space-x-2">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(item)}
                            title="ดูรายละเอียด"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(item)}
                            title="แก้ไข"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(item)}
                            title="ลบ"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                        {customActions && customActions(item)}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
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

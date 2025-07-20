import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChartLine,
  Settings,
  Beaker,
  FlaskConical,
  FileText,
  GraduationCap,
  Shield,
  ListTodo,
  ClipboardCheck,
  ChevronDown,
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  submenu?: { id: string; label: string }[];
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "แดชบอร์ด",
    icon: ChartLine,
  },
  {
    id: "tools",
    label: "เครื่องมือ",
    icon: Settings,
    submenu: [
      { id: "tools-overview", label: "ภาพรวม" },
      { id: "tools-list", label: "รายการเครื่องมือ" },
      { id: "tools-calibration", label: "การสอบเทียบ" },
    ],
  },
  {
    id: "glassware",
    label: "เครื่องแก้ว",
    icon: Beaker,
    submenu: [
      { id: "glassware-overview", label: "ภาพรวม" },
      { id: "glassware-list", label: "รายการเครื่องแก้ว" },
    ],
  },
  {
    id: "chemicals",
    label: "สารเคมี",
    icon: FlaskConical,
    submenu: [
      { id: "chemicals-qa", label: "สารเคมี QA" },
      { id: "chemicals-standard", label: "สารมาตรฐาน" },
      { id: "chemicals-rd", label: "สารเคมี RD" },
    ],
  },
  {
    id: "documents",
    label: "เอกสาร",
    icon: FileText,
    submenu: [
      { id: "docs-quality", label: "คู่มือคุณภาพ" },
      { id: "docs-procedures", label: "ระเบียบปฏิบัติ" },
      { id: "docs-manual", label: "คู่มือปฏิบัติงาน" },
    ],
  },
  {
    id: "training",
    label: "การฝึกอบรม",
    icon: GraduationCap,
    submenu: [
      { id: "training-overview", label: "ภาพรวม" },
      { id: "training-list", label: "รายการฝึกอบรม" },
    ],
  },
  {
    id: "msds",
    label: "MSDS",
    icon: Shield,
    submenu: [
      { id: "msds-lab", label: "SDS-LAB" },
      { id: "msds-product", label: "SDS-Product" },
      { id: "msds-rm", label: "SDS-RM" },
    ],
  },
  {
    id: "task-tracker",
    label: "Task Tracker",
    icon: ListTodo,
  },
  {
    id: "qa",
    label: "QA",
    icon: ClipboardCheck,
  },
];

export default function Sidebar({
  activeSection,
  onSectionChange,
  isMobileOpen,
  onMobileClose,
}: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const toggleSubmenu = (menuId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  const handleItemClick = (itemId: string, hasSubmenu: boolean) => {
    if (hasSubmenu) {
      toggleSubmenu(itemId);
    } else {
      onSectionChange(itemId);
      onMobileClose();
    }
  };

  return (
    <nav
      className={cn(
        "bg-white dark:bg-gray-800 shadow-lg w-64 fixed left-0 top-16 bottom-0 transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto custom-scrollbar",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id} className="menu-group">
              <button
                onClick={() => handleItemClick(item.id, !!item.submenu)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  activeSection === item.id
                    ? "bg-primary text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <div className="flex items-center">
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="thai-font">{item.label}</span>
                </div>
                {item.submenu && (
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transform transition-transform",
                      expandedMenus.has(item.id) ? "rotate-180" : ""
                    )}
                  />
                )}
              </button>
              
              {item.submenu && expandedMenus.has(item.id) && (
                <ul className="ml-6 mt-2 space-y-1">
                  {item.submenu.map((subItem) => (
                    <li key={subItem.id}>
                      <button
                        onClick={() => {
                          onSectionChange(item.id);
                          onMobileClose();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors thai-font"
                      >
                        {subItem.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

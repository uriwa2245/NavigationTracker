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
  },
  {
    id: "glassware",
    label: "เครื่องแก้ว",
    icon: Beaker,
  },
  {
    id: "chemicals",
    label: "สารเคมี",
    icon: FlaskConical,
  },
  {
    id: "documents",
    label: "เอกสาร",
    icon: FileText,
  },
  {
    id: "training",
    label: "การฝึกอบรม",
    icon: GraduationCap,
  },
  {
    id: "msds",
    label: "MSDS",
    icon: Shield,
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
  const handleItemClick = (itemId: string) => {
    onSectionChange(itemId);
    onMobileClose();
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
                onClick={() => handleItemClick(item.id)}
                className={cn(
                  "w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  activeSection === item.id
                    ? "bg-primary text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="thai-font">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

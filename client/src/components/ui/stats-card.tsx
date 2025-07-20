import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant: "success" | "warning" | "error" | "info";
}

export default function StatsCard({ title, value, icon: Icon, variant }: StatsCardProps) {
  const variantClasses = {
    success: "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    warning: "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    error: "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    info: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  };

  const valueClasses = {
    success: "text-green-600 dark:text-green-400",
    warning: "text-orange-600 dark:text-orange-400",
    error: "text-red-600 dark:text-red-400",
    info: "text-blue-600 dark:text-blue-400",
  };

  return (
    <div className="lab-card">
      <div className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${variantClasses[variant]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 thai-font">
              {title}
            </p>
            <p className={`text-2xl font-bold ${valueClasses[variant]}`}>
              {value}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

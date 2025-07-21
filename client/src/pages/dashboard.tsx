import { useState } from "react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import StatsCard from "@/components/ui/stats-card";
import ToolsPage from "@/components/tools/tools-page";
import GlasswarePage from "@/components/glassware/glassware-page";
import ChemicalsPage from "@/components/chemicals/chemicals-page";
import DocumentsPage from "@/components/documents/documents-page";
import TrainingPage from "@/components/training/training-page";
import MsdsPage from "@/components/msds/msds-page";
import TaskTrackerPage from "@/components/task-tracker/task-tracker-page";
import QaPage from "@/components/qa/qa-page";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Clock, CheckCircle, ListTodo } from "lucide-react";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  type DashboardStats = {
    overdueCount?: number;
    calibrationDue?: number;
    pendingTasks?: number;
    completedTraining?: number;
  };

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const renderMainContent = () => {
    switch (activeSection) {
      case "tools":
        return <ToolsPage />;
      case "glassware":
        return <GlasswarePage />;
      case "chemicals":
        return <ChemicalsPage />;
      case "documents":
        return <DocumentsPage />;
      case "training":
        return <TrainingPage />;
      case "msds":
        return <MsdsPage />;
      case "task-tracker":
        return <TaskTrackerPage />;
      case "qa":
        return <QaPage />;
      default:
        return (
          <div className="space-y-8">
            {/* Dashboard Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                หน้าหลัก
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                ภาพรวมระบบปฏิบัติการภายในห้องแลป
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="ใกล้หมดอายุ"
                value={statsLoading ? "..." : stats?.overdueCount?.toString() || "0"}
                icon={AlertTriangle}
                variant="error"
              />
              <StatsCard
                title="ครบกำหนดสอบเทียบ"
                value={statsLoading ? "..." : stats?.calibrationDue?.toString() || "0"}
                icon={Clock}
                variant="warning"
              />
              <StatsCard
                title="งานที่รออนุมัติ"
                value={statsLoading ? "..." : stats?.pendingTasks?.toString() || "0"}
                icon={ListTodo}
                variant="info"
              />
              <StatsCard
                title="การฝึกอบรมเสร็จสิ้น"
                value={statsLoading ? "..." : stats?.completedTraining?.toString() || "0"}
                icon={CheckCircle}
                variant="success"
              />
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tools & Glassware Status */}
              <div className="lab-card">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    สถานะเครื่องมือ & เครื่องแก้ว
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          ไม่มีเครื่องมือที่เลยกำหนด
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ตรวจสอบการสอบเทียบล่าสุด
                        </p>
                      </div>
                      <span className="lab-badge-success">ปกติ</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chemical Inventory Alerts */}
              <div className="lab-card">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    สารเคมีใกล้หมดอายุ
                  </h3>
                </div>
                <div className="p-6">
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      ไม่มีสารเคมีที่ใกล้หมดอายุ
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lab-card">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    การดำเนินการด่วน
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveSection("tools")}
                      className="w-full flex items-center justify-center px-4 py-3 lab-button-primary rounded-lg transition-colors"
                    >
                      เครื่องมือ
                    </button>
                    <button
                      onClick={() => setActiveSection("chemicals")}
                      className="w-full flex items-center justify-center px-4 py-3 lab-button-success rounded-lg transition-colors"
                    >
                      สารเคมี
                    </button>
                    <button
                      onClick={() => setActiveSection("training")}
                      className="w-full flex items-center justify-center px-4 py-3 lab-button-warning rounded-lg transition-colors"
                    >
                      การฝึกอบรม
                    </button>
                    <button
                      onClick={() => setActiveSection("qa")}
                      className="w-full flex items-center justify-center px-4 py-3 lab-button-secondary rounded-lg transition-colors"
                    >
                      QA
                    </button>
                  </div>
                </div>
              </div>

              <div className="lab-card">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    การฝึกอบรมล่าสุด
                  </h3>
                </div>
                <div className="p-6">
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      ไม่มีการฝึกอบรมล่าสุด
                    </p>
                  </div>
                </div>
              </div>

              <div className="lab-card">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    งานล่าสุด
                  </h3>
                </div>
                <div className="p-6">
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      ไม่มีงานล่าสุด
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
      
      <div className="flex h-screen pt-16">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
        />
        
        <main className="flex-1 lg:ml-64 p-6 overflow-y-auto custom-scrollbar">
          {renderMainContent()}
        </main>
      </div>
      
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

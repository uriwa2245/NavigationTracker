import { Bell, User, Menu } from "lucide-react";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center ml-2 lg:ml-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-lg">🧪</span>
              </div>
              <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100 thai-font">
                ระบบปฏิบัติการภายในห้องแลป
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-primary cursor-pointer" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Admin User
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

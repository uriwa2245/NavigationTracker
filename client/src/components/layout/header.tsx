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
              <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100 thai-font">
                Laboratory operating system
              </h1>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

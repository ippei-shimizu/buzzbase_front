import { adminLogout, getAdminUser } from "./auth/actions";
import Sidebar from "../_components/Sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const adminUser = await getAdminUser();
  const isAuthenticated = !!adminUser;

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Sidebar />}
      <div className={`${isAuthenticated ? 'md:pl-64' : ''} flex flex-col flex-1`}>
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center md:hidden">
              </div>
              <div className="hidden md:flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  BUZZ BASE Admin
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <form action={adminLogout}>
                  <button
                    type="submit"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    ログアウト
                  </button>
                </form>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

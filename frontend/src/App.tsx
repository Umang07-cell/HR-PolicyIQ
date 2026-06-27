import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { AppRouter } from "./router";
import { Navbar } from "./components/common/Navbar";
import { Sidebar } from "./components/common/Sidebar";
import { Toast } from "./components/common/Toast";
import { ErrorBoundary } from "./components/common/ErrorBoundary";

export default function App() {
  const { isAuthenticated, isHydrating, fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  if (isHydrating) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-slate-400 text-sm font-medium">Loading HR Platform...</span>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50">
        {isAuthenticated && <Navbar />}
        <div className="flex" style={{ height: isAuthenticated ? "calc(100vh - 3.5rem)" : "100vh" }}>
          {isAuthenticated && <Sidebar />}
          <main className="flex-1 overflow-y-auto">
            <AppRouter />
          </main>
        </div>
        <Toast />
      </div>
    </ErrorBoundary>
  );
}

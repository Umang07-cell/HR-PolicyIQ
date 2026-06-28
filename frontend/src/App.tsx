import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { AppRouter } from "./router";
import { Navbar } from "./components/common/Navbar";
import { Sidebar } from "./components/common/Sidebar";
import { Toast } from "./components/common/Toast";
import { ErrorBoundary } from "./components/common/ErrorBoundary";

function LoadingScreen() {
  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span className="text-slate-400 text-sm font-medium">Loading HR Platform…</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isHydrating, fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  if (isHydrating) return <LoadingScreen />;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-surface-secondary">
        {isAuthenticated && <Navbar />}
        <div
          className="flex"
          style={{ height: isAuthenticated ? "calc(100vh - 3.5rem)" : "100vh" }}
        >
          {isAuthenticated && <Sidebar />}
          <main className="flex-1 overflow-y-auto scrollbar-thin">
            <AppRouter />
          </main>
        </div>
        <Toast />
      </div>
    </ErrorBoundary>
  );
}

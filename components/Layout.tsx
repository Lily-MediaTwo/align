
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'workouts', icon: '💪', label: 'Lifts' },
    { id: 'hydration', icon: '💧', label: 'Pace' },
    { id: 'mood', icon: '🧠', label: 'Check-in' },
    { id: 'goals', icon: '🎯', label: 'Align' }
  ];

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-[#fcfbf7] shadow-2xl relative overflow-hidden ring-1 ring-stone-100">
      {/* Premium Header */}
      <header className="px-8 pt-10 pb-4 flex justify-between items-center bg-[#fcfbf7]/80 backdrop-blur-sm z-40 sticky top-0">
        <h1 className="serif text-3xl font-semibold tracking-tighter text-[#4a5d50]">Align</h1>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
             <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[10px] shadow-sm">🌿</div>
             <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-[10px] shadow-sm">✨</div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-8 pb-32 overflow-y-auto no-scrollbar scroll-smooth">
        {children}
      </main>

      {/* Minimal Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] bg-stone-900/95 backdrop-blur-lg rounded-[2.5rem] px-8 py-4 flex justify-between items-center z-50 shadow-2xl shadow-stone-900/40">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${
              activeTab === tab.id ? 'text-white scale-110' : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className={`text-[8px] uppercase font-bold tracking-[0.2em] transition-opacity duration-300 ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}`}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <span className="absolute -bottom-1 w-1 h-1 bg-white rounded-full animate-pulse"></span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;

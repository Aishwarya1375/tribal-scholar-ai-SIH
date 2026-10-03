import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AIAssistantWidget } from './components/AIAssistantWidget';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { ApplicationFormPage } from './pages/ApplicationFormPage';
import { DeficienciesPage } from './pages/DeficienciesPage';
import { ApplicationTimelinePage } from './pages/ApplicationTimelinePage';
import { OfficerQueuePage } from './pages/OfficerQueuePage';
import { OfficerScrutinyPage } from './pages/OfficerScrutinyPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { SchemeConfigPage } from './pages/SchemeConfigPage';
import { SelectionRankingPage } from './pages/SelectionRankingPage';
import { GrievancePage } from './pages/GrievancePage';
import { api } from './api/client';
import { User } from './types';
import {
  GraduationCap,
  FileCheck,
  BarChart3,
  AlertCircle,
  Home,
  MessageSquare
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('landing');
  const [viewParams, setViewParams] = useState<any>({});
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      try {
        if (api.getToken()) {
          const res = await api.getMe();
          setCurrentUser(res.user);
        } else {
          // Default to student demo user on initial load for instant demo accessibility
          const res = await api.login('student@demo.in', 'Demo@12345');
          setCurrentUser(res.user);
        }
      } catch {
        // Fallback login
        try {
          const res = await api.login('student@demo.in', 'Demo@12345');
          setCurrentUser(res.user);
        } catch {
          // Continue unauthenticated
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initSession();
  }, []);

  const handleNavigate = (view: string, params?: any) => {
    setCurrentView(view);
    if (params) {
      setViewParams(params);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchUser = async (email: string) => {
    try {
      const res = await api.login(email, 'Demo@12345');
      setCurrentUser(res.user);

      // Route to role-specific default view
      if (res.user.role === 'student') {
        setCurrentView('student-dashboard');
      } else if (res.user.role === 'verifier' || res.user.role === 'officer') {
        setCurrentView('officer-queue');
      } else if (res.user.role === 'admin') {
        setCurrentView('admin-dashboard');
      }
    } catch (err) {
      console.error('Failed to switch user:', err);
    }
  };

  const handleResetData = async () => {
    try {
      await api.resetDemoData();
      alert('Database restored to clean prototype seed state.');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to reset demo data.');
    }
  };

  const handleLogout = () => {
    api.setToken(null);
    setCurrentUser(null);
    setCurrentView('landing');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#0B2447] text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-amber-400/50 flex items-center justify-center text-2xl animate-bounce">
          🏛️
        </div>
        <h1 className="text-sm font-bold tracking-wider mt-4 text-amber-300 font-['Plus_Jakarta_Sans',sans-serif]">
          MoTA SCHOLARSHIP PORTAL
        </h1>
        <p className="text-xs text-slate-400 mt-1">Starting zero-dependency prototype engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Inter',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={handleNavigate}
        onSwitchUser={handleSwitchUser}
        onResetData={handleResetData}
        onLogout={handleLogout}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16 lg:pb-8">
        {currentView === 'landing' && (
          <LandingPage onNavigate={handleNavigate} onSwitchUser={handleSwitchUser} />
        )}

        {currentView === 'login' && (
          <LoginPage
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              if (user.role === 'student') setCurrentView('student-dashboard');
              else if (user.role === 'admin') setCurrentView('admin-dashboard');
              else setCurrentView('officer-queue');
            }}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'register' && (
          <RegisterPage
            onRegisterSuccess={(user) => {
              setCurrentUser(user);
              setCurrentView('student-dashboard');
            }}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'student-dashboard' && (
          <StudentDashboard onNavigate={handleNavigate} />
        )}

        {currentView === 'apply' && (
          <ApplicationFormPage
            initialSchemeCode={viewParams.schemeCode || 'NFST'}
            initialApplicationId={viewParams.applicationId}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'deficiencies' && (
          <DeficienciesPage onNavigate={handleNavigate} />
        )}

        {currentView === 'timeline' && (
          <ApplicationTimelinePage
            applicationId={viewParams.applicationId}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'officer-queue' && (
          <OfficerQueuePage onNavigate={handleNavigate} />
        )}

        {currentView === 'scrutiny' && (
          <OfficerScrutinyPage
            applicationId={viewParams.applicationId}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'admin-dashboard' && (
          <AdminDashboardPage
            onNavigate={handleNavigate}
            onResetData={handleResetData}
          />
        )}

        {currentView === 'scheme-config' && (
          <SchemeConfigPage />
        )}

        {currentView === 'selection-ranking' && (
          <SelectionRankingPage onNavigate={handleNavigate} />
        )}

        {currentView === 'grievance' && (
          <GrievancePage currentUser={currentUser} />
        )}
      </main>

      {/* Floating MoTA AI Scheme Assistant */}
      <AIAssistantWidget currentApplicationId={viewParams.applicationId} />

      {/* Mobile Bottom Navigation Bar (Optimized for 375px viewports) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0B2447] text-white border-t border-slate-800 flex items-center justify-around py-2 px-1">
        <button
          onClick={() => handleNavigate('landing')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold cursor-pointer ${
            currentView === 'landing' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        {currentUser?.role === 'student' ? (
          <>
            <button
              onClick={() => handleNavigate('student-dashboard')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold cursor-pointer ${
                currentView === 'student-dashboard' || currentView === 'apply'
                  ? 'text-amber-400'
                  : 'text-slate-400'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Portal</span>
            </button>
            <button
              onClick={() => handleNavigate('deficiencies')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold cursor-pointer ${
                currentView === 'deficiencies' ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              <span>Action</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleNavigate('officer-queue')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold cursor-pointer ${
                currentView === 'officer-queue' || currentView === 'scrutiny'
                  ? 'text-amber-400'
                  : 'text-slate-400'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Queue</span>
            </button>
            <button
              onClick={() => handleNavigate('admin-dashboard')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold cursor-pointer ${
                currentView === 'admin-dashboard' ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>KPIs</span>
            </button>
          </>
        )}

        <button
          onClick={() => handleNavigate('grievance')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold cursor-pointer ${
            currentView === 'grievance' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Help</span>
        </button>
      </div>
    </div>
  );
}

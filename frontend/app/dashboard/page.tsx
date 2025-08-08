'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/dashboard/sidebar'
import WelcomeState from '@/components/dashboard/welcome-state'
import AnalysisForm from '@/components/dashboard/analysis-form'
import ChatView from '@/components/dashboard/chat-view'
import RiskScoreDisplay from '@/components/dashboard/risk-score-display'

const API_URL = 'http://localhost:8000';

// --- Interfaces ---
interface User {
  id: string;
  name: string;
  email: string;
}
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}
interface RiskScore {
  score: number;
  justification: string;
}
interface RiskData {
  cardiovascular: RiskScore;
  diabetes: RiskScore;
  liver: RiskScore;
}
interface Session {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
  reportContext?: any;
  riskData?: RiskData;
}
type ViewState = 'welcome' | 'analysis-form' | 'chat';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [viewState, setViewState] = useState<ViewState>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisCount, setAnalysisCount] = useState(15);
  const [riskData, setRiskData] = useState<RiskData | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('hiaUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchSessions(parsedUser.id);
    } else {
      router.push('/auth');
    }
  }, [router]);

  const fetchSessions = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/sessions/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch sessions");
      const data = await response.json();
      setSessions(data);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleNewSession = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });
      if (!response.ok) throw new Error("Failed to create session");
      const newSession = await response.json();
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      setViewState('analysis-form');
      setRiskData(null);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectSession = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      try {
        const response = await fetch(`${API_URL}/sessions/${sessionId}/messages`);
        if (!response.ok) throw new Error("Failed to fetch messages");
        const messages = await response.json();
        const firstUserMessage = messages.find((m: Message) => m.role === 'user');
        let reportContext = {};
        if (firstUserMessage) {
            reportContext = { patient_name: session.title, report: firstUserMessage.content };
        }
        const fullSession = {...session, messages, reportContext};
        setCurrentSession(fullSession);
        setViewState(fullSession.messages.length > 0 ? 'chat' : 'analysis-form');
        setRiskData(null); 
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Failed to delete session");
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setViewState('welcome');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async (data: any) => {
    if (!currentSession || !data.file) return;
    setIsLoading(true);
    setError(null);
    setRiskData(null);
    
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('patient_name', data.patientName);
    formData.append('age', data.age);
    formData.append('gender', data.gender);
    formData.append('session_id', currentSession.id);

    try {
      const response = await fetch(`${API_URL}/analyze/initial`, { method: 'POST', body: formData });
      if (!response.ok) {
        const errData = await response.json();
        if (Array.isArray(errData.detail)) {
          throw new Error(errData.detail.map((e: any) => `${e.loc[1]}: ${e.msg}`).join(', '));
        }
        throw new Error(errData.detail || 'Analysis failed');
      }
      const result = await response.json();
      const updatedSession = { ...currentSession, reportContext: result.report_context };
      setCurrentSession(updatedSession);
      await handleRiskScoreAnalysis(result.report_context);
      await handleSelectSession(currentSession.id);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRiskScoreAnalysis = async (reportContext: any) => {
    try {
      const response = await fetch(`${API_URL}/analyze/risk-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_context: reportContext }),
      });
      if (!response.ok) throw new Error("Could not generate risk scores");
      const scores = await response.json();
      setRiskData(scores);
    } catch (error: any) {
      console.error("Risk score analysis failed:", error);
      setError(error.message || "Could not generate risk scores.");
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!currentSession) return;
    setIsLoading(true);
    setError(null);

    const tempUserMessage = { id: Date.now().toString(), content: message, role: 'user' as const, timestamp: new Date().toISOString() };
    setCurrentSession(prev => prev ? {...prev, messages: [...prev.messages, tempUserMessage]} : null);

    try {
        const response = await fetch(`${API_URL}/analyze/followup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt: message, 
              session_id: currentSession.id,
              report_context: currentSession.reportContext || {}
            }),
        });
        if (!response.ok) throw new Error("Failed to send message");
        await handleSelectSession(currentSession.id);
    } catch (error: any) {
        setError(error.message);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
      localStorage.removeItem('hiaUser');
      localStorage.removeItem('hiaToken');
      router.push('/auth');
  };

  // --- THE FIX: Simplified render logic to remove duplicate chat input ---
  const renderMainContent = () => {
    switch (viewState) {
      case 'welcome':
        return <WelcomeState onNewSession={handleNewSession} />;
      case 'analysis-form':
        return <AnalysisForm onAnalyze={handleAnalyze} isLoading={isLoading} />;
      case 'chat':
        return currentSession ? (
          <ChatView
            messages={currentSession.messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            riskData={riskData}
          />
        ) : <WelcomeState onNewSession={handleNewSession} />;
      default:
        return <WelcomeState onNewSession={handleNewSession} />;
    }
  };
  // --- END OF FIX ---

  return (
    <div className="h-screen bg-white flex border-4 border-black">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSession?.id || null}
        analysisCount={analysisCount}
        maxAnalyses={15}
        onNewSession={handleNewSession}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col border-l-4 border-black">
        {error && <div className="p-4 bg-red-500 text-white text-center font-bold" onClick={() => setError(null)}>{error}</div>}
        {renderMainContent()}
      </div>
    </div>
  );
}

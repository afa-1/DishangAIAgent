
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Login from './pages/Login';
import { ChatSession, Agent, Message } from './types';
import { MOCK_HISTORY } from './constants';

// Wrapper component to use hooks inside Router
const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>(MOCK_HISTORY);
  const [homeResetKey, setHomeResetKey] = useState(0); // Key to force Home re-render
  const navigate = useNavigate();

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleNewChat = () => {
    // Increment key to force Home component to remount (resetting state)
    setHomeResetKey(prev => prev + 1);
    navigate('/');
  };

  const handleSelectAgent = (agent: Agent) => {
    const newSessionId = Date.now().toString();
    const newSession: ChatSession = {
      id: newSessionId,
      title: `新任务: ${agent.name}`,
      agentId: agent.id,
      type: 'single',
      messages: [],
      updatedAt: Date.now()
    };
    setSessions([newSession, ...sessions]);
    navigate(`/chat/${newSessionId}`);
  };

  const handleCollaborationChat = (agentIds: string[]) => {
    const newSessionId = Date.now().toString();
    const newSession: ChatSession = {
       id: newSessionId,
       title: '员工协作任务',
       agentId: agentIds[0], // Primary agent (could be the first one)
       agentIds: agentIds,
       type: 'collaboration',
       messages: [],
       updatedAt: Date.now()
    };
    setSessions([newSession, ...sessions]);
    navigate(`/chat/${newSessionId}`);
  };

  const handleUpdateSession = (sessionId: string, messages: Message[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        // Auto-update title based on first user message if it's generic
        const newTitle = (s.messages.length === 0 && messages.length > 0) 
          ? messages[0].content.substring(0, 15) + '...' 
          : s.title;
        
        return { ...s, messages, title: newTitle, updatedAt: Date.now() };
      }
      return s;
    }));
  };

  // History Actions
  const handlePinSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, isPinned: !s.isPinned } : s
    ));
  };

  const handleFavoriteSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, isFavorite: !s.isFavorite } : s
    ));
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    navigate('/');
  };

  // If not authenticated, show Login page
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Main App Layout
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar 
        recentChats={sessions} 
        onNewChat={handleNewChat} 
        onLogout={handleLogout} 
        onCollaboration={handleCollaborationChat}
        onPinSession={handlePinSession}
        onFavoriteSession={handleFavoriteSession}
        onDeleteSession={handleDeleteSession}
      />
      <Routes>
        <Route 
          path="/" 
          element={
            <Home 
              key={homeResetKey} // Force reset when New Task is clicked
              onSelectAgent={handleSelectAgent} 
            />
          } 
        />
        <Route 
          path="/chat/:sessionId" 
          element={<Chat sessions={sessions} onUpdateSession={handleUpdateSession} />} 
        />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

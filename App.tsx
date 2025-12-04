
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Login from './pages/Login';
import OnboardingModal from './components/OnboardingModal';
import { ChatSession, Agent, Message, CollaborationGroup } from './types';
import { MOCK_HISTORY, DISHANG_AGENTS, MOCK_GROUPS } from './constants';

// Wrapper component to use hooks inside Router
const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>(MOCK_HISTORY);
  const [groups, setGroups] = useState<CollaborationGroup[]>(MOCK_GROUPS);
  const [homeResetKey, setHomeResetKey] = useState(0); // Key to force Home re-render
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
      if (!hasCompletedOnboarding) {
        // Small delay to ensure smooth transition
        const timer = setTimeout(() => {
          setShowOnboarding(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated]);

  const handleOnboardingConfirm = (selectedIds: string[]) => {
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('user_selected_agents', JSON.stringify(selectedIds));
    setShowOnboarding(false);
    
    // Here you could also add these agents to a "favorites" list or create initial sessions
    console.log('User selected agents:', selectedIds);
  };

  const handleOnboardingClose = () => {
    // Treat close as "Skip"
    localStorage.setItem('onboarding_completed', 'true'); 
    setShowOnboarding(false);
  };

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
    // Check if there is an existing session for this agent
    // We prioritize the most recently updated session
    const existingSession = sessions
      .filter(s => s.agentId === agent.id && s.type === 'single')
      .sort((a, b) => b.updatedAt - a.updatedAt)[0];

    if (existingSession) {
      navigate(`/chat/${existingSession.id}`);
    } else {
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
    }
  };

  const handleCollaborationChat = (agentIds: string[], groupName: string, initialMessage?: string) => {
    const newGroupId = Date.now().toString();
    
    // Create new group
    const newGroup: CollaborationGroup = {
      id: newGroupId,
      name: groupName,
      department: '跨部门协作',
      task: '新协作任务',
      deadline: '进行中',
      status: 'active',
      unreadCount: 0,
      memberAgentIds: agentIds,
      updatedAt: Date.now()
    };
    setGroups([newGroup, ...groups]);

    const newSessionId = (Date.now() + 1).toString();
    const newSession: ChatSession = {
       id: newSessionId,
       title: groupName,
       agentId: agentIds[0], // Primary agent (could be the first one)
       agentIds: agentIds,
       type: 'collaboration',
       messages: initialMessage ? [{
         id: Date.now().toString(),
         role: 'user',
         content: initialMessage,
         timestamp: Date.now()
       }] : [],
       updatedAt: Date.now(),
       groupId: newGroupId,
       groupName: groupName
    };
    setSessions([newSession, ...sessions]);
    navigate(`/chat/${newSessionId}`);
  };

  const handleGroupClick = (group: CollaborationGroup) => {
    // Find active session for this group
    const groupSessions = sessions.filter(s => s.groupId === group.id).sort((a, b) => b.updatedAt - a.updatedAt);
    const activeSession = groupSessions.find(s => s.status !== 'completed');

    if (activeSession) {
      navigate(`/chat/${activeSession.id}`);
    } else {
      // Create new session for this group if all are completed or none exist
      const newSessionId = Date.now().toString();
      const newSession: ChatSession = {
         id: newSessionId,
         title: group.name,
         agentId: group.memberAgentIds[0],
         agentIds: group.memberAgentIds,
         type: 'collaboration',
         messages: [],
         updatedAt: Date.now(),
         groupId: group.id,
         groupName: group.name
      };
      setSessions([newSession, ...sessions]);
      navigate(`/chat/${newSessionId}`);
    }
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

  const handleEndSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'completed' } : s));
  };

  const handleCreateNewSession = (agentId: string) => {
     const agent = DISHANG_AGENTS.find(a => a.id === agentId);
     if (!agent) return;

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

  // If not authenticated, show Login page
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Main App Layout
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar 
        recentChats={sessions} 
        groups={groups}
        onNewChat={handleNewChat} 
        onLogout={handleLogout} 
        onCollaboration={handleCollaborationChat}
        onGroupClick={handleGroupClick}
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
              onCollaboration={handleCollaborationChat}
            />
          } 
        />
        <Route 
          path="/chat/:sessionId" 
          element={
            <Chat 
              sessions={sessions} 
              onUpdateSession={handleUpdateSession} 
              onEndSession={handleEndSession}
              onCreateNewSession={handleCreateNewSession}
              onFavoriteSession={handleFavoriteSession}
            />
          } 
        />
      </Routes>

      <OnboardingModal 
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
        onConfirm={handleOnboardingConfirm}
      />
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

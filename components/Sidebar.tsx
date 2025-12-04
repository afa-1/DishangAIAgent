import React, { useState, useMemo, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  Users, 
  UserCircle2, 
  Star,
  Settings,
  ChevronRight,
  Clock,
  SquarePen,
  User
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChatSession, Agent, AgentCategory, CollaborationGroup, GroupStatus } from '../types';
import { DISHANG_AGENTS } from '../constants';
import * as Icons from 'lucide-react';
import AgentSelectionModal from './AgentSelectionModal';

// --- Helper Components ---

interface SidebarAgentItemProps {
  agent: Agent;
  lastMsgContent: string | null;
  lastMsgTime: Date | null;
  lastMsgSessionId: string | null;
  isActive: boolean;
  isCollapsed: boolean;
  onAgentClick: (agent: Agent, sessionId?: string) => void;
}

// 使用 React.memo 优化渲染性能
const SidebarAgentItem = React.memo(({ 
  agent, 
  lastMsgContent, 
  lastMsgTime, 
  lastMsgSessionId, 
  isActive, 
  isCollapsed,
  onAgentClick 
}: SidebarAgentItemProps) => {
  // Helper to get Agent Icon dynamically
  const Icon = (Icons as any)[agent.icon] || Icons.Bot;

  // Format time for display
  const formatTime = (date: Date) => {
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth();
    const isYesterday = date.getDate() === now.getDate() - 1 && date.getMonth() === now.getMonth();
    
    if (isToday) return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    if (isYesterday) return '昨天';
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const handleClick = () => {
    onAgentClick(agent, lastMsgSessionId || undefined);
  };

  return (
    <div 
      onClick={handleClick}
      className={`group flex items-center ${isCollapsed ? 'justify-center p-2' : 'p-2'} rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-sm ${
        isActive ? 'bg-white border-indigo-100 shadow-sm' : 'transparent'
      }`}
      title={isCollapsed ? agent.name : undefined}
    >
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm flex-shrink-0 ${
        agent.category === AgentCategory.DESIGN ? 'bg-orange-400' :
        agent.category === AgentCategory.PRODUCTION ? 'bg-blue-500' :
        'bg-indigo-500'
      }`}>
        <Icon size={16} strokeWidth={2} />
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="ml-3 flex-1 min-w-0 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-medium truncate ${isActive ? 'text-indigo-700' : 'text-slate-700'}`}>
              {agent.name}
            </h4>
            {lastMsgTime ? (
               <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{formatTime(lastMsgTime)}</span>
            ) : (
               <span className="flex items-center text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full ml-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></div>
                 在线
               </span>
            )}
          </div>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {lastMsgContent || agent.description}
          </p>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数，确保只有关键数据变化时才重渲染
  return (
    prevProps.isActive === nextProps.isActive &&
    prevProps.isCollapsed === nextProps.isCollapsed &&
    prevProps.lastMsgContent === nextProps.lastMsgContent &&
    prevProps.lastMsgSessionId === nextProps.lastMsgSessionId &&
    prevProps.lastMsgTime?.getTime() === nextProps.lastMsgTime?.getTime() &&
    prevProps.agent.id === nextProps.agent.id
  );
});

interface SidebarGroupItemProps {
  groupData: CollaborationGroup;
  isCollapsed: boolean;
  onClick: () => void;
}

const SidebarGroupItem = React.memo(({ groupData, isCollapsed, onClick }: SidebarGroupItemProps) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group relative ${isCollapsed ? 'p-2 flex justify-center' : 'p-3'}`}
      title={isCollapsed ? groupData.name : undefined}
    >
      <div className={`flex items-start ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
        {/* Status Bar & Icon */}
        <div className="relative">
           <div className={`absolute -left-3 top-0 bottom-0 w-1 rounded-r-full ${
             groupData.status === 'active' ? 'bg-orange-500' : 
             groupData.status === 'pending' ? 'bg-slate-300' : 'bg-emerald-500'
           } ${isCollapsed ? 'hidden' : ''}`}></div>
           <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 border border-slate-100">
             <Users size={18} />
           </div>
           {groupData.unreadCount > 0 && (
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center border border-white font-bold">
               {groupData.unreadCount}
             </div>
           )}
        </div>

        {/* Info */}
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-800 truncate">
              {groupData.name}
            </h4>
            <p className="text-xs text-slate-500 mt-1 truncate flex items-center">
              <Clock size={10} className="mr-1"/> {groupData.deadline}
            </p>
          </div>
        )}
      </div>
      
      {!isCollapsed && (
        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 bg-slate-50 rounded-md px-2 py-1.5">
           <span className="truncate max-w-[120px]">{groupData.task}</span>
           <span>{groupData.department}</span>
        </div>
      )}
    </div>
  );
});

interface SidebarProps {
  recentChats: ChatSession[];
  groups: CollaborationGroup[];
  onNewChat: () => void;
  onLogout: () => void;
  onCollaboration: (agentIds: string[], groupName: string, initialMessage?: string) => void;
  onGroupClick: (group: CollaborationGroup) => void;
  onPinSession: (id: string) => void;
  onFavoriteSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  recentChats, 
  groups,
  onNewChat, 
  onLogout, 
  onCollaboration,
  onGroupClick,
  onPinSession,
  onFavoriteSession,
  onDeleteSession
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'employees' | 'groups'>('employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<GroupStatus>('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // --- Helper Functions ---

  const lastMessageMap = useMemo(() => {
    const map = new Map<string, { content: string; time: Date; sessionId: string; updatedAt: number }>();
    for (const c of recentChats) {
      if (c.type === 'collaboration' || !c.agentId) continue;
      const prev = map.get(c.agentId);
      if (!prev || c.updatedAt > prev.updatedAt) {
        const lastMsg = c.messages[c.messages.length - 1];
        map.set(c.agentId, {
          content: lastMsg ? lastMsg.content : '暂无对话',
          time: new Date(c.updatedAt),
          sessionId: c.id,
          updatedAt: c.updatedAt
        });
      }
    }
    return map;
  }, [recentChats]);

  const getAgentLastMessage = (agentId: string) => {
    const info = lastMessageMap.get(agentId);
    if (!info) return null;
    const { content, time, sessionId } = info;
    return { content, time, sessionId };
  };

  // Handle Agent Click
  const handleAgentClick = useCallback((agent: Agent, sessionId?: string) => {
    if (sessionId) {
      navigate(`/chat/${sessionId}`);
    } else {
      navigate(`/?startAgent=${agent.id}`);
    }
  }, [navigate]);

  // --- Data Preparation ---

  const groupedAgents = useMemo(() => {
    return Object.values(AgentCategory).reduce((acc, category) => {
      const agents = DISHANG_AGENTS.filter(a => a.category === category);
      if (agents.length > 0) {
        acc[category] = agents;
      }
      return acc;
    }, {} as Record<string, Agent[]>);
  }, []);

  const filteredAgentCategories = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return (Object.entries(groupedAgents) as [string, Agent[]][]) .reduce((acc, [category, agents]) => {
      const filtered = agents.filter(a => 
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
      return acc;
    }, {} as Record<string, Agent[]>);
  }, [groupedAgents, searchQuery]);

  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return groups.filter(g => {
      const matchesSearch = g.name.toLowerCase().includes(q) || g.task.toLowerCase().includes(q);
      const matchesStatus = true; // No longer filtering by group status
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, groupFilter, groups]);

  // --- Renderers ---

  const renderEmployeeList = () => (
    <div className="space-y-6 pb-4">
      {(Object.entries(filteredAgentCategories) as [string, Agent[]][]).map(([category, agents]) => (
        <div key={category}>
          {!isCollapsed && (
            <div className="flex items-center space-x-2 px-4 mb-2">
              <div className="h-3 w-[2px] bg-indigo-500 rounded-full"></div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {category} <span className="text-slate-400 font-normal ml-1">({agents.length})</span>
              </h3>
            </div>
          )}
          <div className="space-y-1 px-2">
            {agents.map(agent => {
              const lastMsgInfo = getAgentLastMessage(agent.id);
              // 只有当 lastMsgInfo.sessionId 存在且匹配当前 URL 时才高亮
              const isActive = !!lastMsgInfo && location.pathname.includes(`/chat/${lastMsgInfo.sessionId}`);
              
              return (
                <SidebarAgentItem
                  key={agent.id}
                  agent={agent}
                  lastMsgContent={lastMsgInfo?.content || null}
                  lastMsgTime={lastMsgInfo?.time || null}
                  lastMsgSessionId={lastMsgInfo?.sessionId || null}
                  isActive={isActive}
                  isCollapsed={isCollapsed}
                  onAgentClick={handleAgentClick}
                />
              );
            })}
          </div>
        </div>
      ))}
      
      {Object.keys(filteredAgentCategories).length === 0 && (
        <div className="text-center py-8 text-slate-400 text-sm">
          {isCollapsed ? '无' : '未找到匹配的员工'}
        </div>
      )}
    </div>
  );

  const renderGroupList = () => (
    <div className="space-y-3 px-2 pb-4">
      {filteredGroups.map(group => (
        <SidebarGroupItem 
          key={group.id}
          groupData={group}
          isCollapsed={isCollapsed}
          onClick={() => onGroupClick(group)}
        />
      ))}

      {filteredGroups.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-sm">
          {isCollapsed ? '无' : `暂无群组`}
        </div>
      )}
    </div>
  );

  return (
    <>
    <div className={`${isCollapsed ? 'w-20' : 'w-[280px]'} h-screen bg-[#f8f9fa] flex flex-col flex-shrink-0 border-r border-slate-200 z-20 font-sans transition-all duration-300 ease-in-out relative`}>
      
      {/* Floating Collapse Toggle (Right Center) */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 z-50 bg-white rounded-full p-1.5 border border-slate-200 shadow-md text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all hidden md:flex"
        title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
      >
        <ChevronRight size={14} className={`transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} strokeWidth={2.5} />
      </button>

      {/* Top Header Area */}
      <div className="flex-shrink-0 bg-[#f8f9fa] pt-4 pb-2 z-10">
        {/* Header: Logo & New Task Action */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center flex-col gap-4' : 'justify-between px-5'} mb-3 transition-all`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
              D
            </div>
            {!isCollapsed && (
              <span className="font-bold text-slate-800 text-lg tracking-tight whitespace-nowrap animate-fadeIn">迪尚AI平台</span>
            )}
          </div>
          
          {/* Compact New Task Button */}
          <button 
            onClick={onNewChat}
            className={`${isCollapsed ? 'w-10 h-10 rounded-xl bg-blue-600 text-white shadow-lg' : 'px-3 py-1.5 rounded-xl bg-blue-600 text-white shadow-md'} hover:bg-blue-700 flex items-center justify-center transition-all hover:shadow-lg group`}
            title="新建任务"
          >
            <SquarePen size={18} strokeWidth={2.5} className={isCollapsed ? '' : 'mr-1.5'} />
            {!isCollapsed && <span className="text-sm font-bold">新任务</span>}
          </button>
        </div>

        {/* Unified Search Bar (Sticky) */}
        {!isCollapsed && (
          <div className="px-4 pb-2 animate-fadeIn sticky top-0 bg-[#f8f9fa] z-20">
            <div className="relative group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="搜索员工、群组..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-sm text-slate-700 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 border border-slate-200 transition-all placeholder:text-slate-400 shadow-sm"
              />
            </div>
          </div>
        )}

        {/* Segmented Control (Tabs) */}
        {(!searchQuery || isCollapsed) && (
          <div className={`px-4 mt-1 pb-2 ${!isCollapsed && 'border-b border-slate-100/50'}`}>
            {isCollapsed ? (
              // Collapsed Tab Icons
              <div className="flex flex-col space-y-2 items-center">
                 <button 
                   onClick={() => setActiveTab('employees')}
                   className={`p-2 rounded-xl transition-all ${activeTab === 'employees' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:bg-slate-100'}`}
                   title="员工"
                 >
                   <User size={20} />
                 </button>
                 <button 
                   onClick={() => setActiveTab('groups')}
                   className={`p-2 rounded-xl transition-all ${activeTab === 'groups' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:bg-slate-100'}`}
                   title="群组"
                 >
                   <Users size={20} />
                 </button>
              </div>
            ) : (
              // Expanded Tabs
              <div className="flex p-1 bg-slate-200/60 rounded-xl animate-fadeIn">
                <button 
                  onClick={() => setActiveTab('employees')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'employees' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  员工
                </button>
                <button 
                  onClick={() => setActiveTab('groups')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'groups' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  群组
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main List Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pt-2">
        
        {/* Search Results View */}
        {searchQuery && !isCollapsed ? (
           <div className="space-y-6 pb-4">
             {/* Search Matches for Agents */}
             {Object.keys(filteredAgentCategories).length > 0 && (
               <div>
                 <div className="flex items-center space-x-2 px-4 mb-2 mt-2">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">匹配员工</h3>
                 </div>
                 <div className="space-y-1 px-2">
                   {(Object.values(filteredAgentCategories) as Agent[][]).flat().map(agent => {
                      const lastMsgInfo = getAgentLastMessage(agent.id);
                      const isActive = !!lastMsgInfo && location.pathname.includes(`/chat/${lastMsgInfo.sessionId}`);
                      return (
                        <SidebarAgentItem
                          key={agent.id}
                          agent={agent}
                          lastMsgContent={lastMsgInfo?.content || null}
                          lastMsgTime={lastMsgInfo?.time || null}
                          lastMsgSessionId={lastMsgInfo?.sessionId || null}
                          isActive={isActive}
                          isCollapsed={isCollapsed}
                          onAgentClick={handleAgentClick}
                        />
                      );
                   })}
                 </div>
               </div>
             )}

             {/* Search Matches for Groups */}
             {filteredGroups.length > 0 && (
               <div>
                 <div className="flex items-center space-x-2 px-4 mb-2 mt-2">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">匹配群组</h3>
                 </div>
                 <div className="space-y-2 px-2">
                   {filteredGroups.map(group => (
                     <div key={group.id} className="bg-white rounded-lg p-3 border border-slate-100 shadow-sm flex items-center space-x-3">
                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 border border-slate-100">
                          <Users size={16} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{group.name}</h4>
                          <p className="text-[10px] text-slate-500">{group.task}</p>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {Object.keys(filteredAgentCategories).length === 0 && filteredGroups.length === 0 && (
               <div className="text-center py-8 text-slate-400 text-sm">
                 未找到相关内容
               </div>
             )}
           </div>
        ) : (
          /* Normal Tab View */
          <>
            {activeTab === 'employees' ? renderEmployeeList() : (
              <>
                {renderGroupList()}
              </>
            )}
          </>
        )}
      </div>

      {/* Bottom Area: Favorites & Profile & Collapse Toggle (Unified Container) */}
      <div className="flex-shrink-0 border-t border-slate-200 bg-slate-100">
        <div className="flex flex-col p-2 space-y-1">
          {/* Favorites Link */}
           <button
            onClick={() => {}} 
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'space-x-3 px-3 py-2'} rounded-xl transition-all text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm hover:text-blue-600 group border border-transparent`}
            title={isCollapsed ? "我的收藏" : undefined}
          >
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-amber-400 group-hover:text-amber-500 shadow-sm border border-slate-100 transition-colors flex-shrink-0">
              <Star size={16} strokeWidth={2.5} fill="currentColor" className="opacity-100" />
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 text-left">
                  <span className="block text-slate-700 group-hover:text-blue-700 font-bold">我的收藏</span>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-400" />
              </>
            )}
          </button>

          {/* User Profile */}
          <div 
            className={`flex items-center ${isCollapsed ? 'justify-center p-2' : 'space-x-3 px-3 py-2'} cursor-pointer rounded-xl transition-all border border-transparent hover:bg-white hover:shadow-sm group`} 
            onClick={onLogout}
            title={isCollapsed ? "设计总监 (点击退出)" : undefined}
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-slate-500 overflow-hidden border border-slate-100 shadow-sm">
                <UserCircle2 size={36} />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-700 group-hover:text-blue-600 truncate">设计总监</h4>
                  <p className="text-[10px] text-slate-400 truncate">点击退出登录</p>
                </div>
                <Settings size={16} className="text-slate-300 group-hover:text-slate-500" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Modal */}
    <AgentSelectionModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onConfirm={(agentIds, groupName) => {
        onCollaboration(agentIds, groupName);
        setIsModalOpen(false);
      }}
    />
  </>
  );
};

export default Sidebar;

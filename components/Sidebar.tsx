
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  MessageSquare, 
  LayoutGrid, 
  Palette, 
  Factory, 
  Megaphone, 
  Headphones, 
  Briefcase, 
  MessageSquareText,
  UserCircle2,
  Star,
  Users,
  MoreHorizontal,
  Pin,
  Trash2,
  PinOff
} from 'lucide-react';
import { ChatSession } from '../types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AgentSelectionModal from './AgentSelectionModal';

interface SidebarProps {
  recentChats: ChatSession[];
  onNewChat: () => void;
  onLogout: () => void;
  onCollaboration: (agentIds: string[]) => void;
  onPinSession: (id: string) => void;
  onFavoriteSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  recentChats, 
  onNewChat, 
  onLogout, 
  onCollaboration,
  onPinSession,
  onFavoriteSession,
  onDeleteSession
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuGroups = [
    {
      title: '工作台',
      items: [
        { label: '收藏夹', icon: Star, path: '/', action: 'reset' },
      ]
    },
    {
      title: '业务板块',
      items: [
        { label: '趋势与设计', icon: Palette, path: '/?category=趋势与设计' },
        { label: '生产与供应链', icon: Factory, path: '/?category=生产与供应链' },
        { label: '营销与销售', icon: Megaphone, path: '/?category=营销与销售' },
        { label: '客户服务', icon: Headphones, path: '/?category=客户服务' },
        { label: '内部管理与协同', icon: Briefcase, path: '/?category=内部管理与协同' },
      ]
    }
  ];

  // Sort chats: Pinned first, then by updatedAt desc
  const sortedChats = [...recentChats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  const handleMenuAction = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
    setActiveMenuId(null);
  };

  return (
    <>
    <div className="w-[260px] h-screen bg-[#F7F8FA] flex flex-col flex-shrink-0 border-r border-slate-200 z-10 font-sans">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-5 mb-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
            D
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">迪尚AI Agent平台</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 mb-6 flex items-center space-x-2">
        <button 
          onClick={onNewChat}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 px-4 flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-200 hover:shadow-lg font-medium"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>新建任务</span>
        </button>
        
        {/* Collaboration Button (Smaller) */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-12 h-12 bg-white hover:bg-blue-50 text-blue-600 border border-blue-100 rounded-lg flex items-center justify-center transition-all shadow-sm hover:shadow-md tooltip-container"
          title="员工协作"
        >
          <Users size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto px-4 space-y-8 scrollbar-hide pb-4">
        
        {/* Menu Groups */}
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="text-xs font-semibold text-slate-400 mb-3 px-2">{group.title}</h3>
            <div className="space-y-1">
              {group.items.map((item, i) => {
                const isActive = item.path === location.pathname + location.search;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (item.action === 'reset') onNewChat();
                      else navigate(item.path);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                      isActive 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon size={18} strokeWidth={2} className={isActive ? 'text-blue-600' : 'text-slate-500'}/>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Recent Chats (History) */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 mb-3 px-2">历史记录</h3>
          <div className="space-y-1">
            {sortedChats.length === 0 && (
              <div className="text-xs text-slate-400 px-3 py-2">暂无历史记录</div>
            )}
            {sortedChats.map((chat) => {
              const isActive = location.pathname === `/chat/${chat.id}`;
              const isCollab = chat.type === 'collaboration';
              const showMenu = activeMenuId === chat.id;

              return (
                <div key={chat.id} className="relative group">
                  <Link 
                    to={`/chat/${chat.id}`}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm group relative ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      {isCollab ? (
                        <Users size={18} className={`flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      ) : (
                        <MessageSquareText size={18} className={`flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      )}
                      <span className={`truncate flex-1 ${chat.isPinned ? 'font-medium' : ''}`}>{chat.title}</span>
                      {chat.isPinned && <Pin size={12} className="text-blue-500 flex-shrink-0 rotate-45" fill="currentColor" />}
                    </div>
                    
                    {/* More Button (Visible on hover or if menu open) */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveMenuId(showMenu ? null : chat.id);
                      }}
                      className={`p-1 rounded hover:bg-slate-200/80 transition-opacity ${isActive || showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                      <MoreHorizontal size={14} className="text-slate-500"/>
                    </button>
                  </Link>

                  {/* Dropdown Menu */}
                  {showMenu && (
                    <div ref={menuRef} className="absolute right-0 top-8 w-32 bg-white rounded-lg shadow-xl border border-slate-100 z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                      <button 
                        onClick={(e) => handleMenuAction(e, () => onPinSession(chat.id))}
                        className="w-full px-3 py-2 text-left text-xs flex items-center space-x-2 hover:bg-slate-50 text-slate-700"
                      >
                        {chat.isPinned ? <PinOff size={14}/> : <Pin size={14}/>}
                        <span>{chat.isPinned ? '取消置顶' : '置顶对话'}</span>
                      </button>
                      <button 
                        onClick={(e) => handleMenuAction(e, () => onFavoriteSession(chat.id))}
                        className="w-full px-3 py-2 text-left text-xs flex items-center space-x-2 hover:bg-slate-50 text-slate-700"
                      >
                        <Star size={14} fill={chat.isFavorite ? "currentColor" : "none"} className={chat.isFavorite ? "text-amber-400" : ""}/>
                        <span>{chat.isFavorite ? '取消收藏' : '加入收藏'}</span>
                      </button>
                      <div className="h-[1px] bg-slate-100 my-1"></div>
                      <button 
                        onClick={(e) => handleMenuAction(e, () => onDeleteSession(chat.id))}
                        className="w-full px-3 py-2 text-left text-xs flex items-center space-x-2 hover:bg-red-50 text-red-600"
                      >
                        <Trash2 size={14}/>
                        <span>删除对话</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Profile (Bottom) */}
      <div className="p-4 border-t border-slate-200 mt-auto">
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-white p-2 rounded-xl transition-colors group" onClick={onLogout}>
          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 overflow-hidden">
             <UserCircle2 size={36} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-700 truncate">设计总监</p>
            <p className="text-xs text-slate-400 truncate">点击退出登录</p>
          </div>
        </div>
      </div>
    </div>

    {/* Selection Modal */}
    <AgentSelectionModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)}
      onConfirm={(ids) => {
        onCollaboration(ids);
        setIsModalOpen(false);
      }}
    />
    </>
  );
};

export default Sidebar;

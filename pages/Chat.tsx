
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatSession, Message, StepLog, Agent, AgentCategory, FileItem } from '../types';
import { DISHANG_AGENTS } from '../constants';
import { streamAgentResponse } from '../services/geminiService';
import { Send, Paperclip, Bot, User, Loader2, MoreHorizontal, Share2, Star, Sparkles, ArrowRight, ChevronRight, BookOpen, BarChart3, FileText, Image as ImageIcon, Box, X, History, Users, FolderOpen, GitMerge, Link, Clock, Check, Power } from 'lucide-react';
import * as Icons from 'lucide-react';
import FileViewerModal from '../components/FileViewerModal';
import SharePopover from '../components/SharePopover';

interface ChatProps {
  sessions: ChatSession[];
  onUpdateSession: (sessionId: string, messages: Message[]) => void;
  onEndSession: (sessionId: string) => void;
  onCreateNewSession: (agentId: string) => void;
  onFavoriteSession: (sessionId: string) => void;
}

// Mock Files Data
const MOCK_FILES: FileItem[] = [
  { id: 'f1', name: '安全生产平台培训.pdf', type: 'pdf', size: '2.4MB', timestamp: '04-24 13:54' },
  { id: 'f2', name: '安全生产平台产品培训文档.docx', type: 'word', size: '1.8MB', timestamp: '04-24 13:46', isFavorite: true },
  { id: 'f3', name: '安全生产平台产品目标.xlsx', type: 'excel', size: '56KB', timestamp: '04-24 13:46' },
  { id: 'f4', name: '产品背景信息收集结果.docx', type: 'word', size: '12KB', timestamp: '04-24 13:46' },
  { id: 'f5', name: '安全生产平台功能结构图.png', type: 'image', size: '3.2MB', timestamp: '04-24 13:42' },
  { id: 'f6', name: '2024秋季新品发布会.mp4', type: 'video', size: '128MB', timestamp: '04-23 10:00' },
];

// Helper to generate mock cases based on category
const getMockCases = (category: AgentCategory) => {
  switch (category) {
    case AgentCategory.DESIGN:
      return [
        { title: '2024早秋女装趋势报告', type: 'Report', color: 'bg-rose-50', icon: 'TrendingUp' },
        { title: '极简主义西装设计稿', type: 'Design', color: 'bg-pink-50', icon: 'Scissors' },
        { title: '法式复古连衣裙面料方案', type: 'Material', color: 'bg-orange-50', icon: 'Palette' },
      ];
    case AgentCategory.PRODUCTION:
      return [
        { title: 'Q3 原料库存消耗预测', type: 'Excel', color: 'bg-blue-50', icon: 'Table' },
        { title: '智能工厂动态排产表', type: 'Schedule', color: 'bg-cyan-50', icon: 'CalendarClock' },
        { title: '供应链成本分析报告', type: 'Report', color: 'bg-indigo-50', icon: 'BarChart3' },
      ];
    case AgentCategory.SALES:
      return [
        { title: '双11男装营销策划案', type: 'Plan', color: 'bg-violet-50', icon: 'Target' },
        { title: '小红书种草文案 - 羊毛衫', type: 'Social', color: 'bg-purple-50', icon: 'Smartphone' },
        { title: 'VIP客户画像分析', type: 'Analysis', color: 'bg-fuchsia-50', icon: 'Users' },
      ];
    default:
      return [
        { title: '业务流程规范文档', type: 'Doc', color: 'bg-slate-50', icon: 'FileText' },
        { title: '员工培训考核试题', type: 'Quiz', color: 'bg-slate-50', icon: 'CheckSquare' },
        { title: '季度部门协作报表', type: 'Report', color: 'bg-slate-50', icon: 'PieChart' },
      ];
  }
};

// Helper for abortable delay
const delay = (ms: number, signal?: AbortSignal) => {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort);
  });
};

const Chat: React.FC<ChatProps> = ({ sessions, onUpdateSession, onEndSession, onCreateNewSession, onFavoriteSession }) => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [liveSteps, setLiveSteps] = useState<StepLog[]>([]); // Current generation steps
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSteps, setDrawerSteps] = useState<StepLog[]>([]); // Steps to show in drawer
  const [activeCollabAgentId, setActiveCollabAgentId] = useState<string | null>(null);
  
  const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
  const [isSharePopoverOpen, setIsSharePopoverOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const streamAbortRef = useRef<AbortController | null>(null);
  
  const session = sessions.find(s => s.id === sessionId);
  const agent = DISHANG_AGENTS.find(a => a.id === session?.agentId);
  const isCollaboration = session?.type === 'collaboration';

  // For collaboration, get all participants
  const collabAgents = isCollaboration && session?.agentIds 
     ? DISHANG_AGENTS.filter(a => session.agentIds?.includes(a.id))
     : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.messages, liveSteps]);

  useEffect(() => {
    if (streamAbortRef.current) {
      streamAbortRef.current.abort();
    }
    setIsStreaming(false);
    setInput('');
    setLiveSteps([]);
    setDrawerOpen(false);
    setActiveCollabAgentId(null);
    setIsHistoryDrawerOpen(false);
    setIsFilesModalOpen(false);
    setIsSharePopoverOpen(false);
  }, [sessionId]);

  if (!session || (!agent && !isCollaboration)) {
    return <div className="flex-1 flex items-center justify-center text-slate-400">Session not found</div>;
  }

  const IconComponent = agent ? (Icons as any)[agent.icon] || Icons.Bot : Icons.Users;
  const mockCases = agent ? getMockCases(agent.category) : getMockCases(AgentCategory.MANAGEMENT);

  // Generate steps and return them for saving
  const simulateSteps = async (signal?: AbortSignal, promptText: string = '') => {
    const newSteps: StepLog[] = [
      { id: '1', title: '用户发送信息', description: `接收到指令：${promptText.length > 15 ? promptText.substring(0, 15) + '...' : promptText}`, status: 'pending', timestamp: '00:00' },
      { id: '2', title: '文件读取', description: '正在检索安全生产平台相关文档...', status: 'pending', timestamp: '00:01' },
      { id: '3', title: '虚拟终端', description: '正在运行数据分析脚本...', status: 'pending', timestamp: '00:02' },
    ];
    
    if (signal?.aborted) return [];
    setLiveSteps(newSteps);

    try {
      // Simulate progress
      for (let i = 0; i < newSteps.length; i++) {
        if (signal?.aborted) return [];
        setLiveSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'processing' } : s));
        await delay(800, signal);
        setLiveSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'completed' } : s));
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return [];
      }
      throw error;
    }
    
    // Return the completed steps to be saved
    return newSteps.map(s => ({...s, status: 'completed' as const}));
  };

  const handleSubmit = async (promptText: string = input) => {
    if (!promptText.trim() || isStreaming) return;

    let finalPrompt = promptText;
    if (isCollaboration && activeCollabAgentId) {
       const targetAgent = collabAgents.find(a => a.id === activeCollabAgentId);
       if (targetAgent) {
         finalPrompt = `@${targetAgent.name} ${promptText}`;
       }
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: finalPrompt,
      timestamp: Date.now()
    };

    const updatedMessages = [...session.messages, userMsg];
    onUpdateSession(session.id, updatedMessages);
    setInput('');
    setIsStreaming(true);
    if (streamAbortRef.current) {
      streamAbortRef.current.abort();
    }
    streamAbortRef.current = new AbortController();

    const completedStepsPromise = simulateSteps(streamAbortRef.current.signal, finalPrompt);

    const aiMsgId = (Date.now() + 1).toString();
    let aiContent = '';
    const sysInstruction = isCollaboration 
       ? "你是迪尚集团的虚拟专家团队协调员。请根据用户需求，调度相关领域的Agent进行回答。" 
       : agent?.systemInstruction || "";

    let scheduled = false;
    const flush = () => {
      onUpdateSession(session.id, [
        ...updatedMessages,
        { id: aiMsgId, role: 'model', content: aiContent, timestamp: Date.now() }
      ]);
    };
    const scheduleFlush = () => {
      if (scheduled) return;
      scheduled = true;
      setTimeout(() => {
        if (streamAbortRef.current?.signal.aborted) {
          scheduled = false;
          return;
        }
        flush();
        scheduled = false;
      }, 80);
    };

    try {
      await streamAgentResponse(
        userMsg.content,
        sysInstruction,
        updatedMessages,
        (chunk) => {
          if (streamAbortRef.current?.signal.aborted) return;
          aiContent += chunk;
          scheduleFlush();
        },
        { signal: streamAbortRef.current?.signal, onDone: flush }
      );

      const finalSteps = await completedStepsPromise;
      
      if (streamAbortRef.current?.signal.aborted) return;

      onUpdateSession(session.id, [
        ...updatedMessages,
        { 
          id: aiMsgId, 
          role: 'model', 
          content: aiContent, 
          timestamp: Date.now(),
          steps: finalSteps 
        }
      ]);
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        console.error('Generation failed:', error);
      }
    } finally {
      if (!streamAbortRef.current?.signal.aborted) {
        setIsStreaming(false);
        setLiveSteps([]);
      }
    }
  };

  // Simulate a full tutorial conversation when clicking a featured case
  const handleCaseClick = (caseTitle: string) => {
    const timestamp = Date.now();
    const userMsgId = timestamp.toString();
    const aiMsgId = (timestamp + 1).toString();

    // 1. User Request
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: `我需要处理：${caseTitle}`,
      timestamp: timestamp
    };

    // 2. AI Response (Simulated Tutorial Content)
    const aiContent = `好的，已为您加载【${caseTitle}】的专业处理流程。\n\n作为迪尚AI助手，我通过以下步骤为您生成了结果：\n\n1. **数据提取**：已自动关联业务系统数据。\n2. **规则匹配**：应用了集团最新的业务规范。\n3. **智能生成**：为您草拟了初步方案。\n\n您可以点击下方的“查看思考过程”了解详情，或直接在输入框中补充更多要求进行调整。`;

    const demoSteps: StepLog[] = [
      { id: '1', title: '场景识别', description: `识别为 ${caseTitle} 任务，加载对应Agent模型`, status: 'completed', timestamp: '00:00' },
      { id: '2', title: '数据调取', description: '关联 RAG 知识库与业务系统参数', status: 'completed', timestamp: '00:01' },
      { id: '3', title: '内容生成', description: '完成结构化输出与格式校验', status: 'completed', timestamp: '00:02' }
    ];

    const aiMsg: Message = {
      id: aiMsgId,
      role: 'model',
      content: aiContent,
      timestamp: timestamp + 1000,
      steps: demoSteps
    };

    onUpdateSession(session.id, [...session.messages, userMsg, aiMsg]);
  };

  const handleOpenDrawer = (steps: StepLog[]) => {
    setDrawerSteps(steps);
    setDrawerOpen(true);
  };

  // Reusable function to render collaboration shortcuts
  const renderCollabShortcuts = (paddingClass: string = "px-1") => {
    if (!isCollaboration || collabAgents.length === 0) return null;

    return (
      <div className={`flex flex-wrap gap-2 mb-2 ${paddingClass}`}>
        <button
           onClick={() => setActiveCollabAgentId(null)}
           className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
             activeCollabAgentId === null 
               ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
               : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
           }`}
        >
           <Users size={12} className="mr-1.5" />
           全员协作
        </button>
        {collabAgents.map(ca => (
           <button 
             key={ca.id} 
             onClick={() => setActiveCollabAgentId(activeCollabAgentId === ca.id ? null : ca.id)}
             className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
               activeCollabAgentId === ca.id
                 ? 'bg-brand-600 text-white border-brand-600 shadow-md' 
                 : 'bg-white text-slate-600 border-slate-200 hover:border-brand-200 hover:text-brand-600'
             }`}
           >
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${activeCollabAgentId === ca.id ? 'bg-white' : 'bg-brand-400'}`}></span>
              {ca.name}
           </button>
        ))}
      </div>
    );
  };

  useEffect(() => {
    return () => {
      if (streamAbortRef.current) streamAbortRef.current.abort();
    };
  }, []);

  return (
    <div className="flex flex-1 h-screen overflow-hidden bg-white relative">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-0">
        {/* Header - Minimalist (Only shown when there are messages) */}
        {session.messages.length > 0 && (
          <div className="h-14 border-b border-slate-50 flex items-center justify-between px-6 flex-shrink-0 bg-white z-10">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-800">
                {isCollaboration ? (session.groupName || session.title || '员工协作') : agent?.name}
              </span>
              <span className="bg-blue-50 text-blue-600 text-[10px] px-1.5 py-0.5 rounded border border-blue-100">Bot</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-400">
              <button 
                onClick={() => onFavoriteSession(session.id)} 
                className={`p-2 hover:bg-slate-100 rounded-lg transition-colors ${session.isFavorite ? 'text-amber-400 hover:text-amber-500' : 'hover:text-slate-600'}`}
                title={session.isFavorite ? "取消收藏" : "收藏对话"}
              >
                <Star size={18} fill={session.isFavorite ? "currentColor" : "none"} />
              </button>

              <div className="relative">
                <button 
                  onClick={() => setIsSharePopoverOpen(!isSharePopoverOpen)} 
                  className={`p-2 hover:bg-slate-100 rounded-lg transition-colors ${isSharePopoverOpen ? 'bg-slate-100 text-slate-600' : 'hover:text-slate-600'}`} 
                  title="分享对话"
                >
                  <Share2 size={18} />
                </button>
                <SharePopover 
                  isOpen={isSharePopoverOpen} 
                  onClose={() => setIsSharePopoverOpen(false)} 
                />
              </div>

              <button onClick={() => setIsFilesModalOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg hover:text-slate-600 transition-colors" title="查看文件">
                <FolderOpen size={18} />
              </button>
              
              <button 
                onClick={() => setDrawerOpen(true)} 
                className={`p-2 hover:bg-slate-100 rounded-lg transition-colors ${drawerOpen ? 'bg-slate-100 text-slate-600' : 'hover:text-slate-600'}`} 
                title="查看步骤"
              >
                <GitMerge size={18} />
              </button>

              <button 
                onClick={() => setIsHistoryDrawerOpen(true)} 
                className={`p-2 hover:bg-slate-100 rounded-lg transition-colors ${isHistoryDrawerOpen ? 'bg-slate-100 text-slate-600' : 'hover:text-slate-600'}`}
                title="历史任务"
              >
                <Clock size={18} />
              </button>

              {session.status !== 'completed' && (
                <button 
                  onClick={() => onEndSession(session.id)} 
                  className="flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium ml-2"
                  title="结束任务"
                >
                  <Power size={16} className="mr-1.5" />
                  结束任务
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-white scroll-smooth" ref={scrollRef}>
          {session.messages.length === 0 ? (
            // === LANDING PAGE STATE ===
            <div className="min-h-full flex flex-col items-center pt-16 pb-10 px-8 relative">
               {/* History Tasks Button */}
               <div className="absolute top-6 right-8">
                  <button 
                    onClick={() => setIsHistoryDrawerOpen(true)}
                    className="flex items-center px-4 py-2 text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-700 transition-colors shadow-sm text-sm font-medium"
                  >
                    <Clock size={16} className="mr-2" />
                    历史任务
                  </button>
               </div>

               {/* 1. Identity */}
               <div className="w-24 h-24 bg-gradient-to-tr from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-100 mb-6 transform hover:scale-105 transition-transform duration-300">
                  {isCollaboration ? <Users size={44} /> : <IconComponent size={44} />}
               </div>
               <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                 {isCollaboration ? '员工协作' : agent?.name}
               </h1>
               <p className="text-slate-500 mb-10 flex items-center text-base hover:text-blue-600 transition-colors cursor-pointer group">
                  {isCollaboration 
                    ? '由多位专家Agent组成的协作团队，为您处理跨部门复杂业务' 
                    : `由迪尚AI团队孵化的专家 Agent，为您提供专业的${agent?.category}服务`
                  }
                  <ChevronRight size={16} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1"/>
               </p>

               {/* 2. Hero Input Box */}
               <div className="w-full max-w-5xl relative mb-12">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-50 rounded-3xl blur opacity-60"></div>
                  <div className="relative bg-white rounded-2xl border border-slate-200 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.05)] p-5 transition-shadow hover:shadow-[0_8px_30px_-6px_rgba(37,99,235,0.15)] flex flex-col">
                    
                    {/* Selected Agents Shortcuts (Landing State) */}
                    {renderCollabShortcuts("mb-3 px-1")}

                    <textarea 
                      className="w-full resize-none outline-none text-slate-700 text-lg min-h-[80px] bg-transparent placeholder-slate-300"
                      placeholder={
                        isCollaboration 
                          ? (activeCollabAgentId ? `向 @${collabAgents.find(a => a.id === activeCollabAgentId)?.name} 提问...` : "请描述您的跨部门协作需求...") 
                          : `有什么关于${agent?.category}的问题问我吧！也可以点击下方快速发起咨询...`
                      }
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                          }
                      }}
                    />
                    <div className="flex justify-end mt-2">
                        <button 
                          onClick={() => handleSubmit()}
                          disabled={!input.trim()}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            input.trim() 
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 translate-y-0' 
                              : 'bg-slate-100 text-slate-300 translate-y-1'
                          }`}
                        >
                          <ArrowRight size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                  </div>
               </div>

               {/* 3. Capability Cards */}
               <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
                  <div 
                    onClick={() => handleSubmit(agent?.promptPreview || "请协助我进行一次跨部门协作任务。")}
                    className="flex flex-col p-6 bg-[#f9fafb] hover:bg-white rounded-2xl border border-transparent hover:border-slate-200 cursor-pointer transition-all duration-200 group hover:shadow-lg"
                  >
                     <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                           <Sparkles size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">快速开始</h3>
                     </div>
                     <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1">
                        "{agent?.promptPreview || "发起协作任务..."}"
                     </p>
                     <span className="text-xs font-semibold text-slate-400 group-hover:text-blue-500 flex items-center">
                        立即尝试 <ArrowRight size={12} className="ml-1" />
                     </span>
                  </div>

                  <div className="flex flex-col p-6 bg-[#f9fafb] hover:bg-white rounded-2xl border border-transparent hover:border-slate-200 cursor-pointer transition-all duration-200 group hover:shadow-lg"
                  >
                     <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                           <BookOpen size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">能力说明</h3>
                     </div>
                     <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1">
                        {isCollaboration 
                          ? "支持多Agent协同工作，自动拆解任务并调度相关专家进行处理。" 
                          : `基于 ${agent?.category} 知识库构建，支持多模态输入与专业分析。`
                        }
                     </p>
                     <span className="text-xs font-semibold text-slate-400 group-hover:text-blue-500 flex items-center">
                        查看详情 <ArrowRight size={12} className="ml-1" />
                     </span>
                  </div>
               </div>

               {/* 4. Featured Cases (Not in Collab) */}
               {!isCollaboration && (
                 <div className="w-full max-w-5xl">
                    <div className="flex items-center justify-between mb-6 px-2">
                       <h3 className="text-lg font-bold text-slate-800">精选案例</h3>
                       <span className="text-sm text-slate-400 hover:text-blue-600 cursor-pointer">查看更多</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                      {mockCases.map((item, i) => {
                        const CaseIcon = (Icons as any)[item.icon] || FileText;
                        return (
                          <div 
                            key={i} 
                            onClick={() => handleCaseClick(item.title)}
                            className="bg-white border border-slate-100 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                          >
                              <div className={`h-36 ${item.color} flex items-center justify-center relative overflow-hidden`}>
                                  <div className="absolute inset-0 bg-white/20"></div>
                                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/30 rounded-full blur-xl"></div>
                                  <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-white/30 rounded-full blur-xl"></div>
                                  <div className="relative z-10 flex flex-col items-center space-y-2">
                                     <div className="p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm text-slate-700">
                                        <CaseIcon size={28} strokeWidth={1.5}/>
                                     </div>
                                  </div>
                              </div>
                              <div className="p-4">
                                  <div className="flex items-center space-x-2 mb-2">
                                     <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">{item.type}</span>
                                  </div>
                                  <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{item.title}</h4>
                                  <p className="text-xs text-slate-400 mt-2 flex items-center">
                                     <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"></span>
                                     已生成 1200+ 次
                                  </p>
                              </div>
                          </div>
                        );
                      })}
                    </div>
                 </div>
               )}
            </div>
          ) : (
            // === ACTIVE CHAT STATE ===
            <div className="max-w-3xl mx-auto py-8 px-4 space-y-8 pb-32">
              {session.messages.map((msg) => (
                <div key={msg.id} className={`flex space-x-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'model' && (
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-md text-white border-2 border-white ring-1 ring-slate-100">
                      {isCollaboration ? <Users size={18} /> : <IconComponent size={18} />}
                    </div>
                  )}
                  
                  <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`${msg.role === 'user' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-800 shadow-md border border-slate-100'} px-6 py-4 rounded-2xl leading-7 text-[15px]`}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      
                      {/* View Steps Button for Model Messages */}
                      {msg.role === 'model' && msg.steps && msg.steps.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100/50">
                           <button 
                             onClick={() => handleOpenDrawer(msg.steps || [])}
                             className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center"
                           >
                              <Sparkles size={12} className="mr-1.5" />
                              查看思考过程
                              <ChevronRight size={12} className="ml-1 opacity-50" />
                           </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1 text-slate-500 border-2 border-white">
                      <User size={18} />
                    </div>
                  )}
                </div>
              ))}

              {/* Live Streaming Indicator & Steps */}
              {isStreaming && (
                <div className="flex space-x-4">
                   <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-md text-white border-2 border-white ring-1 ring-slate-100">
                      {isCollaboration ? <Users size={18} /> : <IconComponent size={18} />}
                   </div>
                   <div className="flex flex-col items-start max-w-[85%]">
                      {/* Thinking Status */}
                      <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm mb-2 flex items-center space-x-3 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleOpenDrawer(liveSteps)}>
                         <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                         </div>
                         <span className="text-sm text-slate-500 font-medium">
                            {liveSteps.find(s => s.status === 'processing')?.title || '正在思考...'}
                         </span>
                         <ChevronRight size={14} className="text-slate-300"/>
                      </div>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Input Area (Only for Active Chat) */}
        {session.messages.length > 0 && (
          <div className="absolute bottom-6 left-0 right-0 px-4 pointer-events-none z-20">
            {session.status === 'completed' ? (
              <div className="max-w-3xl mx-auto pointer-events-auto">
                 <div className="bg-white rounded-full border border-slate-200 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.05)] p-2 pl-6 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-md shadow-blue-100">
                          {isCollaboration ? <Users size={16} /> : <IconComponent size={16} />}
                       </div>
                       <span className="font-bold text-slate-700">任务已终止</span>
                    </div>
                    <button 
                      onClick={() => agent && onCreateNewSession(agent.id)} 
                      className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-sm"
                    >
                       创建新任务
                    </button>
                 </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-[0_8px_30px_-6px_rgba(0,0,0,0.1)] border border-slate-200 p-2 pointer-events-auto flex flex-col">
                 
                 {/* Selected Agents Shortcuts (Active Chat State) */}
                 {renderCollabShortcuts("px-2 pt-1")}

                 <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder={
                      isCollaboration && activeCollabAgentId 
                        ? `向 @${collabAgents.find(a => a.id === activeCollabAgentId)?.name} 提问...` 
                        : "发送消息..."
                    }
                    className="w-full px-4 py-3 bg-transparent outline-none text-slate-700 placeholder-slate-400 resize-none max-h-[120px]"
                    rows={1}
                  />
                  <div className="flex justify-between items-center px-2 pb-1">
                     <div className="flex space-x-1 text-slate-400">
                        <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors hover:text-blue-600"><Paperclip size={18}/></button>
                        <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors hover:text-blue-600"><ImageIcon size={18}/></button>
                     </div>
                     <button 
                      onClick={() => handleSubmit()}
                      disabled={!input.trim() || isStreaming}
                      className={`p-2 rounded-lg transition-all ${input.trim() ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-300'}`}
                    >
                      <Send size={18} />
                    </button>
                  </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drawer Overlay (Backdrop) */}
      {drawerOpen && (
        <div 
          className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] z-30 transition-opacity"
          onClick={() => setDrawerOpen(false)}
        ></div>
      )}



      {/* History Drawer */}
      <div className={`absolute top-0 right-0 h-full w-[450px] bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out border-l border-slate-100 ${isHistoryDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="flex flex-col h-full">
            <div className="h-14 border-b border-slate-50 flex items-center justify-between px-6 relative bg-white z-10">
               <h3 className="font-bold text-slate-800 text-lg">
                  历史任务
               </h3>
               <button 
                 onClick={() => setIsHistoryDrawerOpen(false)}
                 className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
               >
                  <X size={20} />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
               {sessions.filter(s => s.agentId === agent?.id && s.id !== sessionId).length === 0 ? (
                 <div className="flex flex-col items-center justify-center mt-20 text-slate-400 space-y-4 opacity-60">
                    <History size={32} className="text-slate-300"/>
                    <p className="text-xs">暂无其他历史任务</p>
                    <button 
                      onClick={() => {
                        if (agent) {
                          onCreateNewSession(agent.id);
                          setIsHistoryDrawerOpen(false);
                        }
                      }}
                      className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      创建新任务
                    </button>
                 </div>
               ) : (
                 <div className="space-y-3">
                   {sessions.filter(s => s.agentId === agent?.id && s.id !== sessionId)
                   .sort((a, b) => b.updatedAt - a.updatedAt)
                   .map(s => (
                     <div 
                       key={s.id}
                       onClick={() => {
                         navigate(`/chat/${s.id}`);
                         setIsHistoryDrawerOpen(false);
                       }}
                       className="bg-white p-4 rounded-xl border border-slate-100 hover:shadow-md cursor-pointer transition-all group"
                     >
                       <div className="flex items-center justify-between mb-2">
                         <h4 className="font-bold text-slate-700 truncate group-hover:text-blue-600 flex-1">{s.title || "未命名对话"}</h4>
                         <div className="flex items-center space-x-2 ml-2">
                           <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                             s.status === 'completed' 
                               ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
                               : 'text-orange-600 bg-orange-50 border-orange-100'
                           }`}>
                             {s.status === 'completed' ? '已完成' : '进行中'}
                           </span>
                           <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                         </div>
                       </div>
                       <div className="flex items-center text-xs text-slate-400 space-x-2">
                         <Clock size={12} />
                         <span>{new Date(s.updatedAt).toLocaleString()}</span>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* Steps Drawer */}
      <div className={`absolute top-0 right-0 h-full w-[450px] bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out border-l border-slate-100 ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="flex flex-col h-full">
            <div className="h-14 border-b border-slate-50 flex items-center justify-between px-6 relative bg-white z-10">
               <h3 className="font-bold text-slate-800 text-lg">
                  步骤
               </h3>
               <button 
                 onClick={() => setDrawerOpen(false)}
                 className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
               >
                  <X size={20} />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
               <div className="relative pl-4 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-blue-100/50 before:border-l before:border-dashed before:border-blue-200">
                 {(isStreaming && liveSteps.length > 0 ? liveSteps : drawerSteps).length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 text-slate-400 space-y-4 opacity-60">
                       <GitMerge size={32} className="text-slate-300"/>
                       <p className="text-xs">暂无步骤记录</p>
                    </div>
                 ) : (
                   (isStreaming && liveSteps.length > 0 ? liveSteps : drawerSteps).map((step) => (
                     <div key={step.id} className="relative pl-10 group">
                       {/* Timeline Node */}
                       <div className={`absolute left-0 top-0 w-10 h-10 -ml-1 rounded-full border-[3px] flex items-center justify-center z-10 transition-all duration-300 bg-white shadow-sm ${
                         step.status === 'completed' ? 'border-blue-500 text-blue-600' : 
                         step.status === 'processing' ? 'border-blue-400 text-blue-500' : 'border-slate-200 text-slate-300'
                       }`}>
                          {step.title.includes('用户') ? <User size={16} /> : 
                           step.title.includes('文件') ? <FolderOpen size={16} /> : 
                           step.title.includes('终端') ? <Box size={16} /> : <Sparkles size={16} />}
                       </div>
                       
                       <div className="transition-all duration-500 pt-1">
                         <div className="flex items-center justify-between mb-2">
                            <h4 className={`font-bold ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-800'}`}>{step.title}</h4>
                         </div>
                         
                         <div className={`text-sm leading-relaxed p-4 rounded-2xl border transition-colors ${
                           step.status === 'processing' 
                             ? 'bg-blue-50/50 border-blue-100 text-slate-700' 
                             : 'bg-white border-slate-100 text-slate-500 shadow-sm'
                         }`}>
                           {step.description}
                           {step.title.includes('文件') && (
                             <div className="mt-3 flex items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                               <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-blue-500 border border-slate-100 mr-2">
                                 <FileText size={16} />
                               </div>
                               <div className="flex-1 min-w-0">
                                 <div className="text-xs font-medium truncate text-slate-700">安全生产平台功能结构图.png</div>
                               </div>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   ))
                 )}
               </div>
            </div>
         </div>
      </div>

      <FileViewerModal 
        isOpen={isFilesModalOpen} 
        onClose={() => setIsFilesModalOpen(false)} 
        files={MOCK_FILES}
      />
    </div>
  );
};

export default Chat;

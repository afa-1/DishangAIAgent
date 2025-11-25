import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DISHANG_AGENTS } from '../constants';
import AgentCard from '../components/AgentCard';
import { Agent, AgentCategory } from '../types';
import { 
  Search, Sparkles, PenTool, Presentation, FileSpreadsheet, Globe, Mic, Send, 
  Image as ImageIcon, Scissors, Users, BarChart3, Bot, ClipboardList, Database, 
  Palette, FileText, Shirt, X, ArrowRight, LayoutTemplate, Briefcase
} from 'lucide-react';

interface HomeProps {
  onSelectAgent: (agent: Agent) => void;
}

// === SCENARIO DATA DEFINITION (FROM PDF) ===
const SCENARIOS = [
  {
    id: 'new-style',
    label: '新款开发',
    heroTitle: '10 分钟，搞定一组新款设计方案',
    icon: Scissors,
    color: 'text-rose-600 bg-rose-50 border-rose-100',
    placeholder: "请补充新款需求：目标客群 / 风格 / 品类（示例：‘30-45 岁商务男性西装，复古风’）",
    tools: [
      { label: '关联 PLM 历史款', icon: Database },
      { label: '面料库快速匹配', icon: Palette }
    ],
    templates: [
      { title: '2024秋季商务装开发模板', desc: '含趋势报告 + 3 套设计稿框架', icon: Shirt, prompt: '生成一份2024秋季商务装开发方案，包含流行趋势分析及3套设计稿框架。' },
      { title: '小单快反新款模板', desc: '适配 100-500 件量产', icon: ZapIcon, prompt: '为100-500件量产的小单快反需求生成新款设计方案。' },
      { title: '大码女装系列开发模板', desc: '含版型优化建议', icon: Users, prompt: '设计一套大码女装系列，重点关注版型优化建议。' },
      { title: '运动休闲系列开发模板', desc: '适配功能性面料推荐', icon: Scissors, prompt: '开发一系列运动休闲服装，请推荐功能性面料。' }
    ]
  },
  {
    id: 'team-custom',
    label: '团装定制',
    heroTitle: '根据客户需求，一键生成团装方案',
    icon: Users,
    color: 'text-blue-600 bg-blue-50 border-blue-100',
    placeholder: "请补充团装需求：数量 / 品类 / 风格 / 交货周期（示例：‘100 套藏青色羊毛西装，30 天交货’）",
    tools: [
      { label: '关联客户信息', icon: Briefcase },
      { label: '材质样卡预览', icon: ImageIcon }
    ],
    templates: [
      { title: '国企员工团装方案模板', desc: '含设计稿 + 成本核算表', icon: FileText, prompt: '生成一份国企员工团装定制方案，包含设计稿和成本核算表。' },
      { title: '互联网公司文化衫定制', desc: '支持 logo 嵌入', icon: Shirt, prompt: '设计一款互联网公司文化衫，支持Logo嵌入。' },
      { title: '高端企业商务套装模板', desc: '含多材质对比', icon: Briefcase, prompt: '定制高端企业商务套装方案，提供多种材质对比。' },
      { title: '学校校服定制模板', desc: '含尺码标准库', icon: Users, prompt: '设计一套学校校服定制方案，包含尺码标准库。' }
    ]
  },
  {
    id: 'report-center',
    label: '报表中心',
    heroTitle: '连接业务系统，自动生成分析报表',
    icon: BarChart3,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    placeholder: "请选择报表类型 + 周期：设计进度 / 生产产能 / 销售业绩 / 售后数据（示例：‘近 30 天生产车间产能报表’）",
    tools: [
      { label: '导出格式 (PDF/Excel)', icon: FileSpreadsheet },
      { label: '自定义报表维度', icon: LayoutTemplate }
    ],
    templates: [
      { title: '月度销售业绩区域对比表', desc: '自动生成图表分析', icon: BarChart3, prompt: '生成月度销售业绩区域对比表，并进行自动图表分析。' },
      { title: '设计部款式完成率进度表', desc: '对接 PLM 数据', icon: PenTool, prompt: '对接PLM数据，生成设计部款式完成率进度表。' },
      { title: '售后问题类型占比分析表', desc: '质量/尺码/物流', icon: FileText, prompt: '分析售后数据，生成问题类型（质量/尺码/物流）占比分析表。' },
      { title: '原料库存周转率分析表', desc: '预警高库存风险', icon: Database, prompt: '生成原料库存周转率分析表，预警高库存风险。' },
      { title: '各车间设备利用率统计表', desc: 'MES 数据实时抓取', icon: Bot, prompt: '抓取MES数据，统计各车间设备利用率。' }
    ]
  },
  {
    id: 'smart-qa',
    label: '智能问答',
    heroTitle: '不懂就问，你的全能业务助手',
    icon: Bot,
    color: 'text-amber-600 bg-amber-50 border-amber-100',
    placeholder: "请输入疑问：流程咨询 / 系统操作 / 制度查询（示例：‘PLM 设计稿如何上传？’）",
    tools: [
      { label: '语音输入', icon: Mic },
      { label: '相似问题推荐', icon: Sparkles }
    ],
    templates: [
      { title: '财务报销流程查询', desc: '差旅/采购/招待费', icon: FileText, prompt: '查询公司财务报销流程，特别是差旅、采购和招待费的规定。' },
      { title: 'PLM 系统基础操作指引', desc: '新手入门必读', icon: Globe, prompt: '提供PLM系统基础操作指引，适合新手入门。' },
      { title: '生产排产异常处理流程', desc: '应急预案查询', icon: AlertIcon, prompt: '查询生产排产异常处理流程及应急预案。' },
      { title: '员工培训报名流程', desc: '内部课程体系', icon: Users, prompt: '查询内部课程体系及员工培训报名流程。' },
      { title: '合同审批流程', desc: '法务合规节点', icon: FileText, prompt: '查询合同审批流程及法务合规关键节点。' }
    ]
  },
  {
    id: 'task-track',
    label: '任务跟踪',
    heroTitle: '全链路监控，实时掌握任务进度',
    icon: ClipboardList,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    placeholder: "请输入任务名称 / ID 查询进度...",
    tools: [
      { label: '催办任务', icon: BellIcon },
      { label: '任务转交', icon: ArrowRight }
    ],
    templates: [
      { title: '待执行任务列表', desc: '按优先级排序', icon: ClipboardList, prompt: '列出所有待执行任务，按优先级排序。' },
      { title: '执行中任务监控', desc: '实时日志/剩余时间', icon: ClockIcon, prompt: '监控执行中的任务，显示实时日志和剩余时间。' },
      { title: '已完成任务归档', desc: '结果预览及下载', icon: CheckIcon, prompt: '归档已完成的任务，提供结果预览及下载。' },
      { title: '已延期任务预警', desc: '延期原因分析', icon: AlertIcon, prompt: '分析已延期任务，提供延期原因分析。' }
    ]
  },
  {
    id: 'asset-center',
    label: '素材中心',
    heroTitle: '海量素材，一键智能生成',
    icon: ImageIcon,
    color: 'text-violet-600 bg-violet-50 border-violet-100',
    placeholder: "请选择素材类型 + 风格：营销海报 / 短视频脚本 / 虚拟穿搭图 / 培训素材",
    tools: [
      { label: '同步飞书共享空间', icon: Globe },
      { label: '素材在线编辑', icon: PenTool }
    ],
    templates: [
      { title: '商务西装虚拟模特穿搭', desc: '含多体型展示', icon: UserIcon, prompt: '生成商务西装的虚拟模特穿搭图，展示多体型效果。' },
      { title: '618 大促连衣裙短视频脚本', desc: '含分镜建议', icon: VideoIcon, prompt: '编写618大促连衣裙的短视频脚本，包含分镜建议。' },
      { title: '团装定制效果对比图', desc: '含材质标注', icon: ImageIcon, prompt: '生成团装定制效果对比图，包含材质标注。' },
      { title: '新员工设计规范培训包', desc: '含案例库', icon: BookIcon, prompt: '生成新员工设计规范培训包，包含案例库。' },
      { title: '面料特性展示图模板', desc: '垂感/透气性说明', icon: FileText, prompt: '生成面料特性展示图，说明垂感和透气性。' }
    ]
  }
];

// Helper icons for templates
function ZapIcon(props: any) { return <Sparkles {...props} /> }
function AlertIcon(props: any) { return <div className="text-red-500 font-bold">!</div> }
function BellIcon(props: any) { return <div className="text-orange-500">🔔</div> }
function ClockIcon(props: any) { return <div className="text-blue-500">🕒</div> }
function CheckIcon(props: any) { return <div className="text-green-500">✓</div> }
function UserIcon(props: any) { return <Users {...props} /> }
function VideoIcon(props: any) { return <div className="text-violet-500">🎬</div> }
function BookIcon(props: any) { return <div className="text-amber-500">📚</div> }

const Home: React.FC<HomeProps> = ({ onSelectAgent }) => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  // Sync category from URL
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setActiveCategory(categoryParam);
    } else {
      setActiveCategory('All');
    }
  }, [searchParams]);

  const activeScenario = SCENARIOS.find(s => s.id === activeScenarioId);

  const filteredAgents = DISHANG_AGENTS.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || agent.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Object.values(AgentCategory)];

  // Helper to get input placeholder
  const getPlaceholder = () => {
    if (activeScenario) return activeScenario.placeholder;
    return "给我发消息或布置任务...";
  };

  const handleScenarioClick = (id: string) => {
    // Toggle
    if (activeScenarioId === id) {
      setActiveScenarioId(null);
      setSearchQuery('');
    } else {
      setActiveScenarioId(id);
      setSearchQuery(''); // Clear previous input
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#fdfdfd]">
      {/* Hero & Input Section */}
      <div className="w-full max-w-6xl mx-auto pt-20 pb-8 px-8 flex flex-col items-center transition-all duration-500">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 tracking-tight text-center flex items-center justify-center min-h-[60px] transition-all duration-300">
          {activeScenario ? (
            <span className="animate-in fade-in zoom-in-95 duration-300">{activeScenario.heroTitle}</span>
          ) : (
            <>
              迪尚AI Agent平台，你的 AI 办公助手
              <span className="ml-4 px-3 py-1.5 bg-white text-base font-normal text-slate-500 rounded-full shadow-sm border border-slate-100 flex items-center">
                hi <span className="ml-1 animate-pulse">👋</span>
              </span>
            </>
          )}
        </h1>

        {/* Quick Actions Row (Scenarios) */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 max-w-4xl">
          {SCENARIOS.map((scenario) => {
            const isActive = activeScenarioId === scenario.id;
            return (
              <button 
                key={scenario.id} 
                onClick={() => handleScenarioClick(scenario.id)}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-200 
                  ${isActive 
                    ? `shadow-md scale-105 ${scenario.color} border-current` 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600 hover:shadow-md hover:-translate-y-0.5'
                  }`}
              >
                <scenario.icon size={16} />
                <span>{scenario.label}</span>
                {isActive && <X size={14} className="ml-1 opacity-60 hover:opacity-100" />}
              </button>
            );
          })}
        </div>

        {/* Main Input Area (Aligned Width) */}
        <div className="w-full relative group z-10 transition-all duration-500">
          {/* Glow Effect */}
          <div className={`absolute -inset-1 bg-gradient-to-r rounded-[32px] blur-xl opacity-50 group-hover:opacity-70 transition duration-700
             ${activeScenarioId ? 'from-slate-200 to-slate-200' : 'from-purple-100 via-indigo-100 to-blue-100'}
          `}></div>
          
          <div className="relative bg-white rounded-[28px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 p-3 flex flex-col group-focus-within:shadow-[0_8px_30px_-4px_rgba(99,102,241,0.1)] transition-all duration-300">
             <textarea 
               className="w-full p-5 resize-none outline-none text-slate-700 placeholder-slate-400 bg-transparent min-h-[140px] text-lg leading-relaxed rounded-xl transition-all"
               placeholder={getPlaceholder()}
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
             
             {/* Input Actions Bar */}
             <div className="flex justify-between items-end px-3 pb-2 pt-2">
                <div className="flex items-center space-x-2 text-slate-500">
                  {/* Scenario Specific Tools */}
                  {activeScenario ? (
                    <div className="flex space-x-2 animate-fadeIn">
                       {activeScenario.tools.map((tool, idx) => (
                         <button 
                            key={idx}
                            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-xs font-medium rounded-lg text-brand-600 border border-slate-100 transition-colors"
                         >
                            <tool.icon size={14} />
                            <span>{tool.label}</span>
                         </button>
                       ))}
                    </div>
                  ) : (
                    // Default Tools
                    <div className="flex space-x-1">
                      <button className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors hover:text-brand-500 tooltip" title="联网搜索">
                        <Globe size={20}/>
                      </button>
                      <button className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors hover:text-brand-500 tooltip" title="AI 绘图">
                        <ImageIcon size={20}/>
                      </button>
                      <button className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors hover:text-brand-500 tooltip" title="深度思考">
                        <Sparkles size={20}/>
                      </button>
                    </div>
                  )}
                </div>
                
                <button className={`p-3 rounded-xl transition-all duration-200 ${searchQuery ? 'bg-brand-600 text-white shadow-lg shadow-brand-200 scale-100' : 'bg-slate-100 text-slate-300 scale-95'}`}>
                   <Send size={20} className={searchQuery ? 'ml-0.5' : ''} />
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full max-w-6xl mx-auto px-8 pb-24 min-h-[400px]">
        {activeScenario ? (
           // === SCENARIO TEMPLATE VIEW ===
           <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${activeScenario.color.split(' ')[1]} ${activeScenario.color.split(' ')[0]}`}>
                       <activeScenario.icon size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">{activeScenario.label}专属模板</h2>
                      <p className="text-sm text-slate-500">已为您加载 {activeScenario.templates.length} 个行业常用模板</p>
                    </div>
                 </div>
                 <button 
                    onClick={() => setActiveScenarioId(null)}
                    className="text-sm text-slate-400 hover:text-slate-600 flex items-center"
                 >
                    返回全部 Agent <ArrowRight size={14} className="ml-1"/>
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                 {activeScenario.templates.map((tpl, idx) => (
                   <div 
                      key={idx}
                      onClick={() => setSearchQuery(tpl.prompt || tpl.title)}
                      className="bg-white border border-slate-100 rounded-xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-[180px]"
                   >
                      <div className="flex items-start justify-between mb-4">
                         <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                            <tpl.icon size={20} />
                         </div>
                         <ArrowRight size={16} className="text-slate-300 group-hover:text-brand-500 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0"/>
                      </div>
                      <h3 className="font-bold text-slate-800 mb-2 group-hover:text-brand-600 transition-colors">{tpl.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{tpl.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        ) : (
           // === DEFAULT AGENT MARKET VIEW ===
           <>
              {/* Category Navigation */}
              <div className="flex items-center space-x-8 border-b border-slate-100 mb-10 overflow-x-auto no-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`pb-4 text-base font-medium whitespace-nowrap border-b-[3px] transition-all duration-200 px-1 ${
                      activeCategory === cat 
                        ? 'border-brand-600 text-brand-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200'
                    }`}
                  >
                    {cat === 'All' ? '探索' : cat}
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                {filteredAgents.map(agent => (
                  <AgentCard 
                    key={agent.id} 
                    agent={agent} 
                    onClick={onSelectAgent} 
                  />
                ))}
              </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
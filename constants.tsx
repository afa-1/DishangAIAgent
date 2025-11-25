import { Agent, AgentCategory, ChatSession } from './types';
import { 
  Scissors, 
  TrendingUp, 
  Factory, 
  PackageCheck, 
  Megaphone, 
  Users, 
  Headphones, 
  FileText, 
  Briefcase,
  Shirt
} from 'lucide-react';

export const DISHANG_AGENTS: Agent[] = [
  // 趋势与设计
  {
    id: 'design-trend',
    name: '趋势分析 Agent',
    category: AgentCategory.DESIGN,
    description: '抓取全球秀场与电商数据，生成季度流行趋势报告，提供差异化建议。',
    icon: 'TrendingUp',
    promptPreview: '生成2024秋季商务西装趋势报告，包含面料与色彩分析。',
    systemInstruction: '你是迪尚集团的趋势分析专家。你可以访问RAG知识库中的秀场数据、电商数据和行业报告。请根据用户需求生成专业的服装流行趋势报告，包含推荐面料、色彩（如潘通色号）和版型方向。'
  },
  {
    id: 'design-style',
    name: '款式创新 Agent',
    category: AgentCategory.DESIGN,
    description: '基于RAG知识库生成新款设计方案，输出含面料推荐的设计稿。',
    icon: 'Scissors',
    promptPreview: '基于复古工装风，生成3套男士夹克设计方案。',
    systemInstruction: '你是迪尚集团的款式创新专家。基于用户输入的关键词或风格，结合迪尚核心品类数据，构思并描述服装设计方案。你需要详细描述款式细节、推荐面料和尺寸参数。'
  },
  
  // 生产与供应链
  {
    id: 'prod-inventory',
    name: '库存预测 Agent',
    category: AgentCategory.PRODUCTION,
    description: '结合历史销售与季节因素，预测原料与成品库存，生成补货建议。',
    icon: 'PackageCheck',
    promptPreview: '预测下个月羊毛面料的库存消耗情况。',
    systemInstruction: '你是生产供应链专家。利用OMS历史数据和季节因素，预测原料消耗。如果库存低于安全阈值，请给出具体的补货建议（数量、供应商、周期）。'
  },
  {
    id: 'prod-schedule',
    name: '动态排产 Agent',
    category: AgentCategory.PRODUCTION,
    description: '根据订单优先级和设备产能，自动生成或调整生产计划。',
    icon: 'Factory',
    promptPreview: '原料延迟到货，请重新调整生产流水线排期。',
    systemInstruction: '你是动态排产专员。根据MES设备产能和订单优先级（如VIP订单）安排生产。遇到异常（设备故障、原料延迟）时，请给出最优的调整方案。'
  },

  // 营销与销售
  {
    id: 'sales-copy',
    name: '营销文案 Agent',
    category: AgentCategory.SALES,
    description: '生成多类型营销素材，如小红书推文、电商详情页、短视频脚本。',
    icon: 'Megaphone',
    promptPreview: '为新款"轻量化户外西装"写一篇小红书种草文案。',
    systemInstruction: '你是首席营销官。根据目标客群（如年轻国潮、商务精英）和产品卖点，生成极具吸引力的营销文案、短视频脚本或海报标语。'
  },
  
  // 客户服务
  {
    id: 'service-smart',
    name: '智能客服 Agent',
    category: AgentCategory.SERVICE,
    description: '实时响应咨询，处理订单查询、尺码推荐及售后问题。',
    icon: 'Headphones',
    promptPreview: '客户询问商务西装如何选择尺码，身高175cm体重70kg。',
    systemInstruction: '你是迪尚智能客服。语气亲切专业，负责解答尺码推荐、订单进度和售后政策。遇到复杂纠纷，请引导转接人工。'
  },

  // 内部管理
  {
    id: 'mgmt-contract',
    name: '合同审查 Agent',
    category: AgentCategory.MANAGEMENT,
    description: '审查供应商与客户合同，标注风险条款并提供修改建议。',
    icon: 'FileText',
    promptPreview: '审查这份面料采购合同，检查付款周期是否合规。',
    systemInstruction: '你是法务合规专家。对照迪尚合同标准模板，严格审查合同条款。重点关注付款方式、违约责任和交货期，指出风险等级（高/中/低）并给出修改建议。'
  }
];

export const MOCK_HISTORY: ChatSession[] = [
  {
    id: 'h1',
    title: '2024秋季商务西装开发',
    agentId: 'design-trend',
    messages: [],
    updatedAt: Date.now() - 100000
  },
  {
    id: 'h2',
    title: '企业团装定制方案',
    agentId: 'sales-copy',
    messages: [],
    updatedAt: Date.now() - 500000
  }
];
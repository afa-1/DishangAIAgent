
export enum AgentCategory {
  DESIGN = '趋势与设计',
  PRODUCTION = '生产与供应链',
  SALES = '营销与销售',
  SERVICE = '客户服务',
  MANAGEMENT = '内部管理与协同'
}

export interface Agent {
  id: string;
  name: string;
  category: AgentCategory;
  description: string;
  icon: string; // Lucide icon name
  promptPreview: string;
  systemInstruction: string;
}

export interface StepLog {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed';
  timestamp: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  steps?: StepLog[]; // Added field for thinking chain
}

export interface ChatSession {
  id: string;
  title: string;
  agentId: string; // Primary agent or representative
  agentIds?: string[]; // For collaboration: list of all participants
  type?: 'single' | 'collaboration'; // Session type
  messages: Message[];
  updatedAt: number;
  isPinned?: boolean; // New
  isFavorite?: boolean; // New
}

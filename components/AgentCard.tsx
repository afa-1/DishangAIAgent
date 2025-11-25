import React from 'react';
import { Agent } from '../types';
import * as Icons from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  onClick: (agent: Agent) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick }) => {
  const IconComponent = (Icons as any)[agent.icon] || Icons.Bot;

  // Generate a consistent pastel color based on the category/id
  const getGradient = () => {
    switch (agent.category) {
      case '趋势与设计': return 'from-pink-100 to-rose-50';
      case '生产与供应链': return 'from-blue-100 to-cyan-50';
      case '营销与销售': return 'from-violet-100 to-purple-50';
      case '客户服务': return 'from-amber-100 to-orange-50';
      default: return 'from-slate-100 to-slate-50';
    }
  };

  const getIconColor = () => {
     switch (agent.category) {
      case '趋势与设计': return 'text-rose-500';
      case '生产与供应链': return 'text-cyan-600';
      case '营销与销售': return 'text-violet-600';
      case '客户服务': return 'text-amber-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div 
      onClick={() => onClick(agent)}
      className="group relative bg-white rounded-2xl p-5 hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 flex flex-col h-[180px] overflow-hidden"
    >
      {/* Gradient Background Decoration */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${getGradient()} opacity-50 rounded-bl-[60px] -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center ${getIconColor()} border border-slate-100`}>
             <IconComponent size={24} strokeWidth={2} />
          </div>
        </div>

        <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-brand-600 transition-colors">
          {agent.name}
        </h3>
        
        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {agent.description}
        </p>

        <div className="mt-auto flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded">立即使用</span>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
import React, { useState, useMemo, useEffect } from 'react';
import { X, Check, Sparkles, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { Agent, AgentCategory } from '../types';
import { DISHANG_AGENTS } from '../constants';
import * as Icons from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedIds: string[]) => void;
  userRole?: string; // e.g., '设计师'
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  userRole = '设计师'
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isOthersExpanded, setIsOthersExpanded] = useState(true);

  // 1. Identify Recommended Category based on User Role
  const recommendedCategory = useMemo(() => {
    if (userRole === '设计师') return AgentCategory.DESIGN;
    // Add more mappings if needed
    return AgentCategory.DESIGN;
  }, [userRole]);

  // 2. Group Agents
  const { recommendedAgents, otherCategories } = useMemo(() => {
    const recommended: Agent[] = [];
    const others: Record<string, Agent[]> = {};

    DISHANG_AGENTS.forEach(agent => {
      if (agent.category === recommendedCategory) {
        recommended.push(agent);
      } else {
        if (!others[agent.category]) {
          others[agent.category] = [];
        }
        others[agent.category].push(agent);
      }
    });

    return { recommendedAgents: recommended, otherCategories: others };
  }, [recommendedCategory]);

  // 3. Initial Selection (Select all recommended by default)
  useEffect(() => {
    if (isOpen) {
      const initialIds = new Set<string>();
      recommendedAgents.forEach(a => initialIds.add(a.id));
      setSelectedIds(initialIds);
    }
  }, [isOpen, recommendedAgents]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedIds));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-white flex-shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Sparkles size={120} />
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-3 mb-3">
                  快速添加推荐agent <Sparkles className="text-yellow-300" fill="currentColor" />
                </h2>
                <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">
                  检测到您的角色是 <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded">{userRole}</span>。
                  根据您的{userRole}角色，您可能需要以下AI员工协助您的日常工作。
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 custom-scrollbar">
          
          {/* Recommended Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Sparkles className="text-blue-600" size={24} />
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-800">为您推荐</h3>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200">
                      {recommendedCategory}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">根据您的{userRole}角色，您可能需要这些合作伙伴</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    const newSet = new Set(selectedIds);
                    recommendedAgents.forEach(a => newSet.add(a.id));
                    setSelectedIds(newSet);
                  }}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  一键添加
                </button>
                <span className="text-slate-500 font-medium">
                  已选 {recommendedAgents.filter(a => selectedIds.has(a.id)).length}/{recommendedAgents.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedAgents.map(agent => (
                <AgentCard 
                  key={agent.id} 
                  agent={agent} 
                  isSelected={selectedIds.has(agent.id)} 
                  onToggle={() => toggleSelection(agent.id)} 
                  isRecommended
                />
              ))}
            </div>
          </div>

          {/* Other Sections */}
          <div className="border-t border-slate-200 pt-8">
            <button 
              onClick={() => setIsOthersExpanded(!isOthersExpanded)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 group"
            >
              {isOthersExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              <h3 className="text-lg font-bold">其他部门员工</h3>
            </button>
            
            {isOthersExpanded && (
              <div className="space-y-8 animate-in slide-in-from-top-2 duration-300">
                {(Object.entries(otherCategories) as [string, Agent[]][]).map(([category, agents]) => (
                  <div key={category}>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {agents.map(agent => (
                        <AgentCard 
                          key={agent.id} 
                          agent={agent} 
                          isSelected={selectedIds.has(agent.id)} 
                          onToggle={() => toggleSelection(agent.id)} 
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between flex-shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="text-slate-600 font-medium">
            已选择 <span className="text-blue-600 font-bold text-xl mx-1">{selectedIds.size}</span> 位员工
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-3 text-slate-500 hover:text-slate-800 font-bold transition-colors"
            >
              稍后添加
            </button>
            <button 
              onClick={handleConfirm}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all flex items-center gap-2 active:scale-95"
            >
              <Check size={20} strokeWidth={3} />
              确认添加 ({selectedIds.size})
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onToggle: () => void;
  isRecommended?: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, isSelected, onToggle, isRecommended }) => {
  const Icon = (Icons as any)[agent.icon] || Icons.Bot;
  
  return (
    <div 
      onClick={onToggle}
      className={`
        relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 group select-none
        ${isSelected 
          ? 'bg-blue-50/50 border-blue-500 shadow-sm' 
          : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md'
        }
      `}
    >
      <div className="flex items-start gap-4">
        <div className={`
          w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0
          ${agent.category === AgentCategory.DESIGN ? 'bg-orange-400' :
            agent.category === AgentCategory.PRODUCTION ? 'bg-blue-500' :
            'bg-indigo-500'}
        `}>
          <Icon size={28} strokeWidth={2} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`text-lg font-bold mb-1 ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
            {agent.name}
          </h4>
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
            {agent.description}
          </p>
        </div>

        <div className={`
          w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
          ${isSelected 
            ? 'bg-blue-600 border-blue-600 text-white scale-110' 
            : 'border-slate-300 text-transparent group-hover:border-blue-300'
          }
        `}>
          <Check size={16} strokeWidth={4} />
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;

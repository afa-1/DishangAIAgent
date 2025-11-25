
import React, { useState } from 'react';
import { X, Check, Users } from 'lucide-react';
import { DISHANG_AGENTS } from '../constants';
import { AgentCategory } from '../types';
import * as Icons from 'lucide-react';

interface AgentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedIds: string[]) => void;
}

const AgentSelectionModal: React.FC<AgentSelectionModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const categories = Object.values(AgentCategory);

  const handleConfirm = () => {
    if (selectedIds.size > 0) {
      onConfirm(Array.from(selectedIds));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Users size={20} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-800">发起员工协作</h2>
                <p className="text-sm text-slate-500">选择多个 Agent 组成专家团队，协同处理复杂任务</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
           <div className="space-y-8">
              {categories.map((category) => {
                const agents = DISHANG_AGENTS.filter(a => a.category === category);
                if (agents.length === 0) return null;

                return (
                  <div key={category}>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {agents.map(agent => {
                        const isSelected = selectedIds.has(agent.id);
                        const IconComponent = (Icons as any)[agent.icon] || Icons.Bot;
                        
                        return (
                          <div 
                            key={agent.id}
                            onClick={() => toggleSelection(agent.id)}
                            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-start space-x-4 hover:shadow-md ${
                              isSelected 
                                ? 'border-blue-600 bg-blue-50/30' 
                                : 'border-white bg-white hover:border-slate-200'
                            }`}
                          >
                             <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                <IconComponent size={20} />
                             </div>
                             <div className="flex-1 min-w-0">
                                <h4 className={`font-bold text-sm mb-1 ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>{agent.name}</h4>
                                <p className="text-xs text-slate-500 line-clamp-2">{agent.description}</p>
                             </div>
                             
                             {/* Checkbox Indicator */}
                             <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                               isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-transparent'
                             }`}>
                                {isSelected && <Check size={12} className="text-white" />}
                             </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
           </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between">
           <span className="text-sm text-slate-500">
             已选择 <span className="font-bold text-slate-800">{selectedIds.size}</span> 位虚拟员工
           </span>
           <div className="flex space-x-3">
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-colors">
                取消
              </button>
              <button 
                onClick={handleConfirm}
                disabled={selectedIds.size === 0}
                className={`px-6 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all ${
                   selectedIds.size > 0 
                     ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5' 
                     : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                确定协作
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AgentSelectionModal;


import React, { useState } from 'react';
import { X, Check, Users, ChevronLeft } from 'lucide-react';
import { DISHANG_AGENTS } from '../constants';
import { AgentCategory } from '../types';
import * as Icons from 'lucide-react';

interface AgentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedIds: string[], groupName: string) => void;
}

const AgentSelectionModal: React.FC<AgentSelectionModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<1 | 2>(1);
  const [groupName, setGroupName] = useState('');

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

  const handleNext = () => {
    if (selectedIds.size > 0) {
      setStep(2);
    }
  };

  const handleConfirm = () => {
    if (groupName.trim()) {
      onConfirm(Array.from(selectedIds), groupName);
      // Reset state after confirm
      setTimeout(() => {
        setStep(1);
        setSelectedIds(new Set());
        setGroupName('');
      }, 300);
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
                <h2 className="text-xl font-bold text-slate-800">
                  {step === 1 ? '发起员工协作' : '创建协作群组'}
                </h2>
                <p className="text-sm text-slate-500">
                  {step === 1 ? '选择多个 Agent 组成专家团队，协同处理复杂任务' : '为您的专家团队命名，便于后续识别与管理'}
                </p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
           {step === 1 ? (
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
           ) : (
             <div className="flex flex-col items-center justify-center h-full py-10">
               <div className="w-full max-w-md space-y-6">
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">群组名称</label>
                   <input 
                     type="text" 
                     value={groupName}
                     onChange={(e) => setGroupName(e.target.value)}
                     placeholder="例如：2024新品研发项目组"
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                     autoFocus
                   />
                 </div>
                 
                 <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">已选成员 ({selectedIds.size})</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(selectedIds).map(id => {
                        const agent = DISHANG_AGENTS.find(a => a.id === id);
                        if (!agent) return null;
                        return (
                          <div key={id} className="flex items-center px-2 py-1 bg-slate-100 rounded-md text-xs text-slate-600">
                             <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5"></span>
                             {agent.name}
                          </div>
                        );
                      })}
                    </div>
                 </div>
               </div>
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between">
           {step === 1 ? (
             <span className="text-sm text-slate-500">
               已选择 <span className="font-bold text-slate-800">{selectedIds.size}</span> 位虚拟员工
             </span>
           ) : (
             <button onClick={() => setStep(1)} className="flex items-center text-slate-500 hover:text-slate-700 transition-colors">
                <ChevronLeft size={20} className="mr-1" />
                <span className="font-medium">返回选择</span>
             </button>
           )}
           
           <div className="flex space-x-3">
              {step === 1 && (
                <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-colors">
                  取消
                </button>
              )}
              
              {step === 1 ? (
                <button 
                  onClick={handleNext}
                  disabled={selectedIds.size === 0}
                  className={`px-6 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all ${
                     selectedIds.size > 0 
                       ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5' 
                       : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  下一步
                </button>
              ) : (
                <button 
                  onClick={handleConfirm}
                  disabled={!groupName.trim()}
                  className={`px-6 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all ${
                     groupName.trim() 
                       ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5' 
                       : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  确定协作
                </button>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default AgentSelectionModal;

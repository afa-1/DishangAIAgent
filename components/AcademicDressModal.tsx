import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface AcademicDressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (designData: any) => void;
}

const TABS = [
  'AI 配色', '帽兜', '学科色', '校徽', '帽穗', '门襟', '袖口', '纹样'
];

const COLOR_SCHEMES = [
  {
    id: 'purple',
    name: '扁豆紫',
    subName: '八月 · 白露',
    desc: '最怜秋满疏篱外，带雨斜开扁豆花。',
    hex: '#912a73',
    rgb: '190/92/151',
    cmyk: '26/79/9/0',
    colors: ['#000000', '#1e2b58', '#b91c1c'] // Mock secondary colors
  },
  {
    id: 'green',
    name: '苍绿',
    subName: '正月 · 立春',
    desc: '剪彩为花，春意盎然。',
    hex: '#0f5c45', // Mock hex
    rgb: '15/92/69',
    cmyk: '80/20/60/10',
    colors: ['#000000', '#1e2b58', '#b91c1c']
  },
  {
    id: 'red',
    name: '枫叶红',
    subName: '九月 · 霜降',
    desc: '停车坐爱枫林晚，霜叶红于二月花。',
    hex: '#c92a2a', // Mock hex
    rgb: '201/42/42',
    cmyk: '10/90/90/0',
    colors: ['#000000', '#1e2b58', '#b91c1c']
  }
];

const AcademicDressModal: React.FC<AcademicDressModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [activeTab, setActiveTab] = useState('AI 配色');
  const [selectedScheme, setSelectedScheme] = useState(COLOR_SCHEMES[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[650px] flex overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/50 hover:bg-white rounded-full transition-colors"
        >
          <X size={20} className="text-slate-500" />
        </button>

        {/* Left: Preview Area */}
        <div className="w-1/2 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center relative flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-[2px]"></div>
          
          {/* Mock Dress Preview - Using a placeholder image or SVG would be better, but for now a styled div */}
          <div className="relative z-10 w-full max-w-md aspect-[3/4] transition-all duration-500">
             {/* This image represents the Academic Dress. In a real app, this would be a dynamic composition layer. */}
             {/* Using a generic academic dress image from Unsplash or similar if possible, otherwise a placeholder */}
             <img 
               src="https://img.alicdn.com/imgextra/i2/O1CN014e1v4S1h6W1c2X3yZ_!!6000000004228-2-tps-800-800.png" 
               alt="Academic Dress Preview" 
               className="w-full h-full object-contain drop-shadow-2xl"
               onError={(e) => {
                 (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x600?text=Academic+Dress+Preview";
               }}
             />
          </div>
        </div>

        {/* Right: Controls Area */}
        <div className="w-1/2 flex flex-col bg-white">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">百变小迪 AI 设计工坊</h3>
                <p className="text-xs text-slate-500 mt-0.5">小迪已根据您的选择生成配色方案～若您想调整配色或更换部件设计，随时与我互动！</p>
              </div>
            </div>
            <button 
              onClick={() => onConfirm(selectedScheme)}
              className="px-5 py-2 bg-[#ff5e3a] hover:bg-[#e04f30] text-white text-sm font-bold rounded-lg shadow-lg shadow-orange-200 transition-all hover:scale-105 active:scale-95"
            >
              完成设计 »
            </button>
          </div>

          {/* Tabs */}
          <div className="px-2 py-2 bg-slate-50/50 border-b border-slate-100 overflow-x-auto">
            <div className="flex space-x-1 min-w-max px-4">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-sm rounded-md transition-all ${
                    activeTab === tab 
                      ? 'bg-[#ff5e3a] text-white font-medium shadow-md' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
            {activeTab === 'AI 配色' ? (
              <div className="grid grid-cols-1 gap-4">
                {/* Main Selected Card Display (Like the purple one in screenshot) */}
                <div className="w-full aspect-[1.8/1] rounded-2xl overflow-hidden shadow-xl relative group cursor-pointer transition-transform hover:scale-[1.01]" style={{ backgroundColor: selectedScheme.hex }}>
                   <div className="absolute inset-0 p-6 text-white flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="writing-vertical-rl text-4xl font-bold tracking-widest h-32">{selectedScheme.name}</div>
                        <div className="writing-vertical-rl text-sm font-light tracking-widest opacity-80 h-32 border-r border-white/30 pr-2 mr-2">
                          {selectedScheme.subName}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div className="space-y-1 text-[10px] font-mono opacity-80">
                          <div className="border border-white/30 w-8 h-12 mb-2"></div>
                          <p>HEX: {selectedScheme.hex}</p>
                          <p>RGB: {selectedScheme.rgb}</p>
                          <p>CMYK: {selectedScheme.cmyk}</p>
                        </div>
                        <div className="flex space-x-2">
                          {selectedScheme.colors.map((c, i) => (
                             <div key={i} className="w-8 h-8 rounded bg-white border-2 border-white/20" style={{ backgroundColor: c }}></div>
                          ))}
                        </div>
                        <div className="writing-vertical-rl text-sm font-medium tracking-widest h-24 border-l border-white/30 pl-3">
                          {selectedScheme.desc}
                        </div>
                      </div>
                   </div>
                </div>

                {/* Other Options List */}
                <div className="grid grid-cols-1 gap-3 mt-2">
                  {COLOR_SCHEMES.filter(s => s.id !== selectedScheme.id).map(scheme => (
                    <button 
                      key={scheme.id}
                      onClick={() => setSelectedScheme(scheme)}
                      className="flex items-center p-2 bg-white rounded-xl border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all group text-left"
                    >
                      <div className="w-16 h-16 rounded-lg shadow-sm flex-shrink-0 mr-4" style={{ backgroundColor: scheme.hex }}>
                         <div className="w-full h-full flex items-center justify-center text-white/90 font-bold writing-vertical-rl text-xs py-2">
                            {scheme.name}
                         </div>
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-center mb-1">
                            <h4 className="font-bold text-slate-700">{scheme.name}</h4>
                            <span className="text-xs text-slate-400">{scheme.subName}</span>
                         </div>
                         <p className="text-xs text-slate-500 line-clamp-1">{scheme.desc}</p>
                         <div className="flex mt-2 space-x-1">
                            <div className="w-3 h-3 rounded-full bg-slate-900"></div>
                            <div className="w-3 h-3 rounded-full bg-blue-900"></div>
                            <div className="w-3 h-3 rounded-full bg-red-900"></div>
                         </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[#ff5e3a] pr-2">
                        <Check size={20} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                   <span className="text-2xl">🚧</span>
                </div>
                <p>该模块正在开发中...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicDressModal;

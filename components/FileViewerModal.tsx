import React, { useState } from 'react';
import { X, FileText, Image as ImageIcon, Globe, Download, Star, FileSpreadsheet, File, Video } from 'lucide-react';
import { FileItem } from '../types';

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileItem[];
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({ isOpen, onClose, files }) => {
  const [filter, setFilter] = useState<'all' | 'file' | 'image' | 'video'>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleFavorite = (id: string) => {
    const newFavs = new Set(favorites);
    if (newFavs.has(id)) newFavs.delete(id);
    else newFavs.add(id);
    setFavorites(newFavs);
  };

  const filteredFiles = files.filter(f => {
    if (filter === 'all') return true;
    if (filter === 'file') return ['pdf', 'word', 'excel', 'web'].includes(f.type);
    if (filter === 'image') return f.type === 'image';
    if (filter === 'video') return f.type === 'video';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="text-red-500" size={24} />;
      case 'word': return <FileText className="text-blue-500" size={24} />;
      case 'excel': return <FileSpreadsheet className="text-green-500" size={24} />;
      case 'image': return <ImageIcon className="text-purple-500" size={24} />;
      case 'web': return <Globe className="text-indigo-500" size={24} />;
      case 'video': return <Video className="text-orange-500" size={24} />;
      default: return <File className="text-slate-400" size={24} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-zoomIn">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">文件</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 pb-2 flex space-x-4 border-b border-slate-50">
          {[
            { id: 'all', label: '全部' },
            { id: 'file', label: '文件' },
            { id: 'image', label: '图片' },
            { id: 'video', label: '视频' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`pb-2 text-sm font-medium transition-all relative ${
                filter === tab.id 
                  ? 'text-blue-600' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {filter === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
          <div className="space-y-3">
            {filteredFiles.length === 0 ? (
               <div className="text-center py-12 text-slate-400 text-sm">
                 暂无相关文件
               </div>
            ) : (
              filteredFiles.map(file => (
                <div key={file.id} className="bg-white p-4 rounded-xl border border-slate-100 hover:shadow-md transition-all flex items-center group">
                  <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                    {getIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 truncate mb-1">{file.name}</h4>
                    <p className="text-xs text-slate-400 flex items-center">
                      {file.timestamp} 
                      {file.size && <span className="mx-1.5 opacity-50">|</span>}
                      {file.size}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => toggleFavorite(file.id)}
                      className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${favorites.has(file.id) ? 'text-amber-400' : 'text-slate-400'}`}
                      title="收藏"
                    >
                      <Star size={18} fill={favorites.has(file.id) ? "currentColor" : "none"} />
                    </button>
                    <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors" title="下载">
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileViewerModal;

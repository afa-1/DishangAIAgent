import React, { useState } from 'react';
import { Link, Check } from 'lucide-react';

interface SharePopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

const SharePopover: React.FC<SharePopoverProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-20 cursor-default" onClick={onClose}></div>
      <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 z-30 py-4 px-4 animate-zoomIn flex flex-col gap-3">
        <div className="text-sm text-slate-600 text-center font-medium">
          公司内获得链接的人可访问
        </div>
        <button 
          onClick={handleCopy}
          className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-md shadow-blue-100 active:scale-95 duration-150"
        >
          {copied ? <Check size={16} /> : <Link size={16} />}
          <span>{copied ? '已复制链接' : '复制链接'}</span>
        </button>
      </div>
    </>
  );
};

export default SharePopover;

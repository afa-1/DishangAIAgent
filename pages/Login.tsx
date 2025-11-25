import React, { useState } from 'react';
import { Eye, EyeOff, Check, Sun } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loginMethod, setLoginMethod] = useState<'password' | 'feishu'>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 relative font-sans text-slate-800">
      
      {/* Theme Toggle (Visual only based on screenshot) */}
      <div className="absolute top-6 right-6">
        <button className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
          <Sun size={20} />
        </button>
      </div>

      <div className="w-full max-w-[1000px] bg-white rounded-[20px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden flex min-h-[600px]">
        
        {/* Left Side - Illustration */}
        <div className="hidden md:flex md:w-[480px] bg-[#fff7e6] flex-col relative p-8 items-center justify-center">
           {/* Logo Area (Optional) */}
           <div className="absolute top-8 left-8 flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#ff3b30] rounded-full flex items-center justify-center text-white font-bold text-lg">d</div>
           </div>

           {/* 3D Illustration Area */}
           <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
              {/* 3D Character - Clothing Worker / Blue Shirt Style */}
              <img 
                src="https://cdn3d.iconscout.com/3d/premium/thumb/delivery-man-5750849-4817488.png" 
                alt="3D Clothing Worker" 
                className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
                // Fallback
                onError={(e) => {
                  e.currentTarget.src = "https://cdn3d.iconscout.com/3d/premium/thumb/man-avatar-6299539-5187871.png";
                }}
              />
           </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 bg-white p-12 flex flex-col justify-center">
          <div className="max-w-[360px] mx-auto w-full">
            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">欢迎使用</h1>
            <p className="text-slate-500 font-medium text-lg mb-8 flex items-center">
              <span className="bg-red-50 text-red-500 px-1 rounded border border-red-100 text-sm mr-2">BETA</span>
              迪尚AI Agent平台
            </p>

            {/* Login Method Tabs */}
            <div className="flex bg-[#f5f5f7] p-1 rounded-lg mb-8 w-fit">
              <button
                onClick={() => setLoginMethod('password')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  loginMethod === 'password'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                账号密码登录
              </button>
              <button
                onClick={() => setLoginMethod('feishu')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  loginMethod === 'feishu'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                飞书登录
              </button>
            </div>

            {loginMethod === 'password' ? (
              <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
                <div className="space-y-1">
                  <input 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white border border-[#e5e7eb] rounded-lg outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] transition-all text-[15px] text-slate-900 placeholder-slate-400"
                    placeholder="请输入工号"
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-1 relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white border border-[#e5e7eb] rounded-lg outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] transition-all text-[15px] text-slate-900 placeholder-slate-400"
                    placeholder="请输入密码"
                    autoComplete="new-password"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" className="peer sr-only" defaultChecked />
                      <div className="w-4 h-4 border-2 border-slate-300 rounded peer-checked:bg-[#1a1a1a] peer-checked:border-[#1a1a1a] transition-colors"></div>
                      <Check size={10} className="text-white absolute top-[2px] left-[2px] opacity-0 peer-checked:opacity-100" />
                    </div>
                    <span className="ml-2 text-sm text-slate-600">记住我</span>
                  </label>
                  <a href="#" className="text-sm font-medium text-slate-900 hover:underline">忘记密码了?</a>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1a1a1a] hover:bg-[#000000] text-white font-medium py-3.5 rounded-lg shadow-sm flex items-center justify-center transition-all mt-4"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    "登录"
                  )}
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center py-8">
                 <div className="w-40 h-40 bg-slate-100 rounded-xl mb-4 flex items-center justify-center text-slate-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-20 h-20">
                      <path d="M3 3h18v18H3z" />
                      <path d="M7 7h10M7 12h10M7 17h10" />
                    </svg>
                 </div>
                 <p className="text-sm text-slate-500">请使用飞书 APP 扫码登录</p>
                 <button className="mt-6 text-[#1a1a1a] font-medium text-sm hover:underline" onClick={onLogin}>
                    模拟扫码成功
                 </button>
              </div>
            )}

            <div className="mt-12 text-center">
              <span className="text-slate-500 text-sm">还没有帐号？ </span>
              <a href="#" className="text-[#1a1a1a] font-medium text-sm hover:underline">注册新帐号</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
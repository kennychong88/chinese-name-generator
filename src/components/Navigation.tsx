import React from 'react';
import { Home, Info, Sparkles, Compass, Sun, Users, BookOpen, HelpCircle } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {

  const navItems = [
    { id: 'compatibility', label: 'Zodiac Compatibility', icon: Users },
    { id: 'fengShuiTips', label: 'Feng Shui Tips', icon: Compass },
    { id: 'astrology', label: 'Zodiac Signs', icon: Sun },
    { id: 'famousPeople', label: 'Famous People', icon: Users },
    { id: 'blog', label: 'Blog', icon: BookOpen },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'about', label: 'About', icon: Info },
    { id: 'home', label: 'Home', icon: Home }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group">
              {/* 科技感背景效果 */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,212,255,0.1)_1px,transparent_1px),linear-gradient(-45deg,rgba(255,0,128,0.1)_1px,transparent_1px)] bg-[size:4px_4px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* 简化版"名"字图标 */}
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-6 sm:h-6 text-white drop-shadow-lg">
                  <defs>
                    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00d4ff" />
                      <stop offset="100%" stopColor="#ff0080" />
                    </linearGradient>
                  </defs>
                  {/* 简化的"名"字设计 */}
                  <g fill="none" stroke="url(#iconGradient)" strokeWidth="1.5" strokeLinecap="round">
                    {/* 夕字部分 */}
                    <line x1="4" y1="8" x2="10" y2="8" />
                    <path d="M6 10 Q5 14 7 18" />
                    <circle cx="8" cy="10" r="0.5" fill="url(#iconGradient)" />
                    {/* 口字部分 */}
                    <rect x="12" y="6" width="8" height="12" rx="1" />
                    <line x1="13" y1="9" x2="19" y2="9" strokeWidth="0.5" />
                    <line x1="13" y1="12" x2="19" y2="12" strokeWidth="0.5" />
                    <line x1="13" y1="15" x2="19" y2="15" strokeWidth="0.5" />
                  </g>
                </svg>
              </div>
              
              {/* 发光效果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <div className="hidden xs:flex flex-col">
              <span className="text-sm sm:text-base font-bold text-white/90 leading-tight"> The Name Dragon</span>
              <span className="text-xs text-cyan-400/80 font-medium">Zodiac & Feng Shui</span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    currentPage === item.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="flex lg:hidden items-center space-x-1">
            {navItems.slice(0, 3).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                    currentPage === item.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
            
            {/* More menu for mobile */}
            <div className="relative">
              <button
                className="flex items-center justify-center w-10 h-10 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                onClick={() => {
                  // Simple toggle for remaining items
                  const moreItems = navItems.slice(3);
                  if (moreItems.length > 0) {
                    onPageChange(moreItems[0].id);
                  }
                }}
              >
                <div className="flex flex-col space-y-0.5">
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navigation;
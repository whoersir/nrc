'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutTemplate, MessageSquare, Gamepad2, Music, Sparkles, LogOut, User } from 'lucide-react';
import { SupabaseAuth } from '@/lib/supabase-auth';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [features, setFeatures] = useState<any[]>([
    {
      title: '个人空间',
      description: '自定义你的专属空间，添加喜欢的组件',
      icon: LayoutTemplate,
      href: '/profile',
      color: 'from-pink-400 to-rose-400',
    },
    {
      title: 'AI-Agent',
      description: '团队的AI智能助手',
      icon: MessageSquare,
      href: '/chat',
      color: 'from-blue-400 to-indigo-400',
    },
    {
      title: '在线游戏',
      description: '闲暇时光跟朋友增进友谊',
      icon: Gamepad2,
      href: '/games',
      color: 'from-green-400 to-emerald-400',
    },
    {
      title: '音乐播放',
      description: '聆听美妙音乐缓解工作压力',
      icon: Music,
      href: '/music',
      color: 'from-purple-400 to-pink-400',
    },
  ]);

  useEffect(() => {
    const userData = localStorage.getItem('user_session');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // 更新个人空间的标题
      setFeatures(prevFeatures =>
        prevFeatures.map(feature =>
          feature.href === '/profile'
            ? { ...feature, title: `${parsedUser.nickname || parsedUser.username}的空间` }
            : feature
        )
      );
    }
  }, []);

  const getWelcomeMessage = () => {
    if (user) {
      const displayName = user.nickname || user.username;
      return `欢迎回来，${displayName}！`;
    }
    return '欢迎来到NRC的温馨小屋';
  };

  const handleLogout = async () => {
    try {
      await SupabaseAuth.logout();
      setUser(null);
      // 重新加载页面
      window.location.reload();
    } catch (error: any) {
      console.error('退出登录失败:', error);
      alert('退出失败，请重试');
    }
  };

  return (
    <div className="flex flex-col animate-fade-in">
      {/* Hero Section - 自然布局 */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-24 sm:pb-28 lg:pb-32 mt-[100px]">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-pink-400/10 to-orange-300/10 blur-3xl animate-pulse" />
          <div className="absolute top-1/4 right-1/4 h-[28rem] w-[28rem] translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-bl from-blue-400/10 to-indigo-300/10 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute bottom-1/3 left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 translate-y-1/2 rounded-full bg-gradient-to-t from-purple-400/10 to-pink-300/10 blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
        </div>

        {/* 主内容 */}
        <div className="relative w-full max-w-5xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* 欢迎标签 */}
          <div className="inline-flex items-center justify-center rounded-full glass px-4 py-2 text-sm animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{getWelcomeMessage()}</span>
          </div>

          {/* 主标题 */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h1 className="mb-4 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-pink-400 via-orange-300 to-yellow-200 bg-clip-text text-transparent">
                NRC的温馨小屋
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              NRC团队的温馨小屋，这里有属于你的个人空间、团队的AI-agent、
              聆听美妙音乐缓解你的工作压力，闲暇时光跟朋友来一把小游戏增进友谊。
            </p>
          </div>

          {/* 登录/注册按钮 - 仅在未登录时显示 */}
          {!user && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3 rounded-full text-base text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-105"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-pink-400 to-orange-300 text-base text-white hover:from-pink-500 hover:to-orange-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                注册账号
              </Link>
            </div>
          )}

          {/* 已登录 - 显示用户信息和退出按钮 */}
          {user && (
            <div className="flex items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link
                href="/profile"
                className="flex items-center gap-2 px-6 py-3 rounded-full glass text-base hover:bg-accent hover:text-accent-foreground transition-all duration-300"
              >
                <User className="h-5 w-5" />
                <span>{user.nickname || user.username}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-400 to-orange-300 text-base text-white hover:from-pink-500 hover:to-orange-400 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <LogOut className="h-5 w-5" />
                <span>退出</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Features Grid - 自然布局 */}
      <div className="relative z-10 bg-background/60 backdrop-blur-md border-t border-border/40 px-4 sm:px-6 lg:px-8 py-6 mt-[100px]">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className="group relative overflow-hidden rounded-2xl glass-card p-5 sm:p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up"
                  style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-300 group-hover:opacity-15`} />

                  <div className="relative flex flex-col items-center text-center">
                    <div className={`mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>

                    <h3 className="mb-1.5 sm:mb-2 text-sm sm:text-base font-semibold">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{feature.description}</p>

                    <div className="mt-3 sm:mt-4 flex items-center text-xs font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                      立即体验
                      <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

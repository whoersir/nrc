'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Gamepad2, 
  Target, 
  Circle, 
  UtensilsCrossed, 
  Users, 
  Wifi,
  Trophy,
  Play,
  Info,
  X,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { GameLeaderboard } from '@/components/GameLeaderboard';
import { SupabaseAuth } from '@/lib/supabase-auth';
import { AuthGuard } from '@/components/AuthGuard';
import type { GameId } from '@/types/game';
import { getGameName } from '@/types/game';

interface Game {
  id: GameId;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  tags: string[];
  players: string;
  status: 'available' | 'deployed' | 'development';
  url?: string;
  features: string[];
  isExternal?: boolean;
}

const games: Game[] = [
  {
    id: 'snake',
    name: '贪吃蛇',
    description: '经典贪吃蛇游戏，使用方向键或屏幕按钮控制蛇的移动，吃掉食物增长身体。',
    icon: <Gamepad2 className="h-8 w-8" />,
    color: 'from-green-400 to-emerald-500',
    tags: ['单机', '休闲', '经典'],
    players: '1人',
    status: 'available',
    url: '/games/snake',
    features: ['本地存储最高分', '响应式控制', '流畅动画', '暂停功能', '速度递增'],
    isExternal: false,
  },
  {
    id: 'gomoku',
    name: '五子棋对战',
    description: '经典五子棋游戏，支持双人对战和人机对战，15x15 标准棋盘。',
    icon: <Circle className="h-8 w-8" />,
    color: 'from-blue-400 to-indigo-500',
    tags: ['单机', '对战', '策略'],
    players: '1-2人',
    status: 'available',
    url: '/games/gomoku',
    features: ['双人对战', '人机对战', 'AI 对手', '计分系统', '15x15 标准棋盘'],
    isExternal: false,
  },
  {
    id: 'fps',
    name: 'FPS 射击游戏',
    description: '第一人称射击游戏，使用 Three.js 构建的 3D 射击体验。',
    icon: <Target className="h-8 w-8" />,
    color: 'from-red-400 to-orange-500',
    tags: ['3D', '射击', '排行榜'],
    players: '1人',
    status: 'available',
    url: 'https://nrc-8ggxdu3m3534afc0-1392812070.tcloudbaseapp.com/fps-game',
    features: ['3D 第一人称视角', '排行榜', '云端分数存储', '音效与模型资源'],
    isExternal: true,
  },
  {
    id: 'overcooked',
    name: '分手厨房',
    description: '合作烹饪游戏，与好友一起完成订单，分工合作经营厨房。',
    icon: <UtensilsCrossed className="h-8 w-8" />,
    color: 'from-yellow-400 to-orange-500',
    tags: ['合作', '烹饪', '联机'],
    players: '2人',
    status: 'available',
    url: 'https://nrc-8ggxdu3m3534afc0-1392812070.tcloudbaseapp.com/overcooked-game',
    features: ['实时合作', '订单系统', '多种食材', '排行榜', '跨设备联机'],
    isExternal: true,
  },
];

function GameCard({ game, onPlay, userId }: { game: Game; onPlay: (game: Game) => void; userId?: string }) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary/20 flex flex-col h-full">
      <CardHeader className={`bg-gradient-to-br ${game.color} text-white p-6`}>
        <div className="flex items-start justify-between">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            {game.icon}
          </div>
          <div className="flex gap-2">
            {game.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-white/20 text-white border-0">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <CardTitle className="text-2xl mt-4">{game.name}</CardTitle>
        <CardDescription className="text-white/80 line-clamp-2">
          {game.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {game.players}
          </div>
          <div className="flex items-center gap-1">
            {game.status === 'available' ? (
              <>
                <Play className="h-4 w-4" />
                <span className="text-green-600">可游玩</span>
              </>
            ) : game.status === 'deployed' ? (
              <>
                <Wifi className="h-4 w-4" />
                <span className="text-blue-600">在线</span>
              </>
            ) : (
              <>
                <Info className="h-4 w-4" />
                <span className="text-orange-600">待部署</span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="text-sm font-medium">游戏特色:</div>
          <div className="flex flex-wrap gap-2">
            {game.features.slice(0, 3).map((feature) => (
              <Badge key={feature} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-2 items-stretch mt-auto">
          <Button
            className="flex-1 h-10"
            onClick={() => onPlay(game)}
            disabled={game.status === 'development'}
          >
            <Play className="mr-2 h-4 w-4" />
            {game.status === 'available' ? '开始游戏' : '即将上线'}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                <Trophy className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader className="flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle className="flex items-center gap-2">
                    {game.icon}
                    {game.name}排行榜
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    查看 {game.name} 的排行榜数据
                  </DialogDescription>
                </div>
                <DialogClose className="flex h-8 w-8 items-center justify-center rounded-sm opacity-60 transition-opacity hover:opacity-100 focus:outline-none">
                  <X className="h-5 w-5" />
                </DialogClose>
              </DialogHeader>
              <GameLeaderboard gameId={game.id} userId={userId} />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                <Info className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader className="flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle className="flex items-center gap-2">
                    {game.icon}
                    {game.name}
                  </DialogTitle>
                  <DialogDescription className="mt-1">{game.description}</DialogDescription>
                </div>
                <DialogClose className="flex h-8 w-8 items-center justify-center rounded-sm opacity-60 transition-opacity hover:opacity-100 focus:outline-none">
                  <X className="h-5 w-5" />
                </DialogClose>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">游戏特色</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {game.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">玩家人数:</span>
                    <span className="ml-1 font-medium">{game.players}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">类型:</span>
                    <span className="ml-1 font-medium">{game.tags.join(', ')}</span>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

function GamesContent() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await SupabaseAuth.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handlePlay = (game: Game) => {
    if (game.status === 'development') {
      return;
    }
    
    if (game.isExternal && game.url) {
      // 外部游戏，在新窗口打开
      window.open(game.url, '_blank');
    } else if (game.url) {
      // 内部游戏，直接跳转
      window.location.href = game.url;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl mb-6">
          <Gamepad2 className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4">游戏中心</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          欢迎来到游戏中心！这里有各种类型的游戏，从休闲单机到实时联机对战，
          总有一款适合你。邀请好友一起，享受游戏的乐趣吧！
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card className="text-center p-6">
          <div className="text-3xl font-bold text-primary mb-1">{games.length}</div>
          <div className="text-sm text-muted-foreground">游戏总数</div>
        </Card>
        <Card className="text-center p-6">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {games.filter(g => g.status === 'available' || g.status === 'deployed').length}
          </div>
          <div className="text-sm text-muted-foreground">可游玩</div>
        </Card>
        <Card className="text-center p-6">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {games.filter(g => g.tags.includes('联机')).length}
          </div>
          <div className="text-sm text-muted-foreground">联机游戏</div>
        </Card>
        <Card className="text-center p-6">
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {games.filter(g => g.tags.includes('合作')).length}
          </div>
          <div className="text-sm text-muted-foreground">合作游戏</div>
        </Card>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {games.map((game) => (
          <GameCard key={game.id} game={game} onPlay={handlePlay} userId={user?.id} />
        ))}
      </div>
    </div>
  );
}

export default function GamesPage() {
  return (
    <AuthGuard>
      <GamesContent />
    </AuthGuard>
  );
}

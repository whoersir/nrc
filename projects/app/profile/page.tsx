'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Plus,
  X,
  Save,
  Quote,
  StickyNote,
  Sun,
  Clock,
  Link as LinkIcon,
  LayoutTemplate,
  Gamepad2,
  Music,
  Edit2,
  Camera,
  Trophy,
  Heart,
  Moon,
  Monitor,
  Maximize2,
  Settings2,
  Grid,
  PanelRight,
  PanelLeft,
  LayoutGrid,
  Columns,
  Cloud,
  MapPin,
} from 'lucide-react';

interface Component {
  id: string;
  type: string;
  data: any;
  width: number; // 占用多少列（1-3）
  height: number; // 占用多少行（1-4）
  x?: number; // 自由放置模式下的X位置（像素）
  y?: number; // 自由放置模式下的Y位置（像素）
}

interface GameStats {
  gameName: string;
  wins: number;
  totalGames: number;
}

interface MusicHistory {
  songName: string;
  artist: string;
  playCount: number;
}

// 城市地区编码表
const CITIES = [
  { name: '北京', adcode: '110114' },
  { name: '上海', adcode: '310115' },
  { name: '广州', adcode: '440106' },
  { name: '深圳', adcode: '440300' },
  { name: '杭州', adcode: '330102' },
  { name: '南京', adcode: '320100' },
  { name: '苏州', adcode: '320500' },
  { name: '武汉', adcode: '420105' },
  { name: '成都', adcode: '510104' },
  { name: '西安', adcode: '610100' },
  { name: '天津', adcode: '120100' },
  { name: '重庆', adcode: '500100' },
  { name: '南昌', adcode: '360100' },
  { name: '长沙', adcode: '430100' },
  { name: '郑州', adcode: '410100' },
  { name: '沈阳', adcode: '210100' },
  { name: '青岛', adcode: '370200' },
  { name: '大连', adcode: '210200' },
  { name: '宁波', adcode: '330200' },
  { name: '哈尔滨', adcode: '230100' },
];

const availableComponents = [
  {
    type: 'quote',
    name: '名言/签名',
    icon: Quote,
    description: '展示一句励志名言或个性签名',
  },
  {
    type: 'todo',
    name: '待办事项',
    icon: StickyNote,
    description: '记录和管理你的待办事项',
  },
  {
    type: 'weather',
    name: '天气组件',
    icon: Sun,
    width: 1,
    height: 2,
    description: '显示当前天气信息（示例）',
  },
  {
    type: 'clock',
    name: '时钟',
    icon: Clock,
    description: '显示当前时间',
  },
  {
    type: 'social',
    name: '社交链接',
    icon: LinkIcon,
    description: '展示你的社交媒体链接',
  },
  {
    type: 'link',
    name: '链接嵌入',
    icon: LinkIcon,
    description: '嵌入外部网页或快速访问链接',
  },
  {
    type: 'dateWidget',
    name: '日期小组件',
    icon: Clock,
    description: '显示精美的日期小组件',
  },
];

type LayoutMode = 'classic' | 'fullscreen' | 'centered';
type ThemeMode = 'light' | 'dark';
type ComponentLayoutMode = 'grid' | 'freeform'; // 网格模式 或 自由放置模式

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    avatar: '',
  });
  const [pageTitle, setPageTitle] = useState('个人空间');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('classic');
  const [componentLayoutMode, setComponentLayoutMode] = useState<ComponentLayoutMode>('grid');

  // 模拟游戏战绩和音乐记录
  const [gameStats] = useState<GameStats[]>([
    { gameName: '五子棋', wins: 12, totalGames: 15 },
    { gameName: '井字棋', wins: 8, totalGames: 10 },
  ]);

  const [musicHistory] = useState<MusicHistory[]>([
    { songName: '晴天', artist: '周杰伦', playCount: 45 },
    { songName: '夜曲', artist: '周杰伦', playCount: 32 },
    { songName: '稻香', artist: '周杰伦', playCount: 28 },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user_session');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setProfileData({
        displayName: parsedUser.displayName || parsedUser.username,
        bio: parsedUser.bio || '',
        avatar: parsedUser.avatar || '',
      });
      setPageTitle(`${parsedUser.displayName || parsedUser.username}的空间`);
    }

    // 加载用户配置的组件
    const savedComponents = localStorage.getItem('userComponents');
    if (savedComponents) {
      setComponents(JSON.parse(savedComponents));
    }

    // 加载保存的主题设置
    const savedTheme = localStorage.getItem('profileTheme') as ThemeMode;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }

    // 加载保存的布局模式
    const savedLayout = localStorage.getItem('profileLayout') as LayoutMode;
    if (savedLayout) {
      setLayoutMode(savedLayout);
    }

    // 加载保存的组件布局模式
    const savedComponentLayout = localStorage.getItem('componentLayoutMode') as ComponentLayoutMode;
    if (savedComponentLayout) {
      setComponentLayoutMode(savedComponentLayout);
    }
  }, []);

  // 主题切换
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('profileTheme', newTheme);
  };

  // 布局模式切换
  const changeLayoutMode = (mode: LayoutMode) => {
    setLayoutMode(mode);
    localStorage.setItem('profileLayout', mode);
  };

  // 组件布局模式切换
  const changeComponentLayoutMode = (mode: ComponentLayoutMode) => {
    setComponentLayoutMode(mode);
    localStorage.setItem('componentLayoutMode', mode);

    // 如果切换到自由模式，为没有位置的组件初始化位置
    if (mode === 'freeform') {
      const updatedComponents = components.map((component, index) => {
        // 如果组件已有位置，保持不变；否则根据索引初始化位置
        if (component.x !== undefined && component.y !== undefined) {
          return component;
        }

        // 计算初始位置：网格排列，每行3个组件
        const itemsPerRow = 3;
        const row = Math.floor(index / itemsPerRow);
        const col = index % itemsPerRow;
        const spacing = 20; // 组件间距
        const componentWidth = component.width * 150;

        return {
          ...component,
          x: col * (componentWidth + spacing) + spacing,
          y: row * 200 + spacing, // 200px 高度用于行间距
        };
      });

      setComponents(updatedComponents);
      saveComponents(updatedComponents);
    }
  };

  // 获取布局模式对应的描述
  const getLayoutModeInfo = (mode: LayoutMode) => {
    switch (mode) {
      case 'classic':
        return { icon: LayoutGrid, name: '经典模式', desc: '左侧资料 + 右侧组件' };
      case 'fullscreen':
        return { icon: Maximize2, name: '全屏模式', desc: '隐藏侧边栏，最大化组件区' };
      case 'centered':
        return { icon: Columns, name: '居中模式', desc: '整体居中，两侧留白' };
    }
  };

  // 获取网格布局类名
  const getGridClassName = () => {
    if (layoutMode === 'classic') return 'grid-cols-1 xl:grid-cols-12';
    if (layoutMode === 'fullscreen') return 'grid-cols-1';
    return 'grid-cols-1 max-w-5xl mx-auto';
  };

  // 获取组件网格类名
  const getComponentGridClassName = () => {
    if (layoutMode === 'fullscreen') return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    if (layoutMode === 'centered') return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3';
  };

  // 获取左侧div类名
  const getLeftPanelClassName = () => {
    if (layoutMode === 'classic') return 'xl:col-span-3 order-2 xl:order-1';
    return 'order-2 md:order-1';
  };

  // 获取右侧div类名
  const getRightPanelClassName = () => {
    if (layoutMode === 'classic') return 'xl:col-span-9 order-1 xl:order-2';
    return 'order-1 md:order-2';
  };

  const handleSaveProfile = async () => {
    const updatedUser = { ...user, ...profileData };
    setUser(updatedUser);
    localStorage.setItem('user_session', JSON.stringify(updatedUser));
    setPageTitle(`${profileData.displayName}的空间`);
    setEditingProfile(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addComponent = (componentType: string) => {
    const newComponent: Component = {
      id: Date.now().toString(),
      type: componentType,
      data: {},
      width: 1,
      height: 1,
    };
    setComponents([...components, newComponent]);
    saveComponents([...components, newComponent]);
    setShowComponentLibrary(false);
  };

  const removeComponent = (componentId: string) => {
    const newComponents = components.filter((c) => c.id !== componentId);
    setComponents(newComponents);
    saveComponents(newComponents);
  };

  const saveComponents = (newComponents: Component[]) => {
    localStorage.setItem('userComponents', JSON.stringify(newComponents));
  };

  const updateComponentData = (componentId: string, data: any) => {
    const newComponents = components.map((c) =>
      c.id === componentId ? { ...c, data } : c
    );
    setComponents(newComponents);
    saveComponents(newComponents);
  };

  const updateComponentSize = (componentId: string, width: number, height: number) => {
    const newComponents = components.map((c) =>
      c.id === componentId ? { ...c, width, height } : c
    );
    setComponents(newComponents);
    saveComponents(newComponents);
  };

  const updateComponentPosition = (componentId: string, x: number, y: number) => {
    const newComponents = components.map((c) =>
      c.id === componentId ? { ...c, x, y } : c
    );
    setComponents(newComponents);
    saveComponents(newComponents);
  };

  const moveComponent = (fromIndex: number, toIndex: number) => {
    const newComponents = [...components];
    const [removed] = newComponents.splice(fromIndex, 1);
    newComponents.splice(toIndex, 0, removed);
    setComponents(newComponents);
    saveComponents(newComponents);
  };

  const getSizeClass = (width: number, height: number) => {
    return `col-span-${width} row-span-${height}`;
  };

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <p className="mb-4 text-muted-foreground">请先登录</p>
            <a href="/login" className="text-primary hover:underline">
              前往登录
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-6 md:px-6 lg:px-8 md:py-8 lg:py-10 space-y-6 transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-orange-300 flex-shrink-0">
            <LayoutTemplate className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold truncate">{pageTitle}</h1>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* 主题切换 */}
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="icon"
            className="shrink-0"
            title={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          {/* 布局模式切换 */}
          <div className="relative group">
            <Button variant="outline" size="icon" className="shrink-0" title="布局模式">
              <Settings2 className="h-4 w-4" />
            </Button>
            <div className="absolute top-full right-0 mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <Card className="glass-card">
                <CardContent className="p-3 space-y-2">
                  {(Object.keys({ classic: '', fullscreen: '', centered: '' }) as LayoutMode[]).map((mode) => {
                    const info = getLayoutModeInfo(mode);
                    const Icon = info.icon;
                    return (
                      <button
                        key={mode}
                        onClick={() => changeLayoutMode(mode)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                          layoutMode === mode
                            ? 'bg-gradient-to-r from-pink-400 to-orange-300 text-white'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm">{info.name}</div>
                          <div className={`text-xs ${layoutMode === mode ? 'text-white/80' : 'text-muted-foreground'}`}>
                            {info.desc}
                          </div>
                        </div>
                        {layoutMode === mode && (
                          <Badge className="shrink-0" variant={layoutMode === mode ? 'secondary' : 'default'}>
                            当前
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 组件布局模式切换（网格/自由放置） */}
          {components.length > 0 && (
            <Button
              onClick={() => changeComponentLayoutMode(componentLayoutMode === 'grid' ? 'freeform' : 'grid')}
              variant="outline"
              size="icon"
              className="shrink-0"
              title={componentLayoutMode === 'grid' ? '切换到自由放置模式' : '切换到网格模式'}
            >
              {componentLayoutMode === 'grid' ? <Grid className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
            </Button>
          )}

          {/* 添加组件按钮 */}
          <Button
            onClick={() => setShowComponentLibrary(true)}
            className="bg-gradient-to-r from-pink-400 to-orange-300 text-white hover:from-pink-500 hover:to-orange-400 flex-1 sm:flex-none"
          >
            <Plus className="mr-2 h-4 w-4" />
            添加组件
          </Button>
        </div>
      </div>

      {/* 主要内容区域：根据布局模式调整 */}
      <div className={`grid gap-6 ${getGridClassName()} overflow-visible`}>
        {/* 左侧：个人资料区域（全屏模式下隐藏） */}
        {layoutMode !== 'fullscreen' && (
          <div className={getLeftPanelClassName()}>
            <Card className="glass-card sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl">个人资料</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
              {/* 头像区域 */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative group">
                  {profileData.avatar ? (
                    <img
                      src={profileData.avatar}
                      alt="头像"
                      className="h-24 w-24 rounded-full object-cover ring-4 ring-pink-400/20"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-orange-300 text-4xl text-white font-bold ring-4 ring-pink-400/20">
                      {profileData.displayName?.[0] || user.username[0]}
                    </div>
                  )}
                  {editingProfile && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Camera className="h-6 w-6 text-white" />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                {editingProfile ? (
                  <div className="w-full space-y-2">
                    <Label htmlFor="displayName">昵称</Label>
                    <Input
                      id="displayName"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                      className="glass-input"
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-xl font-bold">{profileData.displayName || user.username}</div>
                  </div>
                )}
              </div>

              {/* 简介 */}
              <div className="space-y-2">
                <Label>简介</Label>
                {editingProfile ? (
                  <Textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="介绍一下自己..."
                    className="glass-input"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {profileData.bio || '这个人很懒，还没有填写简介...'}
                  </p>
                )}
              </div>

              {/* 编辑/保存按钮 */}
              <div className="flex space-x-2">
                {editingProfile ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setEditingProfile(false)}>
                      取消
                    </Button>
                    <Button size="sm" onClick={handleSaveProfile}>
                      <Save className="mr-1 h-4 w-4" />
                      保存
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setEditingProfile(true)} className="w-full">
                    <Edit2 className="mr-2 h-4 w-4" />
                    编辑资料
                  </Button>
                )}
              </div>

              {/* 游戏战绩 */}
              {gameStats.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border/40">
                  <div className="flex items-center space-x-2 text-sm font-semibold">
                    <Gamepad2 className="h-4 w-4 text-primary" />
                    <span>游戏战绩</span>
                  </div>
                  <div className="space-y-2">
                    {gameStats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{stat.gameName}</span>
                        <Badge variant="secondary">
                          {stat.wins}/{stat.totalGames} 胜
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 音乐记录 */}
              {musicHistory.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border/40">
                  <div className="flex items-center space-x-2 text-sm font-semibold">
                    <Music className="h-4 w-4 text-primary" />
                    <span>常听音乐</span>
                  </div>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {musicHistory.map((song, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <Heart className="h-3 w-3 text-pink-400 fill-pink-400" />
                          <span className="flex-1 truncate">{song.songName}</span>
                          <span className="text-xs text-muted-foreground">{song.playCount}次</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* 右侧：组件区域 */}
        <div className={getRightPanelClassName()}>
          {/* 组件网格 */}
          {components.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-16 text-center">
                <LayoutTemplate className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">还没有添加任何组件</p>
                <p className="text-sm text-muted-foreground mb-6">
                  点击"添加组件"按钮,从侧边栏中选择你喜欢的组件来装饰你的空间
                </p>
                <Button onClick={() => setShowComponentLibrary(true)} className="bg-gradient-to-r from-pink-400 to-orange-300 text-white hover:from-pink-500 hover:to-orange-400">
                  <Plus className="mr-2 h-4 w-4" />
                  去添加组件
                </Button>
              </CardContent>
            </Card>
          ) : componentLayoutMode === 'grid' ? (
            <div className={`grid gap-4 auto-rows-[minmax(150px,auto)] transition-all duration-500 ease-in-out overflow-visible ${getComponentGridClassName()}`}>
              {components.map((component, index) => {
                const cardClass = getSizeClass(component.width, component.height);
                return (
                  <div
                    key={component.id}
                    className={`relative ${cardClass} group p-1 min-h-[150px] transition-all duration-300 hover:scale-[1.02] overflow-visible`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('componentIndex', index.toString());
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      const fromIndex = parseInt(e.dataTransfer.getData('componentIndex'));
                      moveComponent(fromIndex, index);
                    }}
                  >
                    {/* 删除按钮 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeComponent(component.id);
                      }}
                      className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-red-500 hover:text-white hover:scale-110"
                      title="删除组件"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    {/* 调整大小手柄 */}
                    <div
                      className="absolute right-0 bottom-0 z-20 flex h-6 w-6 cursor-se-resize items-center justify-center opacity-0 transition-all duration-200 group-hover:opacity-100 hover:scale-110"
                      title="拖拽调整大小"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startWidth = component.width;
                        const startHeight = component.height;

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const deltaX = moveEvent.clientX - startX;
                          const deltaY = moveEvent.clientY - startY;

                          // 计算新的行列数（每列约406px，每行172px）
                          const newWidth = Math.max(1, Math.min(3, startWidth + Math.round(deltaX / 200)));
                          const newHeight = Math.max(1, Math.min(4, startHeight + Math.round(deltaY / 100)));

                          updateComponentSize(component.id, newWidth, newHeight);
                        };

                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };

                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      <div className="flex h-4 w-4 flex-col items-center justify-center gap-0.5">
                        <div className="h-0.5 w-4 bg-white/90 shadow-md rounded-full"></div>
                        <div className="h-0.5 w-4 bg-white/90 shadow-md rounded-full"></div>
                        <div className="h-0.5 w-4 bg-white/90 shadow-md rounded-full"></div>
                      </div>
                    </div>

                    {/* 显示当前尺寸 */}
                    <div className="absolute left-3 bottom-3 z-20 text-xs font-medium text-muted-foreground/70 opacity-0 transition-all duration-200 group-hover:opacity-100">
                      {component.width}×{component.height}
                    </div>

                    {/* 组件内容 */}
                    {renderComponent(component, updateComponentData)}
                  </div>
                );
              })}
            </div>
          ) : (
            // 自由摆放模式
            <div
              className="relative w-full bg-card/30 border-2 border-dashed border-border/40 rounded-lg overflow-hidden min-h-[600px] transition-all duration-500 ease-in-out"
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  const dragData = JSON.parse(e.dataTransfer.getData('dragData'));
                  const container = e.currentTarget as HTMLElement;
                  const containerRect = container.getBoundingClientRect();
                  const newX = e.clientX - containerRect.left - dragData.offsetX;
                  const newY = e.clientY - containerRect.top - dragData.offsetY;
                  updateComponentPosition(
                    dragData.componentId,
                    Math.max(0, newX),
                    Math.max(0, newY)
                  );
                } catch (error) {
                  console.error('Failed to parse drag data:', error);
                }
              }}
            >
              {components.map((component) => {
                const left = component.x || 0;
                const top = component.y || 0;
                const width = component.width * 150;
                const height = component.height * 150;

                return (
                  <div
                    key={component.id}
                    className="absolute group p-1 transition-all duration-200 hover:ring-2 hover:ring-primary/50 rounded-lg cursor-move"
                    style={{
                      left: `${left}px`,
                      top: `${top}px`,
                      width: `${width}px`,
                      height: `${height}px`,
                    }}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/html', '');
                      // 存储拖动起点和组件原始位置
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      const containerRect = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
                      const offsetX = e.clientX - rect.left;
                      const offsetY = e.clientY - rect.top;
                      e.dataTransfer.setData(
                        'dragData',
                        JSON.stringify({
                          componentId: component.id,
                          offsetX,
                          offsetY,
                          startX: containerRect ? e.clientX - containerRect.left : e.clientX,
                          startY: containerRect ? e.clientY - containerRect.top : e.clientY,
                        })
                      );
                    }}
                  >
                    {/* 删除按钮 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeComponent(component.id);
                      }}
                      className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-lg opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-red-500 hover:text-white hover:scale-110"
                      title="删除组件"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    {/* 调整大小手柄 */}
                    <div
                      className="absolute right-0 bottom-0 z-20 flex h-5 w-5 cursor-se-resize items-center justify-center opacity-0 transition-all duration-200 group-hover:opacity-100 hover:scale-110 bg-white/80 rounded-tl"
                      title="拖拽调整大小"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startWidth = component.width;
                        const startHeight = component.height;

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const deltaX = moveEvent.clientX - startX;
                          const deltaY = moveEvent.clientY - startY;

                          // 基于150px单位调整
                          const newWidth = Math.max(1, Math.min(3, startWidth + Math.round(deltaX / 150)));
                          const newHeight = Math.max(1, Math.min(4, startHeight + Math.round(deltaY / 150)));

                          updateComponentSize(component.id, newWidth, newHeight);
                        };

                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };

                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      <div className="flex h-3.5 w-3.5 flex-col items-center justify-center gap-0.5">
                        <div className="h-0.5 w-3 bg-primary rounded-full"></div>
                        <div className="h-0.5 w-3 bg-primary rounded-full"></div>
                      </div>
                    </div>

                    {/* 显示当前尺寸和位置 */}
                    <div className="absolute left-2 bottom-2 z-20 text-xs font-medium text-muted-foreground/70 opacity-0 transition-all duration-200 group-hover:opacity-100">
                      {component.width}×{component.height} ({left}px, {top}px)
                    </div>

                    {/* 组件内容 */}
                    {renderComponent(component, updateComponentData)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 组件库侧边抽屉 */}
      <Sheet open={showComponentLibrary} onOpenChange={setShowComponentLibrary}>
        <SheetContent side="right" className="w-[400px] sm:w-[500px]">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold">组件库</SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1 h-[calc(100vh-200px)] mt-6">
            <div className="space-y-4 pr-4">
              {availableComponents.map((comp) => {
                const Icon = comp.icon;
                const isAdded = components.some((c) => c.type === comp.type);
                return (
                  <Card
                    key={comp.type}
                    className={`relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg ${
                      isAdded ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    onClick={() => !isAdded && addComponent(comp.type)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start space-x-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-orange-300 text-white shadow-lg">
                          <Icon className="h-7 w-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-lg font-semibold">{comp.name}</h3>
                            {isAdded && (
                              <Badge variant="secondary" className="shrink-0">
                                已添加
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{comp.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// 渲染组件
function renderComponent(component: Component, updateComponentData: (id: string, data: any) => void) {
  switch (component.type) {
    case 'quote':
      return <QuoteCard data={component.data} width={component.width} height={component.height} onUpdate={(data: any) => updateComponentData(component.id, data)} />;
    case 'todo':
      return <TodoCard data={component.data} width={component.width} height={component.height} onUpdate={(data: any) => updateComponentData(component.id, data)} />;
    case 'weather':
      return <WeatherCard width={component.width} height={component.height} />;
    case 'clock':
      return <ClockCard width={component.width} height={component.height} />;
    case 'social':
      return <SocialCard data={component.data} width={component.width} height={component.height} onUpdate={(data: any) => updateComponentData(component.id, data)} />;
    case 'link':
      return <LinkCard data={component.data} width={component.width} height={component.height} onUpdate={(data: any) => updateComponentData(component.id, data)} />;
    case 'dateWidget':
      return <DateWidgetCard width={component.width} height={component.height} />;
    default:
      return null;
  }
}

// 名言/签名卡片
function QuoteCard({ data, width, height, onUpdate }: any) {
  const [editing, setEditing] = useState(false);
  const [quote, setQuote] = useState(data.quote || '生活不是等待风暴过去，而是学会在雨中翩翩起舞。');
  const [author, setAuthor] = useState(data.author || '佚名');

  const handleSave = () => {
    onUpdate({ quote, author });
    setEditing(false);
  };

  const isSmall = width === 1 && height === 1;

  return (
    <Card className="glass-card h-full overflow-hidden flex flex-col">
      {!isSmall && (
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Quote className="h-5 w-5" />
          </CardTitle>
          {!editing && (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="h-7 px-2">
              编辑
            </Button>
          )}
        </CardHeader>
      )}
      <CardContent className="flex items-center justify-center h-full p-4">
        {editing ? (
          <div className="w-full space-y-2">
            <Textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="glass-input text-sm"
              rows={isSmall ? 1 : 2}
            />
            {!isSmall && (
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="作者"
                className="glass-input text-sm"
              />
            )}
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="flex-1">
                取消
              </Button>
              <Button size="sm" onClick={handleSave} className="flex-1">
                保存
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center w-full px-2">
            <p className={`${isSmall ? 'text-sm' : 'text-base'} italic mb-1 font-medium leading-tight`}>"{quote}"</p>
            {!isSmall && (
              <p className="text-sm text-muted-foreground">—— {author}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 链接嵌入卡片
function LinkCard({ data, width, height, onUpdate }: any) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(data.title || '我的链接');
  const [url, setUrl] = useState(data.url || '');
  const [displayMode, setDisplayMode] = useState(data.displayMode || 'card'); // 'card' 或 'iframe'

  const handleSave = () => {
    onUpdate({ title, url, displayMode });
    setEditing(false);
  };

  const isSmall = width === 1 && height === 1;

  return (
    <Card className="glass-card h-full overflow-hidden flex flex-col">
      {!editing && !isSmall && (
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center space-x-2">
              <LinkIcon className="h-5 w-5" />
              <span>{title}</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="h-7 px-2">
              <Edit2 className="h-3 w-3" />
            </Button>
          </CardTitle>
        </CardHeader>
      )}

      <CardContent className="flex-1 flex flex-col min-h-0 p-4">
        {editing ? (
          <div className="flex flex-col space-y-3 h-full">
            <div className="space-y-1.5 shrink-0">
              <Label htmlFor="link-title" className="text-sm">标题</Label>
              <Input
                id="link-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入链接标题..."
                className="glass-input text-sm"
              />
            </div>
            <div className="space-y-1.5 shrink-0">
              <Label htmlFor="link-url" className="text-sm">URL</Label>
              <Input
                id="link-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="glass-input text-sm"
              />
            </div>
            <div className="space-y-1.5 shrink-0">
              <Label htmlFor="display-mode" className="text-sm">显示方式</Label>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant={displayMode === 'card' ? 'default' : 'outline'}
                  onClick={() => setDisplayMode('card')}
                  className="flex-1"
                >
                  卡片
                </Button>
                <Button
                  size="sm"
                  variant={displayMode === 'iframe' ? 'default' : 'outline'}
                  onClick={() => setDisplayMode('iframe')}
                  className="flex-1"
                  disabled={!url}
                >
                  嵌入
                </Button>
              </div>
            </div>
            <div className="flex space-x-2 shrink-0 mt-auto">
              <Button onClick={() => setEditing(false)} variant="outline" size="sm" className="flex-1">
                取消
              </Button>
              <Button onClick={handleSave} size="sm" className="flex-1">
                保存
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {displayMode === 'card' ? (
              <a
                href={url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 flex flex-col items-center justify-center rounded-lg border border-border/40 p-4 hover:bg-accent transition-all hover:scale-105 ${!url ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {isSmall ? (
                  <>
                    <LinkIcon className={`${isSmall ? 'h-6 w-6' : 'h-8 w-8'} text-primary mb-2`} />
                    <p className={`${isSmall ? 'text-xs' : 'text-sm'} font-medium text-center truncate w-full`}>
                      {title || '未设置标题'}
                    </p>
                  </>
                ) : (
                  <>
                    <LinkIcon className={`${isSmall ? 'h-8 w-8' : 'h-12 w-12'} text-primary mb-3`} />
                    <p className={`${isSmall ? 'text-sm' : 'text-base'} font-medium text-center mb-2`}>
                      {title || '未设置标题'}
                    </p>
                    <p className={`text-muted-foreground text-center truncate w-full ${isSmall ? 'text-xs' : 'text-sm'}`}>
                      {url || '点击编辑添加链接'}
                    </p>
                    <Button size="sm" variant="ghost" className="mt-3">
                      访问链接
                    </Button>
                  </>
                )}
              </a>
            ) : (
              url && (
                <div className="flex-1 rounded-lg overflow-hidden border border-border/40">
                  <iframe
                    src={url}
                    title={title}
                    className="w-full h-full"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    allowFullScreen
                  />
                </div>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 日期小组件卡片
function DateWidgetCard({ width, height }: any) {
  // widgets.link 的日期组件 URL
  const widgetUrl = 'https://www.widgets.link/#/view/date-09?tc=%23000000&fs=74&ss=1&sd=0&ds=-&ff=led&scheme=ld';

  return (
    <Card className="glass-card h-full overflow-hidden flex flex-col p-0">
      <div className="flex-1 flex items-center justify-center h-full">
        <iframe
          src={widgetUrl}
          title="日期小组件"
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
    </Card>
  );
}

// 待办事项卡片
function TodoCard({ data, width, height, onUpdate }: any) {
  const [todos, setTodos] = useState(data.todos || []);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const newTodos = [...todos, { id: Date.now(), text: newTodo, completed: false }];
    setTodos(newTodos);
    onUpdate({ todos: newTodos });
    setNewTodo('');
  };

  const toggleTodo = (id: number) => {
    const newTodos = todos.map((t: any) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTodos(newTodos);
    onUpdate({ todos: newTodos });
  };

  const deleteTodo = (id: number) => {
    const newTodos = todos.filter((t: any) => t.id !== id);
    setTodos(newTodos);
    onUpdate({ todos: newTodos });
  };

  const isSmall = width === 1 && height === 1;
  const displayCount = Math.floor(width * height * 2.5);

  return (
    <Card className="glass-card h-full overflow-hidden flex flex-col">
      {!isSmall && (
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <StickyNote className="h-5 w-5" />
            <span>待办事项</span>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex-1 flex flex-col min-h-0 p-4">
        <div className={`flex flex-col space-y-2 h-full ${isSmall ? 'justify-center' : ''}`}>
          {!isSmall && (
            <div className="flex space-x-2 shrink-0 mb-2">
              <Input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="添加待办事项..."
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                className="glass-input flex-1 text-sm"
              />
              <Button onClick={addTodo} size="icon" className="shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-1.5 pr-1">
              {todos.length === 0 ? (
                <p className="text-center text-muted-foreground py-4 text-sm">还没有待办事项</p>
              ) : (
                todos.slice(0, displayCount).map((todo: any) => (
                  <div
                    key={todo.id}
                    className={`flex items-center space-x-2 rounded-lg border border-border/40 ${!isSmall ? 'p-2' : 'p-1.5'} hover:bg-accent/50 transition-colors`}
                  >
                    {!isSmall && (
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="h-4 w-4 shrink-0"
                      />
                    )}
                    <span className={`flex-1 truncate ${isSmall ? 'text-xs' : 'text-sm'} ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {todo.text}
                    </span>
                    {!isSmall && (
                      <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => deleteTodo(todo.id)}>
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

// 天气卡片
function WeatherCard({ width, height }: any) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('weatherCity') || '110114';
    }
    return '110114';
  });
  const [showCitySelector, setShowCitySelector] = useState(false);
  const isSmall = width === 1 && height === 1;

  useEffect(() => {
    fetchWeather();
  }, [selectedCity]);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const appKey = process.env.NEXT_PUBLIC_WEATHER_APP_KEY;
      const uid = process.env.NEXT_PUBLIC_WEATHER_UID;

      if (!appKey || !uid) {
        setError('天气API配置缺失');
        setLoading(false);
        return;
      }

      const response = await fetch('https://luckycola.com.cn/weather/getWeather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adcode: selectedCity,
          appKey,
          uid,
          weatherType: 'base',
        }),
      });

      if (!response.ok) {
        throw new Error('天气数据获取失败');
      }

      const data = await response.json();

      if (data.code === 0 && data.data?.lives?.[0]) {
        setWeather(data.data.lives[0]);
      } else {
        console.error('天气API返回错误:', data);
        setError('无法获取天气数据');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取天气失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (adcode: string) => {
    setSelectedCity(adcode);
    localStorage.setItem('weatherCity', adcode);
    setShowCitySelector(false);
  };

  const getCityName = (adcode: string) => {
    const city = CITIES.find(c => c.adcode === adcode);
    return city?.name || '未知城市';
  };

  const getWeatherIcon = (weatherType: string) => {
    const iconClass = 'h-12 w-12 mb-2';
    if (weatherType.includes('晴')) return <Sun className={`${iconClass} text-yellow-400`} />;
    if (weatherType.includes('雨')) return <Cloud className={`${iconClass} text-blue-400`} />;
    if (weatherType.includes('雪')) return <Cloud className={`${iconClass} text-blue-200`} />;
    if (weatherType.includes('云')) return <Cloud className={`${iconClass} text-gray-400`} />;
    return <Sun className={`${iconClass} text-yellow-400`} />;
  };

  return (
    <Card className="glass-card h-full overflow-visible flex flex-col">
      {!isSmall && (
        <CardHeader className="pb-2 relative z-10">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center space-x-2">
              <Sun className="h-5 w-5 text-yellow-400" />
              <span>天气</span>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowCitySelector(!showCitySelector)}
                className="flex items-center space-x-1 px-3 py-1 rounded-lg hover:bg-accent transition-colors"
                title="选择城市"
              >
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{getCityName(selectedCity)}</span>
              </button>
              {showCitySelector && (
                <div className="absolute right-0 top-full mt-2 w-56 z-[9999] bg-card border border-border rounded-lg shadow-2xl p-2 max-h-80 overflow-y-auto">
                  <div className="space-y-1">
                    {CITIES.map((city) => (
                      <button
                        key={city.adcode}
                        onClick={() => handleCitySelect(city.adcode)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${
                          selectedCity === city.adcode
                            ? 'bg-primary text-white'
                            : 'hover:bg-accent'
                        }`}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] p-4">
        {loading ? (
          <div className="text-muted-foreground">加载中...</div>
        ) : error ? (
          <div className="text-sm text-red-400 text-center max-w-xs -mt-6">{error}</div>
        ) : weather ? (
          <>
            <div className={`${isSmall ? 'text-2xl' : 'text-4xl'} font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-1`}>
              {weather.temperature}°C
            </div>
            {!isSmall && (
              <>
                <div className="text-base text-muted-foreground mb-1">{weather.weather}</div>
                {getWeatherIcon(weather.weather)}
                <div className="text-xs text-muted-foreground text-center">
                  <div>风向：{weather.winddirection}</div>
                  <div>风力：{weather.windpower}</div>
                  <div>湿度：{weather.humidity}%</div>
                </div>
              </>
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

// 时钟卡片
function ClockCard({ width, height }: any) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const isSmall = width === 1 && height === 1;

  return (
    <Card className="glass-card h-full overflow-hidden flex flex-col">
      {!isSmall && (
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Clock className="h-5 w-5" />
            <span>时钟</span>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex flex-col items-center justify-center h-full p-4">
        <div className={`${isSmall ? 'text-2xl' : 'text-4xl'} font-bold font-mono bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent`}>
          {isSmall ? time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : formatTime(time)}
        </div>
        {!isSmall && (
          <div className="text-sm text-muted-foreground mt-2">
            {time.toLocaleDateString('zh-CN')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 社交链接卡片
function SocialCard({ data, width, height, onUpdate }: any) {
  const [editing, setEditing] = useState(false);
  const [links, setLinks] = useState(data.links || []);

  const handleSave = () => {
    const validLinks = links.filter((l: any) => l.name && l.url);
    onUpdate({ links: validLinks });
    setEditing(false);
  };

  const addLink = () => {
    setLinks([...links, { name: '', url: '' }]);
  };

  const updateLink = (index: number, field: 'name' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_l: any, i: number) => i !== index));
  };

  const isSmall = width === 1 && height === 1;
  const displayCount = Math.floor(width * height * 2);

  return (
    <Card className="glass-card h-full overflow-hidden flex flex-col">
      {!isSmall && (
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center space-x-2">
              <LinkIcon className="h-5 w-5" />
              <span>社交链接</span>
            </div>
            {!editing && (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="h-7 px-2 text-xs">
                编辑
              </Button>
            )}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={`flex-1 min-h-0 p-4 ${isSmall ? 'flex items-center justify-center' : ''}`}>
        {editing ? (
          <div className="space-y-2 h-full flex flex-col">
            <ScrollArea className="flex-1 min-h-0 pr-1">
              <div className="space-y-2">
                {links.map((link: any, index: number) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      placeholder="名称"
                      value={link.name}
                      onChange={(e) => updateLink(index, 'name', e.target.value)}
                      className="glass-input flex-1 text-sm"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => removeLink(index)}
                      className="h-8 w-8 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Button onClick={addLink} variant="outline" className="w-full text-sm shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              添加链接
            </Button>
            <div className="flex space-x-2 shrink-0">
              <Button variant="outline" onClick={() => setEditing(false)} className="flex-1 text-sm">
                取消
              </Button>
              <Button onClick={handleSave} className="flex-1 text-sm">
                保存
              </Button>
            </div>
          </div>
        ) : (
          <ScrollArea className={`h-full ${isSmall ? 'w-full' : ''}`}>
            <div className={`space-y-2 pr-1 ${isSmall ? 'flex flex-col items-center justify-center h-full' : ''}`}>
              {links.filter((l: any) => l.name && l.url).slice(0, displayCount).map((link: any, index: number) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 rounded-lg border border-border/40 p-2 hover:bg-accent transition-colors"
                >
                  <LinkIcon className="h-4 w-4 text-primary shrink-0" />
                  <span className={`flex-1 truncate ${isSmall ? 'text-xs' : 'text-sm'}`}>{link.name}</span>
                </a>
              ))}
              {links.filter((l: any) => l.name && l.url).length === 0 && (
                <p className="text-center text-muted-foreground py-4 text-sm">还没有添加社交链接</p>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  ListOrdered,
  Repeat,
  RefreshCw,
  Heart,
  LayoutGrid,
  Disc3,
  Star,
  Search,
  X,
  ListMusic,
  History,
  Sparkles,
} from 'lucide-react';
import type { Track, Artist, PlayMode, ViewType, Letter } from '@/types/music';
import {
  getTracks,
  getArtists,
  getArtistCoverUrl,
} from '@/services/music';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

const LETTERS: Letter[] = [
  '#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
  'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
  'W', 'X', 'Y', 'Z',
];

const PLAY_MODES: Record<PlayMode, { label: string; icon: any; description: string }> = {
  sequential: {
    label: '顺序播放',
    icon: ListOrdered,
    description: '按列表顺序依次播放',
  },
  shuffle: {
    label: '随机播放',
    icon: Shuffle,
    description: '随机播放下一首歌曲',
  },
  loop: {
    label: '单曲循环',
    icon: Repeat,
    description: '循环播放当前歌曲',
  },
};

export default function MusicPage() {
  const {
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    volume,
    isMuted,
    playMode,
    filteredTracks: contextFilteredTracks,
    playQueue,
    playHistory,
    favorites,
    playTrack: contextPlayTrack,
    playFromQueue,
    pauseTrack,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume: contextSetVolume,
    toggleMute,
    setPlayMode,
    addToQueue,
    removeFromQueue,
    toggleFavorite,
    clearHistory,
  } = useAudioPlayer();

  // 页面状态
  const [tracks, setTracks] = useState<Track[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTracks, setTotalTracks] = useState(0);
  const itemsPerPage = 50;

  // 视图状态
  const [viewType, setViewType] = useState<ViewType>('all');
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [isArtistDialogOpen, setIsArtistDialogOpen] = useState(false);
  const [artistTracks, setArtistTracks] = useState<Track[]>([]);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isVolumeSliderVisible, setIsVolumeSliderVisible] = useState(false);

  // 搜索状态
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // 诊断错误
  const diagnoseError = async (trackId: string) => {
    try {
      const response = await fetch(`/api/music/debug/${trackId}`);
      const data = await response.json();
      console.group('🔍 音频文件诊断信息');
      console.log('📝 歌曲信息:', data.track);
      console.log('📂 文件路径:', data.file);
      console.log('🖥️ 系统信息:', data.system);
      if (data.directory) {
        console.log('📁 目录信息:', data.directory);
      }
      if (data.directoryError) {
        console.error('❌ 目录检查错误:', data.directoryError);
      }
      if (data.fileStats) {
        console.log('📊 文件统计:', data.fileStats);
      }
      if (data.statsError) {
        console.error('❌ 文件统计错误:', data.statsError);
      }
      console.groupEnd();

      return data;
    } catch (err) {
      console.error('❌ 诊断失败:', err);
      return null;
    }
  };

  // 加载歌曲列表
  useEffect(() => {
    loadTracks(currentPage);
  }, [currentPage]);

  // 根据视图类型筛选
  useEffect(() => {
    filterTracksByView();
  }, [viewType, tracks, selectedLetter]);

  // 根据字母筛选歌手
  useEffect(() => {
    filterArtistsByLetter();
  }, [artists, selectedLetter]);

  // 新增：键盘快捷键支持
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // 忽略在输入框中的按键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          previousTrack();
          break;
        case 'ArrowRight':
          nextTrack();
          break;
        case 'ArrowUp':
          e.preventDefault();
          contextSetVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          contextSetVolume(Math.max(0, volume - 0.1));
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyF':
          if (currentTrack) {
            toggleFavorite(currentTrack.id);
          }
          break;
        case 'KeyL':
          const modes: PlayMode[] = ['sequential', 'shuffle', 'loop'];
          const currentIndex = modes.indexOf(playMode);
          const nextIndex = (currentIndex + 1) % modes.length;
          setPlayMode(modes[nextIndex]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, volume, isMuted, currentTrack, playMode, togglePlayPause, previousTrack, nextTrack, toggleMute, setPlayMode, contextSetVolume, toggleFavorite]);

  // 新增：搜索历史持久化
  useEffect(() => {
    const saved = localStorage.getItem('music-search-history');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('music-search-history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // 加载歌曲列表
  const loadTracks = async (page = currentPage) => {
    try {
      setIsLoading(true);
      const response = await getTracks({
        page,
        limit: itemsPerPage,
      });
      if (response.success) {
        setTracks(response.data);
        setTotalTracks(response.total);
      }
    } catch (error) {
      console.error('加载歌曲列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 加载歌手列表
  const loadArtists = async () => {
    try {
      const response = await getArtists();
      if (response.success) {
        setArtists(response.data);
      }
    } catch (error) {
      console.error('加载歌手列表失败:', error);
    }
  };

  // 根据视图筛选歌曲
  const filterTracksByView = () => {
    if (viewType === 'favorite') {
      // 收藏视图：从tracks中筛选出收藏的歌曲
      const favoriteTracks = tracks.filter(track => favorites.has(track.id));
      let filtered = favoriteTracks;

      // 按首字母筛选
      if (selectedLetter) {
        filtered = filtered.filter(
          track => track.titleFirstLetter === selectedLetter
        );
      }

      setFilteredTracks(filtered);
      return;
    }

    if (viewType === 'history' as ViewType) {
      // 历史视图：使用playHistory
      setFilteredTracks(playHistory);
      return;
    }

    let filtered = [...tracks];

    // 按首字母筛选
    if (selectedLetter) {
      filtered = filtered.filter(
        track => track.titleFirstLetter === selectedLetter
      );
    }

    setFilteredTracks(filtered);
  };

  // 根据字母筛选歌手
  const filterArtistsByLetter = () => {
    if (!selectedLetter) {
      setFilteredArtists(artists);
      return;
    }

    const filtered = artists.filter(
      artist => artist.firstLetter === selectedLetter
    );
    setFilteredArtists(filtered);
  };

  // 分页控制
  const totalPages = Math.ceil(totalTracks / itemsPerPage);
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 打开歌手对话框
  const openArtistDialog = async (artist: Artist) => {
    setSelectedArtist(artist);
    setIsArtistDialogOpen(true);

    try {
      const response = await getTracks({ artist: artist.name });
      if (response.success) {
        setArtistTracks(response.data);
      }
    } catch (error) {
      console.error('加载歌手歌曲失败:', error);
    }
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 播放指定歌曲
  const playTrack = (index: number) => {
    const track = filteredTracks[index];
    if (track) {
      contextPlayTrack(track, filteredTracks);
    }
  };

  // 播放历史中的歌曲
  const playFromHistory = (track: Track) => {
    const trackIndex = tracks.findIndex(t => t.id === track.id);
    if (trackIndex >= 0) {
      playTrack(trackIndex);
    }
  };

  // 搜索功能
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    if (query.trim() && !searchHistory.includes(query)) {
      setSearchHistory(prev => [query, ...prev].slice(0, 10));
    }

    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      const filtered = tracks.filter(
        track =>
          track.title.toLowerCase().includes(lowerQuery) ||
          track.artist.toLowerCase().includes(lowerQuery) ||
          (track.album && track.album.toLowerCase().includes(lowerQuery))
      );
      setFilteredTracks(filtered);
    } else {
      setFilteredTracks(tracks);
    }
  }, [tracks, searchHistory]);

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            音乐播放器
          </h1>
          <p className="text-muted-foreground">享受美妙的音乐时光</p>
        </div>

        {/* 视图切换和搜索栏 */}
        <div className="mb-6 space-y-4">
          {/* 第一行：视图切换 */}
          <div className="flex justify-center gap-2 flex-wrap">
            <Button
              variant={viewType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setViewType('all');
                setSelectedLetter(null);
                setSearchQuery('');
              }}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
            全部音乐
            </Button>
            <Button
              variant={viewType === 'artist' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setViewType('artist');
                setSelectedLetter(null);
                if (artists.length === 0) {
                  loadArtists();
                }
                setSearchQuery('');
              }}
            >
              <Disc3 className="mr-2 h-4 w-4" />
              歌手列表
            </Button>
            <Button
              variant={viewType === 'favorite' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setViewType('favorite');
                setSelectedLetter(null);
                setSearchQuery('');
              }}
            >
              <Star className="mr-2 h-4 w-4" />
              收藏音乐
            </Button>
            <Button
              variant={viewType === 'history' as ViewType ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setViewType('history' as ViewType);
                setSelectedLetter(null);
                setSearchQuery('');
              }}
            >
              <History className="mr-2 h-4 w-4" />
              播放历史
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadTracks(currentPage)}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Link href="/music/batch-update" prefetch={false}>
              <Button variant="outline" size="sm" asChild>
                <div>
                  <Sparkles className="h-4 w-4" />
                </div>
              </Button>
            </Link>
          </div>

          {/* 第二行：搜索栏 */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索歌曲、歌手、专辑..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => handleSearch('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {searchHistory.length > 0 && !searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg p-2 z-10">
                <p className="text-xs text-muted-foreground mb-2 px-2">搜索历史</p>
                {searchHistory.map((history, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left"
                    onClick={() => handleSearch(history)}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {history}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 主内容区 - 包装在相对定位容器中，用于播放队列定位 */}
        <div className="relative">
          <div className="grid gap-6 lg:grid-cols-1 mb-24">
          {/* 左侧：播放器控制 - 移动到固定底部栏，这里仅作为占位符 */}
          <div className="lg:col-span-1 hidden">
            {/* 原播放器已移至底部固定栏 */}
          </div>

          {/* 右侧：歌曲/歌手列表 */}
          <div className="lg:col-span-1">
            <Card className="glass-card p-6">
              {/* A-Z 快速跳转 */}
              <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
                <Button
                  variant={selectedLetter === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLetter(null)}
                >
                  全部
                </Button>
                {LETTERS.map(letter => (
                  <Button
                    key={letter}
                    variant={selectedLetter === letter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLetter(letter)}
                  >
                    {letter}
                  </Button>
                ))}
              </div>

              {/* 歌手列表视图 */}
              {viewType === 'artist' && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold">
                      歌手列表
                      {selectedLetter && ` (${selectedLetter})`}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      共 {filteredArtists.length} 位歌手
                    </p>
                  </div>

                  <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '12px' }}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pr-2">
                      {filteredArtists.map(artist => (
                        <Card
                          key={artist.name}
                          className="cursor-pointer hover:shadow-lg transition-all"
                          onClick={() => openArtistDialog(artist)}
                        >
                          <div className="aspect-square overflow-hidden rounded-t-lg">
                            <img
                              src={getArtistCoverUrl(artist.name)}
                              alt={artist.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22 fill=%22pink%22>🎵</text></svg>';
                              }}
                            />
                          </div>
                          <div className="p-3 text-center">
                            <h4 className="font-semibold truncate text-sm">{artist.name}</h4>
                            <p className="text-xs text-muted-foreground">{artist.trackCount} 首歌曲</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 歌曲列表视图 */}
              {viewType !== 'artist' && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold">
                      {viewType === 'all' ? '全部音乐' : viewType === 'favorite' ? '收藏音乐' : viewType === ('history' as ViewType) ? '播放历史' : ''}
                      {selectedLetter && ` (${selectedLetter})`}
                    </h3>
                  </div>

                  {/* 使用 Flexbox 布局：列表区域 + 分页区域 */}
                  <div className="flex flex-col" style={{ width: '1432.67px' }}>
                    {/* 歌曲列表区域 - 可滚动 */}
                    <div
                      className="overflow-y-auto pr-2"
                      style={{
                        // 固定列表区域高度
                        height: '550px',
                        // 确保至少有一定高度
                        minHeight: '200px'
                      }}
                    >
                      <div className="space-y-2 pr-2">
                        {viewType === ('history' as ViewType) ? (
                          // 播放历史列表
                          playHistory.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>暂无播放历史</p>
                            </div>
                          ) : (
                            playHistory.map((track, index) => (
                              <div
                                key={track.id}
                                onClick={() => playFromHistory(track)}
                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                                  currentTrack?.id === track.id
                                    ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/50'
                                    : 'bg-muted/50 hover:bg-muted'
                                }`}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="text-xs text-muted-foreground w-12">
                                    #{index + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate text-sm">{track.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToQueue(track);
                                    }}
                                    className="h-8 w-8"
                                    title="添加到队列"
                                  >
                                    <ListMusic className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(track.id);
                                    }}
                                    className="h-8 w-8"
                                  >
                                    <Heart
                                      className={`h-4 w-4 ${
                                        favorites.has(track.id)
                                          ? 'fill-red-500 text-red-500'
                                          : ''
                                      }`}
                                    />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )
                        ) : (
                          // 普通歌曲列表
                          filteredTracks.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                              <Disc3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>暂无歌曲</p>
                            </div>
                          ) : (
                            filteredTracks.map((track, index) => (
                              <div
                                key={track.id}
                                onClick={() => playTrack(index)}
                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                                  currentTrack?.id === track.id
                                    ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/50'
                                    : 'bg-muted/50 hover:bg-muted'
                                }`}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  {currentTrack?.id === track.id && isPlaying && (
                                    <div className="flex space-x-1 text-pink-500">
                                      <div className="h-1 w-1 bg-current rounded-full animate-bounce" />
                                      <div className="h-1 w-1 bg-current rounded-full animate-bounce delay-100" />
                                      <div className="h-1 w-1 bg-current rounded-full animate-bounce delay-200" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate text-sm">{track.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToQueue(track);
                                    }}
                                    className="h-8 w-8"
                                    title="添加到队列"
                                  >
                                    <ListMusic className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(track.id);
                                    }}
                                    className="h-8 w-8"
                                  >
                                    <Heart
                                      className={`h-4 w-4 ${
                                        favorites.has(track.id)
                                          ? 'fill-red-500 text-red-500'
                                          : ''
                                      }`}
                                    />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )
                        )}
                      </div>
                    </div>

                    {/* 分页控制 - 固定在底部 */}
                    {viewType === 'all' && totalPages > 1 && (
                      <div
                        className="bg-transparent border-t border-border pt-3 pb-2 flex-shrink-0"
                        style={{
                          width: '1432.67px',
                          marginTop: '20px'
                        }}
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex items-center gap-2 flex-wrap justify-center">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              <SkipBack className="h-4 w-4" />
                            </Button>

                            <div className="flex gap-1">
                              {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                  // 显示第一页、最后一页、当前页及其前后页
                                  return (
                                    page === 1 ||
                                    page === totalPages ||
                                    Math.abs(page - currentPage) <= 1
                                  );
                                })
                                .map((page, index, array) => {
                                  const prevPage = array[index - 1];
                                  const shouldShowEllipsis = prevPage && page - prevPage > 1;

                                  return (
                                    <React.Fragment key={page}>
                                      {shouldShowEllipsis && (
                                        <span className="px-2 py-1">...</span>
                                      )}
                                      <Button
                                        variant={currentPage === page ? 'default' : 'outline'}
                                        size="icon"
                                        className="w-9 h-9"
                                        onClick={() => handlePageChange(page)}
                                      >
                                        {page}
                                      </Button>
                                    </React.Fragment>
                                  );
                                })}
                            </div>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              <SkipForward className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            共 {totalTracks} 首歌曲，第 {currentPage} / {totalPages} 页
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* 底部播放器 - 常驻显示 */}
          <div className="flex justify-center mb-4" style={{ marginTop: '-95px' }}>
            <div
              className="bg-background/95 backdrop-blur-md border border-border/40 shadow-lg rounded-2xl px-6 py-4 flex flex-col justify-center"
              style={{
                width: '1504px',
                height: '89.33px',
              }}
            >
            {/* 第一行：歌曲信息 + 播放控制 + 进度条 */}
            <div className="flex items-center justify-between mb-3">
              {/* 左侧区域：歌曲信息 */}
              <div className="flex items-center gap-3 flex-shrink-0" style={{ width: '320px' }}>
                <div
                  className={`h-14 w-14 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center flex-shrink-0 ${
                    isPlaying ? 'animate-spin-slow' : ''
                  }`}
                >
                  <span className="text-white text-xl">🎵</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold truncate">{currentTrack?.title || '未选择歌曲'}</p>
                  <p className="text-sm text-muted-foreground truncate">{currentTrack?.artist || '选择一首歌曲开始播放'}</p>
                </div>
              </div>

              {/* 中间区域：播放控制（绝对居中） */}
              <div className="flex items-center justify-center" style={{ width: '366.67px', height: '48px', marginLeft: '70px' }}>
                {/* 播放控制 - 绝对居中 */}
                <div className="flex items-center justify-center gap-3">
                  {(() => {
                    const ModeIcon = PLAY_MODES[playMode].icon;
                    return (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          const modes: PlayMode[] = ['sequential', 'shuffle', 'loop'];
                          const currentIndex = modes.indexOf(playMode);
                          const nextIndex = (currentIndex + 1) % modes.length;
                          setPlayMode(modes[nextIndex]);
                        }}
                        title={PLAY_MODES[playMode].label}
                      >
                        <ModeIcon className="h-4 w-4" />
                      </Button>
                    );
                  })()}
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={previousTrack}>
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="default"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={nextTrack}>
                    <SkipForward className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => currentTrack && toggleFavorite(currentTrack.id)}
                    title="收藏"
                  >
                    <Heart
                      className={`h-4 w-4 ${currentTrack && favorites.has(currentTrack.id) ? 'fill-red-500 text-red-500' : ''}`}
                    />
                  </Button>
                </div>
              </div>

              {/* 右侧区域：进度条（独立） */}
              <div className="flex items-center gap-2 flex-shrink-0" style={{ width: '420px' }}>
                <span className="text-xs text-muted-foreground w-10 text-right font-mono">
                  {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
                </span>
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={(value) => seekTo(value[0])}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-10 font-mono">
                  {duration ? `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}` : '0:00'}
                </span>
              </div>
            </div>

            {/* 第二行：音量和队列按钮 */}
            <div className="flex items-center justify-end" style={{ height: '32px' }}>
              {/* 音量按钮 */}
              <div
                className="relative mr-2"
                onMouseEnter={() => setIsVolumeSliderVisible(true)}
                onMouseLeave={() => setIsVolumeSliderVisible(false)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={toggleMute}
                  title="音量"
                >
                  {isMuted ? '🔇' : '🔊'}
                </Button>
                {isVolumeSliderVisible && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-background border border-border rounded-lg shadow-lg p-3 w-32 z-50">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.1}
                      onValueChange={(value) => contextSetVolume(value[0])}
                    />
                  </div>
                )}
              </div>

              {/* 队列按钮 */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsQueueOpen(!isQueueOpen)}
                title="播放队列"
              >
                <ListMusic className="h-4 w-4" />
              </Button>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* 歌手对话框 */}
      {isArtistDialogOpen && selectedArtist && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* 对话框头部 */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={getArtistCoverUrl(selectedArtist.name)}
                    alt={selectedArtist.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h2 className="text-2xl font-bold">{selectedArtist.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      共 {selectedArtist.trackCount} 首歌曲
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsArtistDialogOpen(false)}
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* 歌曲列表 */}
            <div style={{ flex: 1, maxHeight: '600px', overflowY: 'auto', paddingRight: '12px' }}>
              <div className="space-y-2 pr-2">
                {artistTracks.map(track => (
                  <div
                    key={track.id}
                    onClick={() => {
                      const index = tracks.findIndex(t => t.id === track.id);
                      playTrack(index);
                      setIsArtistDialogOpen(false);
                    }}
                    className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Disc3 className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{track.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {track.duration ? formatTime(track.duration) : '--:--'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(track.id);
                      }}
                      className="h-8 w-8"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          favorites.has(track.id)
                            ? 'fill-red-500 text-red-500'
                            : ''
                        }`}
                      />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* 底部操作栏 */}
            <div className="p-4 border-t flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsArtistDialogOpen(false)}
              >
                关闭
              </Button>
              <Button onClick={() => {
                if (artistTracks.length > 0) {
                  const firstArtistTrackIndex = tracks.findIndex(t => t.id === artistTracks[0]?.id);
                  if (firstArtistTrackIndex >= 0) {
                    playTrack(firstArtistTrackIndex);
                    setIsArtistDialogOpen(false);
                  }
                }
              }}>
                <Play className="mr-2 h-4 w-4" />
                全部播放
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 播放历史对话框 */}
      {isHistoryDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* 对话框头部 */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-6 w-6" />
                  <h2 className="text-2xl font-bold">播放历史</h2>
                  <span className="text-sm text-muted-foreground">({playHistory.length} 首)</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsHistoryDialogOpen(false)}
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* 历史列表 */}
            <ScrollArea className="flex-1 p-4">
              {playHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>暂无播放历史</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {playHistory.map((track, index) => (
                    <div
                      key={track.id}
                      onClick={() => playFromHistory(track)}
                      className="flex items-center justify-between p-3 rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-orange-300 flex items-center justify-center flex-shrink-0 ${
                          index === 0 && isPlaying && currentTrack?.id === track.id ? 'animate-pulse' : ''
                        }`}>
                          <Disc3 className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{track.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* 底部操作栏 */}
            <div className="p-4 border-t flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  clearHistory();
                }}
              >
                清空历史
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsHistoryDialogOpen(false)}
              >
                关闭
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 播放队列侧边栏 */}
      {isQueueOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-background/95 backdrop-blur-md border-l shadow-xl z-50 flex flex-col transition-transform duration-300 ease-in-out translate-x-0">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListMusic className="h-5 w-5" />
              <h3 className="font-semibold">播放队列</h3>
              <span className="text-sm text-muted-foreground">({playQueue.length} 首)</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsQueueOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            {playQueue.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ListMusic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>播放队列为空</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {playQueue.map((track, index) => (
                  <div
                    key={track.id}
                    onClick={() => playFromQueue(index)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      track.id === currentTrack?.id ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {track.id === currentTrack?.id && isPlaying && (
                        <span className="text-xs text-muted-foreground">🎵</span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(index);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </>
  );
}

/**
 * 音乐播放器类型定义
 */

/**
 * 音乐音轨
 */
export interface Track {
  id: string;
  filename: string;
  title: string;
  titlePinyin: string;
  titleFirstLetter: string;
  artist: string;
  artistPinyin: string;
  artistFirstLetter: string;
  album?: string | null;
  duration?: number | null;
  fileSize: number;
  format: string;
  addedAt: string;
  isPlaying?: boolean;
  isFavorite?: boolean;
}

/**
 * 歌手
 */
export interface Artist {
  name: string;
  pinyin: string;
  firstLetter: string;
  trackCount: number;
}

/**
 * 收藏项
 */
export interface Favorite {
  id: string;
  userId: string;
  trackId: string;
  createdAt: string;
}

/**
 * 播放模式
 */
export type PlayMode = 'sequential' | 'shuffle' | 'loop';

/**
 * 视图类型
 */
export type ViewType = 'all' | 'artist' | 'favorite' | 'history';

/**
 * A-Z 字母
 */
export type Letter = '#' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';

/**
 * 获取歌曲列表响应
 */
export interface TracksResponse {
  success: boolean;
  data: Track[];
  total: number;
  page?: number;
  limit?: number;
}

/**
 * 获取歌手列表响应
 */
export interface ArtistsResponse {
  success: boolean;
  data: Artist[];
  total: number;
}

/**
 * 扫描音乐库响应
 */
export interface ScanResponse {
  success: boolean;
  message: string;
  data: {
    totalTracks: number;
    totalArtists: number;
    totalSize: number;
    syncedCount: number;
    scannedFiles: number;
    errors: string[];
  };
}

/**
 * 收藏操作响应
 */
export interface FavoriteResponse {
  success: boolean;
  message: string;
}

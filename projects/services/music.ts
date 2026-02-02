/**
 * 音乐服务函数
 * 用于调用后端 API
 */

import type {
  Track,
  Artist,
  TracksResponse,
  ArtistsResponse,
  ScanResponse,
  FavoriteResponse,
} from '@/types/music';

const API_BASE = '/api/music';

/**
 * 扫描并同步音乐库
 */
export async function scanMusicLibrary(options?: {
  force?: boolean;
  extractMetadata?: boolean;
  verbose?: boolean;
}): Promise<ScanResponse> {
  const response = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options || {}),
  });

  if (!response.ok) {
    throw new Error('扫描失败');
  }

  return response.json();
}

/**
 * 获取歌曲列表
 */
export async function getTracks(options?: {
  page?: number;
  limit?: number;
  letter?: string;
  artist?: string;
}): Promise<TracksResponse> {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.letter) params.append('letter', options.letter);
  if (options?.artist) params.append('artist', options.artist);

  const response = await fetch(`${API_BASE}/tracks?${params.toString()}`);

  if (!response.ok) {
    throw new Error('获取歌曲列表失败');
  }

  const data = await response.json();
  return {
    success: data.success,
    data: data.data,
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
}

/**
 * 获取歌手列表
 */
export async function getArtists(options?: {
  letter?: string;
}): Promise<ArtistsResponse> {
  const params = new URLSearchParams();
  if (options?.letter) params.append('letter', options.letter);

  const response = await fetch(`${API_BASE}/artists?${params.toString()}`);

  if (!response.ok) {
    throw new Error('获取歌手列表失败');
  }

  const data = await response.json();
  return {
    success: data.success,
    data: data.data,
    total: data.total,
  };
}

/**
 * 获取歌手的所有歌曲
 */
export async function getArtistTracks(artist: string): Promise<TracksResponse> {
  const params = new URLSearchParams();
  params.append('artist', artist);

  const response = await fetch(`${API_BASE}/tracks?${params.toString()}`);

  if (!response.ok) {
    throw new Error('获取歌手歌曲失败');
  }

  const data = await response.json();
  return {
    success: data.success,
    data: data.data,
    total: data.total,
  };
}

/**
 * 获取歌曲流式传输 URL
 */
export function getTrackStreamUrl(trackId: string): string {
  return `${API_BASE}/stream/${trackId}`;
}

/**
 * 获取歌手封面 URL
 */
export function getArtistCoverUrl(artistName: string): string {
  return `${API_BASE}/cover/${encodeURIComponent(artistName)}`;
}

/**
 * 添加收藏
 */
export async function addFavorite(trackId: string, userId?: string): Promise<FavoriteResponse> {
  const response = await fetch('/api/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      trackId,
      userId: userId || 'anonymous',
    }),
  });

  if (!response.ok) {
    throw new Error('添加收藏失败');
  }

  return response.json();
}

/**
 * 取消收藏
 */
export async function removeFavorite(trackId: string, userId?: string): Promise<FavoriteResponse> {
  const response = await fetch(`/api/favorites/${trackId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: userId || 'anonymous',
    }),
  });

  if (!response.ok) {
    throw new Error('取消收藏失败');
  }

  return response.json();
}

/**
 * 获取用户收藏列表
 */
export async function getUserFavorites(userId?: string): Promise<TracksResponse> {
  const response = await fetch(`/api/favorites?userId=${userId || 'anonymous'}`);

  if (!response.ok) {
    throw new Error('获取收藏列表失败');
  }

  const data = await response.json();
  return {
    success: data.success,
    data: data.data,
    total: data.total,
  };
}

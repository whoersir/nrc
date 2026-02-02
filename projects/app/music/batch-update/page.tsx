'use client';

import { useState } from 'react';
import { PlayCircle, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TrackUpdate {
  id: string;
  originalTitle: string;
  newTitle: string;
  changed: boolean;
}

interface BatchUpdateResult {
  success: boolean;
  message: string;
  processedCount: number;
  updatedCount: number;
  unchangedCount: number;
  totalCount?: number;  // 数据库中的总歌曲数
  details: TrackUpdate[];
}

export default function BatchUpdatePage() {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [result, setResult] = useState<BatchUpdateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(0);

  const handlePreview = async () => {
    setIsPreviewing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/music/tracks/batch-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: limit || undefined,
          dryRun: true,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || '预览失败');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleUpdate = async () => {
    if (!confirm('确定要执行批量更新吗？此操作不可撤销！')) {
      return;
    }

    setIsUpdating(true);
    setError(null);
    console.log('🔄 开始执行批量更新，limit:', limit);

    try {
      const response = await fetch('/api/music/tracks/batch-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: limit || undefined,
          dryRun: false, // 实际执行更新
        }),
      });

      console.log('📡 收到响应，状态:', response.status);

      const data = await response.json();
      console.log('📊 响应数据:', data);
      setResult(data);

      // 如果更新成功且有数据被更新，延迟后跳转回音乐页面
      if (data.success && data.updatedCount > 0) {
        console.log('✅ 批量更新成功，即将返回音乐页面...');
        setTimeout(() => {
          console.log('🚀 跳转到音乐页面');
          window.location.href = '/music';
        }, 2000);
      } else if (data.success && data.updatedCount === 0) {
        console.log('⚠️ 批量更新完成，但没有歌曲需要更新');
        // 即使没有更新，也跳转回音乐页面
        setTimeout(() => {
          window.location.href = '/music';
        }, 1500);
      } else {
        console.error('❌ 批量更新失败:', data.message);
        setError(data.message || '更新失败');
      }
    } catch (err: any) {
      console.error('❌ 批量更新异常:', err);
      setError(err.message || '更新失败');
    } finally {
      setIsUpdating(false);
    }
  };

  const changedTracks = result?.details.filter(t => t.changed) || [];
  const unchangedTracks = result?.details.filter(t => !t.changed) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <RefreshCw className="w-10 h-10" />
            批量优化歌曲标题
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            自动清理歌曲标题中的序号、扩展名、版本信息等内容
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 处理数量限制 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                处理数量限制
              </label>
              <input
                type="number"
                min="0"
                placeholder="0 = 处理全部"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                设置为0则处理所有歌曲
              </p>
            </div>

            {/* 预览按钮 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                操作
              </label>
              <button
                onClick={handlePreview}
                disabled={isPreviewing || isUpdating}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {isPreviewing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    预览中...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-5 h-5" />
                    预览更新
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                查看将要更新的数据
              </p>
            </div>

            {/* 执行更新按钮 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                执行更新
              </label>
              <button
                onClick={handleUpdate}
                disabled={isUpdating || isPreviewing || !result}
                className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    更新中...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    执行批量更新
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                建议先预览再执行
              </p>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">操作失败</span>
            </div>
            <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* 统计结果 */}
        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              统计结果
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {result.totalCount !== undefined && result.totalCount > result.processedCount && (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {result.totalCount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    数据库总数
                  </div>
                </div>
              )}
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {result.processedCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  处理数量
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {result.updatedCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  需要更新
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                  {result.unchangedCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  无需更新
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {result.updatedCount > 0 ? (
                    Math.round((result.updatedCount / result.processedCount) * 100)
                  ) : 0}
                  %
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  更新比例
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                {result.message}
              </span>
            </div>

            {/* 成功提示 */}
            {result.success && result.updatedCount > 0 && (
              <div className="mt-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <RefreshCw className="w-5 h-5" />
                  <span className="font-medium">正在返回音乐列表...</span>
                </div>
                <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                  页面将在1.5秒后自动跳转，您将看到更新后的歌曲标题
                </p>
              </div>
            )}
          </div>
        )}

        {/* 需要更新的歌曲列表 */}
        {changedTracks.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              需要更新的歌曲 ({changedTracks.length})
            </h2>

            <ScrollArea className="h-[600px] w-full rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="space-y-3 p-4">
                {changedTracks.map((track) => (
                  <div
                    key={track.id}
                    className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">原始标题</div>
                        <div className="text-gray-900 dark:text-white font-medium line-through">
                          {track.originalTitle}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">新标题</div>
                        <div className="text-green-600 dark:text-green-400 font-bold">
                          {track.newTitle}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* 无需更新的歌曲列表 */}
        {unchangedTracks.length > 0 && (
          <details className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <summary className="cursor-pointer text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              无需更新的歌曲 ({unchangedTracks.length})
            </summary>

            <ScrollArea className="h-[400px] w-full rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="space-y-2 p-4">
                {unchangedTracks.map((track) => (
                  <div
                    key={track.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm"
                  >
                    <div className="text-gray-700 dark:text-gray-300">{track.originalTitle}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </details>
        )}
      </div>
    </div>
  );
}

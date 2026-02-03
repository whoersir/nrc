import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
import type { GameId, GameStats } from '@/types/game';
import { getGameName, isWinLossGame } from '@/types/game';

/**
 * GET /api/games/leaderboard/user?user_id=xxx&game_id=xxx
 * 获取用户游戏历史和战绩
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const gameId = searchParams.get('game_id') as GameId | null;

    // 验证参数
    if (!userId) {
      return NextResponse.json(
        { success: false, message: '缺少必填参数: user_id' },
        { status: 400 }
      );
    }

    // 如果指定了game_id，验证其有效性
    if (gameId) {
      const validGames: GameId[] = ['snake', 'gomoku', 'fps', 'overcooked'];
      if (!validGames.includes(gameId)) {
        return NextResponse.json(
          { success: false, message: '无效的游戏ID' },
          { status: 400 }
        );
      }
    }

    // 查询用户游戏记录
    let query = supabase
      .from('game_scores')
      .select('*')
      .eq('user_id', userId)
      .order('played_at', { ascending: false });

    if (gameId) {
      query = query.eq('game_id', gameId);
    }

    const { data: scores, error } = await query;

    if (error) {
      console.error('获取游戏历史失败:', error);
      return NextResponse.json(
        { success: false, message: `获取游戏历史失败: ${error.message}` },
        { status: 500 }
      );
    }

    // 计算战绩统计
    const statsMap = new Map<GameId, {
      scores: number[];
      wins: number;
    }>();

    scores?.forEach((record: any) => {
      const gid = record.game_id as GameId;
      const existing = statsMap.get(gid);

      if (!existing) {
        statsMap.set(gid, {
          scores: [record.score],
          wins: isWinLossGame(gid) && record.score >= 1 ? 1 : 0,
        });
      } else {
        existing.scores.push(record.score);
        if (isWinLossGame(gid) && record.score >= 1) {
          existing.wins++;
        }
      }
    });

    // 构建统计结果
    const stats: GameStats[] = Array.from(statsMap.entries()).map(([gid, data]) => ({
      game_id: gid,
      game_name: getGameName(gid),
      wins: data.wins,
      total_games: data.scores.length,
      best_score: Math.max(...data.scores),
      avg_score: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
    }));

    return NextResponse.json({
      success: true,
      data: {
        history: scores || [],
        stats: stats,
      },
    });
  } catch (error: any) {
    console.error('获取用户游戏历史API错误:', error);
    return NextResponse.json(
      { success: false, message: error.message || '服务器内部错误' },
      { status: 500 }
    );
  }
}

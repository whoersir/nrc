import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
import type { GameId, LeaderboardEntry } from '@/types/game';

/**
 * GET /api/games/leaderboard/list?game_id=snake&limit=50
 * 获取排行榜列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id') as GameId;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const currentUserId = searchParams.get('user_id');

    // 验证游戏ID
    if (!gameId) {
      return NextResponse.json(
        { success: false, error: 'Missing game_id' },
        { status: 400 }
      );
    }

    const validGames: GameId[] = ['snake', 'gomoku', 'fps', 'overcooked'];
    if (!validGames.includes(gameId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid game_id' },
        { status: 400 }
      );
    }

    // 查询该游戏的所有分数记录
    const { data: scores, error } = await supabase
      .from('game_scores')
      .select(`
        id,
        user_id,
        game_id,
        score,
        play_time,
        played_at,
        users:user_id (username, nickname)
      `)
      .eq('game_id', gameId)
      .order('score', { ascending: false });

    if (error) {
      console.error('获取排行榜失败');
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    // 去重：每个用户只保留最高分
    const userBestScores = new Map<string, typeof scores[0]>();
    scores?.forEach((score) => {
      const existing = userBestScores.get(score.user_id);
      if (!existing || score.score > existing.score) {
        userBestScores.set(score.user_id, score);
      }
    });

    // 转换为数组并排序
    const sortedScores = Array.from(userBestScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // 构建排行榜数据
    const leaderboard: LeaderboardEntry[] = sortedScores.map((score, index) => ({
      rank: index + 1,
      user_id: score.user_id,
      username: score.users?.username || '未知用户',
      nickname: score.users?.nickname,
      score: score.score,
      play_time: score.play_time,
      played_at: score.played_at,
      is_current_user: currentUserId ? score.user_id === currentUserId : false,
    }));

    return NextResponse.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error('获取排行榜API错误');
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

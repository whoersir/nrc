import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
import type { GameId } from '@/types/game';

/**
 * GET /api/games/leaderboard/rank?game_id=snake&user_id=xxx
 * 获取用户排名信息
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id') as GameId;
    const userId = searchParams.get('user_id');

    // 验证参数
    if (!gameId || !userId) {
      return NextResponse.json(
        { success: false, message: '缺少必填参数: game_id, user_id' },
        { status: 400 }
      );
    }

    const validGames: GameId[] = ['snake', 'gomoku', 'fps', 'overcooked'];
    if (!validGames.includes(gameId)) {
      return NextResponse.json(
        { success: false, message: '无效的游戏ID' },
        { status: 400 }
      );
    }

    // 获取用户的所有游戏记录
    const { data: userScores, error: userError } = await supabase
      .from('game_scores')
      .select('score')
      .eq('game_id', gameId)
      .eq('user_id', userId);

    if (userError) {
      console.error('获取用户记录失败:', userError);
      return NextResponse.json(
        { success: false, message: `获取用户记录失败: ${userError.message}` },
        { status: 500 }
      );
    }

    // 用户没有玩过该游戏
    if (!userScores || userScores.length === 0) {
      // 获取总玩家数
      const { data: allUsers } = await supabase
        .from('game_scores')
        .select('user_id', { count: 'exact', head: true })
        .eq('game_id', gameId);

      return NextResponse.json({
        success: true,
        data: {
          rank: 0,
          total_players: 0,
          best_score: 0,
          total_games: 0,
        },
      });
    }

    const bestScore = Math.max(...userScores.map(s => s.score));
    const totalGames = userScores.length;

    // 获取所有用户的最高分（用于计算排名）
    const { data: allScores, error: allError } = await supabase
      .from('game_scores')
      .select('user_id, score')
      .eq('game_id', gameId);

    if (allError) {
      console.error('获取排名失败:', allError);
      return NextResponse.json(
        { success: false, message: `获取排名失败: ${allError.message}` },
        { status: 500 }
      );
    }

    // 计算每个用户的最高分
    const userBestScores = new Map<string, number>();
    allScores?.forEach((score: any) => {
      const existing = userBestScores.get(score.user_id) || 0;
      if (score.score > existing) {
        userBestScores.set(score.user_id, score.score);
      }
    });

    // 计算排名
    const sortedScores = Array.from(userBestScores.values()).sort((a, b) => b - a);
    const rank = sortedScores.findIndex(score => score <= bestScore) + 1;

    return NextResponse.json({
      success: true,
      data: {
        rank,
        total_players: userBestScores.size,
        best_score: bestScore,
        total_games: totalGames,
      },
    });
  } catch (error: any) {
    console.error('获取用户排名API错误:', error);
    return NextResponse.json(
      { success: false, message: error.message || '服务器内部错误' },
      { status: 500 }
    );
  }
}

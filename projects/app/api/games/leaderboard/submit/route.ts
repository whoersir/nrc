import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
import type { GameId } from '@/types/game';

/**
 * POST /api/games/leaderboard/submit
 * 提交游戏分数
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, game_id, game_mode, score, play_time, details } = body;

    // 验证必填字段
    if (!user_id || !game_id || score === undefined) {
      return NextResponse.json(
        { success: false, message: '缺少必填字段: user_id, game_id, score' },
        { status: 400 }
      );
    }

    // 验证游戏ID
    const validGames: GameId[] = ['snake', 'gomoku', 'fps', 'overcooked'];
    if (!validGames.includes(game_id)) {
      return NextResponse.json(
        { success: false, message: '无效的游戏ID' },
        { status: 400 }
      );
    }

    // 验证分数
    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { success: false, message: '分数必须是非负数' },
        { status: 400 }
      );
    }

    // 生成记录ID
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 插入数据
    const { data: scoreRecord, error } = await supabase
      .from('game_scores')
      .insert({
        id,
        user_id,
        game_id,
        game_mode: game_mode || 'classic',
        score,
        play_time: play_time || null,
        details: details || {},
        played_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('提交分数失败:', error);
      return NextResponse.json(
        { success: false, message: `提交分数失败: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '分数提交成功',
      data: scoreRecord,
    });
  } catch (error: any) {
    console.error('提交分数API错误:', error);
    return NextResponse.json(
      { success: false, message: error.message || '服务器内部错误' },
      { status: 500 }
    );
  }
}

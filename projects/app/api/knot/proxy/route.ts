import { NextRequest, NextResponse } from 'next/server';

/**
 * Knot Chat API 代理
 * 使用 AG-UI 协议
 *
 * ⚠️ 安全改进：
 * - API_BASE 和 TOKEN 必须从环境变量获取，不允许默认值
 * - 添加 CSRF token 验证
 */

// 从环境变量读取，缺失时抛出错误而不是使用默认值
const KNOT_API_BASE = process.env.NEXT_PUBLIC_KNOT_API_BASE;
const KNOT_API_TOKEN = process.env.KNOT_API_TOKEN;

// 验证必需的环境变量
if (!KNOT_API_BASE) {
  throw new Error('❌ 缺少环境变量: NEXT_PUBLIC_KNOT_API_BASE');
}
if (!KNOT_API_TOKEN) {
  throw new Error('❌ 缺少环境变量: KNOT_API_TOKEN');
}

// CSRF token 验证（从请求头获取）
function validateCsrfToken(request: NextRequest): boolean {
  const csrfToken = request.headers.get('x-csrf-token');
  const cookieToken = request.cookies.get('csrf-token')?.value;

  // 开发环境可以跳过验证
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // 生产环境必须验证
  if (!csrfToken || !cookieToken || csrfToken !== cookieToken) {
    return false;
  }
  return true;
}

/**
 * POST 请求代理（用于聊天消息）
 */
export async function POST(req: NextRequest) {
  try {
    // CSRF 验证
    if (!validateCsrfToken(req)) {
      console.error('[Knot Proxy] CSRF 验证失败');
      return NextResponse.json(
        { error: 'CSRF validation failed' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { message, sessionId } = body;

    // 输入验证
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      );
    }

    // 生产环境减少日志输出
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Knot Proxy] Chat request: message length=${message.length}, sessionId=${sessionId || 'new'}`);
    }

    // 构建符合 AG-UI 协议的请求体
    const requestBody = {
      input: {
        message,
        conversation_id: sessionId || '',
        model: 'glm-4.7',
        stream: false,
        enable_web_search: false,
      },
    };

    // 发送请求到 Knot API
    const response = await fetch(KNOT_API_BASE!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-knot-api-token': KNOT_API_TOKEN!,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Knot Proxy] API Error: ${response.status}`);
      // 不向客户端暴露详细错误信息
      return NextResponse.json(
        { error: 'Failed to process chat request' },
        { status: 500 }
      );
    }

    const data = await response.json();

    // 提取回复内容和 conversation_id
    let reply = '';
    let newConversationId = sessionId || '';

    if (data.type === 'TEXT_MESSAGE_CONTENT' && data.rawEvent) {
      reply = data.rawEvent.content || '';
      if (data.rawEvent.conversation_id) {
        newConversationId = data.rawEvent.conversation_id;
      }
    } else if (data.rawEvent) {
      reply = data.rawEvent.content || '';
      if (data.rawEvent.conversation_id) {
        newConversationId = data.rawEvent.conversation_id;
      }
    } else if (data.content) {
      reply = data.content;
    } else if (data.message) {
      reply = data.message;
    } else if (data.reply) {
      reply = data.reply;
    } else {
      reply = JSON.stringify(data);
    }

    return NextResponse.json({ reply, conversationId: newConversationId });
  } catch (error) {
    console.error('[Knot Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

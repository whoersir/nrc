import { NextRequest, NextResponse } from 'next/server';

/**
 * Knot Chat API 代理
 * 使用 AG-UI 协议
 */

const KNOT_API_BASE = 'http://knot.woa.com/apigw/api/v1/agents/agui/cde9cb837e8e4391a829afe228029ec9';
const KNOT_API_TOKEN = '749a79422fb54be19350f53995d84474';

/**
 * POST 请求代理（用于聊天消息）
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, sessionId } = body;

    console.log(`[Knot Proxy] Chat request:`, { message, sessionId });

    // 构建符合 AG-UI 协议的请求体
    // 首次对话时 conversation_id 为空字符串，后续对话使用 API 返回的 ID
    const requestBody = {
      input: {
        message,
        conversation_id: sessionId || '',
        model: 'glm-4.7',
        stream: false,
        enable_web_search: false,
      },
    };

    console.log('[Knot Proxy] Request body:', JSON.stringify(requestBody, null, 2));

    // 发送请求
    const response = await fetch(KNOT_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-knot-api-token': KNOT_API_TOKEN,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[Knot Proxy] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Knot Proxy] API Error:', response.status, errorText);
      throw new Error(`Knot API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[Knot Proxy] API Response:', data);

    // 提取回复内容和 conversation_id
    let reply = '';
    let newConversationId = sessionId || '';

    if (data.type === 'TEXT_MESSAGE_CONTENT' && data.rawEvent) {
      reply = data.rawEvent.content;
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
    console.error('[Knot Proxy] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request', reply: '抱歉，服务暂时不可用，请稍后重试。' },
      { status: 500 }
    );
  }
}

/**
 * GET 请求代理（可选，用于其他 API 调用）
 */
export async function GET() {
  return NextResponse.json({ message: 'Knot Chat API is ready. Use POST /api/knot/proxy to send messages.' });
}

'use client';

import { useState } from 'react';
import { SupabaseAuth } from '@/lib/supabase-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AuthDebugPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const addLog = (step: string, success: boolean, message: string, details?: any) => {
    setLogs(prev => [...prev, {
      step,
      success,
      message,
      details,
      timestamp: new Date().toLocaleTimeString(),
    }]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testRegister = async () => {
    clearLogs();

    if (!username || !password) {
      addLog('输入验证', false, '请填写用户名和密码');
      return;
    }

    addLog('开始注册', true, '准备注册用户...');

    try {
      // 步骤1: 检查 users 表是否存在（通过查询测试）
      addLog('步骤1: 检查表', true, '检查 users 表是否存在...');
      try {
        const users = await SupabaseAuth.getAllUsers();
        addLog('步骤1: 检查表', true, `✅ users 表存在，当前有 ${users.length} 个用户`);
      } catch (error: any) {
        addLog('步骤1: 检查表', false, `❌ users 表不存在或无法访问`);
        addLog('', false, `错误: ${error.message}`);
        addLog('', false, `🔧 解决方法: 访问 https://supabase.com/dashboard/project/nrc/editor 创建 users 表`);
        return;
      }

      // 步骤2: 检查用户名是否已存在（注册时会自动检查）
      addLog('步骤2: 准备注册', true, `准备注册用户: ${username}...`);

      // 步骤3: 注册用户
      addLog('步骤3: 注册用户', true, `正在注册用户...`);
      try {
        const registerResult = await SupabaseAuth.register(username, password, username);
        addLog('步骤3: 注册用户', true, `✅ 注册成功！用户ID: ${registerResult.user?.id}`);
      } catch (error: any) {
        addLog('步骤3: 注册用户', false, `❌ 注册失败: ${error.message}`);
        addLog('', false, `错误详情:`, error);
        return;
      }

      // 步骤4: 查询所有用户
      addLog('步骤4: 查询所有用户', true, `查询 users 表中的所有用户...`);
      try {
        const allUsers = await SupabaseAuth.getAllUsers();
        addLog('步骤4: 查询所有用户', true, `✅ 找到 ${allUsers.length} 个用户`);
        if (allUsers.length > 0) {
          addLog('', true, `用户列表:`, allUsers.map(u => `${u.username} (${u.email})`).join(', '));
        }
      } catch (error: any) {
        addLog('步骤4: 查询所有用户', false, `❌ 查询失败: ${error.message}`);
        return;
      }

      // 步骤5: 测试登录
      addLog('步骤5: 测试登录', true, `测试用户登录...`);
      try {
        const loginResult = await SupabaseAuth.login(username, password);
        if (loginResult.success && loginResult.user) {
          addLog('步骤5: 测试登录', true, `✅ 登录成功！`);
          addLog('', true, `用户信息:`, loginResult.user);
        } else {
          throw new Error('登录失败，返回结果异常');
        }
      } catch (error: any) {
        addLog('步骤5: 测试登录', false, `❌ 登录失败: ${error.message}`);
        addLog('', false, `💡 可能的原因:`);
        addLog('', false, `1. 密码哈希不匹配`);
        addLog('', false, `2. 查询条件错误`);
        addLog('', false, `3. 数据结构不匹配`);
      }

      // 总结
      addLog('总结', true, '🎉 注册和登录流程完成！');

    } catch (error: any) {
      addLog('异常', false, `❌ 流程异常: ${error.message}`, error);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">认证系统调试工具</h1>
          <p className="text-muted-foreground">Supabase 认证系统 - 详细检查注册和登录流程</p>
        </div>

          <Card>
            <CardHeader>
              <CardTitle>注册测试</CardTitle>
              <CardDescription>填写测试用户信息进行注册测试（使用 Supabase - 仅需用户名+密码）</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">用户名</label>
                <Input
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">密码</label>
                <Input
                  type="password"
                  placeholder="123456"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            <div className="flex gap-2">
              <Button onClick={testRegister} className="flex-1">
                开始测试
              </Button>
              <Button onClick={clearLogs} variant="outline">
                清除日志
              </Button>
            </div>
          </CardContent>
        </Card>

        {logs.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">执行日志</h2>
            <div className="space-y-2">
              {logs.map((log: any, index: number) => (
                <Card
                  key={index}
                  className={log.success ? 'border-green-200 bg-green-50 dark:bg-green-950' : 'border-red-200 bg-red-50 dark:bg-red-950'}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{log.message}</p>
                        {log.details && (
                          <pre className="mt-2 text-xs bg-white dark:bg-black p-2 rounded overflow-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground ml-4 text-right">
                        <div>{log.step}</div>
                        <div>{log.timestamp}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>快速链接</CardTitle>
            <CardDescription>Supabase 控制台快捷入口</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="https://supabase.com/dashboard/project/nrc/editor"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-primary hover:underline"
            >
              📊 Supabase 控制台（nrc 项目）
            </a>
            <a
              href="http://10.75.31.37:5000/register"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-primary hover:underline"
            >
              📝 注册页面
            </a>
            <a
              href="http://10.75.31.37:5000/login"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-primary hover:underline"
            >
              🔑 登录页面
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { SupabaseAuth } from '@/lib/supabase-auth';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 使用 Supabase 登录
      const result = await SupabaseAuth.login(formData.username, formData.password);

      if (result.success && result.user) {
        router.push('/');
        router.refresh();
      } else {
        throw new Error('登录失败，用户信息为空');
      }
    } catch (err: any) {
      setError(err.message || '登录失败，请重试');
      console.error('登录失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[90vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <Card className="glass-card p-8">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="mb-4 inline-flex justify-center">
              <div className="rounded-full bg-gradient-to-br from-pink-400 to-orange-300 p-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl">欢迎回来</CardTitle>
            <CardDescription className="text-base">
              输入您的账号信息继续
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="username" className="text-base">用户名</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="请输入用户名"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="glass-input h-12 text-base"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="password" className="text-base">密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="glass-input h-12 text-base"
                />
              </div>
              {error && (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-6 pt-6">
              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={isLoading}
              >
                {isLoading ? '登录中...' : '登录'}
              </Button>
              <p className="text-center text-base text-muted-foreground">
                还没有账号？{' '}
                <Link href="/register" className="text-primary hover:underline">
                  立即注册
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

# Supabase 认证系统使用指南

## 概述

本项目使用 Supabase 作为后端服务，提供用户认证和数据存储功能。

## 主要功能

### 1. 数据库
- **类型**: Supabase PostgreSQL（关系型数据库）
- **表结构**: users 表存储用户信息

### 2. 认证方式
- **类型**: Supabase Auth（邮箱密码登录）
- **功能**: 用户注册、登录、退出、修改密码

### 3. 数据存储
- **状态**: Supabase Storage（暂未使用）

## 配置信息

### 环境变量
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=your_app_url
```

> ⚠️ **安全提醒**: 请将实际的环境变量值保存在 `.env.local` 文件中，不要提交到版本控制或文档中。

### 数据库表
- **表名**: `users`
- **结构**:
  - id (UUID, 主键)
  - username (TEXT, 唯一)
  - email (TEXT, 唯一)
  - password (TEXT, 哈希后)
  - nickname (TEXT, 可选)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)

## 使用方式

### 注册流程
1. 访问 `/register` 页面
2. 填写：
   - 用户名
   - 邮箱地址
   - 密码
   - 确认密码
3. 点击"注册"按钮
4. 注册成功后跳转到登录页面

### 登录流程
1. 访问 `/login` 页面
2. 填写：
   - 用户名
   - 密码
3. 点击"登录"按钮
4. 登录成功后跳转到首页

### 调试页面
- 访问 `/auth-debug` 页面测试完整的注册和登录流程

## API 使用示例

### 导入
```typescript
import { SupabaseAuth } from '@/lib/supabase-auth';
```

### 用户注册
```typescript
const result = await SupabaseAuth.register(
  'username',
  'user@example.com',
  'password123',
  'nickname' // 可选
);
```

### 用户登录
```typescript
const result = await SupabaseAuth.login('username', 'password123');
```

### 获取当前用户
```typescript
const user = await SupabaseAuth.getCurrentUser();
```

### 退出登录
```typescript
await SupabaseAuth.logout();
```

### 更新用户信息
```typescript
await SupabaseAuth.updateUser(userId, {
  nickname: '新昵称',
});
```

### 修改密码
```typescript
await SupabaseAuth.changePassword(userId, 'oldPassword', 'newPassword');
```

## Supabase 控制台

访问以下链接管理你的 Supabase 项目：
- **项目仪表板**: https://supabase.com/dashboard/project/nrc
- **数据库管理**: https://supabase.com/dashboard/project/nrc/editor
- **认证设置**: https://supabase.com/dashboard/project/nrc/auth/providers

## 优势

1. ✅ **免费额度大**: Supabase 提供 500MB 数据库存储
2. ✅ **稳定可靠**: 成熟的开源解决方案
3. ✅ **文档完善**: 详细的 API 文档和社区支持
4. ✅ **PostgreSQL**: 强大的关系型数据库，支持复杂查询

## 注意事项

1. **用户名唯一性**: 用户名和邮箱都是唯一的，重复会报错
2. **密码安全**: 目前使用简单哈希，生产环境应使用 bcrypt
3. **Session 管理**: 使用 Supabase Auth 的内置 session 功能
4. **局域网部署**: 适合局域网内部使用，无需外网访问

## 下一步

### 生产环境部署
如需部署到生产环境：

1. 在 Supabase 控制台设置环境变量
2. 配置域名和 SSL 证书
3. 启用 Row Level Security（RLS）策略
4. 配置 CORS 策略

### 功能扩展
可以扩展的功能：
1. 文件上传和存储
2. 实时功能（WebSocket）
3. 第三方登录（Google、GitHub）
4. 邮箱验证
5. 密码找回

## 故障排除

### 常见问题

#### 1. 连接失败
- 检查环境变量是否正确
- 检查浏览器控制台是否有错误
- 尝试清除 localStorage 并刷新

#### 2. 注册失败
- 检查邮箱格式是否正确
- 确认邮箱未被注册
- 检查 Supabase 控制台的认证设置

#### 3. 登录失败
- 确认用户名和密码正确
- 检查 users 表中是否有对应记录
- 查看浏览器控制台的错误信息

## 技术支持

- Supabase 文档: https://supabase.com/docs
- Supabase GitHub: https://github.com/supabase/supabase-js
- 社区论坛: https://github.com/supabase/supabase/discussions

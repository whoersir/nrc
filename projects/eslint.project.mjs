/**
 * ESLint 项目配置
 *
 * 自定义规则：
 * - 禁止 any 类型（需显式注解）
 * - 禁止 console.log（生产环境）
 * - 强制错误处理
 */

export default [
  ...await import('eslint/config'),
  {
    rules: {
      // 禁止 any 类型
      '@typescript-eslint/no-explicit-any': 'error',

      // 禁止 console.log（生产环境）
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

      // 强制 Promise await 或 catch
      '@typescript-eslint/no-floating-promises': 'warn',

      // 禁止 any 作为函数参数类型
      '@typescript-eslint/ban-types': 'warn',

      // 强制返回类型注解
      '@typescript-eslint/explicit-function-return-type': 'off',

      // 禁止未使用的变量
      'no-unused-vars': 'warn',

      // 一致的导入排序
      'simple-import-sort/imports': 'warn',

      // 强制使用 const
      'prefer-const': 'warn',

      // 禁止 any 类型的对象
      '@typescript-eslint/no-explicit-any': ['error', {
        'fixToUnknown': false,
      }],
    },
    settings: {
      'import/resolver': {
        typescript: true,
      },
    },
  },
];

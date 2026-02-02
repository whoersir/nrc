# NRC项目沙盒环境 - 完全隔离的容器
FROM node:18-alpine

# 安装系统依赖
RUN apk add --no-cache git bash curl

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "run", "dev"]

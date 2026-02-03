# NRC项目生产环境 - 参考官方 Next.js 模板
FROM alpine:3.13

# 使用国内镜像源
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tencent.com/g' /etc/apk/repositories \
    && apk add --update --no-cache nodejs npm

# 设置时区
RUN apk add tzdata && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo Asia/Shanghai > /etc/timezone

# 安装 HTTPS 证书
RUN apk add ca-certificates

# 设置工作目录
WORKDIR /app

# 复制包管理文件
COPY package*.json /app/

# 使用国内镜像源
RUN npm config set registry https://mirrors.cloud.tencent.com/npm/

# npm 安装依赖
RUN npm install

# 复制项目文件
COPY . /app

# 构建项目
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]

# 维萨拉短信辅助工具

## 环境要求

### node.js
Javascript 运行环境    
版本要求：**>= 16.0**

#### 安装方法
[下载](https://nodejs.org/en/download/)并运行 nodejs 对应系统版本安装包

```Bash
 $ node -v # 安装完成后可运行此命令，检查版本是否正确
 v16.14.0
```

### pm2
nodejs 进程管理工具    

#### 安装方法
```Bash
# 使用 npm 进行安装
$ npm install pm2@latest -g
```

## 应用启动方法

### 1. 设置配置文件

将 ```src/configs/config.ts.sample``` 改名为 ```config.ts```，并修改相应配置：
```Javascript
const config: Config = {
  nest: {
    port: 3001, // 应用运行时占用的端口号
    adminNum: '' // 系统异常时，接收短信的手机号
  },
  aliyun: { // 阿里云相关配置，可调用短信服务的账户
    accessKeyId: '', 
    accessKeySecret: '',
    endpoint: '',
  },
  vaisala: {
    host: '', // 维萨拉 api 地址
    username: '', // 登录用户名
    password: '', // 登录密码
  },
  crontab: {
    fetchEvent: '01 * * * * *', // 拉取事件的定时任务
    sendMsg: '30 * * * * *', // 发送短信的定时任务 
  },
};
```

### 2. 安装 node 依赖

```Bash
$ npm install
```

### 3. 生成 prisma 客户端

```Bash
$ npx prisma generate
```

### 4. 启动应用
**如使用 pm2 启动则不执行此步骤**
```Bash
$ npm run start
```

## pm2 管理启动和管理应用

### 1. 检查 pm2 是否安装成功
```Bash
$ pm2 -v
4.5.0 # 输出版本号则表示安装正确
```

### 2. 添加任务
```Bash
$ pm2 start <configPath>
# configPath 为 pm2 配置文件的绝对路径，文件位置为 ./pm2/service.config.js
# 输出结果为当前 pm2 管理中的 node 进程。其中 status 为 online 表示正在运行中，stopped 表示已经退出的进程
```

### 3. 查看任务进程
```Bash
$ pm2 ls <id>
# id 为 pm2 给进程分配的 id，可运行 pm2 ls 进行查看
```

### 4. 重启任务进程
```Bash
$ pm2 reload <id>
# id 为 pm2 给进程分配的 id，可运行 pm2 ls 进行查看
```

### 5. 停止任务
```Bash
$ pm2 stop <id>
# id 为 pm2 给进程分配的 id，可运行 pm2 ls 进行查看
```

### 6. 持久化
```Bash
$ pm2 save
# 持久化是保存运行中的进程列表，在系统重启后自动运行列表中的进程
```

## 目录结构
* ```./db: ``` sqlite 数据库
* ```./dist:``` 应用所在路径
* ```./logs:``` 日志
* ```./node_modules:``` 包依赖
* ```./src:``` 程序源文件
* ```./prisma:``` orm

module.exports = {
  apps: [
    {
      name: 'sms-service',
      script: 'npm run start:prod',
      cwd: 'D:\\Viewlink\\SMS\\sms-service', // 项目 dist 所在绝对路径
      instances: 1, // 运行实例数,
      autorestart: true, // 是否自动重启
      max_memory_restart: '1G', // 最大占用内存
      env: {
        NODE_ENV: 'production', // 环境变量
      },
    },
  ],
};

// 其他配置可参考 pm2 官方文档

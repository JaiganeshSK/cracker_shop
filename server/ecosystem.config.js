module.exports = {
  apps: [
    {
      name: 'cracker-shop-server',
      script: './server.js',
      cwd: './',
      instances: 'max', // Use all CPU cores for cluster mode
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};

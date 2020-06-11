module.exports = {
  apps: [
    {
      name: 'newspaper',
      script: './server.js',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      instances: 'max',
      exec_mode: 'cluster', // to load balance
      autorestart: true,
      watch: true,
      ignore_watch: ['node_modules', 'sessions', 'public'],
    },
  ],
};

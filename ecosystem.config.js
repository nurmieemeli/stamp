// PM2 process config. On the server: pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "stamp",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};

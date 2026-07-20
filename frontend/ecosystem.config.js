module.exports = {
  apps: [
    {
      name: "ParaisoWeb",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      watch: false,
      max_memory_restart: "1G",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: "./logs/error.log",
      out_file: "./logs/output.log",
      merge_logs: true,
      max_restarts: 5, // Limita a 5 reinicios
      restart_delay: 5000, // Espera 5 segundos entre reinicios
    },
  ],
};

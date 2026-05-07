import { createApp } from "./app.js";
import { config } from "./config/env.js";

const { app, close } = createApp();

const server = app.listen(config.port, config.host, () => {
  console.log(`Server is running on http://${config.host}:${config.port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(() => {
      close();
      process.exit(0);
    });
  });
}

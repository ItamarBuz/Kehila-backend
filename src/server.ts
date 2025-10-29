import app from "./app";
import { getEnv } from "./config/env";

const { PORT } = getEnv();

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

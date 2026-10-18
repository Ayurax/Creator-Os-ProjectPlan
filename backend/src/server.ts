import app from './app';
import { assertJwtConfig } from './utils/jwt';

const port = Number(process.env.PORT) || 3000;

assertJwtConfig();
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
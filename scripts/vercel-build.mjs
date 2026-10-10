import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) {
    console.error(`Failed to start ${command}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

// Preview deployments should not run migrations against a database. In
// particular, preview builds may not have production-scoped DATABASE_URL.
// Production migrations run before the production Next.js build.
const isVercelProduction =
  process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production";

if (isVercelProduction) {
  run("npx", ["prisma", "migrate", "deploy", "--config", "prisma7.config.ts"]);
} else {
  console.log("Skipping Prisma migrations outside a Vercel production build.");
}

run("npx", ["next", "build"]);

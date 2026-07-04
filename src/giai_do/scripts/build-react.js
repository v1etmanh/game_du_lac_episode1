const { spawn } = require("child_process");

const env = {
  ...process.env,
  NODE_OPTIONS: [process.env.NODE_OPTIONS, "--openssl-legacy-provider"]
    .filter(Boolean)
    .join(" ")
};

const child = spawn(process.execPath, [require.resolve("react-scripts/scripts/build")], {
  env,
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  }
  process.exit(code || 0);
});

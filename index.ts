import dotenv from "dotenv";
import { Command } from "commander";
import chalk from "chalk";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";

// 加载 .env.local 文件中的环境变量
dotenv.config({ path: ".env.local" });

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.error("OPENAI_API_KEY is not set in the environment variables.");
  process.exit(1);
}

const program = new Command();
const git = simpleGit();

function checkGitEnvironment() {
  const gitDir = path.join(process.cwd(), ".git");
  if (!fs.existsSync(gitDir)) {
    console.error(
      chalk.red(
        "Error: Not a git repository (or any of the parent directories)"
      )
    );
    process.exit(1);
  }
}

program
  .name("commitgenie")
  .description("AI-powered code review and git utilities")
  .version("0.1.0")
  .hook("preAction", () => {
    checkGitEnvironment();
  });

program
  .command("review")
  .description("Perform an AI-powered code review")
  .argument("<target>", "Branch, commit, or file to review")
  .option("-b, --branch <branch>", "Specify the base branch for comparison")
  .option("-c, --commit <commit>", "Specify a commit to review")
  .option(
    "-f, --file <file>",
    "Specify file(s) to review",
    (val: string, prev: string[]) => prev.concat([val]),
    [] as string[]
  )
  .option("--staged", "Review only staged changes")
  .option("-n, --lines <n>", "Limit the number of context lines", "5")
  .option(
    "--format <format>",
    "Specify output format (json, markdown)",
    "markdown"
  )
  .option("--verbose", "Show detailed review information")
  .option("--summary", "Show only review summary")
  .action(async (target, options) => {
    console.log(chalk.blue("Starting code review..."));
    console.log("Target:", target);
    console.log("Options:", options);

    try {
      let diff = "";

      if (options.staged) {
        diff = await git.diff(["--staged"]);
      } else if (options.commit) {
        diff = await git.diff([`${options.commit}^..${options.commit}`]);
      } else if (options.branch) {
        diff = await git.diff([options.branch, target]);
      } else if (options.file.length > 0) {
        diff = await git.diff([target, "--", ...options.file]);
      } else {
        diff = await git.diff([target]);
      }

      // TODO: Implement AI review logic here
      console.log(chalk.yellow("AI review not yet implemented"));
      console.log("Diff:", diff.slice(0, 200) + "..."); // Just showing first 200 chars for now
    } catch (error) {
      console.error(chalk.red("Error during review:"), error);
    }
  });

program.parse(process.argv);

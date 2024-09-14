#! /usr/bin/env node

import dotenv from "dotenv";
import { Command } from "commander";
import fs from "fs";
import path from "path";
import { createReviewCommand } from "./command/review/review";
import "simple-git";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.error("OPENAI_API_KEY is not set in the environment variables.");
  process.exit(1);
}

function checkGitEnvironment() {
  const gitDir = path.join(process.cwd(), ".git");
  if (!fs.existsSync(gitDir)) {
    console.error(
      "Error: Not a git repository (or any of the parent directories)"
    );
    process.exit(1);
  }
}

const program = new Command();

program
  .name("commitgenie")
  .description("AI-powered code review and git utilities")
  .version("0.1.0")
  .hook("preAction", () => {
    checkGitEnvironment();
  });

createReviewCommand(program);

program.parse(process.argv);

import { Command } from "commander";
import chalk from "chalk";
import simpleGit from "simple-git";
import { PromptTemplate } from "@langchain/core/prompts";
import { OpenAI } from "@langchain/openai";
import { reviewAction } from "./action";

export function createReviewCommand() {
  const git = simpleGit();

  return new Command("review")
    .description("Perform an AI-powered code review")
    .argument("[target]", "Branch, commit, or file to review")
    .option("-b, --branch <branch>", "Specify the base branch for comparison")
    .option("-c, --commit <commit>", "Specify a commit to review")
    .option(
      "-f, --file <file>",
      "Specify file(s) to review",
      (val: string, prev: string[]) => prev.concat([val]),
      [] as string[]
    )
    .option("--staged", "Review only staged changes")
    .option("-n, --lines <n>", "Limit the number of context lines", "15")
    .option(
      "--format <format>",
      "Specify output format (json, markdown)",
      "markdown"
    )
    .option("--verbose", "Show detailed review information")
    .option("--summary", "Show only review summary")
    .action(reviewAction);
}

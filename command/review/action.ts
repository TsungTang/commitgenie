import chalk from "chalk";
import simpleGit from "simple-git";
import { PromptTemplate } from "@langchain/core/prompts";
import { OpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";

const git = simpleGit();

export async function reviewAction(target: string, options: any) {
  console.log(chalk.blue("Starting code review..."));
  // console.log("Target:", target);
  // console.log("Options:", options);

  try {
    let diff = "";
    const contextLines = parseInt(options.lines);

    if (options.staged) {
      diff = await git.diff(["--staged", `-U${contextLines}`]);
    } else if (options.commit) {
      diff = await git.diff([
        `${options.commit}^..${options.commit}`,
        `-U${contextLines}`,
      ]);
    } else if (options.branch && target) {
      diff = await git.diff([options.branch, target, `-U${contextLines}`]);
    } else if (options.file.length > 0) {
      diff = await git.diff([
        target || "HEAD",
        "--",
        ...options.file,
        `-U${contextLines}`,
      ]);
    } else if (target) {
      diff = await git.diff([target, `-U${contextLines}`]);
    } else {
      console.error(
        chalk.red("Error: No target specified and --staged option not used.")
      );
      process.exit(1);
    }

    const llm = new OpenAI({
      modelName: "gpt-4-1106-preview",
      temperature: 0.7,
      maxTokens: 3000,
      streaming: true,
    });

    const template = `
    You are an experienced software developer performing a code review. 
    Please analyze the following git diff and provide a detailed review:

    {diff}

    Please provide your review in the following format:

    1. Summary of changes:
       Briefly summarize the overall changes in the diff.

    2. Code quality:
       Analyze the code quality, including readability, maintainability, and adherence to best practices.
       For each point, quote the relevant code snippet and provide your comment.

    3. Potential issues or concerns:
       Identify any potential bugs, security issues, or performance concerns.
       For each issue, quote the relevant code snippet and explain the problem.

    4. Suggestions for improvement:
       Offer specific suggestions to improve the code.
       For each suggestion, quote the relevant code snippet and provide your recommended changes.

    5. Positive aspects:
       Highlight any particularly well-written or clever parts of the code.
       Quote the relevant code snippets and explain why they are good.

    6. Overall assessment:
       Provide a brief overall assessment of the changes.

    For each section, ensure you quote relevant code snippets to support your points.
    Keep your response focused on the most important points, but provide enough detail for a thorough review.
    `;

    const prompt = new PromptTemplate({
      template,
      inputVariables: ["diff"],
    });

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());

    console.log(chalk.green("AI Review:"));

    const stream = await chain.stream({ diff: diff });

    for await (const chunk of stream) {
      process.stdout.write(chunk);
    }
  } catch (error) {
    console.error(chalk.red("Error during review:"), error);
  }
}

import chalk from 'chalk';
import simpleGit, { TaskOptions } from 'simple-git';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatOpenAI } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { getOpenAIConfig } from '../../config/openaiConfig';
const git = simpleGit();

type ReviewOptions = {
  args: string[];
  unified: string;
};

export async function reviewAction(options: ReviewOptions) {
  console.log(chalk.blue('Starting code review...'));

  const { apiKey, model } = getOpenAIConfig(); // Get API key and model

  // Check if API key is set
  if (!apiKey) {
    console.error(
      chalk.red("Error: OpenAI API key is not set. Please configure it using the 'config' command.")
    );
    process.exit(1);
  }

  try {
    const contextLines = parseInt(options.unified);
    const args: string[] = options.args && options.args.length > 0 ? options.args : ['HEAD'];

    const gitDiffCommand = `git diff ${args.join(' ')} -U${contextLines}`;
    const intentAnalysis = await analyzeUserIntent(gitDiffCommand);
    console.log(chalk.yellow(`${gitDiffCommand}: `), intentAnalysis);

    const diff = await git.diff([...args, `-U${contextLines}`]);

    if (!diff.trim()) {
      console.log(chalk.yellow('No changes detected. Nothing to review.'));
      return;
    }

    console.log(chalk.green('Changes detected. Starting AI review...'));

    const llm = new ChatOpenAI({
      modelName: model,
      temperature: 0.7,
      maxTokens: 4000,
      streaming: true,
      apiKey
    });

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 4000,
      chunkOverlap: 500
    });

    const diffChunks = await textSplitter.splitText(diff);

    const template = `
    As an experienced code reviewer, your task is to conduct a detailed review of the provided Git diff chunk. Your goal is to evaluate code quality, potential issues, and offer suggestions for improvement in a concise and structured manner.

    You will be provided with the following Git diff content:

    {diffChunk}

    Your tasks as a code reviewer are:

    1. Review **only** the added, edited, or deleted lines.
    2. Analyze code quality, focusing on readability, maintainability, and adherence to best practices.
    3. Identify any potential bugs, performance concerns, or security vulnerabilities.
    4. Provide clear and actionable suggestions for improvement.

    Use the following format for your feedback:

    '[tag] - <file path>:<line number(s)> - <comment>'

    Tags to use:
    - **[CRITICAL]**: For serious issues that must be resolved (e.g., bugs, security risks).
    - **[SUGGESTION]**: For recommended improvements or alternative approaches.
    - **[STYLE]**: For style or formatting issues (e.g., inconsistent naming, spacing).
    - **[IMPROVEMENT]**: For opportunities to optimize code or improve performance.
    - **[NICE TO HAVE]**: For optional improvements that are not necessary for approval.

    If no issues are found, simply state: "No feedback for this chunk."

    Please provide your review in Traditional Chinese (繁體中文).
    `;

    const prompt = new PromptTemplate({
      template,
      inputVariables: ['diffChunk']
    });

    const chain = prompt.pipe(llm as any).pipe(new StringOutputParser());

    console.log(chalk.green('AI Review:'));

    for (const chunk of diffChunks) {
      const stream = await chain.stream({ diffChunk: chunk });
      for await (const response of stream) {
        process.stdout.write(response);
      }
      console.log('\n---\n');
    }

    const summaryTemplate = `
    Based on the reviews of all diff chunks, provide a concise summary in Traditional Chinese (繁體中文) that includes:
    1. An overview of the overall changes in this review
    2. A list of the main files that were modified
    3. The most important feedback points
    4. Brief overall recommendations for the user to improve code quality

    Keep the summary concise and clear.
    `;

    const summaryPrompt = new PromptTemplate({
      template: summaryTemplate,
      inputVariables: []
    });

    const summaryChain = summaryPrompt.pipe(llm as any).pipe(new StringOutputParser());

    console.log(chalk.green('Overall Summary:'));
    const summaryStream = await summaryChain.stream({});
    for await (const chunk of summaryStream) {
      process.stdout.write(chunk);
    }
  } catch (error) {
    console.error(chalk.red('Error during review:'), error);
  }
}

async function analyzeUserIntent(gitDiffCommand: string): Promise<string> {
  const { model, apiKey } = getOpenAIConfig();
  const llm = new ChatOpenAI({
    modelName: model,
    temperature: 0.3,
    maxTokens: 100,
    apiKey
  });

  const template = `
  Git Diff command: {gitDiffCommand}

  Please provide a concise one-sentence explanation in Traditional Chinese (繁體中文) of what this command does. If it appears to be an invalid command, respond with "This may be an invalid command."
  `;

  const prompt = new PromptTemplate({
    template,
    inputVariables: ['gitDiffCommand']
  });

  const chain = prompt.pipe(llm as any).pipe(new StringOutputParser());

  return chain.invoke({ gitDiffCommand });
}

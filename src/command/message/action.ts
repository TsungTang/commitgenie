import chalk from 'chalk';
import simpleGit from 'simple-git';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatOpenAI } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { isGitRepository } from '../../utils';
import { COMMON_IGNORE_FILES, getOpenAIConfig } from '../../config';
const git = simpleGit();

type MessageOptions = {
  commit?: string;
  files?: string[];
  staged?: boolean;
  unified: string;
};

export async function messageAction(options: MessageOptions) {
  console.log(chalk.blue('Generating commit message...'));

  const { apiKey, model } = getOpenAIConfig();

  if (!apiKey) {
    console.error(
      chalk.red("Error: OpenAI API key is not set. Please configure it using the 'config' command.")
    );
    process.exit(1);
  }

  isGitRepository();

  try {
    let diff = '';
    const contextLines = parseInt(options.unified);
    const baseArgs: string[] = [];
    const ignoreArgs = COMMON_IGNORE_FILES.map(file => `:!${file}`);

    if (options.commit) {
      baseArgs.push(`${options.commit}^..${options.commit}`);
    } else if (options.files && options.files.length > 0) {
      baseArgs.push('HEAD', '--', ...options.files);
    } else if (options.staged) {
      baseArgs.push('--staged');
    } else {
      baseArgs.push('--staged');
    }

    const finalArgs = [...baseArgs, `-U${contextLines}`, '--', '.', ...ignoreArgs];

    diff = await git.diff(finalArgs);

    if (!diff.trim()) {
      console.log(chalk.yellow('No changes detected. Cannot generate commit message.'));
      return;
    }

    console.log(chalk.green('Changes detected. Generating...'));

    const llm = new ChatOpenAI({
      modelName: model,
      temperature: 0.7,
      maxTokens: 500,
      streaming: false,
      apiKey
    });

    // Optional: Use text splitter if diff is too large, but aim to generate one commit message
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 3000,
      chunkOverlap: 400
    });

    const diffChunks = await textSplitter.splitText(diff);

    // Combine chunks into one prompt if possible
    const combinedDiff = diffChunks.join('\n');

    const template = `
You are an experienced developer tasked with writing a concise and clear commit message based on the following Git diff content, adhering to the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) specification.

## Types
- \`feat\` - a new feature
- \`fix\` - a bug fix
- \`docs\` - documentation only changes
- \`style\` - changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)
- \`refactor\` - a code change that neither fixes a bug nor adds a feature
- \`perf\` - a code change that improves performance
- \`test\` - adding missing tests or correcting existing tests
- \`build\` - changes that affect the build system or external dependencies
- \`ci\` - changes to our CI configuration files and scripts
- \`chore\` - other changes that don't modify src or test files

## Commit Message Structure

\`\`\`
<type>[optional scope]: <description>
- <bullet point 1>
- <bullet point 2>
...
\`\`\`

- **Title**: Should be within 72 characters and follow the '<type>[optional scope]: <description>' format.
- **Bullet Points**: Use concise bullet points to summarize key changes.

## Git Diff:
{diffChunk}

Please generate a single, well-structured commit message that summarizes the changes made, following the Conventional Commits guidelines provided above. The commit message should be in English and include a title and bullet points as specified.
`;

    const prompt = new PromptTemplate({
      template,
      inputVariables: ['diffChunk']
    });

    const chain = prompt.pipe(llm as any).pipe(new StringOutputParser());

    const commitMessage = await chain.invoke({ diffChunk: combinedDiff });

    console.log(chalk.green('AI-generated commit message:'));
    console.log(`\n${commitMessage.trim()}\n`);
  } catch (error) {
    console.error(chalk.red('Error generating commit message:'), error);
  }
}

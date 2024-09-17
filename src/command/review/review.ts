import { Command } from 'commander';
import { reviewAction } from './action';

export const createReviewCommand = (program: Command) => {
  program
    .command('review [args...]')
    .description('Perform AI-assisted code review based on git diff')
    .option('-U, --unified <n>', 'Generate diffs with <n> lines of context', '10')
    .allowUnknownOption(true)
    .action((args, options) => reviewAction({ ...options, args }))
    .addHelpText(
      'after',
      `
Description:
  This command performs an AI-assisted code review based on the output of git diff.
  It accepts all standard git diff arguments and options.

Examples:
  1. Review staged changes:
     $ commitgenie review --staged

  2. Review changes in the working directory:
     $ commitgenie review

  3. Review changes in a specific commit:
     $ commitgenie review <commit-hash>

  4. Compare two commits:
     $ commitgenie review <commit1>..<commit2>

  5. Compare two branches:
     $ commitgenie review <branch1>..<branch2>

  6. Review changes in specific files:
     $ commitgenie review -- <file1> <file2>

  7. Review changes with more context lines:
     $ commitgenie review -U5

  8. Combine multiple options:
     $ commitgenie review --staged -U5 -- src/

Notes:
  - This command mimics git diff syntax. Any arguments valid for git diff can be used.
  - The -U or --unified option sets the number of context lines for the diff.
  - Use -- to separate paths from other options, especially when reviewing specific files.
    `
    );
};

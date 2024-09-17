import chalk from 'chalk';
import simpleGit from 'simple-git';

export const isGitRepository = async () => {
  const git = simpleGit();

  try {
    await git.raw(['rev-parse', '--is-inside-work-tree']);
  } catch (error) {
    console.error(chalk.red('Error: The current directory is not a Git repository.'));
    process.exit(1);
  }
};

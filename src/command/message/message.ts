import { Command } from "commander";
import { messageAction } from "./action";

export const createMessageCommand = (program: Command) => {
  program
    .command("message")
    .description("Generate AI-assisted commit message")
    .option("-c, --commit <hash>", "Generate message for a specific commit")
    .option("-f, --files <files...>", "Generate message for specific files")
    .option("-s, --staged", "Generate message for staged changes")
    .option(
      "-U, --unified <n>",
      "Generate diffs with <n> lines of context",
      "3"
    )
    .action(messageAction)
    .addHelpText(
      "after",
      `
Description:
  This command generates an AI-assisted commit message based on the changes in a commit, specific files, or staged changes.

Examples:
  1. Generate message for a specific commit:
     $ commitgenie message -c abc123

  2. Generate message for specific files:
     $ commitgenie message -f src/index.ts src/utils.ts

  3. Generate message for staged changes:
     $ commitgenie message -s

  4. Generate message with more context lines:
     $ commitgenie message -s -U5

Notes:
  - If no option is specified, it will generate a message for the staged changes.
  - The -c, -f, and -s options are mutually exclusive. If multiple are provided, only one will be used in the following priority order: commit > files > staged.
  - The -U or --unified option sets the number of context lines for the diff.
    `
    );
};

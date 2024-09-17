# CommitGenie

CommitGenie is a CLI tool that leverages LLM technology to assist in the software development process. It currently offers automated code review functionality, with plans to add automatic generation of git commit messages and changelogs in the future.

## Features

- **AI-Powered Code Review**: Utilizes OpenAI's GPT-4 model to perform intelligent analysis and commentary on git diffs.

  - Review staged changes, working directory changes, specific commits, or differences between branches.
  - Customize the number of context lines for better understanding of changes.
  - Review specific files or entire repositories.
  - Supports reviewing pure text content or content from a file.

- **AI-Assisted Commit Message Generation**: Automatically generates meaningful commit messages based on code changes.

  - Generate messages for staged changes, specific commits, or selected files.
  - Customizable context lines for more accurate message generation.

- **Flexible Configuration**: Easy setup and management of OpenAI API key for seamless integration.

- **Developer-Friendly CLI**: Intuitive command-line interface with comprehensive help text and examples for each command.

- **Git Integration**: Seamlessly works with your existing Git workflow, supporting various Git diff options and arguments.

## Prerequisites

- # Node.js (version 18 or higher)

## Installation

To install CommitGenie globally, run: `npm install -g @tsungtanglee/commitgenie`

## Local Development and Testing

To set up and test CommitGenie locally, follow these steps:

1. Clone the repository:

   ```
   git clone https://github.com/your-username/commitgenie.git
   cd commitgenie
   ```

2. Install dependencies:

   ```
   bun install
   ```

3. Build the project:

   ```
   bun run build
   ```

4. Create a symlink for global usage:

   ```
   npm link
   ```

5. Test the CLI:

   ```
   commitgenie --version
   ```

   This should display the version number of CommitGenie.

6. Run a command:

   ```
   commitgenie <command>
   ```

   Replace `<command>` with any available CommitGenie command to test its functionality.

7. To unlink after testing:
   ```
   npm unlink commitgenie
   ```

Note: Make sure you have set up your OpenAI API key in the `.env.local` file or as an environment variable before running the commands.

For more detailed information on available commands and usage, refer to the documentation above.

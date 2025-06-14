#!/usr/bin/env node

import { Command } from 'commander';
import 'simple-git';
import { createMessageCommand } from './command/message/message';
import { createReviewCommand } from './command/review/review';
import { createConfigCommand } from './command/config/config';
import { getLLMConfig, COMMANDS_WITHOUT_API_KEY, TCommandWithoutApiKey } from './config';

const program = new Command();

program
  .name('commitgenie')
  .description('AI-powered code review and git utilities')
  .version('0.1.0')
  .hook('preAction', (thisCommand, actionCommand) => {
    if (!COMMANDS_WITHOUT_API_KEY.includes(actionCommand.name() as TCommandWithoutApiKey)) {
      try {
        const { apiKey, provider } = getLLMConfig();
        if (!apiKey) {
          console.error(
            `Error: ${provider} API key is not set. Please configure it using the config command.`
          );
          process.exit(1);
        }
      } catch (error) {
        console.error('Error:', (error as Error).message);
        process.exit(1);
      }
    }
  });

createReviewCommand(program);
createMessageCommand(program);
createConfigCommand(program);
program.parse(process.argv);

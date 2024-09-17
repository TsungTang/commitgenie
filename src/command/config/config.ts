import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import os from 'os';

const configFilePath = path.join(os.homedir(), '.commitgenie_config.json');

export const createConfigCommand = (program: Command) => {
  program
    .command('config')
    .description('Set OpenAI API key and model')
    .option('-k, --api-key <key>', 'OpenAI API key')
    .option('-m, --model <model>', 'OpenAI model to use (e.g., gpt-4)', 'gpt-4o-mini')
    .action(options => {
      let config = {
        apiKey: '',
        model: 'gpt-4o-mini' // Default model
      };

      if (fs.existsSync(configFilePath)) {
        const existingConfig = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
        config = {
          apiKey: existingConfig.apiKey || config.apiKey,
          model: existingConfig.model || config.model
        };
      }

      if (options.apiKey) {
        config.apiKey = options.apiKey;
      }
      if (options.model) {
        config.model = options.model;
      }

      // Save the updated configuration to a JSON file
      fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
      console.log('Configuration saved successfully.');
    });
};

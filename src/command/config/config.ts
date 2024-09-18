import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import os from 'os';
import inquirer from 'inquirer';

const configFilePath = path.join(os.homedir(), '.commitgenie_config.json');

interface ConfigQuestion {
  type: string;
  name: string;
  message: string;
  default: string;
}

const promptConfig = async (existingConfig: { apiKey: string; model: string }) => {
  return inquirer.prompt<{ apiKey: string; model: string }>([
    {
      type: 'password',
      name: 'apiKey',
      message: 'Enter your OpenAI API key:',
      mask: '*',
      validate: (value: string) => {
        if (value.length === 0) {
          return 'Please enter a valid OpenAI API key.';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'model',
      message: 'Enter the OpenAI model to use:',
      default: existingConfig.model || 'gpt-4o-mini',
      validate: (value: string) => {
        if (value.length === 0) {
          return 'Please enter a valid OpenAI model.';
        }
        return true;
      }
    }
  ]);
};

export const createConfigCommand = (program: Command) => {
  program
    .command('config')
    .description('Set OpenAI API key and model')
    .option('-k, --api-key <key>', 'OpenAI API key')
    .option('-m, --model <model>', 'OpenAI model to use (e.g., gpt-4-1106-preview)')
    .action(async options => {
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

      if (!options.apiKey && !options.model) {
        // No options provided, use interactive mode
        config = await promptConfig(config);
      } else {
        if (options.apiKey) config.apiKey = options.apiKey;
        if (options.model) config.model = options.model;
      }

      // Save the updated configuration to a JSON file
      fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
      console.log('Configuration saved successfully.');
    });
};

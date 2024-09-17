export const COMMANDS_WITHOUT_API_KEY = ['config'] as const;
export type TCommandWithoutApiKey = (typeof COMMANDS_WITHOUT_API_KEY)[number];

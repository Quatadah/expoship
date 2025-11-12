import { env } from '../../lib/env';

type ChatCompletionMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type ChatCompletionRequest = {
  model?: string;
  messages: ChatCompletionMessage[];
  temperature?: number;
  max_tokens?: number;
};

type ChatCompletionResponse = {
  id: string;
  choices: Array<{
    index: number;
    message: ChatCompletionMessage;
  }>;
};

export const isOpenAIConfigured = () => Boolean(env.openAiApiKey);

export const createChatCompletion = async (
  payload: ChatCompletionRequest
): Promise<ChatCompletionResponse> => {
  if (!isOpenAIConfigured()) {
    throw new Error(
      'OpenAI is not configured. Set EXPO_PUBLIC_OPEN_AI_API_KEY to enable AI features.'
    );
  }

  const response = await fetch(`${env.openAiBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.openAiApiKey}`,
    },
    body: JSON.stringify({
      model: payload.model ?? 'gpt-4o-mini',
      messages: payload.messages,
      temperature: payload.temperature ?? 0.7,
      max_tokens: payload.max_tokens ?? 300,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI request failed: ${error}`);
  }

  return (await response.json()) as ChatCompletionResponse;
};

export const generateProductIdeas = async (prompt: string) => {
  const completion = await createChatCompletion({
    messages: [
      {
        role: 'system',
        content:
          'You are an AI product strategist helping founders ideate SaaS features.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  return completion.choices[0]?.message.content ?? '';
};


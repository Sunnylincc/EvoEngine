import OpenAI from "openai";

export interface LLMProvider {
  complete(prompt: string): Promise<string>;
}

export class OpenAIProvider implements LLMProvider {
  private readonly client: OpenAI;

  constructor(private readonly modelName: string, private readonly temperature: number) {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async complete(prompt: string): Promise<string> {
    const response = await this.client.responses.create({
      model: this.modelName,
      temperature: this.temperature,
      input: prompt
    });

    return response.output_text || "";
  }
}

export class MockProvider implements LLMProvider {
  async complete(prompt: string): Promise<string> {
    return `MOCK_RESPONSE: ${prompt.slice(0, 120)}`;
  }
}

// @fileOverview A conversational AI agent for the chat panel.
//
// - continueChat - A function that continues a conversation.
// - ChatInput - The input type for the continueChat function.
// - ChatOutput - The return type for the continueChat function.

'use server';

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {Message, Part} from 'genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model', 'system']),
  text: z.string(),
});

const ChatInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
  prompt: z.string().describe('The user\'s prompt.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI\'s response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function continueChat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async ({history, prompt}) => {
    const systemPrompt = `You are an expert assistant for the ZENIT platform, specializing in GIS, Artificial Intelligence, Data Analysis, and Finance.
Your tone should be formal, clear, and concise, avoiding overly technical jargon.
Your goal is to help users with their questions about the platform, spatial analysis, and data visualization. Keep your answers brief and to the point.
If the user's query is unclear, ask clarifying questions to better understand their needs before providing a detailed response.`;

    const convertToParts = (text: string): Part[] => [{text}];
    const messages: Message[] = [
      ...history.map(h => ({
        role: h.role,
        content: convertToParts(h.text),
      })),
      {role: 'user', content: convertToParts(prompt)},
    ];

    const {output} = await ai.generate({
      model: googleAI.model('gemini-pro'),
      prompt,
      history: messages,
      system: systemPrompt,
      output: {
        schema: z.object({
          response: z.string(),
        }),
      },
    });

    return output ?? {response: 'No se pudo obtener una respuesta.'};
  }
);

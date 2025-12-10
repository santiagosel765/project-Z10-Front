
// @fileOverview An AI agent that generates insights for the dashboard homepage.
//
// - getDashboardInsights - A function that returns tips or news.
// - DashboardInsightInput - The input type for the getDashboardInsights function.
// - DashboardInsightOutput - The return type for the getDashboardInsights function.

'use server';

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';

const DashboardInsightInputSchema = z.object({
  insightType: z.enum(['tips', 'news']).describe('The type of insight to generate.'),
  additionalContext: z.string().optional().describe('Any additional context for the generation.'),
});
export type DashboardInsightInput = z.infer<typeof DashboardInsightInputSchema>;

const DashboardInsightOutputSchema = z.object({
  content: z.string().describe('The generated content, either a tip or a news item.'),
});
export type DashboardInsightOutput = z.infer<typeof DashboardInsightOutputSchema>;

export async function getDashboardInsights(input: DashboardInsightInput): Promise<DashboardInsightOutput> {
  const isTips = input.insightType === 'tips';
  const isNews = input.insightType === 'news';
  return dashboardInsightsFlow({...input, isTips, isNews});
}

const dashboardInsightsPrompt = ai.definePrompt({
  name: 'dashboardInsightsPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: {
    schema: DashboardInsightInputSchema.extend({
        isTips: z.boolean().optional(),
        isNews: z.boolean().optional(),
    }),
  },
  output: {
    schema: DashboardInsightOutputSchema,
  },
  prompt: `
  {{#if isTips}}
  You are an expert in geographic data analysis, map design and creation, a data scientist, and an artificial intelligence specialist.
  Your task is to generate a short, actionable tip or recommendation for performing spatial analysis.
  The tip should be easy for a business user to understand. Keep it to one or two sentences.
  The response must be in Spanish.
  Example: "Al superponer datos de ventas con mapas de densidad de población, puede identificar mercados sin explotar y optimizar la ubicación de nuevas sucursales."
  {{/if}}

  {{#if isNews}}
  You are a copywriter specialist. Your tone should be clear, informal but respectful.
  Your task is to generate a brief summary of a recent, relevant news item or trend related to the intersection of GIS and finance.
  Mention the source or context, and include a link to the source if possible. Keep it to one or two sentences.
  The response must be in Spanish. If the source is in English, translate the summary to Spanish.
  Example: "La aseguradora 'Geospatial Insure' ha lanzado pólizas basadas en la ubicación en tiempo real del cliente, usando tecnología de geofencing para micro-seguros. (Fuente: TechCrunch - https://techcrunch.com/geospatial-insurance)"
  {{/if}}

  {{#if additionalContext}}
  Additional Context: {{{additionalContext}}}
  {{/if}}

  Generate the content based on the requested insightType.
  Follow the JSON schema for the output.
  `,
});

const dashboardInsightsFlow = ai.defineFlow(
  {
    name: 'dashboardInsightsFlow',
    inputSchema: DashboardInsightInputSchema.extend({
        isTips: z.boolean().optional(),
        isNews: z.boolean().optional(),
    }),
    outputSchema: DashboardInsightOutputSchema,
  },
  async input => {
    const {output} = await dashboardInsightsPrompt(input);
    return output!;
  }
);

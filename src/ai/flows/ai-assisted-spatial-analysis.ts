// @fileOverview A GIS analyst AI assistant for spatial analysis tasks.
//
// - aiAssistedSpatialAnalysis - A function that handles the spatial analysis process.
// - AiAssistedSpatialAnalysisInput - The input type for the aiAssistedSpatialAnalysis function.
// - AiAssistedSpatialAnalysisOutput - The return type for the aiAssistedSpatialAnalysis function.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiAssistedSpatialAnalysisInputSchema = z.object({
  analysisType: z.enum(['overlay', 'proximity', 'hotspot']).describe('The type of spatial analysis to perform.'),
  layerData: z.string().describe('The main GIS layer data as a GeoJSON string.'),
  parameters: z.record(z.any()).describe('The parameters for the spatial analysis.'),
  usePublicData: z.boolean().describe('Whether to use public data sources to augment the analysis.'),
  additionalContext: z.string().optional().describe('Any additional context or instructions for the AI.'),
});
export type AiAssistedSpatialAnalysisInput = z.infer<typeof AiAssistedSpatialAnalysisInputSchema>;

const AiAssistedSpatialAnalysisOutputSchema = z.object({
  analysisResult: z.string().describe('The result of the spatial analysis as a GeoJSON string.'),
  dataSourcesUsed: z.array(z.string()).describe('The public data sources used for the analysis (e.g., INE, SEGEPLAN, MAGA).'),
  analysisSummary: z.string().describe('A summary of the spatial analysis process and findings.'),
});
export type AiAssistedSpatialAnalysisOutput = z.infer<typeof AiAssistedSpatialAnalysisOutputSchema>;

export async function aiAssistedSpatialAnalysis(input: AiAssistedSpatialAnalysisInput): Promise<AiAssistedSpatialAnalysisOutput> {
  return aiAssistedSpatialAnalysisFlow(input);
}

const aiAssistedSpatialAnalysisPrompt = ai.definePrompt({
  name: 'aiAssistedSpatialAnalysisPrompt',
  input: {
    schema: AiAssistedSpatialAnalysisInputSchema,
  },
  output: {
    schema: AiAssistedSpatialAnalysisOutputSchema,
  },
  prompt: `You are an expert GIS analyst, skilled in performing spatial analysis and utilizing public data sources to enhance analysis results.

  You will take into account the users request, and based on that use public data sources if appropriate.

  You will perform the following spatial analysis: {{{analysisType}}}
  Using the following layer data: {{{layerData}}}
  With the following parameters: {{{parameters}}}
  And the following additional context: {{{additionalContext}}}

  The user has indicated whether to use public data sources: {{{usePublicData}}}
  If so, consider data from INE (National Statistics Institute), SEGEPLAN (General Secretariat of Planning), and MAGA (Ministry of Agriculture).

  Return the analysis result as a GeoJSON string, list the data sources used, and provide a summary of the analysis.
  Make sure to include links if possible.
  Follow the JSON schema for the output.
  {
    analysisResult: "...",
    dataSourcesUsed: ["INE", "SEGEPLAN", "MAGA"],
    analysisSummary: "..."
  }`,
});

const aiAssistedSpatialAnalysisFlow = ai.defineFlow(
  {
    name: 'aiAssistedSpatialAnalysisFlow',
    inputSchema: AiAssistedSpatialAnalysisInputSchema,
    outputSchema: AiAssistedSpatialAnalysisOutputSchema,
  },
  async input => {
    const {output} = await aiAssistedSpatialAnalysisPrompt(input);
    return output!;
  }
);

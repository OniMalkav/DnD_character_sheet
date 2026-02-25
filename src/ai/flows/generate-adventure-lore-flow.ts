'use server';
/**
 * @fileOverview A Genkit flow for generating creative lore snippets, character descriptions, or minor encounter ideas.
 *
 * - generateAdventureLore - A function that generates adventure lore based on a text prompt.
 * - GenerateAdventureLoreInput - The input type for the generateAdventureLore function.
 * - GenerateAdventureLoreOutput - The return type for the generateAdventureLore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAdventureLoreInputSchema = z
  .string()
  .describe('A text prompt to generate adventure lore, character descriptions, or encounter ideas.');
export type GenerateAdventureLoreInput = z.infer<typeof GenerateAdventureLoreInputSchema>;

const GenerateAdventureLoreOutputSchema = z
  .string()
  .describe('The generated adventure lore, character description, or encounter idea.');
export type GenerateAdventureLoreOutput = z.infer<typeof GenerateAdventureLoreOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateAdventureLorePrompt',
  input: {schema: GenerateAdventureLoreInputSchema},
  output: {schema: GenerateAdventureLoreOutputSchema},
  prompt: `You are an imaginative Dungeon Master with a knack for creating compelling lore, interesting characters, and exciting encounters.

Based on the following prompt, generate a creative and concise idea for an adventure lore snippet, a character description, or a minor encounter. Focus on inspiring a roleplaying session.

Prompt: {{{input}}}`,
});

const generateAdventureLoreFlow = ai.defineFlow(
  {
    name: 'generateAdventureLoreFlow',
    inputSchema: GenerateAdventureLoreInputSchema,
    outputSchema: GenerateAdventureLoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function generateAdventureLore(input: GenerateAdventureLoreInput): Promise<GenerateAdventureLoreOutput> {
  return generateAdventureLoreFlow(input);
}

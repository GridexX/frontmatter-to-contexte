import { z } from "zod";
import { DATE_REGEX, FRENCH_DATE_REGEX } from "./constants";

// Type received from the front matter
export const frontMatterAttributesSchema = z.object({
  aliases: z.array(z.string()).min(1),
  city: z.string(),
  wings: z.array(z.string()).optional(),
  sets: z.number().optional(),
  marquants: z.number().optional(),
  propals: z.number().optional(),
  close: z.number().optional(),
  date_prevus: z.number().optional(),
  instant_dates: z.number().optional(),
  kc: z.number().optional(),
  pull: z.number().optional(),
  fc: z.number().optional(),
  date: z.string().regex(DATE_REGEX).optional(),
});

// Intermediary type used for the transformation
export interface MarkdownFile {
  filePath: string;
  fileName: string;
  markdownContent: string;
  frontMatter: FrontMatterAttributes;
}

const frenchDate = z.string().regex(FRENCH_DATE_REGEX);

export const generateSentence = z.object({
  // Date in a french format
  session: z.string(),
  date: frenchDate,
  sets: z.number().positive(),
  propal: z.number().positive(),
  close: z.number().positive(),
  wings: z.array(z.string()),
  city: z.string(),
});

export type GenerateSentence = z.infer<typeof generateSentence>;

export const generateContexte = z.object({
  date: frenchDate,
  contexte: z.string(),
  stats: z.object({
    sets: z.number().positive(),
    propal: z.number().positive(),
    close: z.number().positive(),
  }),
});

export type GenerateContexte = z.infer<typeof generateContexte>;

// Final type saved to the frontmatter
export type FrontMatterAttributes = z.infer<typeof frontMatterAttributesSchema>;

export const finalFrontMatterSchema = z
  .object({
    description: z.string(),
    date: z.string(),
  })
  .merge(frontMatterAttributesSchema)
  .required();

export type FinalFrontMatter = z.infer<typeof finalFrontMatterSchema>;

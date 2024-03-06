import { AnyZodObject, date } from "zod";
import {
  FinalFrontMatter,
  FrontMatterAttributes,
  GenerateContexte,
  MarkdownFile,
  frontMatterAttributesSchema,
} from "./types";
import fs from "fs";
import yaml from "js-yaml";
import logger from "./logger";
import { CONTEXT_TEXT, DATE_REGEX, NEXT_SECTION_TEXT } from "./constants";

export const readFile = (filePath: string): string | null => {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    logger.error(`Error reading file: ${error}`);
    return null;
  }
};

export const getMarkdownContent = (content: string): string => {
  // This function should return the content of the markdown file
  // It cut the front matter from the content
  const frontMatterPattern = /^(---\n[\s\S]+?\n---\n\n)/;
  return content.replace(frontMatterPattern, "");
};

export const extractFrontMatter = (markdownContent: string): string | null => {
  const frontMatterPattern = /^---\n([\s\S]+?)\n---/;
  const match = markdownContent.match(frontMatterPattern);
  if (match) {
    return match[1];
  } else {
    logger.error("Front matter not found in the Markdown file.");
    return null;
  }
};

export const getAttributesFrontMatter = (
  frontMatterStr: string,
): FrontMatterAttributes | null => {
  const frontMatter = yaml.load(frontMatterStr);
  const result = frontMatterAttributesSchema.safeParse(frontMatter);
  if (result.success) {
    return result.data;
  } else {
    logger.error(`Error parsing front matter: ${result.error}`);
    return null;
  }
};

export const extractDateFromString = (str: string): string | null => {
  return str.match(DATE_REGEX)?.[1] ?? null;
};

type DescriptionFields = {
  alias: string;
  city: string;
  wings: string[];
};

export const generateDescription = (description: DescriptionFields): string => {
  const { alias, city, wings } = description;
  const wingsFormatted = wings.join(", ").replace(/,([^,]*)$/, " et$1") || [];
  const session = removeDateFromAlias(alias)
    .replace("Session", "")
    .replace("session", "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return `Session ${session} à ${city} avec ${wingsFormatted}`;
};

export const convertAttributesToFinalFrontMatter = (
  fileName: string,
  attributes: FrontMatterAttributes,
): FinalFrontMatter => {
  const dateInFileName = extractDateFromString(fileName);
  const dateInAlias = extractDateFromString(attributes.aliases[0]);

  const date = dateInFileName ?? dateInAlias ?? "";
  if (!date) {
    logger.error(
      `Date not found in the filename or the alias of the file ${fileName}`,
    );
  }

  return {
    aliases: attributes.aliases,
    city: attributes.city,
    wings: attributes.wings ?? [],
    sets: attributes.sets ?? 0,
    marquants: attributes.marquants ?? 0,
    propals: attributes.propals ?? 0,
    close: attributes.close ?? 0,
    date_prevus: attributes.date_prevus ?? 0,
    instant_dates: attributes.instant_dates ?? 0,
    kc: attributes.kc ?? 0,
    pull: attributes.pull ?? 0,
    fc: attributes.fc ?? 0,
    date: date,
    description: generateDescription({
      alias: attributes.aliases[0],
      city: attributes.city,
      wings: attributes.wings ?? [],
    }),
  };
};

const removeDateFromAlias = (alias: string): string => {
  const dateMatch = alias.match(DATE_REGEX);
  if (dateMatch) {
    // Remove the date from the alias and replace multiple spaces by one
    return alias
      .replace(dateMatch[0], "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }
  return alias;
};

export const generateContextSentenceFromFinalAttributes = (
  finalFrontMatter: FinalFrontMatter,
): string => {
  const { date, description, sets, propals, close } = finalFrontMatter;
  const dateFrench = extractDateAndConvertInFrench(date);
  if (!dateFrench) {
    logger.error(
      `Date not found in the final front matter: ${finalFrontMatter}`,
    );
  }
  return `${dateFrench} ${description}.\n${sets}/${propals}/${close}\n`;
};

// This function returns the date in french format or null if the date is not found
const extractDateAndConvertInFrench = (string: string) => {
  // With a regex extract the date from the filename or the alias. It is in format YYYY-MM-DD
  // Then split the string with '-' as separator
  try {
    const dateMatch = string.match(DATE_REGEX);
    if (dateMatch) {
      return dateMatch[4] + "/" + dateMatch[3] + "/" + dateMatch[2];
    }
  } catch (error) {
    logger.error(`Error extracting date from string ${string}: ${error}`);
  }
  return null;
};

export const generateNewMarkdownContent = (
  markdownContent: string,
  contexteStr: string,
  forceWriting: boolean,
): string | undefined => {
  // Check if there are other different caracters from \n or whitespace between the contexte and the next section (Objectifs)
  const contexteEndIndex = markdownContent.indexOf(NEXT_SECTION_TEXT);
  const contexteIndex = markdownContent.indexOf(CONTEXT_TEXT);
  const isContentBetweenSection =
    contexteEndIndex - contexteIndex !== CONTEXT_TEXT.length;

  if (isContentBetweenSection) {
    logger.warn("There are words between the contexte and the next section");
    if (!forceWriting) {
      ("You can force the writing with the -f option");
      return;
    }
  }

  const newMarkdownContent =
    markdownContent.slice(0, contexteIndex) +
    CONTEXT_TEXT +
    contexteStr +
    `\n` +
    markdownContent.slice(contexteEndIndex);

  return newMarkdownContent;
};

export const recomposeMarkdownContent = (
  finalFrontMatter: FinalFrontMatter,
  markdown: string,
) => {
  return "---\n" + yaml.dump(finalFrontMatter) + "---\n\n" + markdown;
};

export const saveFile = (filePath: string, content: string) => {
  try {
    fs.writeFileSync(filePath, content);
    logger.info(`File ${filePath} has been successfully written`);
  } catch (error) {
    logger.error(`Error writing file: ${error}`);
  }
};

import { CONTEXT_TEXT, NEXT_SECTION_TEXT } from "./constants";
import logger from "./logger";
import { FinalFrontMatter, FrontMatterAttributes, MarkdownFile } from "./types";
import {
  convertAttributesToFinalFrontMatter,
  extractFrontMatter,
  generateContextSentenceFromFinalAttributes,
  generateNewMarkdownContent,
  getAttributesFrontMatter,
  getMarkdownContent,
  readFile,
  recomposeMarkdownContent,
  saveFile,
} from "./utils";
import { basename } from "path";

export const retrieveInfoFromFile = (filePath: string): MarkdownFile | null => {
  const content = readFile(filePath);
  if (content) {
    const markdownContent = getMarkdownContent(content);
    const frontMatter = extractFrontMatter(content);
    if (frontMatter) {
      const attributes = getAttributesFrontMatter(frontMatter);
      if (attributes) {
        return {
          filePath,
          fileName: basename(filePath),
          markdownContent,
          frontMatter: attributes,
        };
      }
    }
  }
  return null;
};

export const rewriteFileWithInfo = (
  mdFile: MarkdownFile,
  forceWriting: boolean,
) => {
  const finalFrontMatter = convertAttributesToFinalFrontMatter(
    mdFile.fileName,
    mdFile.frontMatter,
  );

  const contexteStr =
    generateContextSentenceFromFinalAttributes(finalFrontMatter);
  const markdown = generateNewMarkdownContent(
    mdFile.markdownContent,
    contexteStr,
    forceWriting,
  );

  if (!markdown) {
    logger.error("Error generating the new markdown content");
    return;
  }

  const completeMarkdown = recomposeMarkdownContent(finalFrontMatter, markdown);

  saveFile(mdFile.filePath, completeMarkdown);
};

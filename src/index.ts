import { program } from "commander";
import logger from "./logger";
import { retrieveInfoFromFile, rewriteFileWithInfo } from "./markdownProcessor";

program
  .name("frontmatter-to-contexte")
  .description(
    "Rewrite the front matter of a markdown file to the contexte title section",
  )
  .version("1.0.0")
  .requiredOption("-i, --input <path>", "Path to the input file.")
  .option(
    "-f, --force",
    "Force overwriting the file if some content were already present.",
  )
  .action((options) => {
    const { input, force } = options;
    const mdFile = retrieveInfoFromFile(input);
    if (!mdFile) {
      logger.error("Error retrieving the file info");
      return;
    }
    rewriteFileWithInfo(mdFile, force);
    logger.info({ mdFile: JSON.stringify(mdFile) }, "mdFile");
  })
  .parse();

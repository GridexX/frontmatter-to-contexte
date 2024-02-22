const { Command } = require('commander');
const { main } = require('./lib');
const program = new Command();

program
  .name("frontmatter-to-contexte")
  .description("Rewrite the front matter of a markdown file to the contexte title section")
  .version("1.0.0")
  .requiredOption("-i, --input <path>", "Path to the input file.")
  .option("-f, --force", "Force overwriting the file if some content were already present.")
  .action((options) => {
    const { input, force } = options;

    // Execute the main function
    main(input, force);

  })
  .parse();
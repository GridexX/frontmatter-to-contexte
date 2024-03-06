const fs = require('fs');
const yaml = require('js-yaml');
const { basename } = require('path');

const CONTENT_BETWEEN_SECTION = 14;
const CONTEXT_TEXT = "### Contexte\n"
const NEXT_SECTION_TEXT = "### Objectifs"
const RegexDate = /\d{4}-\d{2}-\d{2}/;

// Function to read the Markdown file
const readMarkdownFile = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file: ${error}`);
    return null;
  }
};

// Function to parse YAML front matter
const parseFrontMatter = (markdownContent) => {
  const frontMatterPattern = /^---\n([\s\S]+?)\n---/;
  const match = markdownContent.match(frontMatterPattern);
  if (match) {
    return yaml.load(match[1]);
  } else {
    console.error('Front matter not found in the Markdown file.');
    return null;
  }
};


// This function returns the date in french format or null if the date is not found
const extractDateAndConvertInFrench = (string) => {
  // With a regex extract the date from the filename or the alias. It is in format YYYY-MM-DD
  // Then split the string with '-' as separator
  try {
    const dateMatch = string.match(RegexDate);
    if (dateMatch) {
      const date = dateMatch[0].split('-');
      return date[2] + "/" + date[1] + "/" + date[0];
    }
  } catch (error) {
    console.error(`Error extracting date from string ${string}: ${error}`);
  }
  return null;
}

const removeDateFromString = (string) => {
  // This function remove the date in format YYYY-MM-DD from a string and return the string without the date
  try {
    // Replace two or more spaces with a single space
    return string.replace(RegexDate, '').replace(/\s{2,}/g, ' ');
  } catch (error) {
    console.error(`Error removing date from string ${string}: ${error}`);
  }
  return string;
}

// Function to modify YAML front matter
const getAttributesFrontMatter = (frontMatter, fileName) => {
  // Extract the attributes we need from the front matter
  const { alias: AliasStr, aliases, city, wings, sets, propals, close } = frontMatter;
  const alias = AliasStr ?? aliases?.[0];

  console.log(`Alias found: '${alias}'`);

  if (!alias) {
    console.error('alias attribute not found in the Markdown file.');
    return null;
  }

  const dateInFileName = extractDateAndConvertInFrench(fileName);
  const dateInAlias = extractDateAndConvertInFrench(alias);
  const date = dateInAlias || dateInFileName;

  const session = removeDateFromString(alias);
  // Format wings list, add ", " between each wing and "et" before the last one
  const wingsFormatted = wings?.join(', ').replace(/,([^,]*)$/, ' et$1') || [];

  // Add a line below the "Contexte" section
  return {
    session,
    city,
    date,
    wings: wingsFormatted,
    sets,
    propals,
    close,
  }
};

const attributesToString = (attributes) => {
  const {
    session,
    city,
    date,
    wings,
    sets,
    propals,
    close,
  } = attributes;

  // Format sets/propals/close
  let setsPropalsClose = `\n${!sets ? '?' : sets}/${!propals ? '?' : propals}/${!close ? '?' : close}`;
  if (!sets && !propals && !close) {
    setsPropalsClose = '';
  }

  const wingsSentence = wings.length > 0 ? ` avec ${wings}` : '';
  const citySentence = city ? ` à ${city}` : '';
  return `${date} ${session}${citySentence}${wingsSentence}.${setsPropalsClose}\n\n`;
}

const descriptionFromAttributes = (attributes) => {
  const {
    session,
    city,
    wings
  } = attributes;
  const wingsSentence = wings.length > 0 ? ` avec ${wings}` : '';
  const citySentence = city ? ` à ${city}` : '';
  return `${session}${citySentence}${wingsSentence}`;
}

// Function to write modified content back to the Markdown file
const writeMarkdownFile = (filePath, modifiedContent) => {
  try {
    fs.writeFileSync(filePath, modifiedContent);
    console.log('File successfully modified.');
  } catch (error) {
    console.error(`Error writing file: ${error} `);
  }
};

// Function to modify Markdown content
const modifyMarkdownContent = (markdownContent, attributes, forceWriting) => {
  const contexteIndex = markdownContent.indexOf(CONTEXT_TEXT);
  if (contexteIndex === -1) {
    console.error('Contexte section not found in the Markdown file.');
    return null;
  }

  const contexteEndIndex = markdownContent.indexOf(NEXT_SECTION_TEXT, contexteIndex);
  if (contexteEndIndex === -1) {
    console.error('End of Contexte section not found in the Markdown file.');
    return null;
  }

  let contentAlreadyWritten = false;

  // Check if the section was already written
  if (contexteEndIndex - contexteIndex > CONTENT_BETWEEN_SECTION) {
    contentAlreadyWritten = true;
  }

  if (contentAlreadyWritten && !forceWriting) {
    console.error('The section "###Contexte" was already written. Use -f to force writing.');
    return null;
  }

  // Insert new lines with modified content after Contexte section
  const modifiedContent = markdownContent.slice(0, contexteIndex) +
    CONTEXT_TEXT +
    attributesToString(attributes) +
    markdownContent.slice(contexteEndIndex);

  return modifiedContent;
};

const addDescriptionToFrontMatter = (markdownContent, frontMatter, attributes) => {
  const description = descriptionFromAttributes(attributes);
  //
  frontMatter.description = description;

  // Convert the front matter to YAML
  str = yaml.dump(frontMatter);

  // THen replace the front matter in the markdown file
  const frontMatterPattern = /^---\n([\s\S]+?)\n---/;
  const match = markdownContent.match(frontMatterPattern);
  if (match) {
    return markdownContent.replace(frontMatterPattern, '---\n' + str + '---');
  } else {
    console.error('Front matter not found in the Markdown file.');
    return null;
  }
};

// Main function to orchestrate the process
const main = (filePath, forceWriting) => {
  // Read the Markdown file
  const markdownContent = readMarkdownFile(filePath);
  if (!markdownContent) return;

  // Parse YAML front matter
  const frontMatter = parseFrontMatter(markdownContent);
  if (!frontMatter) return;

  // Modify YAML front matter
  const fileName = basename(filePath);
  const frontMatterAttributes = getAttributesFrontMatter(frontMatter, fileName);
  if (!frontMatterAttributes) return;

  // Write modified content back to the Markdown file
  let modifiedContent = modifyMarkdownContent(markdownContent, frontMatterAttributes, forceWriting);
  modifiedContent = addDescriptionToFrontMatter(modifiedContent, frontMatter, frontMatterAttributes);
  if (!modifiedContent) return;
  writeMarkdownFile(filePath, modifiedContent);
};

module.exports = {
  main,
};


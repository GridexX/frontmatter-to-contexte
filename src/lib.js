const fs = require('fs');
const yaml = require('js-yaml');

const CONTENT_BETWEEN_SECTION = 14;
const CONTEXT_TEXT = "### Contexte\n"
const NEXT_SECTION_TEXT = "### Objectifs\n"

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

// Function to modify YAML front matter
const getAttributesFrontMatter = (frontMatter) => {
  // Extract the attributes we need from the front matter
  const { alias: AliasStr, aliases, city, wings, sets, propals, close } = frontMatter;
  const alias = AliasStr ?? aliases?.[0];

  console.log(`Alias found: '${alias}'`);

  if (!alias) {
    console.error('alias attribute not found in the Markdown file.');
    return null;
  }

  // With a regex extract the date from the alias. It is in format YYYY-MM-DD
  // Then split the string with '-' as separator
  const dateExtracted = alias.match(/\d{4}-\d{2}-\d{2}/)[0].split('-');

  // Extract the text behind the date
  let session = alias.match(/(.*)\d{4}-\d{2}-\d{2}/)[1];
  if (session.endsWith(' ')) {
    session = session.slice(0, -1);
  }
  // Retrieve the place from alias
  let place = alias.match(/\d{4}-\d{2}-\d{2}(.*)/)[1];
  if (place.startsWith(' ')) {
    place = place.slice(1);
  }

  //Then reverse the array and join it with '/'
  const dateFrench = dateExtracted[2] + "/" + dateExtracted[1] + "/" + dateExtracted[0];

  // Format wings list, add ", " between each wing and "et" before the last one
  const wingsFormatted = wings?.join(', ').replace(/,([^,]*)$/, ' et$1') || [];


  // Add a line below the "Contexte" section
  return {
    session,
    city,
    place,
    date: dateFrench,
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
    place,
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
  return `${date} ${session} ${place}${citySentence}${wingsSentence}.${setsPropalsClose}\n\n`;
}

// Function to write modified content back to the Markdown file
const writeMarkdownFile = (filePath, modifiedContent) => {
  try {
    fs.writeFileSync(filePath, modifiedContent);
    console.log('File successfully modified.');
  } catch (error) {
    console.error(`Error writing file: ${error}`);
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

// Main function to orchestrate the process
const main = (filePath, forceWriting) => {
  // Read the Markdown file
  const markdownContent = readMarkdownFile(filePath);
  if (!markdownContent) return;

  // Parse YAML front matter
  const frontMatter = parseFrontMatter(markdownContent);
  if (!frontMatter) return;

  // Modify YAML front matter
  const frontMatterAttributes = getAttributesFrontMatter(frontMatter);
  if (!frontMatterAttributes) return;

  // Write modified content back to the Markdown file
  const modifiedContent = modifyMarkdownContent(markdownContent, frontMatterAttributes, forceWriting);
  if (!modifiedContent) return;
  writeMarkdownFile(filePath, modifiedContent);
};

module.exports = {
  main,
};


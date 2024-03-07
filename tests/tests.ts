import fs from "fs";
import path from "path";
import {
  convertAttributesToFinalFrontMatter,
  extractFrontMatter,
  formatStats,
  generateContextSentenceFromFinalAttributes,
  generateDescription,
  generateMarkdownTable,
  generateNewMarkdownContent,
  getAttributesFrontMatter,
  getMarkdownContent,
  readFile,
  recomposeMarkdownContent,
  saveFile,
} from "../src/utils";
import { FinalFrontMatter, FrontMatterAttributes } from "../src/types";
import logger from "../src/logger";

describe("readFile", () => {
  it("should read a file and return its content", () => {
    const filePath = path.join(__dirname, "test-file.md");
    const content = "This is a test file.";
    fs.writeFileSync(filePath, content);

    const result = readFile(filePath);

    expect(result).toEqual(content);

    fs.unlinkSync(filePath);
  });

  it("should return null if there is an error reading the file", () => {
    const filePath = path.join(__dirname, "non-existent-file.md");

    const result = readFile(filePath);

    expect(result).toBeNull();
  });
});

describe("saveFile", () => {
  it("should write a file with the given content", () => {
    const filePath = path.join(__dirname, "test-file.md");
    const content = "This is a test file.";
    saveFile(filePath, content);
    expect(fs.readFileSync(filePath, "utf8")).toEqual(content);
    fs.unlink(filePath, () => {});
  });
});

describe("getMarkdownContent", () => {
  it("should return the content of the markdown file without the front matter", () => {
    const content = "---\ntitle: Test\n---\nThis is a test file.";

    const result = getMarkdownContent(content);

    expect(result).toEqual("This is a test file.");
  });
  it("should return an empty markdown content file without content", () => {
    const content = "---\ntitle: Test\n---\n";

    const result = getMarkdownContent(content);

    expect(result).toBe("");
  });
});

describe("extractFrontMatter", () => {
  it("should return the front matter of the markdown file", () => {
    const content = "---\ntitle: Test\n---\nThis is a test file.";

    const result = extractFrontMatter(content);

    expect(result).toEqual("title: Test");
  });

  it("should return null if no front matter defined", () => {
    const content = "This is a test file.";

    const result = extractFrontMatter(content);

    expect(result).toBeNull();
  });

  it("should verify the front matter pattern", () => {
    const content = "---\ntitle: Test\n---\nThis is a test file.";
    const frontMatter = extractFrontMatter(content) ?? "";
    // Attributes are null if the front matter is not valid
    const attributes = getAttributesFrontMatter(frontMatter);
    expect(attributes).toBeNull();
  });
});

describe("getAttributesFrontMatter", () => {
  it("should return the attributes of the front matter", () => {
    const frontMatterStr =
      "title: Test\naliases: [alias1, alias2]\ncity: Paris";

    const result = getAttributesFrontMatter(frontMatterStr);

    expect(result).toEqual({
      aliases: ["alias1", "alias2"],
      city: "Paris",
    });
  });
});

describe("generateDescription", () => {
  it("should return a formatted description string", () => {
    const description = {
      alias: "Session 2023-03-15 aux Champs-Élysées",
      city: "Paris",
      wings: ["Gérard", "Victor"],
    };

    const result = generateDescription(description);

    expect(result).toEqual(
      "Session aux Champs-Élysées à Paris avec Gérard et Victor"
    );
  });
});

describe("convertAttributesToFinalFrontMatter", () => {
  it("should return a FinalFrontMatter object", () => {
    const fileName = "test-file_2023-03-15.md";
    const attributes = {
      aliases: ["Session à Chatelet"],
      city: "Paris",
      wings: ["wing1", "wing2"],
      sets: 10,
      marquants: 5,
      propals: 3,
      close: 2,
    };

    const result = convertAttributesToFinalFrontMatter(fileName, attributes);

    // Ensure the date is extracted from fileName
    expect(result).toEqual({
      aliases: ["Session à Chatelet"],
      city: "Paris",
      wings: ["wing1", "wing2"],
      sets: 10,
      marquants: 5,
      propals: 3,
      close: 2,
      date_prevus: 0,
      instant_dates: 0,
      kc: 0,
      pull: 0,
      fc: 0,
      date: "2023-03-15",
      description: "Session à Chatelet à Paris avec wing1 et wing2",
    });
  });
});

describe("formatStats", () => {
  it("should return a formatted string of stats", () => {
    const finalFrontMatter: FinalFrontMatter = {
      aliases: ["Session 2023-03-15"],
      city: "Paris",
      wings: ["wing1", "wing2"],
      sets: 10,
      marquants: 5,
      propals: 3,
      close: 2,
      date_prevus: 0,
      instant_dates: 0,
      kc: 0,
      pull: 0,
      fc: 0,
      date: "2023-03-15",
      description: "Session à Paris avec wing1 et wing2",
    };

    const result = formatStats(finalFrontMatter);

    expect(result).toEqual("10/5/3/2");
  });
});

describe("generateMarkdownTable", () => {
  it("should return a formatted markdown table", () => {
    const finalFrontMatter: FinalFrontMatter = {
      aliases: ["Session 2023-03-15"],
      city: "Paris",
      wings: ["wing1", "wing2"],
      sets: 10,
      marquants: 5,
      propals: 3,
      close: 2,
      date_prevus: 0,
      instant_dates: 0,
      kc: 0,
      pull: 0,
      fc: 0,
      date: "2023-03-15",
      description: "Session 2023-03-15 à Paris avec wing1 et wing2",
    };

    const result = generateMarkdownTable(finalFrontMatter);

    expect(result).toEqual(
      "| sets | marquants | propals | close | kc | pull | fc |\n" +
        "| --- | --- | --- | --- | --- | --- | --- |\n" +
        "| 10 | 5 | 3 | 2 | 0 | 0 | 0 |\n"
    );
  });
});

describe("generate final attributes from front matter", () => {
  it("should return a formatted context sentence", () => {
    const frontMatter: FrontMatterAttributes = {
      aliases: ["Session 2023-03-15"],
      city: "Paris",
      wings: ["wing1", "wing2"],
      sets: 10,
      marquants: 5,
      propals: 3,
    };

    const result = convertAttributesToFinalFrontMatter(
      "test-file-2023-03-15.md",
      frontMatter
    );

    expect(result).toEqual({
      aliases: ["Session 2023-03-15"],
      city: "Paris",
      wings: ["wing1", "wing2"],
      sets: 10,
      marquants: 5,
      propals: 3,
      close: 0,
      date_prevus: 0,
      instant_dates: 0,
      kc: 0,
      pull: 0,
      fc: 0,
      date: "2023-03-15",
      description: "Session à Paris avec wing1 et wing2",
    });
  });
});

describe("generateContextSentenceFromFinalAttributes", () => {
  it("should return a formatted context sentence", () => {
    const finalFrontMatter: FinalFrontMatter = {
      aliases: ["Session 2023-03-15"],
      city: "Paris",
      wings: ["wing1", "wing2"],
      sets: 10,
      marquants: 5,
      propals: 3,
      close: 2,
      date_prevus: 0,
      instant_dates: 0,
      kc: 0,
      pull: 0,
      fc: 0,
      date: "2023-03-15",
      description: "Session 2023-03-15 à Paris avec wing1 et wing2",
    };

    const result = generateContextSentenceFromFinalAttributes(finalFrontMatter);

    expect(result).toEqual(
      "15/03/2023 Session 2023-03-15 à Paris avec wing1 et wing2.\n\n" +
        "| sets | marquants | propals | close | kc | pull | fc |\n" +
        "| --- | --- | --- | --- | --- | --- | --- |\n" +
        "| 10 | 5 | 3 | 2 | 0 | 0 | 0 |\n"
    );
  });
});

describe("generateNewMarkdownContent", () => {
  it("should return a new markdown content with the contexte section updated", () => {
    const markdownContent =
      "---\ntitle: Test\n---\n\n### Contexte\n\n### Objectifs\n";
    const contexteStr = "This is the new contexte.\n";

    const result = generateNewMarkdownContent(
      markdownContent,
      contexteStr,
      true
    );
    expect(result).toEqual(
      "---\ntitle: Test\n---\n\n### Contexte\nThis is the new contexte.\n\n### Objectifs\n"
    );
  });
});

describe("recomposeMarkdownContent", () => {
  it("should return a new markdown content with the updated front matter and markdown", () => {
    const finalFrontMatter: FinalFrontMatter = {
      aliases: ["Session 2023-03-15"],
      city: "Paris",
      wings: ["wing1", "wing2"],
      sets: 10,
      marquants: 5,
      propals: 3,
      close: 2,
      date_prevus: 0,
      instant_dates: 0,
      kc: 0,
      pull: 0,
      fc: 0,
      date: "2023-03-15",
      description: "Session à Paris avec wing1 et wing2",
    };
    const markdown = "This is the updated markdown content.";

    const result = recomposeMarkdownContent(finalFrontMatter, markdown);

    expect(result).toEqual(
      "---\naliases:\n  - Session 2023-03-15\ncity: Paris\nwings:\n  - wing1\n  - wing2\nsets: 10\nmarquants: 5\npropals: 3\nclose: 2\ndate_prevus: 0\ninstant_dates: 0\nkc: 0\npull: 0\nfc: 0\ndate: '2023-03-15'\ndescription: Session à Paris avec wing1 et wing2\n---\n\nThis is the updated markdown content."
    );
  });
});

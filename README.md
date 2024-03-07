# Frontmatter-to-contexte

This repository contains a simple script to extract the frontmatter of a markdown file and fil the contexte of the file with it.

It is intended to be used with [Obsidian](https://obsidian.md), and work with a predefined template.

The template can be found in the `template.md` file.

### Requirements

- Node.js 18.0.0 or higher

### Installation

```bash
git clone git@github.com:GridexX/frontmatter-to-contexte.git
```

### Behaviour

The script will extract the following frontmatter:

```yaml
aliases:
city:
wings:
sets:
propals:
close:
```

It will then fill the contexte section of the file with the extracted frontmatter.
It will extract the date from the first alias and format it in a French format. Then it will add the wings and the city to the contexte.
Finally if the `sets`, `propals` and `close` are defined, it will add them in the format `sets/propals/close` to the contexte.

> [!IMPORTANT]
> The alias is used to extract the date of the session. The date is expected to be in the format `YYYY-MM-DD`. The alias is expected to be in the format `Session [DG|NG] YYYY-MM-DD <place>`.

> [!TIP]
> Fields are optionnal and the script will only add them if they are defined in the frontmatter. Only the `alias` is mandatory.

### Usage

```bash
npm start -- -i <input-file>
```

#### Options

<!-- Insert a table -->

| Option      | Description                             |
| ----------- | --------------------------------------- |
| -i, --input | The input file to process               |
| -f, --force | Force the overwriting of the input file |

> [!NOTE]
> To avoid overwriting the input file with a already defined contexte section, the script will stop and ask for the `--force` option to be set.

### Example

Here are some frontmatters and there corresponding contexte:

**Input**:

```md
---
aliases: 
  - Session DG 2024-02-21 Les Trois singes
city: Montpellier
wings:
  - Rayan
  - Robin
sets: 12
propals: 5
close: 3
...

---

### Contexte

### Objectifs

- Faire 5 sets
```

**Output**:

```md
---
aliases: 
  - Session DG 2024-02-21 Les Trois singes
city: Montpellier
wings:
  - Rayan
  - Robin
sets: 12
propals: 5
close: 3
...

---

### Contexte

21/02/2024 Session DG Les Trois singes à Montpellier avec Rayan et Robin.
12/5/3

### Objectifs

- Faire 5 sets
```

### Author

Made with 🎮 before the incredible week-end of the 21/02/2024 by [@GridexX](https://github.com/GridexX)

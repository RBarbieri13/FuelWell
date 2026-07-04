const NUMBER_WORDS: Record<string, string> = {
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10",
  eleven: "11",
  twelve: "12",
};

const UNIT_PATTERN =
  "(?:lb|lbs|pound|pounds|oz|ounce|ounces|g|gram|grams|kg|cup|cups|portion|portions|pack|packs|item|items|bag|bags|box|boxes|can|cans|bunch|bunches|medium|large|small)";

function cleanSpaces(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function titleCaseGrocery(value: string) {
  return cleanSpaces(value)
    .replace(/^[.,;:()\s]+|[.,;:()\s]+$/g, "")
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (/^[A-Z]{2,}$/.test(word)) return word;
      if (/^\d/.test(word)) return word;
      return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
    })
    .join(" ");
}

export function normalizeGroceryInput(rawName: string, rawQuantity?: string | null) {
  let name = cleanSpaces(rawName);
  const fallbackQuantity = cleanSpaces(rawQuantity ?? "");
  let quantity = "";

  const parentheticalQuantity = name.match(/\s*\((\d+(?:\.\d+)?)\)\s*$/);
  if (parentheticalQuantity) {
    quantity ||= parentheticalQuantity[1];
    name = name.replace(/\s*\(\d+(?:\.\d+)?\)\s*$/, "");
  }

  const numericPrefix = name.match(new RegExp(`^(\\d+(?:\\.\\d+)?(?:\\s*${UNIT_PATTERN})?)\\s+(.+)$`, "i"));
  if (numericPrefix) {
    quantity ||= cleanSpaces(numericPrefix[1]);
    name = numericPrefix[2];
  } else {
    const wordPrefix = name.match(/^([a-z]+)\s+(.+)$/i);
    if (wordPrefix && NUMBER_WORDS[wordPrefix[1].toLowerCase()]) {
      quantity ||= NUMBER_WORDS[wordPrefix[1].toLowerCase()];
      name = wordPrefix[2];
    }
  }

  return {
    name: titleCaseGrocery(name),
    quantity: quantity || fallbackQuantity || undefined,
  };
}

export function groceryItemKey(name: string) {
  return normalizeGroceryInput(name).name.toLowerCase();
}

/**
 * Normalisation for the WHO ICTRP `Condition` field.
 *
 * The raw export is messy. Real examples taken from the live Firestore data:
 *
 *   "Health Condition 1: L649- Androgenic alopecia, unspecified"
 *   "D49- Neoplasms"
 *   "Other autoinflammatory syndromes Health Condition 2: M055- Rheumatoid
 *    polyneuropathy with rheumatoid arthritis Health Condition 3: M055- ..."
 *   "Preterm Birth;Small for Gestational Age (SGA);Stillbirth"
 *   "O- Medical and Surgical"                <- a study domain, not a condition
 *   "O- Medical and Surgical; Cholelithiasis" <- domain + a real condition
 *
 * So we need to:
 *   - drop the "Health Condition N:" slot labels,
 *   - drop leading ICD-10 codes ("L649- ", "D49- "),
 *   - drop ICTRP domain labels ("O- Medical and Surgical", "G- Mental Health"),
 *   - split multi-condition values (slot labels and semicolons),
 *   - discard empty placeholders ("-", "N/A") and bare codes ("PCS-"),
 *   - de-duplicate repeated conditions.
 */

const text = value => (value === null || value === undefined ? '' : String(value));

const decodeEntities = value =>
  text(value)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');

const clean = value => decodeEntities(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

// An empty ICTRP slot: "-", "--", "N/A", "None", ...
const isPlaceholder = value =>
  /^[-–—.,;:/\\|]*$/.test(value) || /^(?:n\/?a|none|not applicable|unknown|nil)$/i.test(value);

/**
 * WHO ICTRP "study domain" names. The registry sometimes stores the domain in
 * the condition field instead of a disease, e.g. "1- Obstetrics" or
 * "O- Medical and Surgical".
 */
const DOMAIN_NAMES = new Set([
  'medical and surgical',
  'mental health',
  'obstetrics',
  'administration',
  'measurement and monitoring',
  'placement',
  'extracorporeal or systemic therapies',
  'extracorporeal or systemic assistance and performance',
  'other procedures',
  'new technology',
  'physical rehabilitation and diagnostic audiology'
]);

/**
 * A study-domain label rather than a disease:
 *   "O- Medical and Surgical", "1- Obstetrics", "8- Other Procedures".
 *
 * A single letter followed by a separator is always a domain label in the ICTRP
 * export; a number is only treated as one when the name is a known domain, so
 * real conditions such as "21-hydroxylase deficiency" survive.
 */
const isDomainLabel = value => {
  if (/^[A-Z]\s*[-–:]\s*\S/.test(value)) return true;

  const match = value.match(/^\d{1,2}\s*[-–:]\s*(.+)$/);
  return Boolean(match) && DOMAIN_NAMES.has(match[1].trim().toLowerCase());
};

/** Nothing but a code, e.g. "PCS-", "M055-", or a lone initial such as "O".
 *  "T2DM" is a disease abbreviation and must survive. */
const isCodeOnly = value =>
  /^[A-Z]\s*[-–:.]?\s*$/.test(value) ||
  /^[A-Z][A-Z0-9]{0,5}\s*[-–:.]\s*$/.test(value);

/**
 * "L649- Androgenic alopecia" -> "Androgenic alopecia"
 * "D49- Neoplasms"           -> "Neoplasms"
 * "COVID-19" / "T2DM"        -> unchanged (no code separator after the digits)
 */
const stripIcdCode = value => {
  const stripped = value.replace(/^[A-Z]\d{2,3}(?:\.\d+)?\s*[-–:]\s*/i, '').trim();
  return stripped || value;
};

/**
 * Turn the raw ICTRP condition value into a readable, de-duplicated string
 * such as "Rheumatoid arthritis; Osteoarthritis of knee".
 */
function parseCondition(value) {
  const raw = clean(value);
  if (!raw) return '';

  const parts = raw
    // "Health Condition 2:" / "Health Condition 3:" slot separators.
    .split(/\bHealth Condition\s*\d+\s*:/i)
    // Multi-value conditions are frequently semicolon separated.
    .flatMap(chunk => chunk.split(';'))
    .map(chunk => clean(chunk))
    .filter(chunk => chunk && !isPlaceholder(chunk) && !isDomainLabel(chunk))
    .map(stripIcdCode)
    .filter(chunk => chunk && !isPlaceholder(chunk) && !isCodeOnly(chunk));

  const seen = new Set();
  const unique = [];

  for (const part of parts) {
    const key = part.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(part);
  }

  return unique.join('; ');
}

/** True when a stored condition is worth showing to a patient. */
const isUsableCondition = value => {
  const parsed = parseCondition(value);
  return parsed.length > 1 && !isPlaceholder(parsed);
};

module.exports = { parseCondition, isUsableCondition, clean };

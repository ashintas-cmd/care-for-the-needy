const { parseCondition, isUsableCondition } = require('../src/utils/condition');

describe('parseCondition', () => {
  test('strips the "Health Condition 1:" label and the ICD code', () => {
    expect(parseCondition('Health Condition 1: L649- Androgenic alopecia, unspecified'))
      .toBe('Androgenic alopecia, unspecified');
  });

  test('strips a leading ICD code when no label is present', () => {
    expect(parseCondition('D49- Neoplasms')).toBe('Neoplasms');
    expect(parseCondition('M055- Rheumatoid polyneuropathy with rheumatoid arthritis'))
      .toBe('Rheumatoid polyneuropathy with rheumatoid arthritis');
  });

  test('splits and de-duplicates repeated "Health Condition N:" slots', () => {
    expect(
      parseCondition(
        'Other autoinflammatory syndromes Health Condition 2: M055- Rheumatoid polyneuropathy with rheumatoid arthritis Health Condition 3: M055- Rheumatoid polyneuropathy with rheumatoid arthritis'
      )
    ).toBe('Other autoinflammatory syndromes; Rheumatoid polyneuropathy with rheumatoid arthritis');
  });

  test('keeps multiple distinct conditions in one value', () => {
    expect(
      parseCondition(
        'Bilateral inguinal hernia, without obstruction or gangrene Health Condition 2: K409- Unilateral inguinal hernia, without obstruction or gangrene'
      )
    ).toBe(
      'Bilateral inguinal hernia, without obstruction or gangrene; Unilateral inguinal hernia, without obstruction or gangrene'
    );
  });

  test('splits semicolon separated conditions', () => {
    expect(
      parseCondition('Preterm Birth;Small for Gestational Age (SGA);Stillbirth')
    ).toBe('Preterm Birth; Small for Gestational Age (SGA); Stillbirth');
  });

  test('drops empty placeholder slots', () => {
    expect(parseCondition('Health Condition 1: - Health Condition 2: - Health Condition 3: C051- Malignant neoplasm of soft palate'))
      .toBe('Malignant neoplasm of soft palate');

    expect(parseCondition('Health Condition 1: C50- Breast cancer Health Condition 2: -'))
      .toBe('Breast cancer');

    expect(parseCondition('N/A')).toBe('');
    expect(parseCondition('None')).toBe('');
  });

  test('drops WHO study-domain labels that are not conditions', () => {
    expect(parseCondition('O- Medical and Surgical')).toBe('');
    expect(parseCondition('G- Mental Health')).toBe('');
    expect(parseCondition('X- New Technology')).toBe('');
    expect(parseCondition('F- Physical Rehabilitation and Diagnostic Audiology')).toBe('');
  });

  test('drops numeric study-domain labels', () => {
    expect(parseCondition('1- Obstetrics')).toBe('');
    expect(parseCondition('3- Administration')).toBe('');
    expect(parseCondition('4- Measurement and Monitoring')).toBe('');
    expect(parseCondition('8- Other Procedures')).toBe('');
    expect(parseCondition('5- Extracorporeal or Systemic Assistance and Performance')).toBe('');
  });

  test('keeps real conditions that merely start with a number', () => {
    expect(parseCondition('21-hydroxylase deficiency')).toBe('21-hydroxylase deficiency');
    expect(parseCondition('5-Fluorouracil toxicity')).toBe('5-Fluorouracil toxicity');
    expect(parseCondition('1p36 deletion syndrome')).toBe('1p36 deletion syndrome');
  });

  test('keeps the condition when a domain label is prefixed to it', () => {
    expect(parseCondition('O- Medical and Surgical; Cholelithiasis')).toBe('Cholelithiasis');
    expect(parseCondition('O- Medical and Surgical; Type 2 diabetes mellitus with other specified complications'))
      .toBe('Type 2 diabetes mellitus with other specified complications');
    expect(parseCondition('G- Mental Health; Generalized anxiety disorder'))
      .toBe('Generalized anxiety disorder');
  });

  test('drops bare code fragments but keeps disease abbreviations', () => {
    expect(parseCondition('PCS-')).toBe('');
    expect(parseCondition('O')).toBe('');
    expect(parseCondition('T2DM')).toBe('T2DM');
  });

  test('leaves already clean values alone', () => {
    expect(parseCondition('Bipolar Disorder')).toBe('Bipolar Disorder');
    expect(parseCondition('Osteoarthritis of knee, unspecified')).toBe('Osteoarthritis of knee, unspecified');
  });

  test('does not mangle codes that are part of a real name', () => {
    expect(parseCondition('COVID-19')).toBe('COVID-19');
    expect(parseCondition('T2DM')).toBe('T2DM');
    expect(parseCondition('Vitamin B12 deficiency')).toBe('Vitamin B12 deficiency');
  });

  test('handles HTML entities, markup and stray whitespace', () => {
    expect(parseCondition('  Health&nbsp;Condition 1:  C50- Breast&nbsp;cancer  '))
      .toBe('Breast cancer');
  });

  test('returns an empty string for empty input', () => {
    expect(parseCondition('')).toBe('');
    expect(parseCondition(null)).toBe('');
    expect(parseCondition(undefined)).toBe('');
    expect(parseCondition('   ')).toBe('');
  });
});

describe('isUsableCondition', () => {
  test('rejects junk and empty values', () => {
    expect(isUsableCondition('')).toBe(false);
    expect(isUsableCondition('-')).toBe(false);
    expect(isUsableCondition('N/A')).toBe(false);
  });

  test('accepts real conditions', () => {
    expect(isUsableCondition('D49- Neoplasms')).toBe(true);
    expect(isUsableCondition('Health Condition 1: - Health Condition 2: - Health Condition 3: C051- Malignant neoplasm of soft palate'))
      .toBe(true);
  });
});

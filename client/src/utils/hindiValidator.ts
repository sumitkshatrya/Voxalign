import { WordSegment, ValidationIssue, QualityChecklistReport, LanguageCode } from '../types';

export const DEVANAGARI_REGEX = /^[\u0900-\u097F]+$/;
export const BENGALI_REGEX = /^[\u0980-\u09FF]+$/;
export const TAMIL_REGEX = /^[\u0B80-\u0BFF]+$/;
export const TELUGU_REGEX = /^[\u0C00-\u0C7F]+$/;
export const GUJARATI_REGEX = /^[\u0A80-\u0AFF]+$/;
export const KANNADA_REGEX = /^[\u0C80-\u0CFF]+$/;
export const MALAYALAM_REGEX = /^[\u0D00-\u0D7F]+$/;
export const GURMUKHI_REGEX = /^[\u0A00-\u0A7F]+$/;
export const ODIA_REGEX = /^[\u0B00-\u0B7F]+$/;
export const ARABIC_URDU_REGEX = /^[\u0600-\u06FF]+$/;
export const LATIN_LOWERCASE_REGEX = /^[a-z]+(?:'[a-z]+)?$/;

export const ARABIC_DIGITS_REGEX = /[0-9]/;
export const DEVANAGARI_DIGITS_REGEX = /[\u0966-\u096F]/;
// All digit scripts across Indic & Arabic Unicode blocks
export const ALL_DIGITS_REGEX = /[0-9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0660-\u0669]/;

export const PUNCTUATION_REGEX = /[.,!?;:\"()[\]{}]/;
export const UNINTELLIGIBLE_REGEX = /^\(\(\)\)$/;
export const PLAUSIBLE_GUESS_REGEX = /^\(\([^\(\)]+\)\)$/;
export const CUTOFF_REGEX = /^[a-z\u0900-\u0D7F\u0600-\u06FF]+-$/i;

export const CANONICAL_HINDI_HESITATION = 'अं';
export const CANONICAL_HINDI_THINKING = 'हम्म';

export const INVALID_NON_LEXICAL_TAGS = [
  '[laughter]', '[cough]', '[applause]', '[music]', '[noise]', 
  '(laughter)', '(cough)', '(applause)', '(music)', '(noise)',
  'haha', 'hehe', 'huh'
];

export const HINDI_NUMBER_WORDS: Record<string, string> = {
  '0': 'शून्य', '1': 'एक', '2': 'दो', '3': 'तीन', '4': 'चार',
  '5': 'पांच', '6': 'छह', '7': 'सात', '8': 'आठ', '9': 'नौ',
  '10': 'दस', '11': 'ग्यारह', '12': 'बारह', '15': 'पंद्रह',
  '20': 'बीस', '25': 'पच्चीस', '50': 'पचास', '100': 'सौ', '1000': 'हज़ार'
};

export const BENGALI_NUMBER_WORDS: Record<string, string> = {
  '0': 'শূন্য', '1': 'এক', '2': 'দুই', '3': 'তিন', '4': 'চার',
  '5': 'পাঁচ', '6': 'ছয়', '7': 'সাত', '8': 'আট', '9': 'নয়',
  '10': 'দশ', '15': 'পনেরো', '20': 'কুড়ি', '50': 'পঞ্চাশ', '100': 'একশো'
};

export const TAMIL_NUMBER_WORDS: Record<string, string> = {
  '0': 'பூஜ்ஜியம்', '1': 'ஒன்று', '2': 'இரண்டு', '3': 'மூன்று', '4': 'நான்கு',
  '5': 'ஐந்து', '6': 'ஆறு', '7': 'ஏழு', '8': 'எட்டு', '9': 'ஒன்பது',
  '10': 'பத்து', '15': 'பதினைந்து', '20': 'இருபது', '50': 'ஐம்பது', '100': 'நூறு'
};

export const TELUGU_NUMBER_WORDS: Record<string, string> = {
  '0': 'సున్నా', '1': 'ఒకటి', '2': 'రెండు', '3': 'మూడు', '4': 'నాలుగు',
  '5': 'ఐదు', '6': 'ఆరు', '7': 'ఏడు', '8': 'ఎనిమిది', '9': 'తొమ్మిది',
  '10': 'పది', '15': 'పదిహేను', '20': 'ఇరవై', '50': 'యాభై', '100': 'వంద'
};

export const MARATHI_NUMBER_WORDS: Record<string, string> = {
  '0': 'शून्य', '1': 'एक', '2': 'दोन', '3': 'तीन', '4': 'चार',
  '5': 'पाच', '6': 'सहा', '7': 'सात', '8': 'आठ', '9': 'नऊ',
  '10': 'दहा', '15': 'पंधरा', '20': 'वीस', '50': 'पन्नास', '100': 'शंभर'
};

export const GUJARATI_NUMBER_WORDS: Record<string, string> = {
  '0': 'શૂન્ય', '1': 'એક', '2': 'બે', '3': 'ત્રણ', '4': 'ચાર',
  '5': 'પાંચ', '6': 'છ', '7': 'સાત', '8': 'આઠ', '9': 'નવ',
  '10': 'દસ', '15': 'પંદર', '20': 'વીસ', '50': 'પચાસ', '100': 'સો'
};

export const PUNJABI_NUMBER_WORDS: Record<string, string> = {
  '0': 'ਸਿਫ਼ਰ', '1': 'ਇੱਕ', '2': 'ਦੋ', '3': 'ਤਿੰਨ', '4': 'ਚਾਰ',
  '5': 'ਪੰਜ', '6': 'ਛੇ', '7': 'ਸੱਤ', '8': 'ਅੱਠ', '9': 'ਨੌਂ',
  '10': 'ਦਸ', '15': 'ਪੰਦਰਾਂ', '20': 'ਵੀਹ', '50': 'ਪੰਜਾਹ', '100': 'ਸੌ'
};

export const ENGLISH_NUMBER_WORDS: Record<string, string> = {
  '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
  '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine',
  '10': 'ten', '11': 'eleven', '12': 'twelve', '13': 'thirteen',
  '15': 'fifteen', '20': 'twenty', '30': 'thirty', '50': 'fifty', '100': 'hundred'
};

export function getClientNumberDictionary(lang?: LanguageCode): Record<string, string> {
  switch (lang) {
    case 'bn':
    case 'as':
      return BENGALI_NUMBER_WORDS;
    case 'ta':
      return TAMIL_NUMBER_WORDS;
    case 'te':
      return TELUGU_NUMBER_WORDS;
    case 'mr':
      return MARATHI_NUMBER_WORDS;
    case 'gu':
      return GUJARATI_NUMBER_WORDS;
    case 'pa':
      return PUNJABI_NUMBER_WORDS;
    case 'en':
      return ENGLISH_NUMBER_WORDS;
    case 'hi':
    case 'hi-en':
    default:
      return HINDI_NUMBER_WORDS;
  }
}

export function validateClientSegment(
  segment: WordSegment, 
  allSegments: WordSegment[] = [],
  targetLang?: LanguageCode
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const rawText = (segment.text || '').trim();
  const effectiveLang = segment.language || targetLang || 'hi-en';

  if (!rawText) {
    issues.push({
      code: 'SEG_EMPTY',
      message: 'Segment text is empty. Each segment must contain a spoken word.',
      severity: 'error',
      ruleCategory: 'segmentation'
    });
    return issues;
  }

  // One space-separated word per segment
  if (/\s+/.test(rawText)) {
    issues.push({
      code: 'SEG_MULTI_WORD',
      message: `Multiple words detected ("${rawText}"). Only one space-separated word per segment is permitted.`,
      severity: 'error',
      ruleCategory: 'segmentation',
      suggestedFix: 'Split into individual word segments.'
    });
  }

  // Ordinary compound hyphens removed and components split
  if (rawText.includes('-') && !rawText.endsWith('-') && !rawText.startsWith('-')) {
    issues.push({
      code: 'HYPHEN_COMPOUND',
      message: `Ordinary compound hyphen detected ("${rawText}"). Components must be split into separate segments.`,
      severity: 'error',
      ruleCategory: 'guideline_compliance',
      suggestedFix: rawText.replace(/-/g, ' ')
    });
  }

  // Digits prohibited across all Indic and Arabic scripts
  if (ALL_DIGITS_REGEX.test(rawText)) {
    const digitMatch = rawText.match(/\d+/)?.[0];
    const dict = getClientNumberDictionary(effectiveLang);
    const suggestion = digitMatch && dict[digitMatch] ? dict[digitMatch] : undefined;
    issues.push({
      code: 'DIGIT_USAGE',
      message: `Digits detected ("${rawText}"). Numbers must be spelled out in spoken words.`,
      severity: 'error',
      ruleCategory: 'script',
      suggestedFix: suggestion ? `Use '${suggestion}'` : 'Spell out number in native letters.'
    });
  }

  const isUnintelligible = UNINTELLIGIBLE_REGEX.test(rawText);
  const isPlausibleGuess = PLAUSIBLE_GUESS_REGEX.test(rawText);
  const isCutOff = CUTOFF_REGEX.test(rawText) || (rawText.startsWith('-') && rawText.length > 1);

  if (!isUnintelligible && !isPlausibleGuess) {
    // Non-lexical sound
    if (INVALID_NON_LEXICAL_TAGS.includes(rawText.toLowerCase())) {
      issues.push({
        code: 'NON_LEXICAL_SOUND',
        message: `Non-lexical acoustic sound "${rawText}" should not be represented as a word.`,
        severity: 'warning',
        ruleCategory: 'guideline_compliance'
      });
    }

    // Punctuation check
    const cleanedForCutoff = isCutOff ? rawText.replace(/^-|-$/g, '') : rawText;
    const isSingleLetterWithPeriod = /^[a-z]\.$/.test(rawText);
    if (!isSingleLetterWithPeriod && PUNCTUATION_REGEX.test(cleanedForCutoff)) {
      issues.push({
        code: 'PUNCTUATION_DETECTED',
        message: `Punctuation mark found in "${rawText}". Standard transcripts omit punctuation marks.`,
        severity: 'error',
        ruleCategory: 'script',
        suggestedFix: rawText.replace(/[.,!?;:\"()[\]{}]/g, '')
      });
    }

    // Script checking
    const hasEnglishLetters = /[a-zA-Z]/.test(rawText);
    const hasIndicLetters = /[\u0900-\u0D7F\u0600-\u06FF]/.test(rawText);

    if (hasEnglishLetters && hasIndicLetters) {
      issues.push({
        code: 'MIXED_SCRIPT',
        message: `Mixed native Indic and Latin script inside word ("${rawText}").`,
        severity: 'warning',
        ruleCategory: 'script'
      });
    } else if (hasEnglishLetters) {
      if (/[A-Z]/.test(rawText)) {
        issues.push({
          code: 'LATIN_UPPERCASE',
          message: `Uppercase Latin character in "${rawText}". English words must be lowercase.`,
          severity: 'warning',
          ruleCategory: 'script',
          suggestedFix: rawText.toLowerCase()
        });
      }
    } else if (hasIndicLetters) {
      // Devanagari hesitation checks
      if (/[\u0900-\u097F]/.test(rawText)) {
        if (['उम', 'उम्म', 'अम्म', 'अह'].includes(rawText)) {
          issues.push({
            code: 'NON_CANONICAL_HESITATION',
            message: `Non-standard hesitation. Canonical hesitation filler is '${CANONICAL_HINDI_HESITATION}'.`,
            severity: 'warning',
            ruleCategory: 'guideline_compliance',
            suggestedFix: CANONICAL_HINDI_HESITATION
          });
        }
        if (['हम', 'हम्मम', 'ह्म्म'].includes(rawText)) {
          issues.push({
            code: 'NON_CANONICAL_THINKING',
            message: `Non-standard thinking signal. Canonical thinking signal is '${CANONICAL_HINDI_THINKING}'.`,
            severity: 'warning',
            ruleCategory: 'guideline_compliance',
            suggestedFix: CANONICAL_HINDI_THINKING
          });
        }
      }
    }
  }

  // Timestamps
  if (segment.start >= segment.end) {
    issues.push({
      code: 'TIMESTAMP_INVALID_RANGE',
      message: `Invalid segment duration: start (${segment.start.toFixed(3)}s) >= end (${segment.end.toFixed(3)}s).`,
      severity: 'error',
      ruleCategory: 'timestamp'
    });
  }

  if (segment.start < 0 || segment.end < 0) {
    issues.push({
      code: 'TIMESTAMP_NEGATIVE',
      message: 'Segment timestamps cannot be negative.',
      severity: 'error',
      ruleCategory: 'timestamp'
    });
  }

  // Duration warnings
  const duration = segment.end - segment.start;
  if (duration > 4.5 && !isUnintelligible) {
    issues.push({
      code: 'DURATION_TOO_LONG',
      message: `Segment duration (${duration.toFixed(2)}s) is long for a single word.`,
      severity: 'warning',
      ruleCategory: 'timestamp'
    });
  }

  // Overlap check
  if (allSegments.length > 0) {
    for (const other of allSegments) {
      if (other.id === segment.id) continue;
      if (other.speaker === segment.speaker) {
        const isOverlapping = Math.max(segment.start, other.start) < Math.min(segment.end, other.end) - 0.005;
        if (isOverlapping) {
          issues.push({
            code: 'SAME_SPEAKER_OVERLAP',
            message: `Overlaps with "${other.text}" (${other.start.toFixed(2)}s - ${other.end.toFixed(2)}s) by the same speaker (${segment.speaker}).`,
            severity: 'error',
            ruleCategory: 'overlap'
          });
          break;
        }
      }
    }
  }

  return issues;
}

export function generateClientQcReport(
  segments: WordSegment[], 
  fileId: string = '',
  targetLang: LanguageCode = 'hi-en'
): QualityChecklistReport {
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const seg of segments) {
    const issues = validateClientSegment(seg, segments, targetLang);
    seg.validationIssues = issues;
    for (const issue of issues) {
      if (issue.severity === 'error') totalErrors++;
      if (issue.severity === 'warning') totalWarnings++;
    }
  }

  const hasNoEmpty = segments.every(s => (s.text || '').trim().length > 0);
  const hasNoMultiWords = segments.every(s => !/\s+/.test((s.text || '').trim()));
  const hasNoDigits = segments.every(s => !ALL_DIGITS_REGEX.test(s.text));
  const hasValidTimestamps = segments.every(s => s.start < s.end && s.start >= 0);
  const hasNoUnsplitCompounds = segments.every(s => !s.text.includes('-') || s.text.endsWith('-') || s.text.startsWith('-'));
  const hasCanonicalMarkers = segments.every(s => !['उम', 'उम्म', 'अम्म'].includes(s.text.trim()));
  const hasLowercaseEnglish = segments.every(s => {
    const t = (s.text || '').trim();
    if (/[a-zA-Z]/.test(t) && !t.startsWith('((')) return !/[A-Z]/.test(t);
    return true;
  });
  const hasValidSpeakers = segments.every(s => s.speaker && s.speaker.trim().length > 0);
  const hasNoSameSpeakerOverlaps = !segments.some(s => s.validationIssues?.some(i => i.code === 'SAME_SPEAKER_OVERLAP'));

  const checklistItems = [
    {
      id: 'chk_single_word',
      label: 'Single Word Segmentation',
      description: 'Each segment contains exactly one spoken word.',
      passed: hasNoEmpty && hasNoMultiWords
    },
    {
      id: 'chk_script_rules',
      label: 'Script & Casing Standards',
      description: 'Native script or lowercase Latin; digits spelled out.',
      passed: hasNoDigits && hasLowercaseEnglish
    },
    {
      id: 'chk_timestamps',
      label: 'Timestamp Integrity',
      description: 'All start < end, non-negative, non-zero durations.',
      passed: hasValidTimestamps
    },
    {
      id: 'chk_no_overlaps',
      label: 'No Same-Speaker Overlaps',
      description: 'Same speaker does not speak in conflicting overlapping time intervals.',
      passed: hasNoSameSpeakerOverlaps
    },
    {
      id: 'chk_compounds',
      label: 'Compound Hyphen Removal',
      description: 'Ordinary compound words are split; only actual cut-offs retain trailing hyphen.',
      passed: hasNoUnsplitCompounds
    },
    {
      id: 'chk_markers',
      label: 'Standard Hesitation & Uncertainty Tags',
      description: 'Hesitations and uncertainty tags follow locale rules.',
      passed: hasCanonicalMarkers
    },
    {
      id: 'chk_speakers',
      label: 'Speaker Assignment',
      description: 'All segments are assigned a distinct, identified speaker.',
      passed: hasValidSpeakers
    }
  ];

  const passedChecksCount = checklistItems.filter(item => item.passed).length;
  const isReadyForExport = totalErrors === 0 && passedChecksCount === checklistItems.length;

  return {
    timestamp: new Date().toISOString(),
    fileId,
    totalSegments: segments.length,
    passedChecksCount,
    warningCount: totalWarnings,
    errorCount: totalErrors,
    checklistItems,
    isReadyForExport
  };
}

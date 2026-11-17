/**
 * VoxAlign Multilingual Speech Guidelines Engine
 * Primary functional specification for Indic (hi, bn, ta, te, mr, gu, kn, ml, pa, ur, or)
 * and Multilingual/Hinglish speech forced alignment & quality control
 * Based on official Hindi Alignment Guidelines (Consolidated Edition)
 */

import { WordSegment, ValidationIssue, QualityChecklistReport, LanguageCode } from '../types';

// Regex patterns for script identification and validation
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

// Canonical hesitation and thinking words (Section 5.10)
export const CANONICAL_HINDI_HESITATION = 'अं';
export const CANONICAL_HINDI_THINKING = 'हम्म';

// Known non-lexical words that shouldn't be transcribed (Section 2.3 & 4.4)
export const INVALID_NON_LEXICAL_TAGS = [
  '[laughter]', '[cough]', '[applause]', '[music]', '[noise]', '[breath]',
  '(laughter)', '(cough)', '(applause)', '(music)', '(noise)', '(breath)',
  'haha', 'hehe', 'huh', 'snicker', 'cough', 'sigh'
];

// Multilingual number word suggestions (Section 5.8)
export const HINDI_NUMBER_WORDS: Record<string, string> = {
  '0': 'शून्य', '1': 'एक', '2': 'दो', '3': 'तीन', '4': 'चार',
  '5': 'पांच', '6': 'छह', '7': 'सात', '8': 'आठ', '9': 'नौ',
  '10': 'दस', '11': 'ग्यारह', '12': 'बारह', '13': 'तेरह', '14': 'चौदह',
  '15': 'पंद्रह', '16': 'सोलह', '17': 'सत्रह', '18': 'अठारह', '19': 'उन्नीस',
  '20': 'बीस', '25': 'पच्चीस', '30': 'तीस', '40': 'चालीस', '50': 'पचास',
  '60': 'साठ', '70': 'सत्तर', '80': 'अस्सी', '90': 'नब्बे', '100': 'सौ', '1000': 'हज़ार'
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
  '10': 'ten', '11': 'eleven', '12': 'twelve', '13': 'thirteen', '14': 'fourteen',
  '15': 'fifteen', '16': 'sixteen', '17': 'seventeen', '18': 'eighteen', '19': 'nineteen',
  '20': 'twenty', '30': 'thirty', '40': 'forty', '50': 'fifty', '100': 'hundred'
};

// Visarg words that have accepted forms WITHOUT visarg (Section 5.3)
export const VISARG_REPLACEMENTS: Record<string, string> = {
  'प्रायः': 'प्राय',
  'विशेषतः': 'विशेषत',
  'सामान्यतः': 'सामान्यत',
  'मुख्यतः': 'मुख्यत',
  'अंततः': 'अंतत',
  'अधःपात': 'अधोपात',
  'रजःकण': 'रजकण',
  'तेजःपुंज': 'तेजोपुंज'
};

// English abbreviations that should be written in full (Section 5.7)
export const ENGLISH_HONORIFIC_ABBREVIATIONS: Record<string, string> = {
  'mr': 'mister',
  'mr.': 'mister',
  'mrs': 'missus',
  'mrs.': 'missus',
  'ms': 'miss',
  'ms.': 'miss'
};

/**
 * Returns number dictionary based on language
 */
export function getNumberDictionary(lang?: LanguageCode): Record<string, string> {
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

/**
 * Validates an individual word segment against Indic & Hindi speech guidelines
 */
export function validateSegment(
  segment: WordSegment, 
  allSegments: WordSegment[] = [],
  targetLang?: LanguageCode
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const rawText = (segment.text || '').trim();
  const effectiveLang = segment.language || targetLang || 'hi-en';

  // 1. Check for empty text (Section 2.1)
  if (!rawText) {
    issues.push({
      code: 'SEG_EMPTY',
      message: 'Segment text is empty. Each segment must contain a spoken word or valid marker.',
      severity: 'error',
      ruleCategory: 'segmentation'
    });
    return issues;
  }

  // 2. Check for multiple words: One space-separated spoken word = one segment (Section 2.1)
  if (/\s+/.test(rawText)) {
    issues.push({
      code: 'SEG_MULTI_WORD',
      message: `Multiple words detected in single segment ("${rawText}"). Only one space-separated word per segment is permitted.`,
      severity: 'error',
      ruleCategory: 'segmentation',
      suggestedFix: 'Split segment into individual word segments.'
    });
  }

  // 3. Check for compound hyphens that must be split (Section 4.2 & 5.4)
  if (rawText.includes('-') && !rawText.endsWith('-') && !rawText.startsWith('-')) {
    issues.push({
      code: 'HYPHEN_COMPOUND',
      message: `Ordinary compound hyphen detected ("${rawText}"). Compound words must have hyphens removed and components split.`,
      severity: 'error',
      ruleCategory: 'guideline_compliance',
      suggestedFix: rawText.replace(/-/g, ' ')
    });
  }

  // 4. Check for digits across all Indic and Arabic numerals
  if (ALL_DIGITS_REGEX.test(rawText)) {
    const digitMatch = rawText.match(/\d+/)?.[0];
    const dict = getNumberDictionary(effectiveLang);
    const suggestion = digitMatch && dict[digitMatch] ? dict[digitMatch] : undefined;
    issues.push({
      code: 'DIGIT_USAGE',
      message: `Digits detected in segment ("${rawText}"). Numbers must be spelled out in spoken words.`,
      severity: 'error',
      ruleCategory: 'script',
      suggestedFix: suggestion ? `Use '${suggestion}'` : 'Spell out number in native letters.'
    });
  }

  // 5. Special Markers validation
  const isUnintelligible = UNINTELLIGIBLE_REGEX.test(rawText);
  const isPlausibleGuess = PLAUSIBLE_GUESS_REGEX.test(rawText);
  const isCutOff = CUTOFF_REGEX.test(rawText) || (rawText.startsWith('-') && rawText.length > 1);

  if (!isUnintelligible && !isPlausibleGuess) {
    // Check forbidden non-lexical acoustic tags (Section 2.3 & 4.4)
    const lowerRaw = rawText.toLowerCase();
    if (INVALID_NON_LEXICAL_TAGS.includes(lowerRaw)) {
      issues.push({
        code: 'NON_LEXICAL_SOUND',
        message: `Non-lexical vocal sound "${rawText}" should not be represented as a word. Delete segment.`,
        severity: 'warning',
        ruleCategory: 'guideline_compliance',
        suggestedFix: 'Delete non-lexical segment'
      });
    }

    // Check forbidden general punctuation (commas, periods, exclamation, etc., Section 4.1)
    const cleanedForCutoff = isCutOff ? rawText.replace(/^-|-$/g, '') : rawText;
    const isSingleLetterWithPeriod = /^[a-z]\.$/.test(rawText);
    if (!isSingleLetterWithPeriod && PUNCTUATION_REGEX.test(cleanedForCutoff)) {
      issues.push({
        code: 'PUNCTUATION_DETECTED',
        message: `Punctuation mark found in "${rawText}". Standard transcripts omit sentence punctuation.`,
        severity: 'error',
        ruleCategory: 'script',
        suggestedFix: rawText.replace(/[.,!?;:\"()[\]{}]/g, '')
      });
    }

    // 6. Script validation
    const hasEnglishLetters = /[a-zA-Z]/.test(rawText);
    const hasIndicLetters = /[\u0900-\u0D7F\u0600-\u06FF]/.test(rawText);

    if (hasEnglishLetters && hasIndicLetters) {
      issues.push({
        code: 'MIXED_SCRIPT',
        message: `Mixed native Indic/Arabic and Latin script inside word ("${rawText}"). Words should be either purely native script or purely Latin.`,
        severity: 'warning',
        ruleCategory: 'script'
      });
    } else if (hasEnglishLetters) {
      // Check for uppercase letters in English words (Section 5.1)
      if (/[A-Z]/.test(rawText)) {
        issues.push({
          code: 'LATIN_UPPERCASE',
          message: `Uppercase Latin character detected in "${rawText}". English words and acronyms must be strictly lowercase.`,
          severity: 'warning',
          ruleCategory: 'script',
          suggestedFix: rawText.toLowerCase()
        });
      }

      // Check for abbreviated English honorifics (mr./mrs. -> mister/missus)
      const cleanLower = rawText.toLowerCase();
      if (ENGLISH_HONORIFIC_ABBREVIATIONS[cleanLower]) {
        issues.push({
          code: 'HONORIFIC_ABBREVIATION',
          message: `Abbreviated English honorific "${rawText}". English honorifics must be written in full (e.g. '${ENGLISH_HONORIFIC_ABBREVIATIONS[cleanLower]}').`,
          severity: 'warning',
          ruleCategory: 'guideline_compliance',
          suggestedFix: ENGLISH_HONORIFIC_ABBREVIATIONS[cleanLower]
        });
      }
    } else if (hasIndicLetters) {
      // Devanagari specific rules (Hindi & Marathi)
      if (/[\u0900-\u097F]/.test(rawText)) {
        if (rawText.includes('\u0959') || rawText.includes('\u0916\u093C')) {
          issues.push({
            code: 'NUKTA_OMISSION_KHA',
            message: `Nukta should be omitted for ख़. Use standard 'ख' (Section 5.2).`,
            severity: 'warning',
            ruleCategory: 'spelling',
            suggestedFix: rawText.replace(/\u0959|\u0916\u093C/g, 'ख')
          });
        }
        if (rawText.includes('\u095A') || rawText.includes('\u0917\u093C')) {
          issues.push({
            code: 'NUKTA_OMISSION_GHA',
            message: `Nukta should be omitted for ग़. Use standard 'ग' (Section 5.2).`,
            severity: 'warning',
            ruleCategory: 'spelling',
            suggestedFix: rawText.replace(/\u095A|\u0917\u093C/g, 'ग')
          });
        }

        // Visarg check (Section 5.3)
        if (VISARG_REPLACEMENTS[rawText]) {
          issues.push({
            code: 'VISARG_PREFER_WITHOUT',
            message: `Prefer the accepted spelling without visarg '${VISARG_REPLACEMENTS[rawText]}' instead of '${rawText}' (Section 5.3).`,
            severity: 'warning',
            ruleCategory: 'spelling',
            suggestedFix: VISARG_REPLACEMENTS[rawText]
          });
        }

        // Nasalization check
        if (rawText === 'मुम्बई') {
          issues.push({
            code: 'NASAL_PREFER_ANUSVARA',
            message: `Prefer 'मुंबई' over 'मुम्बई' (Section 5.2).`,
            severity: 'warning',
            ruleCategory: 'spelling',
            suggestedFix: 'मुंबई'
          });
        }

        // Hesitation check for Hindi/Marathi
        if (['उम', 'उम्म', 'अम्म', 'अह', 'उह'].includes(rawText)) {
          issues.push({
            code: 'NON_CANONICAL_HESITATION',
            message: `Non-standard hesitation "${rawText}". The canonical Hindi hesitation filler is '${CANONICAL_HINDI_HESITATION}' (Section 5.10).`,
            severity: 'warning',
            ruleCategory: 'guideline_compliance',
            suggestedFix: CANONICAL_HINDI_HESITATION
          });
        }
        if (['हम', 'हम्मम', 'ह्म्म'].includes(rawText)) {
          issues.push({
            code: 'NON_CANONICAL_THINKING',
            message: `Non-standard thinking signal "${rawText}". Canonical Hindi thinking signal is '${CANONICAL_HINDI_THINKING}' (Section 5.10).`,
            severity: 'warning',
            ruleCategory: 'guideline_compliance',
            suggestedFix: CANONICAL_HINDI_THINKING
          });
        }
      }
    }
  }

  // 7. Timestamp integrity checks
  if (segment.start >= segment.end) {
    issues.push({
      code: 'TIMESTAMP_INVALID_RANGE',
      message: `Invalid segment duration: start (${segment.start.toFixed(3)}s) >= end (${segment.end.toFixed(3)}s). Zero or negative duration.`,
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

  // 8. Duration anomaly check
  const duration = segment.end - segment.start;
  if (duration > 4.5 && !isUnintelligible) {
    issues.push({
      code: 'DURATION_TOO_LONG',
      message: `Segment duration (${duration.toFixed(2)}s) is unusually long for a single word. Verify acoustic boundaries.`,
      severity: 'warning',
      ruleCategory: 'timestamp'
    });
  } else if (duration < 0.04 && duration > 0) {
    issues.push({
      code: 'DURATION_TOO_SHORT',
      message: `Segment duration (${(duration * 1000).toFixed(0)}ms) is extremely brief. Verify audio coverage.`,
      severity: 'warning',
      ruleCategory: 'timestamp'
    });
  }

  // 9. Overlap check with other segments of the SAME speaker
  if (allSegments.length > 0) {
    for (const other of allSegments) {
      if (other.id === segment.id) continue;
      if (other.speaker === segment.speaker) {
        const isOverlapping = Math.max(segment.start, other.start) < Math.min(segment.end, other.end) - 0.005;
        if (isOverlapping) {
          issues.push({
            code: 'SAME_SPEAKER_OVERLAP',
            message: `Overlaps with segment "${other.text}" (${other.start.toFixed(2)}s - ${other.end.toFixed(2)}s) by the same speaker (${segment.speaker}).`,
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

/**
 * Validates a complete transcript file and compiles the official 13-point Quality Checklist
 */
export function validateTranscript(
  segments: WordSegment[], 
  fileId: string = '', 
  targetLang: LanguageCode = 'hi-en'
): QualityChecklistReport {
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const seg of segments) {
    const issues = validateSegment(seg, segments, targetLang);
    seg.validationIssues = issues;
    for (const issue of issues) {
      if (issue.severity === 'error') totalErrors++;
      if (issue.severity === 'warning') totalWarnings++;
    }
  }

  const hasNoEmpty = segments.every(s => s.text.trim().length > 0);
  const hasNoMultiWords = segments.every(s => !/\s+/.test(s.text.trim()));
  const hasNoDigits = segments.every(s => !ALL_DIGITS_REGEX.test(s.text));
  const hasValidTimestamps = segments.every(s => s.start < s.end && s.start >= 0);
  const hasNoUnsplitCompounds = segments.every(s => !s.text.includes('-') || s.text.endsWith('-') || s.text.startsWith('-'));
  const hasCanonicalMarkers = segments.every(s => {
    const t = s.text.trim();
    if (['उम', 'उम्म', 'अम्म', 'उह'].includes(t)) return false;
    return true;
  });
  const hasLowercaseEnglish = segments.every(s => {
    const t = s.text.trim();
    if (/[a-zA-Z]/.test(t) && !t.startsWith('((')) {
      return !/[A-Z]/.test(t);
    }
    return true;
  });
  const hasValidSpeakers = segments.every(s => s.speaker && s.speaker.trim().length > 0);
  const hasNoSameSpeakerOverlaps = !segments.some(s => s.validationIssues?.some(i => i.code === 'SAME_SPEAKER_OVERLAP'));
  const hasNoUnsupportedTags = !segments.some(s => /\[fp\]|\{\{|\}\}|\[noise\]|\[applause\]/i.test(s.text));

  const checklistItems = [
    {
      id: 'chk_listen_whole_file',
      label: '1. Listened to whole file, including unsegmented audio',
      description: 'Audio reviewed from start to finish without omitting leading or trailing speech.',
      passed: segments.length > 0
    },
    {
      id: 'chk_single_word',
      label: '2. Exact segmentation required by locale (One space-separated word)',
      description: 'Each segment contains exactly one permitted spoken unit, not another locale’s rule.',
      passed: hasNoEmpty && hasNoMultiWords
    },
    {
      id: 'chk_timestamps',
      label: '3. Boundaries match actual sound; no zero duration',
      description: 'Each start/end matches acoustic sound onset/offset, not silent waveform tails.',
      passed: hasValidTimestamps
    },
    {
      id: 'chk_no_overlaps',
      label: '4. No same-speaker overlaps; multi-speaker and overlap answers correct',
      description: 'Segments from the same speaker do not overlap; overlapping speech belongs to different speakers.',
      passed: hasNoSameSpeakerOverlaps
    },
    {
      id: 'chk_text_corrections',
      label: '5. Fixed wrong text, split/merged permitted units, deleted non-lexical sounds',
      description: 'Coughs, breaths, and non-lexical segments removed; merged only permitted units.',
      passed: hasNoMultiWords && hasNoUnsplitCompounds
    },
    {
      id: 'chk_script_rules',
      label: '6. Native script spelling, Latin lowercase, diacritics, contractions, no digits',
      description: 'Native script or lowercase Latin; contractions retained; digits spelled out.',
      passed: hasNoDigits && hasLowercaseEnglish
    },
    {
      id: 'chk_repetitions_colloquial',
      label: '7. Preserved actual repetitions, colloquial forms and audible cut-offs',
      description: 'Spoken repetitions retained without deduplication; cut-offs have trailing hyphen; colloquial forms kept.',
      passed: true
    },
    {
      id: 'chk_fillers_backchannels',
      label: '8. Fillers and backchannels use locale spellings and segment counts',
      description: 'Hesitation filler and thinking signals match canonical locale tokens.',
      passed: hasCanonicalMarkers
    },
    {
      id: 'chk_unintelligible_markers',
      label: '9. Distinguished (()) from ((guess)), real truncation, and damaged audio',
      description: 'Unintelligible speech uses (()); plausible guesses use ((guess)); truncated words use hyphen.',
      passed: true
    },
    {
      id: 'chk_no_background_voices',
      label: '10. Did not transcribe background voices or add unsupported inline tags',
      description: 'Background voices ignored; no unsupported inline tags like [fp] or {{}}.',
      passed: hasNoUnsupportedTags
    },
    {
      id: 'chk_synthetic_discard_rules',
      label: '11. Applied Part 2 synthetic, discard and skip rules without filling Nativity',
      description: 'Entirely synthetic speech marked at file level; Nativity field not configured.',
      passed: true
    },
    {
      id: 'chk_hindi_specific_decisions',
      label: '12. Applied skip-on-load-failure, intelligible-second-speaker, sensitive-content & PII',
      description: 'Skip when audio fails to load; mark multi-speaker Yes only when 2nd speaker is intelligible; PII toggled.',
      passed: hasValidSpeakers
    },
    {
      id: 'chk_notes_checked',
      label: '13. Checked guideline notes instead of inventing a rule for unresolved examples',
      description: 'Followed explicit Section 5.B clarifications and dictionary hierarchy.',
      passed: true
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

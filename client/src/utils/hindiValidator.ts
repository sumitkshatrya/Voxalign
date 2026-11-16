import { WordSegment, ValidationIssue, QualityChecklistReport } from '../types';

export const DEVANAGARI_REGEX = /^[\u0900-\u097F]+$/;
export const LATIN_LOWERCASE_REGEX = /^[a-z]+(?:'[a-z]+)?$/;
export const ARABIC_DIGITS_REGEX = /[0-9]/;
export const DEVANAGARI_DIGITS_REGEX = /[\u0966-\u096F]/;
export const PUNCTUATION_REGEX = /[.,!?;:\"()[\]{}]/;
export const UNINTELLIGIBLE_REGEX = /^\(\(\)\)$/;
export const PLAUSIBLE_GUESS_REGEX = /^\(\([^\(\)]+\)\)$/;
export const CUTOFF_REGEX = /^[a-z\u0900-\u097F]+-$/;

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

export function validateClientSegment(segment: WordSegment, allSegments: WordSegment[] = []): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const rawText = (segment.text || '').trim();

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
  if (rawText.includes('-') && !rawText.endsWith('-')) {
    issues.push({
      code: 'HYPHEN_COMPOUND',
      message: `Ordinary compound hyphen detected ("${rawText}"). Components must be split into separate segments.`,
      severity: 'error',
      ruleCategory: 'guideline_compliance',
      suggestedFix: 'Split components into individual words.'
    });
  }

  // Digits prohibited
  if (ARABIC_DIGITS_REGEX.test(rawText) || DEVANAGARI_DIGITS_REGEX.test(rawText)) {
    const digitMatch = rawText.match(/\d+/)?.[0];
    const suggestion = digitMatch && HINDI_NUMBER_WORDS[digitMatch] ? HINDI_NUMBER_WORDS[digitMatch] : undefined;
    issues.push({
      code: 'DIGIT_USAGE',
      message: `Digits detected ("${rawText}"). Numbers must be spelled out in spoken words.`,
      severity: 'error',
      ruleCategory: 'script',
      suggestedFix: suggestion ? `Use '${suggestion}'` : 'Spell out number in words.'
    });
  }

  const isUnintelligible = UNINTELLIGIBLE_REGEX.test(rawText);
  const isPlausibleGuess = PLAUSIBLE_GUESS_REGEX.test(rawText);
  const isCutOff = CUTOFF_REGEX.test(rawText);

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
    const cleanedForCutoff = isCutOff ? rawText.slice(0, -1) : rawText;
    if (PUNCTUATION_REGEX.test(cleanedForCutoff)) {
      issues.push({
        code: 'PUNCTUATION_DETECTED',
        message: `Punctuation mark found in "${rawText}". Standard transcripts omit punctuation marks.`,
        severity: 'error',
        ruleCategory: 'script',
        suggestedFix: 'Remove punctuation mark.'
      });
    }

    // Script checking
    const hasEnglishLetters = /[a-zA-Z]/.test(rawText);
    const hasDevanagariLetters = /[\u0900-\u097F]/.test(rawText);

    if (hasEnglishLetters && hasDevanagariLetters) {
      issues.push({
        code: 'MIXED_SCRIPT',
        message: `Mixed Devanagari and Latin script inside word ("${rawText}").`,
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
    } else if (hasDevanagariLetters) {
      if (['उम', 'उम्म', 'अम्म', 'अह'].includes(rawText)) {
        issues.push({
          code: 'NON_CANONICAL_HESITATION',
          message: `Non-standard hesitation. Canonical Hindi hesitation filler is '${CANONICAL_HINDI_HESITATION}'.`,
          severity: 'warning',
          ruleCategory: 'guideline_compliance',
          suggestedFix: CANONICAL_HINDI_HESITATION
        });
      }
      if (['हम', 'हम्मम', 'ह्म्म'].includes(rawText)) {
        issues.push({
          code: 'NON_CANONICAL_THINKING',
          message: `Non-standard thinking signal. Canonical Hindi thinking signal is '${CANONICAL_HINDI_THINKING}'.`,
          severity: 'warning',
          ruleCategory: 'guideline_compliance',
          suggestedFix: CANONICAL_HINDI_THINKING
        });
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

export function generateClientQcReport(segments: WordSegment[], fileId: string = ''): QualityChecklistReport {
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const seg of segments) {
    const issues = validateClientSegment(seg, segments);
    seg.validationIssues = issues;
    for (const issue of issues) {
      if (issue.severity === 'error') totalErrors++;
      if (issue.severity === 'warning') totalWarnings++;
    }
  }

  const hasNoEmpty = segments.every(s => (s.text || '').trim().length > 0);
  const hasNoMultiWords = segments.every(s => !/\s+/.test((s.text || '').trim()));
  const hasNoDigits = segments.every(s => !ARABIC_DIGITS_REGEX.test(s.text) && !DEVANAGARI_DIGITS_REGEX.test(s.text));
  const hasValidTimestamps = segments.every(s => s.start < s.end && s.start >= 0);
  const hasNoUnsplitCompounds = segments.every(s => !s.text.includes('-') || s.text.endsWith('-'));
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
      description: 'Hindi in Devanagari, English in lowercase Latin, No digits.',
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
      description: 'Hesitations use "अं", thinking signals use "हम्म", unintelligible uses "(())".',
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

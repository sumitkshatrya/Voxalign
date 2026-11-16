/**
 * VoxAlign Hindi Alignment Guidelines Engine
 * Primary functional specification for Hindi (hi_IN) and Hinglish annotation
 * Based on official Hindi Alignment Guidelines
 */

import { WordSegment, ValidationIssue, QualityChecklistReport } from '../types';

// Regex patterns for script identification and validation
export const DEVANAGARI_REGEX = /^[\u0900-\u097F]+$/;
export const LATIN_LOWERCASE_REGEX = /^[a-z]+(?:'[a-z]+)?$/;
export const ARABIC_DIGITS_REGEX = /[0-9]/;
export const DEVANAGARI_DIGITS_REGEX = /[\u0966-\u096F]/;
export const PUNCTUATION_REGEX = /[.,!?;:\"()[\]{}]/;
export const UNINTELLIGIBLE_REGEX = /^\(\(\)\)$/;
export const PLAUSIBLE_GUESS_REGEX = /^\(\([^\(\)]+\)\)$/;
export const CUTOFF_REGEX = /^[a-z\u0900-\u097F]+-$/;

// Canonical hesitation and thinking words
export const CANONICAL_HINDI_HESITATION = 'अं';
export const CANONICAL_HINDI_THINKING = 'हम्म';

// Known non-lexical words that shouldn't be transcribed
export const INVALID_NON_LEXICAL_TAGS = [
  '[laughter]', '[cough]', '[applause]', '[music]', '[noise]', 
  '(laughter)', '(cough)', '(applause)', '(music)', '(noise)',
  'haha', 'hehe', 'huh'
];

// Common Hindi number words for suggestions
export const HINDI_NUMBER_WORDS: Record<string, string> = {
  '0': 'शून्य', '1': 'एक', '2': 'दो', '3': 'तीन', '4': 'चार',
  '5': 'पांच', '6': 'छह', '7': 'सात', '8': 'आठ', '9': 'नौ',
  '10': 'दस', '11': 'ग्यारह', '12': 'बारह', '15': 'पंद्रह',
  '20': 'बीस', '25': 'पच्चीस', '50': 'पचास', '100': 'सौ', '1000': 'हज़ार'
};

/**
 * Validates an individual word segment against Hindi hi_IN guidelines
 */
export function validateSegment(segment: WordSegment, allSegments: WordSegment[] = []): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const rawText = segment.text.trim();

  // 1. Check for empty text
  if (!rawText) {
    issues.push({
      code: 'SEG_EMPTY',
      message: 'Segment text is empty. Each segment must contain a spoken word or valid marker.',
      severity: 'error',
      ruleCategory: 'segmentation'
    });
    return issues;
  }

  // 2. Check for multiple words (One space-separated word per segment rule)
  if (/\s+/.test(rawText)) {
    issues.push({
      code: 'SEG_MULTI_WORD',
      message: `Multiple words detected in single segment ("${rawText}"). Only one space-separated word per segment is permitted.`,
      severity: 'error',
      ruleCategory: 'segmentation',
      suggestedFix: 'Split segment into individual word segments.'
    });
  }

  // 3. Check for compound hyphens that must be split
  // e.g. "माता-पिता" must be split into "माता" and "पिता".
  // Note: Cut-off words ending with "-" like "कम-" are valid.
  if (rawText.includes('-') && !rawText.endsWith('-')) {
    issues.push({
      code: 'HYPHEN_COMPOUND',
      message: `Ordinary compound hyphen detected ("${rawText}"). Compound words must have hyphens removed and components split.`,
      severity: 'error',
      ruleCategory: 'guideline_compliance',
      suggestedFix: 'Split into separate word segments without hyphen.'
    });
  }

  // 4. Check for digits (Numbers must be written according to spoken form)
  if (ARABIC_DIGITS_REGEX.test(rawText) || DEVANAGARI_DIGITS_REGEX.test(rawText)) {
    const digitMatch = rawText.match(/\d+/)?.[0];
    const suggestion = digitMatch && HINDI_NUMBER_WORDS[digitMatch] ? HINDI_NUMBER_WORDS[digitMatch] : undefined;
    issues.push({
      code: 'DIGIT_USAGE',
      message: `Digits detected in segment ("${rawText}"). Numbers must be spelled out in spoken form (e.g. 'एक', 'five').`,
      severity: 'error',
      ruleCategory: 'script',
      suggestedFix: suggestion ? `Use '${suggestion}' if spoken in Hindi.` : 'Spell out number in Devanagari or Latin letters.'
    });
  }

  // 5. Special Markers validation
  const isUnintelligible = UNINTELLIGIBLE_REGEX.test(rawText);
  const isPlausibleGuess = PLAUSIBLE_GUESS_REGEX.test(rawText);
  const isCutOff = CUTOFF_REGEX.test(rawText);

  // If not a special marker, check script and punctuation
  if (!isUnintelligible && !isPlausibleGuess) {
    // Check forbidden non-lexical acoustic tags
    const lowerRaw = rawText.toLowerCase();
    if (INVALID_NON_LEXICAL_TAGS.includes(lowerRaw)) {
      issues.push({
        code: 'NON_LEXICAL_SOUND',
        message: `Non-lexical acoustic sound "${rawText}" should not be represented as a word.`,
        severity: 'warning',
        ruleCategory: 'guideline_compliance',
        suggestedFix: 'Remove segment if audio is just laughing/coughing/noise.'
      });
    }

    // Check forbidden general punctuation (commas, periods, exclamation, etc.)
    const cleanedForCutoff = isCutOff ? rawText.slice(0, -1) : rawText;
    if (PUNCTUATION_REGEX.test(cleanedForCutoff)) {
      issues.push({
        code: 'PUNCTUATION_DETECTED',
        message: `Punctuation mark found in "${rawText}". Standard transcripts do not include punctuation (full stops, commas, etc.).`,
        severity: 'error',
        ruleCategory: 'script',
        suggestedFix: 'Remove punctuation marks from word.'
      });
    }

    // 6. Script validation: Hindi must be Devanagari, English must be lowercase Latin
    const isDevanagari = /^[\u0900-\u097F\-]+$/.test(rawText);
    const hasEnglishLetters = /[a-zA-Z]/.test(rawText);
    const hasDevanagariLetters = /[\u0900-\u097F]/.test(rawText);

    if (hasEnglishLetters && hasDevanagariLetters) {
      issues.push({
        code: 'MIXED_SCRIPT',
        message: `Mixed Devanagari and Latin script inside word ("${rawText}"). Words should be either purely Devanagari or purely Latin.`,
        severity: 'warning',
        ruleCategory: 'script'
      });
    } else if (hasEnglishLetters) {
      // Check for uppercase letters in English words
      if (/[A-Z]/.test(rawText)) {
        issues.push({
          code: 'LATIN_UPPERCASE',
          message: `Uppercase Latin character detected in "${rawText}". English words and acronyms must be strictly lowercase.`,
          severity: 'warning',
          ruleCategory: 'script',
          suggestedFix: rawText.toLowerCase()
        });
      }
    } else if (isDevanagari) {
      // Devanagari checks:
      // Hesitation check: Check if speaker used non-standard hesitation spelling
      if (['उम', 'उम्म', 'अम्म', 'अह'].includes(rawText)) {
        issues.push({
          code: 'NON_CANONICAL_HESITATION',
          message: `Non-standard hesitation "${rawText}". The canonical Hindi hesitation filler is '${CANONICAL_HINDI_HESITATION}'.`,
          severity: 'warning',
          ruleCategory: 'guideline_compliance',
          suggestedFix: CANONICAL_HINDI_HESITATION
        });
      }
      // Thinking signal check
      if (['हम', 'हम्मम', 'ह्म्म'].includes(rawText)) {
        issues.push({
          code: 'NON_CANONICAL_THINKING',
          message: `Non-standard thinking signal "${rawText}". Canonical Hindi thinking signal is '${CANONICAL_HINDI_THINKING}'.`,
          severity: 'warning',
          ruleCategory: 'guideline_compliance',
          suggestedFix: CANONICAL_HINDI_THINKING
        });
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

  // 8. Duration anomaly check (e.g. single word segment > 4 seconds or < 0.04 seconds)
  const duration = segment.end - segment.start;
  if (duration > 4.5 && !isUnintelligible) {
    issues.push({
      code: 'DURATION_TOO_LONG',
      message: `Segment duration (${duration.toFixed(2)}s) is unusually long for a single word. Verify boundaries.`,
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
        // Check for time overlap
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
 * Validates a complete transcript file and compiles the Page 17 Quality Checklist
 */
export function validateTranscript(segments: WordSegment[], fileId: string = ''): QualityChecklistReport {
  let totalErrors = 0;
  let totalWarnings = 0;

  // Run validation on all segments
  for (const seg of segments) {
    const issues = validateSegment(seg, segments);
    seg.validationIssues = issues;
    for (const issue of issues) {
      if (issue.severity === 'error') totalErrors++;
      if (issue.severity === 'warning') totalWarnings++;
    }
  }

  // Page 17 Hindi Guidelines Quality Checklist verification
  const hasNoEmpty = segments.every(s => s.text.trim().length > 0);
  const hasNoMultiWords = segments.every(s => !/\s+/.test(s.text.trim()));
  const hasNoDigits = segments.every(s => !ARABIC_DIGITS_REGEX.test(s.text) && !DEVANAGARI_DIGITS_REGEX.test(s.text));
  const hasValidTimestamps = segments.every(s => s.start < s.end && s.start >= 0);
  const hasNoUnsplitCompounds = segments.every(s => !s.text.includes('-') || s.text.endsWith('-'));
  const hasCanonicalMarkers = segments.every(s => {
    const t = s.text.trim();
    if (['उम', 'उम्म', 'अम्म'].includes(t)) return false;
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
  const hasNoSameSpeakerOverlaps = totalErrors === 0 || !segments.some(s => s.validationIssues?.some(i => i.code === 'SAME_SPEAKER_OVERLAP'));

  const checklistItems = [
    {
      id: 'chk_single_word',
      label: 'Single Word Segmentation',
      description: 'Each segment contains exactly one spoken word (or valid special tag).',
      passed: hasNoEmpty && hasNoMultiWords
    },
    {
      id: 'chk_script_rules',
      label: 'Script & Casing Standards',
      description: 'Hindi in Devanagari; English in lowercase Latin; No digits (0-9 or ०-९).',
      passed: hasNoDigits && hasLowercaseEnglish
    },
    {
      id: 'chk_timestamps',
      label: 'Timestamp Integrity',
      description: 'All start < end, non-negative, non-zero durations without fabrication.',
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

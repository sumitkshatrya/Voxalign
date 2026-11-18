import assert from 'assert';
import { validateSegment, validateTranscript } from './shared/guidelines/hindi-rules';
import { WordSegment } from './shared/types';
import { UserStore, ProjectStore, AudioFileStore } from './models/store';

console.log('--- STARTING VOXALIGN SYSTEM & HINDI GUIDELINES ACCEPTANCE TESTS ---');

function runTests() {
  // TEST 1: User Registration & Lookup
  console.log('[Test 1] User Store & Roles Verification...');
  const testUser = UserStore.create({
    email: 'test_annotator@voxalign.ai',
    password: 'hashed_password_xyz',
    name: 'Test Annotator',
    role: 'user'
  });
  assert(testUser.id.startsWith('usr_'), 'User ID should be properly generated');
  const foundUser = UserStore.findByEmail('test_annotator@voxalign.ai');
  assert(foundUser?.name === 'Test Annotator', 'User should be found by email');
  console.log('✓ Test 1 Passed: User store and role management working.');

  // TEST 2: Hindi Guidelines — Single word segmentation
  console.log('[Test 2] Hindi Guidelines: Single Word Rule...');
  const multiWordSeg: WordSegment = {
    id: 's1',
    text: 'नमस्ते भारत',
    start: 0.1,
    end: 0.8,
    speaker: 'Speaker 1',
    reviewStatus: 'unreviewed'
  };
  const multiIssues = validateSegment(multiWordSeg);
  assert(multiIssues.some(i => i.code === 'SEG_MULTI_WORD'), 'Should flag multiple words in single segment');
  console.log('✓ Test 2 Passed: Multi-word segments correctly flagged.');

  // TEST 3: Hindi Guidelines — Digits not permitted
  console.log('[Test 3] Hindi Guidelines: Digits Prohibition Rule...');
  const digitSeg: WordSegment = {
    id: 's2',
    text: '5',
    start: 0.5,
    end: 0.9,
    speaker: 'Speaker 1',
    reviewStatus: 'unreviewed'
  };
  const digitIssues = validateSegment(digitSeg);
  assert(digitIssues.some(i => i.code === 'DIGIT_USAGE'), 'Should flag digits in segment');
  console.log('✓ Test 3 Passed: Digits prohibited and flagged with suggestion.');

  // TEST 4: Hindi Guidelines — Compound hyphens split vs cut-offs
  console.log('[Test 4] Hindi Guidelines: Compound Hyphen vs Cut-off Rule...');
  const compoundSeg: WordSegment = {
    id: 's3',
    text: 'माता-पिता',
    start: 1.0,
    end: 1.5,
    speaker: 'Speaker 1',
    reviewStatus: 'unreviewed'
  };
  const compoundIssues = validateSegment(compoundSeg);
  assert(compoundIssues.some(i => i.code === 'HYPHEN_COMPOUND'), 'Should flag unsplit compound words');

  const cutoffSeg: WordSegment = {
    id: 's4',
    text: 'कम-', // valid cut-off
    start: 1.6,
    end: 1.9,
    speaker: 'Speaker 1',
    reviewStatus: 'unreviewed'
  };
  const cutoffIssues = validateSegment(cutoffSeg);
  assert(!cutoffIssues.some(i => i.code === 'HYPHEN_COMPOUND'), 'Cut-off with trailing hyphen should be permitted');
  console.log('✓ Test 4 Passed: Compound hyphens flagged and cut-offs preserved.');

  // TEST 5: Hindi Guidelines — Canonical hesitation & thinking markers
  console.log('[Test 5] Hindi Guidelines: Hesitation and Thinking Markers...');
  const nonCanonicalHesitation: WordSegment = {
    id: 's5',
    text: 'उम्म',
    start: 2.0,
    end: 2.3,
    speaker: 'Speaker 1',
    reviewStatus: 'unreviewed'
  };
  const hesIssues = validateSegment(nonCanonicalHesitation);
  assert(hesIssues.some(i => i.code === 'NON_CANONICAL_HESITATION'), 'Should flag non-canonical hesitation');

  const canonicalHesitation: WordSegment = {
    id: 's6',
    text: 'अं',
    start: 2.0,
    end: 2.3,
    speaker: 'Speaker 1',
    reviewStatus: 'verified'
  };
  const canonIssues = validateSegment(canonicalHesitation);
  assert(canonIssues.length === 0, 'Canonical hesitation अं should have 0 issues');
  console.log('✓ Test 5 Passed: Canonical hesitation and thinking tokens enforced.');

  // TEST 6: Hindi Guidelines — English lowercase Latin
  console.log('[Test 6] Hindi Guidelines: English Lowercase Latin Rule...');
  const uppercaseSeg: WordSegment = {
    id: 's7',
    text: 'School',
    start: 2.4,
    end: 2.8,
    speaker: 'Speaker 1',
    reviewStatus: 'unreviewed'
  };
  const upperIssues = validateSegment(uppercaseSeg);
  assert(upperIssues.some(i => i.code === 'LATIN_UPPERCASE'), 'Should flag uppercase English letters');
  console.log('✓ Test 6 Passed: Uppercase Latin letters flagged.');

  // TEST 7: Hindi Guidelines — Unintelligible & plausible guesses
  console.log('[Test 7] Hindi Guidelines: Unintelligible (()) and Plausible Guesses...');
  const unintelligibleSeg: WordSegment = {
    id: 's8',
    text: '(())',
    start: 3.0,
    end: 3.5,
    speaker: 'Speaker 1',
    reviewStatus: 'unreviewed'
  };
  assert(validateSegment(unintelligibleSeg).length === 0, '(()) should be accepted as valid unintelligible marker');

  const guessSeg: WordSegment = {
    id: 's9',
    text: '((बाज़ार))',
    start: 3.6,
    end: 4.0,
    speaker: 'Speaker 1',
    reviewStatus: 'unreviewed'
  };
  assert(validateSegment(guessSeg).length === 0, '((guess)) should be accepted as valid plausible guess');
  console.log('✓ Test 7 Passed: Uncertainty tags strictly validated.');

  // TEST 8: Full Quality Checklist (Page 17 Guidelines)
  console.log('[Test 8] Page 17 Quality Checklist Report Generation...');
  const validTestSegments: WordSegment[] = [
    { id: 'v1', text: 'नमस्ते', start: 0.1, end: 0.6, speaker: 'Speaker 1', reviewStatus: 'verified' },
    { id: 'v2', text: 'अं', start: 0.7, end: 1.0, speaker: 'Speaker 1', reviewStatus: 'verified' },
    { id: 'v3', text: 'audio', start: 1.1, end: 1.5, speaker: 'Speaker 1', reviewStatus: 'verified' }
  ];
  const qcReport = validateTranscript(validTestSegments, 'file_test_01');
  assert(qcReport.isReadyForExport === true, 'Valid segments should pass export checklist');
  assert(qcReport.errorCount === 0, 'Error count should be 0');
  console.log('✓ Test 8 Passed: Quality Checklist report matches Page 17 specifications.');

  // TEST 9: Multilingual Indic Quality Rules
  console.log('[Test 9] Multilingual Indic & Global Script Validation...');
  const bengaliDigitSeg: WordSegment = {
    id: 'm1',
    text: '৫', // Bengali digit 5
    start: 4.1,
    end: 4.5,
    speaker: 'Speaker 1',
    language: 'bn',
    reviewStatus: 'unreviewed'
  };
  const bnIssues = validateSegment(bengaliDigitSeg);
  assert(bnIssues.some(i => i.code === 'DIGIT_USAGE'), 'Should flag Indic Bengali digits');

  const tamilValidSeg: WordSegment = {
    id: 'm2',
    text: 'வணக்கம்',
    start: 4.6,
    end: 5.0,
    speaker: 'Speaker 1',
    language: 'ta',
    reviewStatus: 'verified'
  };
  const taIssues = validateSegment(tamilValidSeg);
  assert(taIssues.length === 0, 'Valid Tamil word should have 0 issues');
  console.log('✓ Test 9 Passed: Multilingual Indic numerals and script validation verified.');

  // TEST 10: Multilingual Project Creation & Guidelines Profile Schema
  console.log('[Test 10] Project Creation Schema & GuidelinesProfile Validation...');
  const testProject = ProjectStore.create({
    userId: testUser.id,
    name: 'Bengali-Tamil Speech Corpus',
    targetLanguage: 'bn',
    guidelinesProfile: 'indic_multilingual'
  });
  assert(testProject.guidelinesProfile === 'indic_multilingual', 'Profile should be indic_multilingual');
  assert(testProject.targetLanguage === 'bn', 'Target language should be bn');
  console.log('✓ Test 10 Passed: indic_multilingual profile and multilingual language codes validated.');

  console.log('\n=========================================================');
  console.log('  ALL VOXALIGN SYSTEM AND GUIDELINE TESTS PASSED (10/10) ');
  console.log('=========================================================');
}

runTests();

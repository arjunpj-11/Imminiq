import type { LessonAnswerAttempt } from '../../types/tracker.types';

export const formatVerdict = (verdict?: string) => {
  if (!verdict) return 'Not checked';

  return verdict
    .split('_')
    .join(' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const formatDateTime = (value?: string) => {
  if (!value) return '';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export const uniqueQuestions = (questions: string[]) => {
  const seen = new Set<string>();

  return questions.filter((question) => {
    const normalized = question.trim().toLowerCase();

    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);

    return true;
  });
};

export const getAttemptFeedback = (attempt: LessonAnswerAttempt) => {
  const feedback = attempt.feedback;

  if (
    feedback &&
    typeof feedback === 'object' &&
    'feedback' in feedback &&
    typeof feedback.feedback === 'string'
  ) {
    return feedback.feedback;
  }

  return '';
};

export const getAttemptCorrectedAnswer = (attempt: LessonAnswerAttempt) => {
  const feedback = attempt.feedback;

  if (
    feedback &&
    typeof feedback === 'object' &&
    'correctedAnswer' in feedback &&
    typeof feedback.correctedAnswer === 'string'
  ) {
    return feedback.correctedAnswer;
  }

  return '';
};

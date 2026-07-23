import type { ITrackerClanChallengeHistory } from '../types/tracker.types';

export const getBattleHistoryQuestions = (history: ITrackerClanChallengeHistory) => {
  const questions = new Map<
    string,
    {
      questionId: string;
      topicTitle: string;
      prompt: string;
      correctAnswer: string;
      isCheckpoint: boolean;
      firstAskedAt: number;
    }
  >();

  history.players.forEach((player) => {
    player.answers.forEach((entry) => {
      const askedAt = new Date(entry.answeredAt).getTime();
      const existing = questions.get(entry.questionId);
      if (!existing) {
        questions.set(entry.questionId, {
          questionId: entry.questionId,
          topicTitle: entry.topicTitle,
          prompt: entry.prompt,
          correctAnswer: entry.correctAnswer,
          isCheckpoint: entry.isCheckpoint,
          firstAskedAt: askedAt,
        });
      } else if (askedAt < existing.firstAskedAt) {
        existing.firstAskedAt = askedAt;
      }
    });
  });

  return [...questions.values()]
    .sort((left, right) => left.firstAskedAt - right.firstAskedAt)
    .map((question) => ({
      ...question,
      attempts: history.players.map((player) => ({
        player: player.user,
        answer: player.answers.find((entry) => entry.questionId === question.questionId) ?? null,
      })),
    }));
};

export const downloadBattleHistoryPdf = async (history: ITrackerClanChallengeHistory) => {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const document = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const questions = getBattleHistoryQuestions(history);
  const rows = questions.map((question, index) => [
    index + 1,
    question.topicTitle,
    question.prompt,
    question.correctAnswer,
    ...question.attempts.map(({ answer }) =>
      answer ? `${answer.answer}\n${answer.isCorrect ? 'Correct' : 'Incorrect'}` : 'Not asked'
    ),
  ]);

  document.setFillColor(28, 26, 24);
  document.rect(0, 0, document.internal.pageSize.getWidth(), 82, 'F');
  document.setTextColor(255, 255, 255);
  document.setFont('helvetica', 'bold');
  document.setFontSize(20);
  document.text('Imminiq Guild Battle History', 36, 38);
  document.setFont('helvetica', 'normal');
  document.setFontSize(9);
  document.setTextColor(205, 199, 192);
  document.text(
    `Completed ${new Date(history.completedAt).toLocaleString()} · ${history.players.map((player) => `${player.user.name}: ${player.score}`).join(' · ')}`,
    36,
    58
  );
  autoTable(document, {
    startY: 100,
    head: [
      [
        '#',
        'Topic',
        'Question',
        'Correct answer',
        ...history.players.map((player) => `${player.user.name}'s attempt`),
      ],
    ],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 4, overflow: 'linebreak', valign: 'top' },
    headStyles: { fillColor: [82, 73, 66], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [250, 248, 246] },
    columnStyles: {
      2: { cellWidth: 210 },
      3: { cellWidth: 115 },
      4: { cellWidth: 115 },
      5: { cellWidth: 115 },
    },
    margin: { left: 30, right: 30, bottom: 30 },
  });
  document.save(`imminiq-battle-history-${history.challengeId}.pdf`);
};

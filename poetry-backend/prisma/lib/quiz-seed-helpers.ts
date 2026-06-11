import type { Prisma, PrismaClient } from "@prisma/client";

export const QUIZ_ICONS = [
  "✍️",
  "📚",
  "🎯",
  "🌿",
  "📅",
  "📝",
  "⭐",
  "🏛️",
  "🎭",
  "💫",
];
export const QUIZ_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#A78BFA",
  "#F59E0B",
  "#10B981",
  "#6366F1",
  "#EC4899",
  "#14B8A6",
];
export const QUIZ_IMAGES = [
  "/images/quizzes/author-work.jpg",
  "/images/quizzes/chronology.jpg",
  "/images/quizzes/fill-blank.jpg",
];

export type AuthorRefs = Record<
  string,
  { id: number; name: string; birthYear: number | null }
>;

export async function deleteQuizzesExcept(
  prisma: PrismaClient,
  keepTitles: string[],
) {
  const bulk = await prisma.quiz.findMany({
    where: { title: { notIn: keepTitles } },
    select: { id: true },
  });
  const bulkIds = bulk.map((q) => q.id);
  if (bulkIds.length === 0) return 0;

  const questions = await prisma.question.findMany({
    where: { quizId: { in: bulkIds } },
    select: { id: true },
  });
  const questionIds = questions.map((q) => q.id);

  if (questionIds.length > 0) {
    await prisma.itemZone.deleteMany({
      where: {
        OR: [
          { item: { questionId: { in: questionIds } } },
          { zone: { questionId: { in: questionIds } } },
        ],
      },
    });
    await prisma.item.deleteMany({ where: { questionId: { in: questionIds } } });
    await prisma.zone.deleteMany({ where: { questionId: { in: questionIds } } });
    await prisma.question.deleteMany({ where: { id: { in: questionIds } } });
  }

  await prisma.quizAssignmentItem.deleteMany({
    where: { quizId: { in: bulkIds } },
  });
  const deleted = await prisma.quiz.deleteMany({ where: { id: { in: bulkIds } } });
  return deleted.count;
}

export async function resetQuizzes(prisma: PrismaClient) {
  await prisma.quizAttemptAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizAssignmentItem.deleteMany();
  await prisma.itemZone.deleteMany();
  await prisma.item.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
}

export type MatchPair = [string, string];

export function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Адна карточка аўтара і адна зона твора — без паўтораў у межах задання. */
export function sanitizeMatchPairs(pairs: MatchPair[]): MatchPair[] {
  const result: MatchPair[] = [];
  const usedAuthors = new Set<string>();
  const usedWorks = new Set<string>();

  for (const [work, author] of pairs) {
    const normalizedWork = work.trim();
    const normalizedAuthor = author.trim();
    if (
      !normalizedWork ||
      !normalizedAuthor ||
      usedAuthors.has(normalizedAuthor) ||
      usedWorks.has(normalizedWork)
    ) {
      continue;
    }
    result.push([normalizedWork, normalizedAuthor]);
    usedAuthors.add(normalizedAuthor);
    usedWorks.add(normalizedWork);
    if (result.length >= 4) break;
  }

  return result;
}

export function collectPairPool(
  sets: Array<{ pairs: MatchPair[] }>,
): MatchPair[] {
  return sets.flatMap((set) => set.pairs);
}

/** Адзіны твор мэтавага аўтара + 3 адвольныя творы іншых аўтараў. */
export function buildMixedAuthorPairs(
  targetAuthor: string,
  targetWorks: string[],
  pool: MatchPair[],
  size = 4,
): MatchPair[] {
  const pairs: MatchPair[] = [];
  const usedAuthors = new Set<string>();
  const usedWorks = new Set<string>();
  const cleanAuthor = targetAuthor.trim();

  const targetWork = targetWorks
    .map((work) => work.trim())
    .find((work) => work && !usedWorks.has(work));

  if (targetWork) {
    pairs.push([targetWork, cleanAuthor]);
    usedAuthors.add(cleanAuthor);
    usedWorks.add(targetWork);
  }

  for (const [work, author] of pool) {
    if (pairs.length >= size) break;
    const normalizedWork = work.trim();
    const normalizedAuthor = author.trim();
    if (
      !normalizedWork ||
      !normalizedAuthor ||
      usedAuthors.has(normalizedAuthor) ||
      usedWorks.has(normalizedWork)
    ) {
      continue;
    }
    pairs.push([normalizedWork, normalizedAuthor]);
    usedAuthors.add(normalizedAuthor);
    usedWorks.add(normalizedWork);
  }

  return sanitizeMatchPairs(pairs);
}

type PreparedMatchQuestion = {
  text: string;
  pairs: MatchPair[];
  reverse: boolean;
  zones: { content: string; order: number }[];
  items: { content: string; order: number }[];
};

function buildMatchQuestionEntities(
  text: string,
  pairs: MatchPair[],
  reverse = false,
): PreparedMatchQuestion | null {
  const cleanPairs = sanitizeMatchPairs(pairs);
  if (cleanPairs.length < 2) return null;

  const zones = reverse
    ? cleanPairs.map(([, author], order) => ({ content: author, order }))
    : cleanPairs.map(([work], order) => ({ content: work, order }));

  const itemRows = reverse
    ? cleanPairs.map(([work]) => ({ content: work }))
    : cleanPairs.map(([, author]) => ({ content: author }));

  const items = shuffleArray(itemRows).map((item, order) => ({
    content: item.content,
    order,
  }));

  return {
    text,
    pairs: cleanPairs,
    reverse,
    zones,
    items,
  };
}

async function linkMatchItems(
  prisma: PrismaClient,
  question: {
    items: { id: string; content: string }[];
    zones: { id: string; content: string }[];
  },
  pairs: MatchPair[],
  reverse = false,
) {
  for (const [work, author] of pairs) {
    const zoneContent = reverse ? author : work;
    const itemContent = reverse ? work : author;
    const zone = question.zones.find((entry) => entry.content === zoneContent);
    const item = question.items.find((entry) => entry.content === itemContent);

    if (!zone || !item) {
      throw new Error(
        `Match link failed for "${zoneContent}" <- "${itemContent}"`,
      );
    }

    await prisma.itemZone.create({
      data: {
        itemId: item.id,
        zoneId: zone.id,
        isCorrect: true,
      },
    });
  }
}

async function linkFillItems(
  prisma: PrismaClient,
  question: { items: { id: string }[]; zones: { id: string }[] },
) {
  for (let i = 0; i < question.items.length; i++) {
    await prisma.itemZone.create({
      data: {
        itemId: question.items[i].id,
        zoneId: question.zones[i].id,
        isCorrect: true,
      },
    });
  }
}

export type MatchQuestionInput = {
  text: string;
  pairs: [string, string][];
  reverse?: boolean;
};

export type FillQuestionInput = {
  text: string;
  lines: { prompt: string; answer: string }[];
};

export type OrderQuestionInput = {
  text: string;
  poets: { name: string; year: number; subtitle: string }[];
};

export function chunkPairs(
  pairs: [string, string][],
  size = 2,
): [string, string][][] {
  const chunks: [string, string][][] = [];
  for (let i = 0; i < pairs.length; i += size) {
    chunks.push(pairs.slice(i, i + size));
  }
  return chunks;
}

export async function createMatchQuiz(
  prisma: PrismaClient,
  title: string,
  description: string,
  questions: MatchQuestionInput[],
  index: number,
) {
  const preparedQuestions = questions
    .map((question) =>
      buildMatchQuestionEntities(question.text, question.pairs, question.reverse),
    )
    .filter((question): question is PreparedMatchQuestion => question !== null);

  if (preparedQuestions.length === 0) return;

  const quiz = await prisma.quiz.create({
    data: {
      title,
      description,
      icon: QUIZ_ICONS[index % QUIZ_ICONS.length],
      color: QUIZ_COLORS[index % QUIZ_COLORS.length],
      imageUrl: QUIZ_IMAGES[index % QUIZ_IMAGES.length],
      questions: {
        create: preparedQuestions.map((question) => ({
          text: question.text,
          type: "MATCH" as const,
          zones: { create: question.zones },
          items: { create: question.items },
        })),
      },
    },
    include: {
      questions: { include: { items: true, zones: true } },
    },
  });

  for (let i = 0; i < quiz.questions.length; i += 1) {
    const prepared = preparedQuestions[i];
    await linkMatchItems(
      prisma,
      quiz.questions[i],
      prepared.pairs,
      prepared.reverse,
    );
  }
}

export async function createFillQuiz(
  prisma: PrismaClient,
  title: string,
  description: string,
  questions: FillQuestionInput[],
  index: number,
) {
  const quiz = await prisma.quiz.create({
    data: {
      title,
      description,
      icon: QUIZ_ICONS[(index + 3) % QUIZ_ICONS.length],
      color: QUIZ_COLORS[(index + 3) % QUIZ_COLORS.length],
      imageUrl: QUIZ_IMAGES[2],
      questions: {
        create: questions.map((q) => ({
          text: q.text,
          type: "FILL" as const,
          content: { answers: q.lines.map((line) => line.answer) },
          zones: {
            create: q.lines.map((line, order) => ({
              content: line.prompt,
              order,
            })),
          },
          items: {
            create: q.lines.map((line, order) => ({
              content: line.answer,
              order,
            })),
          },
        })),
      },
    },
    include: {
      questions: { include: { items: true, zones: true } },
    },
  });

  for (const question of quiz.questions) {
    await linkFillItems(prisma, question);
  }
}

export async function createOrderQuiz(
  prisma: PrismaClient,
  title: string,
  description: string,
  questions: OrderQuestionInput[],
  index: number,
) {
  await prisma.quiz.create({
    data: {
      title,
      description,
      icon: QUIZ_ICONS[(index + 5) % QUIZ_ICONS.length],
      color: QUIZ_COLORS[(index + 5) % QUIZ_COLORS.length],
      imageUrl: QUIZ_IMAGES[1],
      questions: {
        create: questions.map((q) => ({
          text: q.text,
          type: "ORDER" as const,
          content: {
            timelineStart: Math.min(...q.poets.map((p) => p.year)) - 5,
            timelineEnd: Math.max(...q.poets.map((p) => p.year)) + 5,
          },
          items: {
            create: q.poets.map((poet, order) => ({
              content: poet.name,
              order,
              year: poet.year,
              subtitle: poet.subtitle,
            })),
          },
        })),
      },
    },
  });
}

type RichQuizPart =
  | { type: "MATCH"; text: string; pairs: [string, string][]; reverse?: boolean }
  | { type: "FILL"; text: string; lines: { prompt: string; answer: string }[] };

/** Квиз з некалькіх заданняў (MATCH + FILL) — для аўтарскіх тэстаў. */
export async function createRichQuiz(
  prisma: PrismaClient,
  title: string,
  description: string,
  parts: RichQuizPart[],
  index: number,
) {
  const preparedMatchParts: PreparedMatchQuestion[] = [];
  const questionCreates: Prisma.QuestionCreateWithoutQuizInput[] = [];

  for (const part of parts) {
    if (part.type === "MATCH") {
      const prepared = buildMatchQuestionEntities(
        part.text,
        part.pairs,
        part.reverse,
      );
      if (!prepared) continue;
      preparedMatchParts.push(prepared);
      questionCreates.push({
        text: prepared.text,
        type: "MATCH",
        zones: { create: prepared.zones },
        items: { create: prepared.items },
      });
    } else {
      questionCreates.push({
        text: part.text,
        type: "FILL",
        content: { answers: part.lines.map((line) => line.answer) },
        zones: {
          create: part.lines.map((line, order) => ({
            content: line.prompt,
            order,
          })),
        },
        items: {
          create: part.lines.map((line, order) => ({
            content: line.answer,
            order,
          })),
        },
      });
    }
  }

  const quiz = await prisma.quiz.create({
    data: {
      title,
      description,
      icon: QUIZ_ICONS[index % QUIZ_ICONS.length],
      color: QUIZ_COLORS[index % QUIZ_COLORS.length],
      imageUrl: QUIZ_IMAGES[index % QUIZ_IMAGES.length],
      questions: { create: questionCreates },
    },
    include: {
      questions: { include: { items: true, zones: true } },
    },
  });

  let matchIndex = 0;
  for (const question of quiz.questions) {
    if (question.type === "MATCH") {
      const prepared = preparedMatchParts[matchIndex];
      matchIndex += 1;
      await linkMatchItems(
        prisma,
        question,
        prepared.pairs,
        prepared.reverse,
      );
    } else if (question.type === "FILL") {
      await linkFillItems(prisma, question);
    }
  }
}

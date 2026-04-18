import { Question, Item, ItemZone, QuestionType } from "@prisma/client";

interface QuestionWithRelations extends Question {
  items: (Item & { itemZones: ItemZone[] })[];
  zones: any[];
}

interface UserAnswer {
  questionId: string;
  itemId: string;
  zoneId?: string;
  order?: number;
  content?: string;
}

interface QuestionContent {
  answers?: string[];
}

export class QuestionValidators {
  public checkQuestion(
    question: QuestionWithRelations,
    userAnswers: UserAnswer[],
  ): boolean {
    switch (question.type) {
      case QuestionType.MATCH:
        return this.checkMatch(question, userAnswers);
      case QuestionType.ORDER:
        return this.checkOrder(question, userAnswers);
      case QuestionType.FILL:
        return this.checkFill(question, userAnswers);
      default:
        return false;
    }
  }

  public checkMatch(
    question: QuestionWithRelations,
    userAnswers: UserAnswer[],
  ): boolean {
    const correctCount = question.items
      .flatMap((item) => item.itemZones)
      .filter((iz) => iz.isCorrect).length;

    const used = new Set<string>();

    for (const answer of userAnswers) {
      const key = `${answer.itemId}-${answer.zoneId}`;
      if (used.has(key)) return false;

      used.add(key);
      const item = question.items.find((i) => i.id === answer.itemId);
      if (!item) return false;

      const relation = item.itemZones.find((iz) => iz.zoneId === answer.zoneId);

      if (!relation || !relation.isCorrect) {
        return false;
      }
    }

    return true;
  }

  public checkOrder(
    question: QuestionWithRelations,
    userAnswers: UserAnswer[],
  ): boolean {
    if (question.items.length !== userAnswers.length) {
      return false;
    }

    const itemsMap = new Map<string, Item & { itemZones: ItemZone[] }>(
      question.items.map((item) => [item.id, item]),
    );

    const usedOrders = new Set<number>();

    for (const answer of userAnswers) {
      const item = itemsMap.get(answer.itemId);
      if (!item) return false;

      // проверка дубликатов order
      if (answer.order !== undefined && usedOrders.has(answer.order)) {
        return false;
      }
      if (answer.order !== undefined) {
        usedOrders.add(answer.order);
      }

      if (item.order !== answer.order) {
        return false;
      }
    }

    return true;
  }

  public checkFill(
    question: QuestionWithRelations,
    userAnswers: UserAnswer[],
  ): boolean {
    const content = question.content as QuestionContent | null;
    const correctAnswers = content?.answers || [];

    if (correctAnswers.length !== userAnswers.length) {
      return false;
    }

    for (let i = 0; i < correctAnswers.length; i++) {
      const correct = correctAnswers[i].toLowerCase().trim();

      // ищем ответ пользователя по order
      const userAnswer = userAnswers.find((a) => a.order === i + 1);

      if (!userAnswer) return false;

      const user = userAnswer.content?.toLowerCase().trim();

      if (correct !== user) {
        return false;
      }
    }

    return true;
  }
}

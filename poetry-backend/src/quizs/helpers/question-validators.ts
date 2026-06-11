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
    if (question.items.length !== userAnswers.length) {
      return false;
    }

    const usedItems = new Set<string>();
    const usedZones = new Set<string>();

    for (const answer of userAnswers) {
      if (!answer.zoneId) return false;
      if (usedItems.has(answer.itemId) || usedZones.has(answer.zoneId)) {
        return false;
      }

      usedItems.add(answer.itemId);
      usedZones.add(answer.zoneId);
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

    const usedItems = new Set<string>();

    for (const answer of userAnswers) {
      const item = itemsMap.get(answer.itemId);
      if (!item) return false;

      if (usedItems.has(answer.itemId) || answer.order === undefined) {
        return false;
      }
      usedItems.add(answer.itemId);

      if (item.year !== null) {
        if (Math.abs(answer.order - item.year) > 5) {
          return false;
        }

        continue;
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
    return this.checkMatch(question, userAnswers);
  }
}

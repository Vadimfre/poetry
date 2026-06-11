import type { Poem } from "./poem.types";
import type { ProseWorkListItem } from "./prose.types";

export type CurriculumKind = "STUDY" | "MEMORIZE" | "DISCUSSION" | "EXTRA";

export type SchoolGradeOverview = {
  grade: number;
  poemCount: number;
  proseCount: number;
  memorizeCount: number;
};

export type SchoolGradesResponse = {
  grades: SchoolGradeOverview[];
};

export type SchoolGradeCurriculum = {
  grade: number;
  study: Poem[];
  memorize: Poem[];
  discussion: Poem[];
  extra: Poem[];
  prose: {
    study: ProseWorkListItem[];
    memorize: ProseWorkListItem[];
    discussion: ProseWorkListItem[];
    extra: ProseWorkListItem[];
  };
  totals: {
    poems: number;
    prose: number;
  };
};

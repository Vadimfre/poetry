"use client";

import { useState } from "react";
import { adminApi } from "@/src/shared/api";
import type { Author } from "@/src/shared/types/poem.types";
import type { Category } from "@/src/shared/types/category.types";
import type {
  ContentLocale,
  SchoolGradeEntry,
} from "@/src/shared/types/admin.types";
import type { CurriculumKind } from "@/src/shared/types/school.types";
import type { Poem } from "@/src/shared/types/poem.types";
import {
  LocaleTabs,
  buildI18nPayload,
  emptyPoemLocaleFields,
  poemI18nFromRecord,
} from "../lib/i18n-form";
import styles from "@/app/admin/admin.module.css";

const GRADES = [5, 6, 7, 8, 9, 10, 11] as const;

const KIND_LABELS: Record<CurriculumKind, string> = {
  STUDY: "Вучыць",
  MEMORIZE: "На памяць",
  DISCUSSION: "Размова",
  EXTRA: "Дадаткова",
};

const KINDS: CurriculumKind[] = [
  "STUDY",
  "MEMORIZE",
  "DISCUSSION",
  "EXTRA",
];

interface AdminPoemFormProps {
  authors: Author[];
  categories: Category[];
  editingPoem: Poem | null;
  onCancel: () => void;
  onSaved: () => void;
}

export function AdminPoemForm({
  authors,
  categories,
  editingPoem,
  onCancel,
  onSaved,
}: AdminPoemFormProps) {
  const [locale, setLocale] = useState<ContentLocale>("be");
  const [localeFields, setLocaleFields] = useState(() =>
    editingPoem
      ? poemI18nFromRecord(editingPoem.i18n, editingPoem)
      : {
          be: emptyPoemLocaleFields(),
          ru: emptyPoemLocaleFields(),
        },
  );
  const [authorId, setAuthorId] = useState(editingPoem?.authorId ?? 0);
  const [categoryId, setCategoryId] = useState(
    editingPoem?.categories[0]?.id ?? 0,
  );
  const [year, setYear] = useState<number | undefined>(
    editingPoem?.year ?? undefined,
  );
  const [videoUrl, setVideoUrl] = useState(editingPoem?.videoUrl ?? "");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [schoolGrades, setSchoolGrades] = useState<SchoolGradeEntry[]>(
    (editingPoem?.schoolGrades as SchoolGradeEntry[]) ?? [],
  );
  const [saving, setSaving] = useState(false);

  const filledLocales = {
    be: !!(localeFields.be.title || localeFields.be.content),
    ru: !!(localeFields.ru.title || localeFields.ru.content),
  };

  const toggleSchoolGrade = (
    grade: number,
    kind: CurriculumKind,
    checked: boolean,
  ) => {
    setSchoolGrades((prev) => {
      if (checked) {
        if (prev.some((g) => g.grade === grade && g.kind === kind)) return prev;
        return [...prev, { grade, kind }];
      }
      return prev.filter((g) => !(g.grade === grade && g.kind === kind));
    });
  };

  const isSchoolChecked = (grade: number, kind: CurriculumKind) =>
    schoolGrades.some((g) => g.grade === grade && g.kind === kind);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingVideo(true);
      const result = await adminApi.uploadVideo(file);
      setVideoUrl(result.videoUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      alert("Ошибка загрузки: " + message);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localeFields.be.title.trim() || !localeFields.be.content.trim()) {
      alert("Заполните название и текст минимум на белорусском (BE)");
      return;
    }
    if (!authorId || !categoryId) {
      alert("Выберите автора и категорию");
      return;
    }

    const i18n = buildI18nPayload(localeFields, [
      "title",
      "content",
      "description",
    ]);

    const payload = {
      authorId,
      categoryId,
      year,
      videoUrl: videoUrl || undefined,
      i18n,
      schoolGrades,
    };

    try {
      setSaving(true);
      if (editingPoem) {
        await adminApi.updatePoem(editingPoem.id, payload);
      } else {
        await adminApi.createPoem(payload);
      }
      onSaved();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      alert("Ошибка: " + message);
    } finally {
      setSaving(false);
    }
  };

  const current = localeFields[locale];

  return (
    <form className={styles.poemForm} onSubmit={handleSubmit}>
      <h3>{editingPoem ? "Редактировать твор" : "Новый твор"}</h3>

      <LocaleTabs
        active={locale}
        onChange={setLocale}
        filled={filledLocales}
      />

      <div className={styles.formGroup}>
        <label>Название ({locale.toUpperCase()}) *</label>
        <input
          type="text"
          value={current.title}
          onChange={(e) =>
            setLocaleFields((prev) => ({
              ...prev,
              [locale]: { ...prev[locale], title: e.target.value },
            }))
          }
          required={locale === "be"}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Описание ({locale.toUpperCase()})</label>
        <textarea
          value={current.description}
          onChange={(e) =>
            setLocaleFields((prev) => ({
              ...prev,
              [locale]: { ...prev[locale], description: e.target.value },
            }))
          }
          rows={3}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Текст твора ({locale.toUpperCase()}) *</label>
        <textarea
          value={current.content}
          onChange={(e) =>
            setLocaleFields((prev) => ({
              ...prev,
              [locale]: { ...prev[locale], content: e.target.value },
            }))
          }
          rows={12}
          required={locale === "be"}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Автор *</label>
          <select
            value={authorId}
            onChange={(e) => setAuthorId(parseInt(e.target.value))}
            required
          >
            <option value={0}>Выберите автора</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Категория *</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(parseInt(e.target.value))}
            required
          >
            <option value={0}>Выберите категорию</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Год</label>
          <input
            type="number"
            value={year ?? ""}
            onChange={(e) =>
              setYear(e.target.value ? parseInt(e.target.value) : undefined)
            }
          />
        </div>

        <div className={styles.formGroup}>
          <label>Видео</label>
          <input type="file" accept="video/*" onChange={handleVideoUpload} />
          {uploadingVideo && <span>Загрузка...</span>}
          {videoUrl && <span className={styles.videoHint}>{videoUrl}</span>}
        </div>
      </div>

      <div className={styles.schoolSection}>
        <h4>Школьная программа (5–11 класс)</h4>
        <div className={styles.schoolGrid}>
          {GRADES.map((grade) => (
            <div key={grade} className={styles.schoolGradeCol}>
              <strong>{grade} кл.</strong>
              {KINDS.map((kind) => (
                <label key={kind} className={styles.schoolCheck}>
                  <input
                    type="checkbox"
                    checked={isSchoolChecked(grade, kind)}
                    onChange={(e) =>
                      toggleSchoolGrade(grade, kind, e.target.checked)
                    }
                  />
                  {KIND_LABELS[kind]}
                </label>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? "Сохранение..." : editingPoem ? "Сохранить" : "Создать"}
        </button>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { adminApi } from "@/src/shared/api";
import type { Author } from "@/src/shared/types/poem.types";
import type { ContentLocale } from "@/src/shared/types/admin.types";
import {
  LocaleTabs,
  authorI18nFromRecord,
  buildI18nPayload,
} from "../lib/i18n-form";
import styles from "@/app/admin/admin.module.css";

interface AdminAuthorsPanelProps {
  authors: Author[];
  onChanged: () => void;
}

export function AdminAuthorsPanel({ authors, onChanged }: AdminAuthorsPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Author | null>(null);
  const [locale, setLocale] = useState<ContentLocale>("be");
  const [localeFields, setLocaleFields] = useState({
    be: { name: "", bio: "" },
    ru: { name: "", bio: "" },
    en: { name: "", bio: "" },
  });
  const [birthYear, setBirthYear] = useState<number | undefined>();
  const [deathYear, setDeathYear] = useState<number | undefined>();
  const [image, setImage] = useState("");

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setLocaleFields({
      be: { name: "", bio: "" },
      ru: { name: "", bio: "" },
      en: { name: "", bio: "" },
    });
    setBirthYear(undefined);
    setDeathYear(undefined);
    setImage("");
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (author: Author & { i18n?: Record<string, Record<string, string>> }) => {
    setEditing(author);
    setLocaleFields(authorI18nFromRecord(author.i18n, author));
    setBirthYear(author.birthYear ?? undefined);
    setDeathYear(author.deathYear ?? undefined);
    setImage(author.image ?? "");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localeFields.be.name.trim()) {
      alert("Имя на белорусском обязательно");
      return;
    }

    const i18n = buildI18nPayload(localeFields, ["name", "bio"]);
    const payload = { i18n, birthYear, deathYear, image: image || undefined };

    try {
      if (editing) {
        await adminApi.updateAuthor(editing.id, payload);
      } else {
        await adminApi.createAuthor(payload);
      }
      resetForm();
      onChanged();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      alert("Ошибка: " + message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить автора?")) return;
    try {
      await adminApi.deleteAuthor(id);
      onChanged();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      alert("Ошибка: " + message);
    }
  };

  const filled = {
    be: !!localeFields.be.name,
    ru: !!localeFields.ru.name,
    en: !!localeFields.en.name,
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>Авторы</h2>
        <button className={styles.addBtn} onClick={openCreate}>
          + Добавить автора
        </button>
      </div>

      {showForm && (
        <form className={styles.poemForm} onSubmit={handleSubmit}>
          <h3>{editing ? "Редактировать" : "Новый автор"}</h3>
          <LocaleTabs active={locale} onChange={setLocale} filled={filled} />

          <div className={styles.formGroup}>
            <label>Имя ({locale.toUpperCase()})</label>
            <input
              type="text"
              value={localeFields[locale].name}
              onChange={(e) =>
                setLocaleFields((prev) => ({
                  ...prev,
                  [locale]: { ...prev[locale], name: e.target.value },
                }))
              }
              required={locale === "be"}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Биография ({locale.toUpperCase()})</label>
            <textarea
              value={localeFields[locale].bio}
              onChange={(e) =>
                setLocaleFields((prev) => ({
                  ...prev,
                  [locale]: { ...prev[locale], bio: e.target.value },
                }))
              }
              rows={4}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Год рождения</label>
              <input
                type="number"
                value={birthYear ?? ""}
                onChange={(e) =>
                  setBirthYear(
                    e.target.value ? parseInt(e.target.value) : undefined,
                  )
                }
              />
            </div>
            <div className={styles.formGroup}>
              <label>Год смерти</label>
              <input
                type="number"
                value={deathYear ?? ""}
                onChange={(e) =>
                  setDeathYear(
                    e.target.value ? parseInt(e.target.value) : undefined,
                  )
                }
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>URL фото</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.saveBtn}>
              {editing ? "Сохранить" : "Создать"}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={resetForm}>
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя</th>
              <th>Творов</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {authors.map((author) => (
              <tr key={author.id}>
                <td>{author.id}</td>
                <td>{author.name}</td>
                <td>{author._count?.poems ?? 0}</td>
                <td className={styles.rowActions}>
                  <button onClick={() => openEdit(author as Author & { i18n?: Record<string, Record<string, string>> })}>
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(author.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

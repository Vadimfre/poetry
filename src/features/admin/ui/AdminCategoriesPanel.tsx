"use client";

import { useState } from "react";
import { adminApi } from "@/src/shared/api";
import type { Category } from "@/src/shared/types/category.types";
import type { ContentLocale } from "@/src/shared/types/admin.types";
import {
  LocaleTabs,
  buildI18nPayload,
  categoryI18nFromRecord,
} from "../lib/i18n-form";
import styles from "@/app/admin/admin.module.css";

interface AdminCategoriesPanelProps {
  categories: Category[];
  onChanged: () => void;
}

export function AdminCategoriesPanel({
  categories,
  onChanged,
}: AdminCategoriesPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [locale, setLocale] = useState<ContentLocale>("be");
  const [localeFields, setLocaleFields] = useState({
    be: { name: "", description: "" },
    ru: { name: "", description: "" },
    en: { name: "", description: "" },
  });

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setLocaleFields({
      be: { name: "", description: "" },
      ru: { name: "", description: "" },
      en: { name: "", description: "" },
    });
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (cat: Category & { i18n?: Record<string, Record<string, string>> }) => {
    setEditing(cat);
    setLocaleFields(categoryI18nFromRecord(cat.i18n, cat));
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localeFields.be.name.trim()) {
      alert("Название на белорусском обязательно");
      return;
    }

    const i18n = buildI18nPayload(localeFields, ["name", "description"]);
    try {
      if (editing) {
        await adminApi.updateCategory(editing.id, { i18n });
      } else {
        await adminApi.createCategory({ i18n });
      }
      resetForm();
      onChanged();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      alert("Ошибка: " + message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить категорию?")) return;
    try {
      await adminApi.deleteCategory(id);
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
        <h2>Категории</h2>
        <button className={styles.addBtn} onClick={openCreate}>
          + Добавить категорию
        </button>
      </div>

      {showForm && (
        <form className={styles.poemForm} onSubmit={handleSubmit}>
          <h3>{editing ? "Редактировать" : "Новая категория"}</h3>
          <LocaleTabs active={locale} onChange={setLocale} filled={filled} />
          <div className={styles.formGroup}>
            <label>Название ({locale.toUpperCase()})</label>
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
            <label>Описание ({locale.toUpperCase()})</label>
            <textarea
              value={localeFields[locale].description}
              onChange={(e) =>
                setLocaleFields((prev) => ({
                  ...prev,
                  [locale]: { ...prev[locale], description: e.target.value },
                }))
              }
              rows={3}
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
              <th>Название</th>
              <th>Творов</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.id}</td>
                <td>{cat.name}</td>
                <td>{(cat as Category & { _count?: { poems?: number } })._count?.poems ?? 0}</td>
                <td className={styles.rowActions}>
                  <button onClick={() => openEdit(cat as Category & { i18n?: Record<string, Record<string, string>> })}>
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(cat.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/src/entities/user";
import { adminApi } from "@/src/shared/api";
import type {
  AdminStats,
  AdminUser,
  CreatePoemDto,
  AdminComment,
  AdminCommentsResponse,
  AdminLike,
  AdminLikesResponse,
  AdminView,
  AdminViewsResponse,
  LikesStatistics,
  ViewsAnalytics,
} from "@/src/shared/types/admin.types";
import type { Poem, Author } from "@/src/shared/types/poem.types";
import type { Category } from "@/src/shared/types/category.types";
import styles from "./admin.module.css";

type Tab =
  | "dashboard"
  | "poems"
  | "users"
  | "comments"
  | "likes"
  | "views"
  | "holidays"
  | "seasonSlides";

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useUserStore();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Poem form state
  const [showPoemForm, setShowPoemForm] = useState(false);
  const [editingPoem, setEditingPoem] = useState<Poem | null>(null);
  const [poemForm, setPoemForm] = useState<CreatePoemDto>({
    title: "",
    content: "",
    description: "",
    authorId: 0,
    year: undefined,
    categoryId: 0,
    videoUrl: "",
  });
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Новые состояния для расширенных сущностей
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [likes, setLikes] = useState<AdminLike[]>([]);
  const [likesTotal, setLikesTotal] = useState(0);
  const [likesPage, setLikesPage] = useState(1);
  const [likesLoading, setLikesLoading] = useState(false);
  const [likesStats, setLikesStats] = useState<LikesStatistics | null>(null);

  const [views, setViews] = useState<AdminView[]>([]);
  const [viewsTotal, setViewsTotal] = useState(0);
  const [viewsPage, setViewsPage] = useState(1);
  const [viewsLoading, setViewsLoading] = useState(false);
  const [viewsAnalytics, setViewsAnalytics] = useState<ViewsAnalytics | null>(
    null,
  );

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    // Просто загружаем данные - бекенд сам проверит права
    // Если нет прав, API вернёт ошибку
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    loadData();
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    // Загружаем данные для активной вкладки
    switch (activeTab) {
      case "comments":
        loadComments(commentsPage);
        break;
      case "likes":
        loadLikes(likesPage);
        break;
      case "views":
        loadViews(viewsPage);
        break;
      default:
        // Для других вкладок данные уже загружены
        break;
    }
  }, [activeTab, isAuthenticated, commentsPage, likesPage, viewsPage]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Загружаем статистику - если нет прав, получим ошибку
      const statsData = await adminApi.getStats();
      setStats(statsData);

      const [poemsData, categoriesData, authorsData] = await Promise.all([
        adminApi.getPoems(),
        adminApi.getCategories(),
        adminApi.getAuthors(),
      ]);
      setPoems(poemsData);
      setCategories(categoriesData);
      setAuthors(authorsData);

      // Пробуем загрузить пользователей (только для SUPER_ADMIN)
      try {
        const usersData = await adminApi.getUsers();
        setUsers(usersData);
      } catch {
        // Не супер-админ - это ок
      }
    } catch (err: any) {
      // Если 403 - нет прав
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError("У вас нет прав для доступа к админ-панели");
      } else {
        setError(err.message || "Ошибка загрузки данных");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingVideo(true);
      const result = await adminApi.uploadVideo(file);
      setPoemForm((prev) => ({ ...prev, videoUrl: result.videoUrl }));
    } catch (err: any) {
      alert("Ошибка загрузки видео: " + err.message);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleCreatePoem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !poemForm.title ||
      !poemForm.content ||
      !poemForm.authorId ||
      !poemForm.categoryId
    ) {
      alert("Заполните все обязательные поля");
      return;
    }

    try {
      if (editingPoem) {
        await adminApi.updatePoem(editingPoem.id, poemForm);
      } else {
        await adminApi.createPoem(poemForm);
      }
      setShowPoemForm(false);
      setEditingPoem(null);
      setPoemForm({
        title: "",
        content: "",
        description: "",
        authorId: 0,
        year: undefined,
        categoryId: 0,
        videoUrl: "",
      });
      loadData();
    } catch (err: any) {
      alert("Ошибка: " + err.message);
    }
  };

  const handleEditPoem = (poem: Poem) => {
    setEditingPoem(poem);
    setPoemForm({
      title: poem.title,
      content: poem.content,
      description: poem.description || "",
      authorId: poem.authorId,
      year: poem.year || undefined,
      categoryId: poem.categories[0]?.id || 0,
      videoUrl: poem.videoUrl || "",
    });
    setShowPoemForm(true);
  };

  const handleDeletePoem = async (id: number) => {
    if (!confirm("Удалить стихотворение?")) return;
    try {
      await adminApi.deletePoem(id);
      loadData();
    } catch (err: any) {
      alert("Ошибка удаления: " + err.message);
    }
  };

  const handleSetRole = async (userId: number, role: "USER" | "ADMIN") => {
    try {
      await adminApi.setUserRole(userId, role);
      loadData();
    } catch (err: any) {
      alert("Ошибка: " + err.message);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Удалить пользователя?")) return;
    try {
      await adminApi.deleteUser(userId);
      loadData();
    } catch (err: any) {
      alert("Ошибка: " + err.message);
    }
  };

  // Функции для комментариев
  const loadComments = async (page: number = 1) => {
    try {
      setCommentsLoading(true);
      const response = await adminApi.getComments(page, 20);
      setComments(response.comments);
      setCommentsTotal(response.total);
      setCommentsPage(response.page);
    } catch (err: any) {
      alert("Ошибка загрузки комментариев: " + err.message);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleEditComment = async (id: number) => {
    const newText = prompt("Введите новый текст комментария");
    if (!newText) return;
    try {
      await adminApi.updateComment(id, { text: newText });
      alert("Комментарий обновлен");
      loadComments(commentsPage);
    } catch (err: any) {
      alert("Ошибка обновления: " + err.message);
    }
  };

  const handleDeleteComment = async (id: number) => {
    if (!confirm("Удалить комментарий?")) return;
    try {
      await adminApi.deleteComment(id);
      alert("Комментарий удален");
      loadComments(commentsPage);
    } catch (err: any) {
      alert("Ошибка удаления: " + err.message);
    }
  };

  // Функции для лайков
  const loadLikes = async (page: number = 1) => {
    try {
      setLikesLoading(true);
      const response = await adminApi.getLikes(page, 20);
      setLikes(response.likes);
      setLikesTotal(response.total);
      setLikesPage(response.page);
    } catch (err: any) {
      alert("Ошибка загрузки лайков: " + err.message);
    } finally {
      setLikesLoading(false);
    }
  };

  const loadLikesStatistics = async () => {
    try {
      const stats = await adminApi.getLikesStatistics();
      setLikesStats(stats);
    } catch (err: any) {
      alert("Ошибка загрузки статистики: " + err.message);
    }
  };

  const handleDeleteLike = async (id: number) => {
    if (!confirm("Удалить лайк?")) return;
    try {
      await adminApi.deleteLike(id);
      alert("Лайк удален");
      loadLikes(likesPage);
    } catch (err: any) {
      alert("Ошибка удаления: " + err.message);
    }
  };

  // Функции для просмотров
  const loadViews = async (page: number = 1) => {
    try {
      setViewsLoading(true);
      const response = await adminApi.getViews(page, 20);
      setViews(response.views);
      setViewsTotal(response.total);
      setViewsPage(response.page);
    } catch (err: any) {
      alert("Ошибка загрузки просмотров: " + err.message);
    } finally {
      setViewsLoading(false);
    }
  };

  const loadViewsAnalytics = async () => {
    try {
      const analytics = await adminApi.getViewsAnalytics();
      setViewsAnalytics(analytics);
    } catch (err: any) {
      alert("Ошибка загрузки аналитики: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <button
            onClick={() => router.push("/")}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            ← Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Админ-панель</h1>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.name || user?.email}</span>
          <span className={styles.userRole}>
            {user?.role === "SUPER_ADMIN" ? "Суперадмин" : "Админ"}
          </span>
        </div>
      </header>

      <nav className={styles.nav}>
        <button
          className={`${styles.navBtn} ${activeTab === "dashboard" ? styles.active : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          📊 Статистика
        </button>
        <button
          className={`${styles.navBtn} ${activeTab === "poems" ? styles.active : ""}`}
          onClick={() => setActiveTab("poems")}
        >
          📝 Стихи
        </button>
        {users.length > 0 && (
          <button
            className={`${styles.navBtn} ${activeTab === "users" ? styles.active : ""}`}
            onClick={() => setActiveTab("users")}
          >
            👥 Пользователи
          </button>
        )}
        <button
          className={`${styles.navBtn} ${activeTab === "comments" ? styles.active : ""}`}
          onClick={() => setActiveTab("comments")}
        >
          💬 Комментарии
        </button>
        <button
          className={`${styles.navBtn} ${activeTab === "likes" ? styles.active : ""}`}
          onClick={() => setActiveTab("likes")}
        >
          ❤️ Лайки
        </button>
        <button
          className={`${styles.navBtn} ${activeTab === "views" ? styles.active : ""}`}
          onClick={() => setActiveTab("views")}
        >
          👁️ Просмотры
        </button>
        <button className={styles.backBtn} onClick={() => router.push("/")}>
          ← На сайт
        </button>
      </nav>

      <main className={styles.main}>
        {/* Dashboard */}
        {activeTab === "dashboard" && stats && (
          <div className={styles.dashboard}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>📝</span>
                <span className={styles.statValue}>{stats.poems}</span>
                <span className={styles.statLabel}>Стихов</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>👥</span>
                <span className={styles.statValue}>{stats.users}</span>
                <span className={styles.statLabel}>Пользователей</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>👑</span>
                <span className={styles.statValue}>{stats.admins}</span>
                <span className={styles.statLabel}>Админов</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>💬</span>
                <span className={styles.statValue}>{stats.comments}</span>
                <span className={styles.statLabel}>Комментариев</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>📁</span>
                <span className={styles.statValue}>{stats.categories}</span>
                <span className={styles.statLabel}>Категорий</span>
              </div>
            </div>
          </div>
        )}

        {/* Poems Management */}
        {activeTab === "poems" && (
          <div className={styles.poemsSection}>
            <div className={styles.sectionHeader}>
              <h2>Управление стихами</h2>
              <button
                className={styles.addBtn}
                onClick={() => {
                  setEditingPoem(null);
                  setPoemForm({
                    title: "",
                    content: "",
                    description: "",
                    authorId: 0,
                    year: undefined,
                    categoryId: 0,
                    videoUrl: "",
                  });
                  setShowPoemForm(true);
                }}
              >
                + Добавить стих
              </button>
            </div>

            {showPoemForm && (
              <form className={styles.poemForm} onSubmit={handleCreatePoem}>
                <h3>{editingPoem ? "Редактировать стих" : "Новый стих"}</h3>

                <div className={styles.formGroup}>
                  <label>Название *</label>
                  <input
                    type="text"
                    value={poemForm.title}
                    onChange={(e) =>
                      setPoemForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Автор *</label>
                  <select
                    value={poemForm.authorId}
                    onChange={(e) =>
                      setPoemForm((prev) => ({
                        ...prev,
                        authorId: parseInt(e.target.value),
                      }))
                    }
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
                  <label>Описание стихотворения</label>
                  <textarea
                    value={poemForm.description || ""}
                    onChange={(e) =>
                      setPoemForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Краткое описание или анализ стихотворения"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Год</label>
                  <input
                    type="number"
                    value={poemForm.year || ""}
                    onChange={(e) =>
                      setPoemForm((prev) => ({
                        ...prev,
                        year: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      }))
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Категория (направление) *</label>
                  <select
                    value={poemForm.categoryId}
                    onChange={(e) =>
                      setPoemForm((prev) => ({
                        ...prev,
                        categoryId: parseInt(e.target.value),
                      }))
                    }
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

                <div className={styles.formGroup}>
                  <label>Текст стихотворения *</label>
                  <textarea
                    value={poemForm.content}
                    onChange={(e) =>
                      setPoemForm((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    rows={10}
                    placeholder="Вводите текст, переносы строк сохраняются автоматически"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Видео для фона</label>
                  <div className={styles.videoUpload}>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={uploadingVideo}
                    />
                    {uploadingVideo && <span>Загрузка...</span>}
                    {poemForm.videoUrl && (
                      <span className={styles.videoPath}>
                        {poemForm.videoUrl}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitBtn}>
                    {editingPoem ? "Сохранить" : "Создать"}
                  </button>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => {
                      setShowPoemForm(false);
                      setEditingPoem(null);
                    }}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            )}

            <div className={styles.poemsList}>
              {poems.map((poem) => (
                <div key={poem.id} className={styles.poemItem}>
                  <div className={styles.poemInfo}>
                    <h4>{poem.title}</h4>
                    <p>
                      {poem.author?.name || "Неизвестный автор"}{" "}
                      {poem.year && `(${poem.year})`}
                    </p>
                    <span className={styles.poemCategory}>
                      {poem.categories[0]?.name || "Без категории"}
                    </span>
                    {poem.videoUrl && (
                      <span className={styles.hasVideo}>🎬 Видео</span>
                    )}
                  </div>
                  <div className={styles.poemActions}>
                    <button onClick={() => handleEditPoem(poem)}>✏️</button>
                    <button onClick={() => handleDeletePoem(poem.id)}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Management (Super Admin only) */}
        {activeTab === "users" && users.length > 0 && (
          <div className={styles.usersSection}>
            <h2>Управление пользователями</h2>
            <div className={styles.usersList}>
              {users.map((u) => (
                <div key={u.id} className={styles.userItem}>
                  <div className={styles.userItemInfo}>
                    <span className={styles.userItemName}>
                      {u.name || "Без имени"}
                    </span>
                    <span className={styles.userItemEmail}>{u.email}</span>
                    <span
                      className={`${styles.userItemRole} ${styles[u.role.toLowerCase()]}`}
                    >
                      {u.role === "SUPER_ADMIN"
                        ? "👑 Суперадмин"
                        : u.role === "ADMIN"
                          ? "⭐ Админ"
                          : "Пользователь"}
                    </span>
                  </div>
                  <div className={styles.userItemStats}>
                    <span>💬 {u._count.comments}</span>
                    <span>❤️ {u._count.favorites}</span>
                  </div>
                  {u.role !== "SUPER_ADMIN" && u.email !== user?.email && (
                    <div className={styles.userItemActions}>
                      {u.role === "USER" ? (
                        <button onClick={() => handleSetRole(u.id, "ADMIN")}>
                          Сделать админом
                        </button>
                      ) : (
                        <button onClick={() => handleSetRole(u.id, "USER")}>
                          Убрать права
                        </button>
                      )}
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Комментарии */}
        {activeTab === "comments" && (
          <div className={styles.commentsSection}>
            <h2>Управление комментариями</h2>
            <div className={styles.sectionHeader}>
              <p>Всего комментариев: {commentsTotal}</p>
              <button
                className={styles.addBtn}
                onClick={() => loadComments(commentsPage)}
                disabled={commentsLoading}
              >
                {commentsLoading ? "Загрузка..." : "Обновить"}
              </button>
            </div>
            {comments.length === 0 ? (
              <p>Нет комментариев</p>
            ) : (
              <div className={styles.commentsList}>
                {comments.map((comment) => (
                  <div key={comment.id} className={styles.commentItem}>
                    <div className={styles.commentInfo}>
                      <h4>Комментарий #{comment.id}</h4>
                      <p>{comment.text}</p>
                      <div className={styles.commentMeta}>
                        <span>
                          👤 {comment.user.name || comment.user.email}
                        </span>
                        <span>📝 Стих: {comment.poem.title}</span>
                        <span>
                          📅 {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className={styles.commentActions}>
                      <button onClick={() => handleEditComment(comment.id)}>
                        ✏️
                      </button>
                      <button onClick={() => handleDeleteComment(comment.id)}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className={styles.pagination}>
              <button
                disabled={commentsPage <= 1}
                onClick={() => {
                  const newPage = commentsPage - 1;
                  setCommentsPage(newPage);
                  loadComments(newPage);
                }}
              >
                ← Назад
              </button>
              <span>Страница {commentsPage}</span>
              <button
                disabled={commentsPage * 20 >= commentsTotal}
                onClick={() => {
                  const newPage = commentsPage + 1;
                  setCommentsPage(newPage);
                  loadComments(newPage);
                }}
              >
                Вперед →
              </button>
            </div>
          </div>
        )}

        {/* Лайки */}
        {activeTab === "likes" && (
          <div className={styles.likesSection}>
            <h2>Управление лайками</h2>
            <div className={styles.sectionHeader}>
              <p>Всего лайков: {likesTotal}</p>
              <button
                className={styles.addBtn}
                onClick={() => loadLikes(likesPage)}
                disabled={likesLoading}
              >
                {likesLoading ? "Загрузка..." : "Обновить"}
              </button>
              <button className={styles.statsBtn} onClick={loadLikesStatistics}>
                📊 Статистика
              </button>
            </div>
            {likes.length === 0 ? (
              <p>Нет лайков</p>
            ) : (
              <div className={styles.likesList}>
                {likes.map((like) => (
                  <div key={like.id} className={styles.likeItem}>
                    <div className={styles.likeInfo}>
                      <h4>Лайк #{like.id}</h4>
                      <div className={styles.likeMeta}>
                        <span>👤 {like.user.name || like.user.email}</span>
                        <span>📝 Стих: {like.poem.title}</span>
                        <span>
                          📅 {new Date(like.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className={styles.likeActions}>
                      <button onClick={() => handleDeleteLike(like.id)}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className={styles.pagination}>
              <button
                disabled={likesPage <= 1}
                onClick={() => {
                  const newPage = likesPage - 1;
                  setLikesPage(newPage);
                  loadLikes(newPage);
                }}
              >
                ← Назад
              </button>
              <span>Страница {likesPage}</span>
              <button
                disabled={likesPage * 20 >= likesTotal}
                onClick={() => {
                  const newPage = likesPage + 1;
                  setLikesPage(newPage);
                  loadLikes(newPage);
                }}
              >
                Вперед →
              </button>
            </div>
            {likesStats && (
              <div className={styles.statsPanel}>
                <h3>Статистика лайков</h3>
                <p>Всего лайков: {likesStats.totalLikes}</p>
                <div>
                  <h4>Топ стихов:</h4>
                  <ul>
                    {likesStats.topPoems.map((poem) => (
                      <li key={poem.poemId}>
                        {poem.title} - {poem.likes} лайков
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Просмотры */}
        {activeTab === "views" && (
          <div className={styles.viewsSection}>
            <h2>Управление просмотрами</h2>
            <div className={styles.sectionHeader}>
              <p>Всего просмотров: {viewsTotal}</p>
              <button
                className={styles.addBtn}
                onClick={() => loadViews(viewsPage)}
                disabled={viewsLoading}
              >
                {viewsLoading ? "Загрузка..." : "Обновить"}
              </button>
              <button className={styles.statsBtn} onClick={loadViewsAnalytics}>
                📊 Аналитика
              </button>
            </div>
            {views.length === 0 ? (
              <p>Нет просмотров</p>
            ) : (
              <div className={styles.viewsList}>
                {views.map((view) => (
                  <div key={view.id} className={styles.viewItem}>
                    <div className={styles.viewInfo}>
                      <h4>Просмотр #{view.id}</h4>
                      <div className={styles.viewMeta}>
                        <span>📝 Стих: {view.poem.title}</span>
                        <span>🔐 Хэш IP: {view.ipHash.substring(0, 8)}...</span>
                        <span>
                          📅 {new Date(view.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className={styles.pagination}>
              <button
                disabled={viewsPage <= 1}
                onClick={() => {
                  const newPage = viewsPage - 1;
                  setViewsPage(newPage);
                  loadViews(newPage);
                }}
              >
                ← Назад
              </button>
              <span>Страница {viewsPage}</span>
              <button
                disabled={viewsPage * 20 >= viewsTotal}
                onClick={() => {
                  const newPage = viewsPage + 1;
                  setViewsPage(newPage);
                  loadViews(newPage);
                }}
              >
                Вперед →
              </button>
            </div>
            {viewsAnalytics && (
              <div className={styles.statsPanel}>
                <h3>Аналитика просмотров</h3>
                <p>Всего просмотров: {viewsAnalytics.totalViews}</p>
                <div>
                  <h4>Топ стихов:</h4>
                  <ul>
                    {viewsAnalytics.topPoems.map((poem) => (
                      <li key={poem.poemId}>
                        {poem.title} - {poem.views} просмотров
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

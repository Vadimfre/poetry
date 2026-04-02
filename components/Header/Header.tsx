"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useUserStore } from "@/src/entities/user";
import { useCategories } from "@/src/features/categories";
import { authApi } from "@/src/shared/api";
import AuthModal from "@/components/AuthModal/AuthModal";
import styles from "./Header.module.css";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false);

  const { user, isAuthenticated, logout: logoutStore } = useUserStore();
  const { data: categories } = useCategories();

  const profileContainerRef = useRef<HTMLDivElement>(null);
  const directionsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Close profile menu if click is outside its container
      if (
        isProfileMenuOpen &&
        profileContainerRef.current &&
        !profileContainerRef.current.contains(target)
      ) {
        setIsProfileMenuOpen(false);
      }

      // Close directions menu if click is outside its container
      if (
        isDirectionsOpen &&
        directionsContainerRef.current &&
        !directionsContainerRef.current.contains(target)
      ) {
        setIsDirectionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen, isDirectionsOpen]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logoutStore();
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
      logoutStore(); // Logout even if API call fails
      setIsProfileMenuOpen(false);
    }
  };

  return (
    <header
      className={`${styles.header} ${isScrolled ? styles.headerScrolled : ""}`}
    >
      <div className={styles.headerWrapper}>
        <div className={styles.headerContent}>
          <nav className={styles.navLeft}>
            <Link
              href="/"
              className={`${styles.navLink} ${styles.navLinkActive}`}
            >
              ГЛАВНАЯ
            </Link>
            <div
              ref={directionsContainerRef}
              className={styles.directionsContainer}
              onMouseEnter={() => setIsDirectionsOpen(true)}
              onMouseLeave={() => setIsDirectionsOpen(false)}
            >
              <button className={styles.navLink}>НАПРАВЛЕНИЯ ▼</button>
              {isDirectionsOpen && categories && categories.length > 0 && (
                <div
                  className={styles.directionsMenu}
                  onClick={() => setIsDirectionsOpen(false)}
                >
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/collection/${category.slug}`}
                      className={styles.directionItem}
                    >
                      <div className={styles.directionIcon}>
                        {category.name.charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.directionContent}>
                        <div className={styles.directionTitle}>
                          {category.name}
                        </div>
                        <div className={styles.directionDesc}>
                          {category.description ||
                            `Коллекции: ${category._count?.collections || 0}`}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link href="/about" className={styles.navLink}>
              О НАС
            </Link>
          </nav>

          <Link href="/" className={styles.logo}>
            POETRY
          </Link>

          <nav className={styles.navRight}>
            <Link href="/faq" className={styles.navLink}>
              ВОПРОС-ОТВЕТ
            </Link>

            {isAuthenticated && user ? (
              <div
                ref={profileContainerRef}
                className={styles.profileContainer}
              >
                <button
                  className={styles.profileButton}
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <div className={styles.avatar}>
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                  <span className={styles.userName}>
                    {user.name || user.email}
                  </span>
                </button>

                {isProfileMenuOpen && (
                  <div className={styles.profileMenu}>
                    <div className={styles.profileMenuHeader}>
                      <div className={styles.avatarLarge}>
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.profileInfo}>
                        <div className={styles.profileName}>
                          {user.name || "User"}
                        </div>
                        <div className={styles.profileEmail}>{user.email}</div>
                      </div>
                    </div>
                    <div className={styles.profileMenuDivider}></div>
                    <Link
                      href="/admin"
                      className={`${styles.profileMenuItem} ${styles.adminLink}`}
                    >
                      🔧 Админ-панель
                    </Link>
                    <Link href="/favorites" className={styles.profileMenuItem}>
                      Избранное
                    </Link>
                    <Link href="/settings" className={styles.profileMenuItem}>
                      Настройки профиля
                    </Link>
                    <div className={styles.profileMenuDivider}></div>
                    <button
                      className={styles.logoutButton}
                      onClick={handleLogout}
                    >
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className={styles.login}
                onClick={() => setIsAuthModalOpen(true)}
              >
                ВОЙТИ
              </button>
            )}
          </nav>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  );
};

export default Header;

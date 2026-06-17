"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuthModalStore } from "@/src/entities/auth/auth-modal.store";
import { useUserStore } from "@/src/entities/user";
import { useCategories } from "@/src/features/categories";
import { authApi } from "@/src/shared/api";
import { useI18n } from "@/src/shared/i18n";
import AuthModal from "@/components/AuthModal/AuthModal";
import { LanguageSelect } from "@/components/LanguageSelect/LanguageSelect";
import styles from "./Header.module.css";

const Header = () => {
  const { t } = useI18n();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthModalOpen = useAuthModalStore((s) => s.isOpen);
  const openAuthModal = useAuthModalStore((s) => s.open);
  const closeAuthModal = useAuthModalStore((s) => s.close);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false);
  const [isMobileDirectionsOpen, setIsMobileDirectionsOpen] = useState(false);
  const [canHover, setCanHover] = useState(false);

  const { user, isAuthenticated, logout: logoutStore } = useUserStore();
  const { data: categories } = useCategories();
  const isTeacher = user?.role === "TEACHER";
  const isStudent = user?.role === "STUDENT";
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const profileContainerRef = useRef<HTMLDivElement>(null);
  const directionsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        isProfileMenuOpen &&
        profileContainerRef.current &&
        !profileContainerRef.current.contains(target)
      ) {
        setIsProfileMenuOpen(false);
      }

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

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileDirectionsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logoutStore();
      setIsProfileMenuOpen(false);
      closeMobileMenu();
    } catch (error) {
      console.error("Logout error:", error);
      logoutStore();
      setIsProfileMenuOpen(false);
      closeMobileMenu();
    }
  };

  const roleLabel = isTeacher
    ? t("header.roleTeacher")
    : isStudent
      ? t("header.roleStudent")
      : isAdmin
        ? t("header.roleAdmin")
        : t("header.roleUser");

  const renderDirectionsItems = (onNavigate: () => void) =>
    categories?.map((category) => (
      <Link
        key={category.id}
        href={`/collection/${category.slug}`}
        className={styles.directionItem}
        onClick={onNavigate}
      >
        <div className={styles.directionIcon}>
          {category.name.charAt(0).toUpperCase()}
        </div>
        <div className={styles.directionContent}>
          <div className={styles.directionTitle}>{category.name}</div>
          <div className={styles.directionDesc}>
            {category.description ||
              t("header.collections", {
                count: category._count?.collections || 0,
              })}
          </div>
        </div>
      </Link>
    ));

  return (
    <header
      className={`${styles.header} ${isScrolled ? styles.headerScrolled : ""}`}
    >
      <div className={styles.headerWrapper}>
        <div className={styles.headerContent}>
          <button
            type="button"
            className={styles.menuToggle}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label={t("header.openMenu")}
            aria-expanded={isMobileMenuOpen}
          >
            <span className={styles.menuBar} />
            <span className={styles.menuBar} />
            <span className={styles.menuBar} />
          </button>

          <nav className={styles.navLeft}>
            <Link
              href="/"
              className={`${styles.navLink} ${styles.navLinkActive}`}
            >
              {t("header.home")}
            </Link>
            <div
              ref={directionsContainerRef}
              className={styles.directionsContainer}
              onMouseEnter={
                canHover ? () => setIsDirectionsOpen(true) : undefined
              }
              onMouseLeave={
                canHover ? () => setIsDirectionsOpen(false) : undefined
              }
            >
              <button
                type="button"
                className={styles.navLink}
                aria-haspopup="menu"
                aria-expanded={isDirectionsOpen}
                onClick={() => setIsDirectionsOpen((prev) => !prev)}
              >
                {t("header.directions")} ▼
              </button>
              {isDirectionsOpen && categories && categories.length > 0 && (
                <div className={styles.directionsMenu}>
                  {renderDirectionsItems(() => setIsDirectionsOpen(false))}
                </div>
              )}
            </div>
            <Link href="/quizzes" className={styles.navLink}>
              {t("header.quizzes")}
            </Link>
            <Link href="/school" className={styles.navLink}>
              {t("header.school")}
            </Link>
            {isTeacher && (
              <Link href="/teacher" className={styles.navLink}>
                {t("header.classes")}
              </Link>
            )}
            {isStudent && (
              <Link href="/student" className={styles.navLink}>
                {t("header.myAssignments")}
              </Link>
            )}
            <Link href="/about" className={styles.navLink}>
              {t("header.about")}
            </Link>
          </nav>

          <Link href="/" className={styles.logo}>
            POETRY
          </Link>

          <nav className={styles.navRight}>
            <LanguageSelect />
            <Link href="/filters" className={styles.navLink}>
              {t("header.filters")}
            </Link>
            <Link href="/faq" className={styles.navLink}>
              {t("header.faq")}
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
                          {user.name || t("header.userFallback")}
                        </div>
                        <div className={styles.profileEmail}>{user.email}</div>
                        <div className={styles.profileRole}>{roleLabel}</div>
                      </div>
                    </div>
                    <div className={styles.profileMenuDivider}></div>
                    {isTeacher && (
                      <Link
                        href="/teacher"
                        className={`${styles.profileMenuItem} ${styles.cabinetLink}`}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        {t("header.classesAndAssignments")}
                      </Link>
                    )}
                    {isStudent && (
                      <Link
                        href="/student"
                        className={`${styles.profileMenuItem} ${styles.cabinetLink}`}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        {t("header.myAssignments")}
                      </Link>
                    )}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className={`${styles.profileMenuItem} ${styles.adminLink}`}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        {t("header.adminPanel")}
                      </Link>
                    )}
                    <Link
                      href="/favorites"
                      className={styles.profileMenuItem}
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      {t("header.favorites")}
                    </Link>
                    <Link
                      href="/settings"
                      className={styles.profileMenuItem}
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      {t("header.profileSettings")}
                    </Link>
                    <div className={styles.profileMenuDivider}></div>
                    <button
                      className={styles.logoutButton}
                      onClick={handleLogout}
                    >
                      {t("header.logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className={styles.login} onClick={openAuthModal}>
                {t("header.login")}
              </button>
            )}
          </nav>

          <div className={styles.mobileActions}>
            <LanguageSelect />
            {isAuthenticated && user ? (
              <button
                type="button"
                className={styles.mobileAvatar}
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label={t("header.profileSettings")}
              >
                {(user.name || user.email).charAt(0).toUpperCase()}
              </button>
            ) : (
              <button
                type="button"
                className={styles.mobileLogin}
                onClick={openAuthModal}
              >
                {t("header.login")}
              </button>
            )}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={closeMobileMenu}
          aria-hidden
        />
      )}

      <nav
        className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ""}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className={styles.mobileMenuHeader}>
          <span className={styles.mobileMenuTitle}>POETRY</span>
          <button
            type="button"
            className={styles.mobileClose}
            onClick={closeMobileMenu}
            aria-label={t("header.closeMenu")}
          >
            ✕
          </button>
        </div>

        {isAuthenticated && user && (
          <div className={styles.mobileUserBlock}>
            <div className={styles.avatarLarge}>
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className={styles.profileName}>
                {user.name || t("header.userFallback")}
              </div>
              <div className={styles.profileRole}>{roleLabel}</div>
            </div>
          </div>
        )}

        <div className={styles.mobileNavLinks}>
          <Link href="/" className={styles.mobileNavLink} onClick={closeMobileMenu}>
            {t("header.home")}
          </Link>

          <button
            type="button"
            className={styles.mobileNavLink}
            onClick={() => setIsMobileDirectionsOpen((p) => !p)}
          >
            {t("header.directions")}{" "}
            <span className={styles.mobileChevron}>
              {isMobileDirectionsOpen ? "▲" : "▼"}
            </span>
          </button>
          {isMobileDirectionsOpen && categories && categories.length > 0 && (
            <div className={styles.mobileDirections}>
              {renderDirectionsItems(closeMobileMenu)}
            </div>
          )}

          <Link href="/filters" className={styles.mobileNavLink} onClick={closeMobileMenu}>
            {t("header.filters")}
          </Link>
          <Link href="/quizzes" className={styles.mobileNavLink} onClick={closeMobileMenu}>
            {t("header.quizzes")}
          </Link>
          <Link href="/school" className={styles.mobileNavLink} onClick={closeMobileMenu}>
            {t("header.school")}
          </Link>
          {isTeacher && (
            <Link href="/teacher" className={styles.mobileNavLink} onClick={closeMobileMenu}>
              {t("header.classes")}
            </Link>
          )}
          {isStudent && (
            <Link href="/student" className={styles.mobileNavLink} onClick={closeMobileMenu}>
              {t("header.myAssignments")}
            </Link>
          )}
          <Link href="/favorites" className={styles.mobileNavLink} onClick={closeMobileMenu}>
            {t("header.favorites")}
          </Link>
          <Link href="/about" className={styles.mobileNavLink} onClick={closeMobileMenu}>
            {t("header.about")}
          </Link>
          <Link href="/faq" className={styles.mobileNavLink} onClick={closeMobileMenu}>
            {t("header.faq")}
          </Link>
          {isAdmin && (
            <Link href="/admin" className={styles.mobileNavLink} onClick={closeMobileMenu}>
              {t("header.adminPanel")}
            </Link>
          )}
          {isAuthenticated && user && (
            <Link href="/settings" className={styles.mobileNavLink} onClick={closeMobileMenu}>
              {t("header.profileSettings")}
            </Link>
          )}
        </div>

        <div className={styles.mobileMenuFooter}>
          {isAuthenticated && user ? (
            <button
              type="button"
              className={styles.mobileLogout}
              onClick={handleLogout}
            >
              {t("header.logout")}
            </button>
          ) : (
            <button
              type="button"
              className={styles.mobileLoginFull}
              onClick={() => {
                closeMobileMenu();
                openAuthModal();
              }}
            >
              {t("header.login")}
            </button>
          )}
        </div>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </header>
  );
};

export default Header;

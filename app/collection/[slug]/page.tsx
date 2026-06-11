'use client';

import Header from '@/components/Header/Header';
import { useCategory } from '@/src/features/categories';
import { useQuery } from '@tanstack/react-query';
import { poemsApi } from '@/src/shared/api';
import { useLocaleQueryKey } from '@/src/shared/i18n/use-locale-query-key';
import { useI18n, usePlural } from '@/src/shared/i18n';
import Link from 'next/link';
import styles from './collection.module.css';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function CollectionPage({ params }: PageProps) {
  const { t } = useI18n();
  const plural = usePlural();
  const { data: category, isLoading: isLoadingCategory, error } = useCategory(params.slug);

  const poemsQueryKey = useLocaleQueryKey(['poems', 'category', params.slug]);
  const { data: poems, isLoading: isLoadingPoems } = useQuery({
    queryKey: poemsQueryKey,
    queryFn: () => poemsApi.getByCategorySlug(params.slug),
    enabled: !!category,
  });

  const isLoading = isLoadingCategory || isLoadingPoems;
  const poemCount = poems?.length || 0;
  const poemWord = plural(poemCount, {
    one: 'common.poemOne',
    few: 'common.poemFew',
    many: 'common.poemMany',
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className="container">
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>{t('collectionPage.loading')}</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !category) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className="container">
            <div className={styles.notFound}>
              <h1>{t('collectionPage.notFound')}</h1>
              <p>{t('collectionPage.notFoundDesc')}</p>
              <Link href="/" className={styles.backLink}>
                ← {t('collectionPage.backHome')}
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <Link href="/" className={styles.backButton}>
              ← {t('common.back')}
            </Link>
            <div className={styles.headerContent}>
              <span className={styles.label}>{t('collectionPage.label')}</span>
              <h1 className={styles.title}>{category.name.toUpperCase()}</h1>
              {category.description && (
                <p className={styles.description}>{category.description}</p>
              )}
              <span className={styles.count}>
                {poemCount} {poemWord}
              </span>
            </div>
          </div>

          {poems && poems.length > 0 ? (
            <div className={styles.poemsGrid}>
              {poems.map((poem, index) => (
                <Link
                  href={`/poem/${poem.id}`}
                  key={poem.id}
                  className={styles.poemCard}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={styles.poemNumber}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className={styles.poemContent}>
                    <h3 className={styles.poemTitle}>{poem.title}</h3>
                    <p className={styles.poemAuthor}>
                      {poem.author?.name || t('common.unknownAuthor')}
                    </p>
                    {poem.year && <span className={styles.poemYear}>{poem.year}</span>}
                  </div>
                  <div className={styles.poemPreview}>
                    {poem.content.split('\n').slice(0, 2).join('\n')}...
                  </div>
                  <div className={styles.poemArrow}>→</div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <p>{t('collectionPage.noPoems')}</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

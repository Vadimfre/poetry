"use client";

import * as React from "react";
import { useHolidayModal } from "../../src/features/holidays/model/use-holidays-modal";
import { Holiday, Poem, useOptimisticViews } from "@/src/shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Share2, Sparkles, X } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { LoadingState } from "../../src/features/holidays/ui/loading-state";
import { PoemCard } from "../PoemCard/PoemCard";
import { EmptyState } from "@/src/features/holidays/ui/empty-state";
import { InfoTab } from "@/src/features/holidays/ui/info-tab";
import { HeroSection } from "@/src/features/holidays/ui/hero-section";
import styles from "./HolidayModal.module.css";
import { useOptimisticLike } from "@/src/shared/hooks/interactions";
import { useOptimisticFavorite } from "@/src/shared/hooks/interactions";
import { usePoemInteractions } from "@/src/shared/hooks/interactions";
import { useI18n } from "@/src/shared/i18n";

interface HolidayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holiday: Holiday | null;
  loading?: boolean;
}

function OptimisticPoemCard({
  poem,
  index,
  isExpanded,
  onToggleExpand,
}: {
  poem: Poem;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const { isLiked, likeCount, toggleLike } = useOptimisticLike(poem.id);
  const { isFavorite, toggleFavorite } = useOptimisticFavorite(poem.id);
  const { commentsCount } = usePoemInteractions(poem.id);
  const { addView, views } = useOptimisticViews(poem.id);
  const [viewTracked, setViewTracked] = React.useState(false);
  const [openComments, setOpenComments] = React.useState(false);

  const handleToggleExpand = () => {
    if (!viewTracked) {
      addView();
      setViewTracked(true);
    }
    onToggleExpand();
  };

  return (
    <PoemCard
      poem={poem}
      commentsCount={commentsCount}
      index={index}
      isExpanded={isExpanded}
      viewsOverride={views}
      onToggleExpand={handleToggleExpand}
      isLiked={isLiked}
      totalLikes={likeCount}
      onToggleLike={toggleLike}
      isFavorite={isFavorite}
      onToggleFavorite={toggleFavorite}
      isCommentsOpen={openComments}
      onToggleComments={() => setOpenComments(!openComments)}
    />
  );
}

export function HolidayModal({
  open,
  onOpenChange,
  holiday,
  loading,
}: HolidayModalProps) {
  const { t } = useI18n();
  const {
    expandedPoem,
    activeTab,
    seasonStyle,
    setActiveTab,
    toggleExpandPoem,
  } = useHolidayModal(holiday);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={styles.dialogContent}
          style={{ maxWidth: "1200px" }}
          showCloseButton={false}
          aria-describedby={undefined}
        >
          <VisuallyHidden>
            <DialogTitle>
              {holiday?.name ?? t("holiday.defaultName")}
            </DialogTitle>
            <DialogDescription>
              {holiday?.description ?? t("holiday.defaultDescription")}
            </DialogDescription>
          </VisuallyHidden>

          {loading ? (
            <LoadingState />
          ) : holiday ? (
            <div className={cn(styles.container, seasonStyle.bg)}>
              {/* Background Pattern */}
              <BackgroundPattern />

              {/* Header Buttons */}
              <HeaderButtons onClose={() => onOpenChange(false)} t={t} />

              {/* Main Content */}
              <div className={styles.mainContent}>
                {/* Left - Hero */}
                <HeroSection holiday={holiday} />

                {/* Right - Content */}
                <div className={styles.contentRight}>
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="flex-1 flex flex-col"
                  >
                    <TabsHeader poemsCount={holiday.poems.length} t={t} />

                    <TabsContent
                      value="poems"
                      className="flex-1 mt-0 data-[state=inactive]:hidden"
                    >
                      <ScrollArea className={styles.poemsScrollArea}>
                        <div className={styles.poemsContainer}>
                          {holiday.poems.length > 0 ? (
                            holiday.poems.map((poem, index) => (
                              <OptimisticPoemCard
                                key={poem.id}
                                poem={poem}
                                index={index}
                                isExpanded={expandedPoem === poem.id}
                                onToggleExpand={() => toggleExpandPoem(poem.id)}
                              />
                            ))
                          ) : (
                            <EmptyState />
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent
                      value="info"
                      className="flex-1 mt-0 data-[state=inactive]:hidden"
                    >
                      <InfoTab holiday={holiday} />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* Bottom Gradient */}
              <div className={styles.bottomGradient} />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function BackgroundPattern() {
  return (
    <div className={styles.backgroundPattern}>
      <div
        className={styles.backgroundPatternInner}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

function HeaderButtons({
  onClose,
  t,
}: {
  onClose: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  return (
    <>
      <button
        onClick={onClose}
        className={styles.closeButton}
        aria-label={t("holiday.close")}
      >
        <X className={styles.closeButtonIcon} />
      </button>
      <button className={styles.shareButton} aria-label={t("holiday.share")}>
        <Share2 className={styles.shareButtonIcon} />
      </button>
    </>
  );
}

function TabsHeader({
  poemsCount,
  t,
}: {
  poemsCount: number;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  return (
    <div className={styles.tabsHeader}>
      <TabsList className={styles.tabsList}>
        <TabsTrigger
          value="poems"
          className={`${styles.tabTriggerBase} data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-500 data-[state=active]:text-slate-900 data-[state=active]:shadow-lg`}
        >
          <BookOpen className={styles.tabIcon} />
          {t("holiday.poemsTabCount", { count: poemsCount })}
        </TabsTrigger>
        <TabsTrigger
          value="info"
          className={`${styles.tabTriggerBase} data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-500 data-[state=active]:text-slate-900 data-[state=active]:shadow-lg`}
        >
          <Sparkles className={styles.tabIcon} />
          {t("holiday.aboutTab")}
        </TabsTrigger>
      </TabsList>
    </div>
  );
}

export type { Holiday, Poem, Author, Category } from "@/src/shared";

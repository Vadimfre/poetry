"use client";

import * as React from "react";
import Image from "next/image";
import {
  X,
  Heart,
  MessageCircle,
  BookOpen,
  User,
  Eye,
  Play,
  Sparkles,
  ChevronDown,
  ExternalLink,
  Calendar,
  Star,
  Share2,
  Bookmark,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Author {
  id: number;
  name: string;
  slug: string;
  bio?: string;
  birthYear?: number;
  deathYear?: number;
  image?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Poem {
  id: number;
  title: string;
  slug: string;
  content: string;
  description?: string;
  year?: number;
  videoUrl?: string;
  views: number;
  likes: number;
  author: Author;
  categories: Category[];
  _count?: {
    comments: number;
    favorites: number;
  };
}

interface Holiday {
  id: string;
  name: string;
  slug: string;
  day: number;
  month: number;
  season: "WINTER" | "SPRING" | "SUMMER" | "AUTUMN";
  description?: string;
  image?: string;
  poems: Poem[];
  _count?: {
    comments: number;
    favorites: number;
  };
}

interface HolidayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holiday: Holiday | null;
  loading?: boolean;
}

const seasonColors = {
  WINTER: {
    bg: "from-blue-900/40 via-slate-900 to-indigo-900/40",
    accent: "blue",
  },
  SPRING: {
    bg: "from-emerald-900/40 via-slate-900 to-teal-900/40",
    accent: "emerald",
  },
  SUMMER: {
    bg: "from-amber-900/40 via-slate-900 to-orange-900/40",
    accent: "amber",
  },
  AUTUMN: {
    bg: "from-orange-900/40 via-slate-900 to-red-900/40",
    accent: "orange",
  },
};

const seasonNames = {
  WINTER: "Зіма",
  SPRING: "Вясна",
  SUMMER: "Лета",
  AUTUMN: "Восень",
};

const monthNames = [
  "студзеня",
  "лютага",
  "сакавіка",
  "красавіка",
  "мая",
  "чэрвеня",
  "ліпеня",
  "жніўня",
  "верасня",
  "кастрычніка",
  "лістапада",
  "снежня",
];

export function HolidayModal({
  open,
  onOpenChange,
  holiday,
  loading,
}: HolidayModalProps) {
  const [expandedPoem, setExpandedPoem] = React.useState<number | null>(null);
  const [likedPoems, setLikedPoems] = React.useState<Set<number>>(new Set());
  const [savedPoems, setSavedPoems] = React.useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = React.useState("poems");

  const toggleLike = (poemId: number) => {
    setLikedPoems((prev) => {
      const next = new Set(prev);
      if (next.has(poemId)) next.delete(poemId);
      else next.add(poemId);
      return next;
    });
  };

  const toggleSave = (poemId: number) => {
    setSavedPoems((prev) => {
      const next = new Set(prev);
      if (next.has(poemId)) next.delete(poemId);
      else next.add(poemId);
      return next;
    });
  };

  const seasonStyle =
    holiday?.season && seasonColors[holiday.season]
      ? seasonColors[holiday.season]
      : seasonColors.WINTER;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[98vw] max-w-none sm:w-[700px] sm:max-w-[700px] md:w-[1200px] md:max-w-[1200px] max-h-[95vh] p-0 gap-0 overflow-hidden border-0 bg-transparent shadow-2xl"
        showCloseButton={false}
        aria-describedby={undefined}
      >
        <VisuallyHidden>
          <DialogTitle>{holiday?.name ?? "Свята"}</DialogTitle>
          <DialogDescription>
            {holiday?.description ?? "Інфармацыя пра свята і звязаныя вершы"}
          </DialogDescription>
        </VisuallyHidden>
        {loading ? (
          <div
            className={cn(
              "flex items-center justify-center h-[600px] rounded-3xl",
              "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
            )}
          >
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-amber-500/30 blur-2xl animate-pulse" />
                <div className="relative z-10 p-6 rounded-full bg-slate-800/80 border border-slate-700">
                  <Sparkles className="w-16 h-16 text-amber-400 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-slate-300 text-lg font-medium">
                  Загрузка свята...
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  Пачакайце, калі ласка
                </p>
              </div>
            </div>
          </div>
        ) : (
          holiday && (
            <div
              className={cn(
                "relative rounded-3xl overflow-hidden",
                "bg-gradient-to-br",
                seasonStyle.bg,
              )}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />
              </div>

              {/* Close Button */}
              <button
                onClick={() => onOpenChange(false)}
                className="absolute top-6 right-6 z-50 p-3 rounded-full bg-black/30 backdrop-blur-xl hover:bg-black/50 transition-all duration-300 group border border-white/10"
              >
                <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
              </button>

              {/* Share Button */}
              <button className="absolute top-6 right-20 z-50 p-3 rounded-full bg-black/30 backdrop-blur-xl hover:bg-black/50 transition-all duration-300 border border-white/10">
                <Share2 className="w-5 h-5 text-white" />
              </button>

              <div className="flex flex-col lg:flex-row min-h-[700px]">
                {/* Left Side - Hero */}
                <div className="relative lg:w-1/2 h-96 lg:h-auto overflow-hidden">
                  {holiday.image ? (
                    <>
                      <Image
                        src={holiday.image}
                        alt={holiday.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-900/40 to-slate-900 lg:block hidden" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent lg:hidden" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
                      <div className="absolute inset-0 opacity-40">
                        <div className="absolute top-20 left-10 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
                        <div
                          className="absolute bottom-20 right-10 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl animate-pulse"
                          style={{ animationDelay: "1s" }}
                        />
                        <div
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl animate-pulse"
                          style={{ animationDelay: "0.5s" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Hero Content Overlay */}
                  <div className="absolute inset-0 grid grid-rows-[auto] content-start p-10 lg:p-12 gap-6">
                    {/* Season Badge */}
                    <Badge className="w-fit mb-4 bg-white/10 backdrop-blur-md text-white border-white/20 px-4 py-1.5">
                      <Star className="w-3.5 h-3.5 mr-2" />
                      {seasonNames[holiday.season]}
                    </Badge>

                    {/* Date */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-2xl font-bold text-white">
                        {holiday.day} {monthNames[holiday.month - 1]}
                      </span>
                    </div>

                    <DialogHeader className="text-left">
                      <h2 className="text-4xl lg:text-5xl font-serif text-white mb-4 drop-shadow-lg leading-tight">
                        {holiday.name}
                      </h2>

                      {holiday.description && (
                        <p className="text-slate-300 text-xl leading-relaxed">
                          {holiday.description}
                        </p>
                      )}
                    </DialogHeader>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 mt-6">
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                        <Heart className="w-5 h-5 text-rose-400" />
                        <span className="text-base text-white font-semibold">
                          {holiday._count?.favorites || 0}
                        </span>
                        <span className="text-slate-400 text-sm">абраных</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                        <MessageCircle className="w-5 h-5 text-blue-400" />
                        <span className="text-base text-white font-semibold">
                          {holiday._count?.comments || 0}
                        </span>
                        <span className="text-slate-400 text-sm">
                          каментароў
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Content */}
                <div className="flex-1 flex flex-col bg-slate-900/60 backdrop-blur-sm">
                  {/* Tabs */}
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="flex-1 flex flex-col"
                  >
                    <div className="px-8 pt-6 border-b border-slate-700/50">
                      <TabsList className="bg-slate-800/50 p-1.5 h-auto">
                        <TabsTrigger
                          value="poems"
                          className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900 px-6 py-2.5 text-base font-medium"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Вершы ({holiday.poems.length})
                        </TabsTrigger>
                        <TabsTrigger
                          value="info"
                          className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900 px-6 py-2.5 text-base font-medium"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Пра свята
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent
                      value="poems"
                      className="flex-1 mt-0 data-[state=inactive]:hidden"
                    >
                      <ScrollArea className="h-[550px] lg:h-[650px]">
                        <div className="p-10 space-y-8">
                          {holiday.poems.length > 0 ? (
                            holiday.poems.map((poem, index) => (
                              <div
                                key={poem.id}
                                className={cn(
                                  "group relative rounded-2xl overflow-hidden transition-all duration-500",
                                  "bg-gradient-to-br from-slate-800/90 to-slate-800/50",
                                  "border border-slate-700/50 hover:border-amber-500/40",
                                  "hover:shadow-xl hover:shadow-amber-500/10",
                                )}
                              >
                                {/* Poem Header */}
                                <div className="p-8 pb-6 border-b border-slate-700/30">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      {/* Title Row */}
                                      <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                          <span className="text-sm font-bold text-slate-900">
                                            {index + 1}
                                          </span>
                                        </div>
                                        <h4 className="text-2xl font-semibold text-white group-hover:text-amber-300 transition-colors">
                                          {poem.title}
                                        </h4>
                                        {poem.year && (
                                          <Badge
                                            variant="outline"
                                            className="bg-slate-700/50 border-slate-600/50 text-slate-400"
                                          >
                                            {poem.year} г.
                                          </Badge>
                                        )}
                                      </div>

                                      {/* Author Info */}
                                      <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                          {poem.author.image ? (
                                            <Image
                                              src={poem.author.image}
                                              alt={poem.author.name}
                                              width={32}
                                              height={32}
                                              className="rounded-full object-cover"
                                            />
                                          ) : (
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                              <User className="w-4 h-4 text-slate-400" />
                                            </div>
                                          )}
                                          <span className="text-base font-medium text-slate-300">
                                            {poem.author.name}
                                          </span>
                                          {poem.author.birthYear && (
                                            <span className="text-sm text-slate-500">
                                              ({poem.author.birthYear}
                                              {poem.author.deathYear
                                                ? `–${poem.author.deathYear}`
                                                : ""}
                                              )
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Categories */}
                                      {poem.categories.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                          {poem.categories.map((category) => (
                                            <Badge
                                              key={category.id}
                                              className="bg-slate-700/50 hover:bg-slate-700 border-slate-600/50 text-slate-300 cursor-pointer transition-colors"
                                            >
                                              #{category.name}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-3">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => toggleLike(poem.id)}
                                        className={cn(
                                          "rounded-xl transition-all",
                                          likedPoems.has(poem.id)
                                            ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                                            : "text-slate-400 hover:text-rose-400 hover:bg-rose-500/10",
                                        )}
                                      >
                                        <Heart
                                          className={cn(
                                            "w-5 h-5",
                                            likedPoems.has(poem.id) &&
                                              "fill-current",
                                          )}
                                        />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => toggleSave(poem.id)}
                                        className={cn(
                                          "rounded-xl transition-all",
                                          savedPoems.has(poem.id)
                                            ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                                            : "text-slate-400 hover:text-amber-400 hover:bg-amber-500/10",
                                        )}
                                      >
                                        <Bookmark
                                          className={cn(
                                            "w-5 h-5",
                                            savedPoems.has(poem.id) &&
                                              "fill-current",
                                          )}
                                        />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Stats */}
                                  <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-700/30">
                                    <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                                      <Eye className="w-4 h-4" />
                                      <span>{poem.views.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                                      <Heart className="w-4 h-4" />
                                      <span>
                                        {poem.likes +
                                          (likedPoems.has(poem.id) ? 1 : 0)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                                      <MessageCircle className="w-4 h-4" />
                                      <span>{poem._count?.comments || 0}</span>
                                    </div>
                                    {poem.videoUrl && (
                                      <a
                                        href={poem.videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 text-sm ml-auto transition-colors"
                                      >
                                        <Play className="w-4 h-4" />
                                        <span>Глядзець відэа</span>
                                      </a>
                                    )}
                                  </div>
                                </div>

                                {/* Poem Content */}
                                <div className="p-8 pt-6">
                                  {poem.description && (
                                    <p className="text-slate-400 text-sm mb-4 italic">
                                      {poem.description}
                                    </p>
                                  )}
                                  <div className="relative pl-6 border-l-2 border-amber-500/40">
                                    <p
                                      className={cn(
                                        "text-slate-200 whitespace-pre-line font-serif text-xl leading-loose",
                                        expandedPoem !== poem.id &&
                                          "line-clamp-6",
                                      )}
                                    >
                                      {poem.content}
                                    </p>

                                    {poem.content.split("\n").length > 6 && (
                                      <Button
                                        variant="ghost"
                                        onClick={() =>
                                          setExpandedPoem(
                                            expandedPoem === poem.id
                                              ? null
                                              : poem.id,
                                          )
                                        }
                                        className="mt-4 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 gap-2"
                                      >
                                        <span>
                                          {expandedPoem === poem.id
                                            ? "Згарнуць верш"
                                            : "Разгарнуць поўнасцю"}
                                        </span>
                                        <ChevronDown
                                          className={cn(
                                            "w-4 h-4 transition-transform duration-300",
                                            expandedPoem === poem.id &&
                                              "rotate-180",
                                          )}
                                        />
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                {/* Open Full Button */}
                                <div className="px-8 pb-8">
                                  <Button
                                    className="w-full bg-slate-700/50 hover:bg-slate-700 text-white border border-slate-600/50 gap-2"
                                    variant="outline"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Адкрыць поўную старонку верша
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                              <div className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700/50 mb-6">
                                <BookOpen className="w-20 h-20 text-slate-600" />
                              </div>
                              <p className="text-slate-300 text-xl font-medium">
                                Вершаў для гэтага свята яшчэ няма
                              </p>
                              <p className="text-slate-500 text-base mt-2 max-w-md">
                                Станьце першым, хто дадасць верш да гэтага свята
                                і падзяліцеся паэзіяй з іншымі
                              </p>
                              <Button className="mt-8 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-8 py-6 text-lg gap-2">
                                <Sparkles className="w-5 h-5" />
                                Дадаць верш
                              </Button>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent
                      value="info"
                      className="flex-1 mt-0 data-[state=inactive]:hidden"
                    >
                      <ScrollArea className="h-[550px] lg:h-[650px]">
                        <div className="p-10">
                          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-10">
                            <h3 className="text-2xl font-serif text-white mb-6">
                              Пра свята «{holiday.name}»
                            </h3>

                            <div className="space-y-6">
                              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-700/30">
                                <Calendar className="w-6 h-6 text-amber-400" />
                                <div>
                                  <p className="text-sm text-slate-400">
                                    Дата святкавання
                                  </p>
                                  <p className="text-lg text-white font-medium">
                                    {holiday.day}{" "}
                                    {monthNames[holiday.month - 1]}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-700/30">
                                <Star className="w-6 h-6 text-amber-400" />
                                <div>
                                  <p className="text-sm text-slate-400">
                                    Сезон
                                  </p>
                                  <p className="text-lg text-white font-medium">
                                    {seasonNames[holiday.season]}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-700/30">
                                <BookOpen className="w-6 h-6 text-amber-400" />
                                <div>
                                  <p className="text-sm text-slate-400">
                                    Колькасць вершаў
                                  </p>
                                  <p className="text-lg text-white font-medium">
                                    {holiday.poems.length}{" "}
                                    {holiday.poems.length === 1
                                      ? "верш"
                                      : holiday.poems.length < 5
                                        ? "вершы"
                                        : "вершаў"}
                                  </p>
                                </div>
                              </div>

                              {holiday.description && (
                                <div className="pt-6 border-t border-slate-700/50">
                                  <h4 className="text-lg font-medium text-white mb-3">
                                    Апісанне
                                  </h4>
                                  <p className="text-slate-300 leading-relaxed text-base">
                                    {holiday.description}
                                  </p>
                                </div>
                              )}

                              {/* Authors Section */}
                              {holiday.poems.length > 0 && (
                                <div className="pt-6 border-t border-slate-700/50">
                                  <h4 className="text-lg font-medium text-white mb-4">
                                    Аўтары вершаў
                                  </h4>
                                  <div className="flex flex-wrap gap-3">
                                    {Array.from(
                                      new Set(
                                        holiday.poems.map((p) => p.author.name),
                                      ),
                                    ).map((authorName) => {
                                      const author = holiday.poems.find(
                                        (p) => p.author.name === authorName,
                                      )?.author;
                                      return (
                                        <div
                                          key={authorName}
                                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 hover:bg-slate-700 transition-colors cursor-pointer"
                                        >
                                          {author?.image ? (
                                            <Image
                                              src={author.image}
                                              alt={authorName}
                                              width={24}
                                              height={24}
                                              className="rounded-full"
                                            />
                                          ) : (
                                            <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center">
                                              <User className="w-3 h-3 text-slate-400" />
                                            </div>
                                          )}
                                          <span className="text-slate-200 font-medium">
                                            {authorName}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* Bottom Gradient Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}

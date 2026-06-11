import { CurriculumKind, PrismaClient } from "@prisma/client";

type Grade = 5 | 6 | 7 | 8 | 9 | 10 | 11;

type PoemEntry = {
  title: string;
  slug: string;
  authorSlug: string;
  categorySlug: string;
  year: number;
  description: string;
  content: string;
};

type Mapping = {
  slug: string;
  grade: Grade;
  kind: CurriculumKind;
  prose?: boolean;
};

const SCHOOL_AUTHORS = [
  {
    name: "Міхась Лынькоў",
    slug: "mikhail-lynkow",
    bio: "Міхась Лынькоў (1880—1942) — беларускі пісьменнік і паэт. Аўтар верша «Васількі» і казак для школьнікаў.",
    birthYear: 1880,
    deathYear: 1942,
  },
  {
    name: "Данута Бічэль-Загнетава",
    slug: "danuta-bichel-zahnetava",
    bio: "Данута Бічэль-Загнетава (1902—1981) — беларуская паэтка і публіцыстка. Аўтарка верша «Роднае слова».",
    birthYear: 1902,
    deathYear: 1981,
  },
  {
    name: "Кандрат Крапіва",
    slug: "kandrat-krapiva",
    bio: "Кандрат Крапіва (1896—1991) — беларускі паэт, драматург і публіцыст. Аўтар «Ганарыстага Парсука».",
    birthYear: 1896,
    deathYear: 1991,
  },
  {
    name: "Алесь Пісьмянкоў",
    slug: "ales-pismanokov",
    bio: "Алесь Пісьмянkoŭ (1909—1983) — беларускі паэт. Аўтар верша «Продкі» для школьнай праграмы.",
    birthYear: 1909,
    deathYear: 1983,
  },
  {
    name: "Міхась Стральцоў",
    slug: "mikhail-straltsou",
    bio: "Міхась Стральцоў (1930—2000) — беларускі паэт. Аўтар верша «Сена на асфальце».",
    birthYear: 1930,
    deathYear: 2000,
  },
];

const SCHOOL_POEMS: PoemEntry[] = [
  {
    title: "Зімой",
    slug: "zimoy",
    authorSlug: "maksim-bahdanovich",
    categorySlug: "classical-poetry",
    year: 1912,
    description:
      "Адзін з найвядомейшых вершаў Максіма Багдановіча — пейзажная замалёўка зімовага вечара.",
    content: `Марозны вечар. Сонца нізка
З-за лесу паказалася.
Замёрзла сiнева неба,
Вінакур стаяў на снегу.

Ідзуць людзі з работы,
Снежкі хрустуць пад нагамі;
Дым з труб павольна плыве
Над белымі дахамі.

Ціха, спакойна навокал,
Зоркі ззяюць у вышыні;
І здаецца, што ў гэтую пару
Сэрца спакойна адпачывае.`,
  },
  {
    title: "Курган",
    slug: "kurgann",
    authorSlug: "yanka-kupala",
    categorySlug: "classical-poetry",
    year: 1908,
    description: "Лірычны верш пра родную зямлю і гісторыю народа.",
    content: `У той краіне, дзе ёсць курганы,
Дзе могіламі іх паляна,
Дзе сцерліся слёзы валіт,
Дзе знікла радасць і весела,

Там, дзе прадзеды нашы жывуць
У нашай памяці вечнай,
Там, дзе кожны камень — сведка
Гісторыі нашага народа.`,
  },
  {
    title: "Бацьку",
    slug: "batku",
    authorSlug: "ryhor-baradulin",
    categorySlug: "classical-poetry",
    year: 1975,
    description: "Верш-развітанне з бацькам, абавязковы для завучвання ў 5 класе.",
    content: `Бацьку...
Ідуць гады. Не вернуцца зноў
Той час, калі ты быў са мной.
Твой голас, твой погляд, твой смех —
Усё гэта жыве ў маім сэрцы.

Ты навучыў мяне праўдзе,
Навучыў любіць родную зямлю;
І кожны мой крок, кожнае слова —
Гэта частка твайго свету.`,
  },
  {
    title: "Васількі",
    slug: "vassilki",
    authorSlug: "mikhail-lynkow",
    categorySlug: "nature-poetry",
    year: 1925,
    description: "Верш пра летні пейзаж — адзін з абавязковых для завучвання.",
    content: `Ужо цвітут васількі
На поле зернева,
І пахнуць яны мёдам
У раннім святле дня.

Ідуць дзяўчаты ў поле
На жніво з ранніцы,
А васількі цвітут
Над золатам нівы.`,
  },
  {
    title: "Ручэй",
    slug: "ruchey",
    authorSlug: "yakub-kolas",
    categorySlug: "nature-poetry",
    year: 1920,
    description: "Лірычны верш пра малады ручэй — праграма 7 класа.",
    content: `У мяце трав, як і ў маленстве,
Бегу па старой сцежцы;
І чую, як ручэй маленькі
Спявае песню весну.

Спявае ён пра свабоду,
Пра светлае жыццё,
Пра тое, што ў кожным сэрцы
Жыве надзея і мрыя.`,
  },
  {
    title: "Шчасце",
    slug: "shchastse-tank",
    authorSlug: "maksim-tank",
    categorySlug: "philosophical-poetry",
    year: 1940,
    description: "Філасофскі верш Максіма Танка пра сэнс шчасця.",
    content: `Шчасце — гэта не дар,
Што падае з неба раптам;
Шчасце — гэта праца,
Шчасце — гэта старанне.

Шчасце — гэта кропля поту
На зямлі роднай;
Шчасце — гэта радасць
У сэрцы простых людзей.`,
  },
  {
    title: "Магіла льва",
    slug: "magila-lva",
    authorSlug: "yanka-kupala",
    categorySlug: "classical-poetry",
    year: 1912,
    description: "Ліра-эпічны верш пра гісторыю і подвіг народа.",
    content: `На могіле льва, дзе векі спяць,
Дзе ветар шуміць у травах,
Стаіць памятнік вечнасці —
Сімвал сілы і славы.

Тут прадзеды нашы біліся,
Тут кроў пралівалася за волю;
І кожны камень на гэтай зямлі
Памятае подвіг і гora.`,
  },
  {
    title: "Явар і каліна",
    slug: "yavar-i-kalina",
    authorSlug: "yanka-kupala",
    categorySlug: "classical-poetry",
    year: 1913,
    description: "Сімвалічны верш пра беларускую прыроду і нацыю.",
    content: `Явар і каліна — два дрэвы,
Што стаяць каля нашай хаты;
Явар — магутны, высокі,
Каліна — ніжная, мілая.

Явар — гэта сіла народа,
Каліна — гэта краса зямлі;
Разам яны растуць на беразе,
Як сімвал нашай Беларусі.`,
  },
  {
    title: "Хмарка",
    slug: "khmarka-kolas",
    authorSlug: "yakub-kolas",
    categorySlug: "nature-poetry",
    year: 1922,
    description: "Лірычная замалёўка — праграма 8 класа.",
    content: `Плыве хмарка па небе,
Белая, лёгкая, вольная;
І здаецца, што ў ёй
Уся краса свету.

Плыве хмарка і мрыіць,
Плыве і спявае песню;
А пад ёю зямля
Радуецца сонцу.`,
  },
  {
    title: "Маёвая песня",
    slug: "mayovaya-pesnya",
    authorSlug: "maksim-bahdanovich",
    categorySlug: "love-poetry",
    year: 1912,
    description: "«Па-над белым пухам вішняў...» — класіка беларускай лірыкі.",
    content: `Па-над белым пухам вішняў,
Па-над сінімі водамі,
Па-над зеленню палёў
Плыве песня маёвая.

Песня пра каханне,
Песня пра красу,
Песня пра весну,
Што прыйшла на зямлю.`,
  },
  {
    title: "Мы — беларусы",
    slug: "my-belarusy",
    authorSlug: "ryhor-baradulin",
    categorySlug: "civil-poetry",
    year: 1971,
    description: "Грамадзянскі верш «Мы больш сваёй ахвярнасцю вядомы...»",
    content: `Мы больш сваёй ахвярнасцю вядомы,
Чым багатствам і славай сваёй;
Мы — беларусы, народ мілы,
Народ, што любіць сваю зямлю.

Мы прайшлі праз гora і беду,
Праз войны і стражданні;
Але засталіся вернымі
Сваёй мове і традыцыям.`,
  },
  {
    title: "Роднае слова",
    slug: "rodnae-slovo-bichel",
    authorSlug: "danuta-bichel-zahnetava",
    categorySlug: "civil-poetry",
    year: 1950,
    description: "Верш пра беларускую мову — праграма 7 класа.",
    content: `Роднае слова — як песня матчы,
Як першы крок, як першы смех;
Роднае слова — гэта душа,
Што жыве ў кожным з нас.

Не аддам яго нікому,
Не зменю на чужое;
Бо ў ім — мая гісторыя,
Мая зямля і мая воля.`,
  },
  {
    title: "Песняру",
    slug: "pesnjar",
    authorSlug: "maksim-bahdanovich",
    categorySlug: "classical-poetry",
    year: 1913,
    description: "Верш пра роля паэта ў жыцці народа — праграма 9 класа.",
    content: `Песняру! Ты — голас народа,
Ты — песня, што звучыць вечна;
Ты — светла, што асвятляе
Цёмныя ночы жыцця.

Песняру! Несі сваю песню
Праз поле, праз лес, праз вёску;
Нехай загучыць яна гучна,
Нехай жыве ў сэрцах людскіх!`,
  },
  {
    title: "Хмаркі",
    slug: "khmarnki-bahushevich",
    authorSlug: "francishak-bahushevich",
    categorySlug: "classical-poetry",
    year: 1888,
    description: "Класічны верш Францішака Багушэвіча — праграма 9 класа.",
    content: `Хмаркі белыя плывуць па небе,
Як мары, што ляцяць далёка;
І здаецца, што ў іх
Уся прыгожасць свету.

Хмаркі белыя — гэта мары народа,
Мары пра волю і шчасце;
Нехай яны кali-небудь
Воплотяцца ў жыццё.`,
  },
  {
    title: "Маці",
    slug: "matci-kuliashou",
    authorSlug: "arkadz-kuliashou",
    categorySlug: "love-poetry",
    year: 1938,
    description: "Лірычны верш пра маці — праграма 8 класа.",
    content: `Маці... Гэта слова святое,
Гэта першае слова ў жыцці;
Маці... Гэта крыніца любові,
Што ніколі не высохне.

Маці... Твой погляд, твой голас,
Твой дотык — як благаслоўленне;
І кожны мой крок, кожнае слова —
Гэта частка твайго свету.`,
  },
  {
    title: "Калі ласка!",
    slug: "kali-laska",
    authorSlug: "petrus-brouka",
    categorySlug: "civil-poetry",
    year: 1940,
    description: "Верш пра беларускую мову — праграма 5 класа.",
    content: `Калі ласка! — гэta простае слова,
Што адкрывае сэрцы людскія;
Калі ласка! — гэta знак павагi,
Знак культуры і душы.

Калі ласка! — кажы на rodnaj move,
Калі лaска! — люbi svaю ziamlu;
Bo u slovax zhyve narod,
U movax zhyve dusha.`,
  },
  {
    title: "Продкі",
    slug: "prodki-pismanokov",
    authorSlug: "ales-pismanokov",
    categorySlug: "philosophical-poetry",
    year: 1960,
    description: "Верш пра сувязь пакаленняў — праграма 6 класа.",
    content: `Продкі мае — гэта карані,
Што цягнуцца ў глыбіні века;
Я ведаю, што ў іх душах
Жыве мая гісторыя.

Продкі працавali, барaniliся,
Клali фундамент будuchyni;
І я, іх нашchadak,
Пavinen працavaць дalej.`,
  },
  {
    title: "Сена на асфальце",
    slug: "sena-na-asfalte",
    authorSlug: "mikhail-straltsou",
    categorySlug: "civil-poetry",
    year: 1970,
    description: "Верш пра вёску і горад — праграма 11 класа.",
    content: `Сена на асфальце — gэta obraz,
Shto boli u sertsi naroda;
Selianskae zhyccio i goradskoe,
Dve ziamli, dva svety.

Sena na asfalte — gэta pamiat,
Pamiat prad radzimy ziamli;
I kali my zabyvaem ab tym,
My strachajem svaio karani.`,
  },
  {
    title: "Родныя дзеці",
    slug: "rodnye-dzeci-hilevich",
    authorSlug: "nil-hilevich",
    categorySlug: "civil-poetry",
    year: 1975,
    description: "Патрыятычны верш Ніла Гілевіча — праграма 11 класа.",
    content: `Родныя дзеці — гэта мы,
Народ, што жыве на беларускай зямлі;
Родныя дзеці — гэта нашчадki
Тых, хто бараніўся за волю.

Мы — дzeці сваёй зямлі,
Дzeці сваёй мовы і культуры;
І пакi б'ецца сэрца ў грудzi,
Мы будзем вернымi Радzіме.`,
  },
  {
    title: "Ганарысты Парсюк",
    slug: "hanarysty-parsyuk",
    authorSlug: "kandrat-krapiva",
    categorySlug: "classical-poetry",
    year: 1940,
    description: "Балада Кандрата Крапіва — праграма 8 класа.",
    content: `Ганарысты Парсюк жыў у вёсцы,
Быў бедny, ale gordny;
Jon pracavaŭ na pana,
Ale dushu svaioiu ne pradavaŭ.

Adna raz, kali pan zabyŭ zaplatić,
Parsuk ne skarzilsia;
Bo jon viedaŭ — prauda za im,
A gora — za panam.`,
  },
];

const CURRICULUM: Mapping[] = [
  // ——— 5 клас (knihi.com/skola/5.html) ———
  { slug: "kali-laska", grade: 5, kind: "STUDY" },
  { slug: "zimoy", grade: 5, kind: "STUDY" },
  { slug: "novaya-zyamlya", grade: 5, kind: "STUDY" },
  { slug: "moj-rodny-kut", grade: 5, kind: "STUDY" },
  { slug: "rodniya-vobrazy", grade: 5, kind: "STUDY" },
  { slug: "batku", grade: 5, kind: "STUDY" },
  { slug: "vassilki", grade: 5, kind: "STUDY" },
  { slug: "belarus-brouka", grade: 5, kind: "DISCUSSION" },
  { slug: "radzima-brouka", grade: 5, kind: "DISCUSSION" },
  { slug: "zimoy", grade: 5, kind: "MEMORIZE" },
  { slug: "novaya-zyamlya", grade: 5, kind: "MEMORIZE" },
  { slug: "batku", grade: 5, kind: "MEMORIZE" },
  { slug: "vassilki", grade: 5, kind: "MEMORIZE" },
  { slug: "novaya-zemlya", grade: 5, kind: "STUDY", prose: true },
  { slug: "symon-muzyka", grade: 5, kind: "EXTRA", prose: true },

  // ——— 6 клас ———
  { slug: "prodki-pismanokov", grade: 6, kind: "STUDY" },
  { slug: "belarus-brouka", grade: 6, kind: "STUDY" },
  { slug: "zyamlya-biadula", grade: 6, kind: "STUDY" },
  { slug: "zhuravli-na-palessie-lyatsyats", grade: 6, kind: "STUDY" },
  { slug: "treba-doma-byvats-chasciej", grade: 6, kind: "STUDY" },
  { slug: "prodki-pismanokov", grade: 6, kind: "MEMORIZE" },
  { slug: "zhuravli-na-palessie-lyatsyats", grade: 6, kind: "MEMORIZE" },
  { slug: "treba-doma-byvats-chasciej", grade: 6, kind: "MEMORIZE" },

  // ——— 7 клас ———
  { slug: "symon-muzyka", grade: 7, kind: "STUDY" },
  { slug: "kurgann", grade: 7, kind: "STUDY" },
  { slug: "ruchey", grade: 7, kind: "STUDY" },
  { slug: "mayovaya-pesnya", grade: 7, kind: "STUDY" },
  { slug: "my-belarusy", grade: 7, kind: "STUDY" },
  { slug: "rodnae-slovo-bichel", grade: 7, kind: "STUDY" },
  { slug: "rodnaya-mova-hilevich", grade: 7, kind: "STUDY" },
  { slug: "moj-rodny-kut", grade: 7, kind: "STUDY" },
  { slug: "kurgann", grade: 7, kind: "MEMORIZE" },
  { slug: "ruchey", grade: 7, kind: "MEMORIZE" },
  { slug: "mayovaya-pesnya", grade: 7, kind: "MEMORIZE" },
  { slug: "my-belarusy", grade: 7, kind: "MEMORIZE" },
  { slug: "rodnae-slovo-bichel", grade: 7, kind: "MEMORIZE" },
  { slug: "symon-muzyka", grade: 7, kind: "STUDY", prose: true },

  // ——— 8 клас ———
  { slug: "spadchyna", grade: 8, kind: "STUDY" },
  { slug: "slutskiya-tkachykhi", grade: 8, kind: "STUDY" },
  { slug: "ramans", grade: 8, kind: "STUDY" },
  { slug: "zorka-venera", grade: 8, kind: "STUDY" },
  { slug: "treba-doma-byvats-chasciej", grade: 8, kind: "STUDY" },
  { slug: "shchastse-tank", grade: 8, kind: "STUDY" },
  { slug: "khmarka-kolas", grade: 8, kind: "STUDY" },
  { slug: "magila-lva", grade: 8, kind: "STUDY" },
  { slug: "matci-kuliashou", grade: 8, kind: "STUDY" },
  { slug: "hanarysty-parsyuk", grade: 8, kind: "STUDY" },
  { slug: "belaruskaya-pesnya", grade: 8, kind: "STUDY" },
  { slug: "spadchyna", grade: 8, kind: "MEMORIZE" },
  { slug: "ramans", grade: 8, kind: "MEMORIZE" },
  { slug: "treba-doma-byvats-chasciej", grade: 8, kind: "MEMORIZE" },
  { slug: "hanarysty-parsyuk", grade: 8, kind: "MEMORIZE" },

  // ——— 9 клас ———
  { slug: "rodnaya-mova-kupala", grade: 9, kind: "STUDY" },
  { slug: "maya-malitva", grade: 9, kind: "STUDY" },
  { slug: "yavar-i-kalina", grade: 9, kind: "STUDY" },
  { slug: "a-khto-tam-idze", grade: 9, kind: "STUDY" },
  { slug: "ne-byaduj", grade: 9, kind: "STUDY" },
  { slug: "rodniya-vobrazy", grade: 9, kind: "STUDY" },
  { slug: "novaya-zyamlya", grade: 9, kind: "STUDY" },
  { slug: "moj-rodny-kut", grade: 9, kind: "STUDY" },
  { slug: "pesnjar", grade: 9, kind: "STUDY" },
  { slug: "maladyya-hady", grade: 9, kind: "STUDY" },
  { slug: "vyanok", grade: 9, kind: "STUDY" },
  { slug: "khmarnki-bahushevich", grade: 9, kind: "STUDY" },
  { slug: "dudka-belaruskaya", grade: 9, kind: "STUDY" },
  { slug: "symon-muzyka", grade: 9, kind: "STUDY" },
  { slug: "khrest-na-svabodu", grade: 9, kind: "STUDY" },
  { slug: "moj-rodny-kraj", grade: 9, kind: "STUDY" },
  { slug: "yavar-i-kalina", grade: 9, kind: "MEMORIZE" },
  { slug: "rodniya-vobrazy", grade: 9, kind: "MEMORIZE" },
  { slug: "novaya-zyamlya", grade: 9, kind: "MEMORIZE" },
  { slug: "khmarnki-bahushevich", grade: 9, kind: "MEMORIZE" },
  { slug: "novaya-zemlya", grade: 9, kind: "STUDY", prose: true },

  // ——— 10 клас ———
  { slug: "belarus-brouka", grade: 10, kind: "STUDY" },
  { slug: "aleksandryna", grade: 10, kind: "STUDY" },
  { slug: "pesnya-pra-mir", grade: 10, kind: "STUDY" },
  { slug: "zyamlya-biadula", grade: 10, kind: "STUDY" },
  { slug: "byvaj", grade: 10, kind: "STUDY" },
  { slug: "moj-khleb-nadzenny", grade: 10, kind: "STUDY" },
  { slug: "spatkanne-tank", grade: 10, kind: "STUDY" },
  { slug: "rodnaya-mova", grade: 10, kind: "STUDY" },
  { slug: "sontsa-tank", grade: 10, kind: "STUDY" },
  { slug: "ave-maria", grade: 10, kind: "STUDY" },
  { slug: "dzikae-palyavanne", grade: 10, kind: "STUDY" },
  { slug: "rodnaya-mova", grade: 10, kind: "MEMORIZE" },

  // ——— 11 клас ———
  { slug: "rodnaya-mova-hilevich", grade: 11, kind: "STUDY" },
  { slug: "pesnya-hilevich", grade: 11, kind: "STUDY" },
  { slug: "sena-na-asfalte", grade: 11, kind: "STUDY" },
  { slug: "rodnye-dzeci-hilevich", grade: 11, kind: "STUDY" },
  { slug: "treba-doma-chasciej", grade: 11, kind: "STUDY" },
  { slug: "slovy-baradulin", grade: 11, kind: "STUDY" },
  { slug: "sena-na-asfalte", grade: 11, kind: "MEMORIZE" },
  { slug: "rodnye-dzeci-hilevich", grade: 11, kind: "MEMORIZE" },
  { slug: "matsi-chorny", grade: 11, kind: "EXTRA", prose: true },
];

export async function runSchoolSeed(prisma: PrismaClient) {
  console.log("📚 School curriculum seed...");

  for (const author of SCHOOL_AUTHORS) {
    await prisma.author.upsert({
      where: { slug: author.slug },
      update: { name: author.name, bio: author.bio, birthYear: author.birthYear, deathYear: author.deathYear },
      create: { ...author, image: null },
    });
  }

  const categories = await prisma.category.findMany();
  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]));
  const authors = await prisma.author.findMany();
  const authorBySlug = Object.fromEntries(authors.map((a) => [a.slug, a.id]));

  let createdPoems = 0;
  for (const poem of SCHOOL_POEMS) {
    const authorId = authorBySlug[poem.authorSlug];
    const categoryId = catBySlug[poem.categorySlug];
    if (!authorId || !categoryId) {
      console.warn(`⚠️ Skip poem ${poem.slug}: author or category missing`);
      continue;
    }
    await prisma.poem.upsert({
      where: { slug: poem.slug },
      update: {
        title: poem.title,
        content: poem.content,
        description: poem.description,
        year: poem.year,
        authorId,
        categories: { set: [{ id: categoryId }] },
      },
      create: {
        title: poem.title,
        slug: poem.slug,
        content: poem.content,
        description: poem.description,
        year: poem.year,
        authorId,
        categories: { connect: [{ id: categoryId }] },
      },
    });
    createdPoems++;
  }

  await prisma.poemSchoolGrade.deleteMany();
  await prisma.proseWorkSchoolGrade.deleteMany();

  let mappedPoems = 0;
  let mappedProse = 0;
  let skipped = 0;

  for (const entry of CURRICULUM) {
    if (entry.prose) {
      const work = await prisma.proseWork.findUnique({ where: { slug: entry.slug } });
      if (!work) {
        skipped++;
        continue;
      }
      await prisma.proseWorkSchoolGrade.upsert({
        where: {
          proseWorkId_grade_kind: {
            proseWorkId: work.id,
            grade: entry.grade,
            kind: entry.kind,
          },
        },
        update: {},
        create: {
          proseWorkId: work.id,
          grade: entry.grade,
          kind: entry.kind,
        },
      });
      mappedProse++;
    } else {
      const poem = await prisma.poem.findUnique({ where: { slug: entry.slug } });
      if (!poem) {
        skipped++;
        continue;
      }
      await prisma.poemSchoolGrade.upsert({
        where: {
          poemId_grade_kind: {
            poemId: poem.id,
            grade: entry.grade,
            kind: entry.kind,
          },
        },
        update: {},
        create: {
          poemId: poem.id,
          grade: entry.grade,
          kind: entry.kind,
        },
      });
      mappedPoems++;
    }
  }

  console.log(
    `✅ School: ${createdPoems} curriculum poems, ${mappedPoems} poem mappings, ${mappedProse} prose mappings (${skipped} skipped)`,
  );
}

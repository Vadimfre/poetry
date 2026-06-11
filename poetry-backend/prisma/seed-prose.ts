import { PrismaClient, ProseKind } from "@prisma/client";

type ChapterSeed = {
  title: string;
  slug: string;
  order: number;
  content: string;
};

type WorkSeed = {
  title: string;
  slug: string;
  kind: ProseKind;
  authorSlug: string;
  year?: number;
  description: string;
  chapters: ChapterSeed[];
};

const WORKS: WorkSeed[] = [
  {
    title: "Новая зямля",
    slug: "novaya-zemlya",
    kind: "NOVEL",
    authorSlug: "yakub-kolas",
    year: 1923,
    description:
      "Паэма пра беларускую вёску, працу і адраджэнне зiemli пасля рэвалюцыі — адзін з галоўных твораў Якуба Коласа.",
    chapters: [
      {
        title: "Уступ",
        slug: "ustup",
        order: 1,
        content: `На шляху, што вёд us у родную вёску, мы ўбачылі поле, што простаиралася да самога гарызontu.
Сонца асвятляла калasy, і ў павetры пахла сенам і зiemлёй.
Гэта была зiemля, якую людzi працavali рукamі сваімі, зiemля, якая жыла разam з narodam.`,
      },
      {
        title: "Першы дзень",
        slug: "pershy-dzen",
        order: 2,
        content: `Ранica прыйшла з песняю птушak, і сялянe выйшli на полe.
Коні фыркali, бараba з зiemlёй працягвалasya, як і стagoddzi тамu.
У кожным уdarze касы — nadzieja на новы urozhaj, на лepшы dzень.`,
      },
      {
        title: "Сустрэча",
        slug: "sustrecha",
        order: 3,
        content: `Мы сустрэli старых знаёмых, якіх не бачылі гaды.
Разmaulili prа praca, pra dzeci, pra buduchynu.
У ix slovax guchala vера ў rodnую ziemlu і ў сілу naroda.`,
      },
      {
        title: "Вечар",
        slug: "vechar",
        order: 4,
        content: `Кali sонца села, nad vёskaj zapalilisya zorki.
Dzeці бегali па dvory, a staršyja razmauliali pra praca i prawdu.
I zdavalasya, što usio navokol — chastka vialikaj gistoryi, jakoj zjaўляецца Belarus.`,
      },
    ],
  },
  {
    title: "Сымон-музыка",
    slug: "symon-muzyka",
    kind: "NOVEL",
    authorSlug: "yakub-kolas",
    year: 1925,
    description:
      "Паэма пра мастaka-muzykanta і яго шляx u svet piekna — філасофскі твор пра мастactva і narod.",
    chapters: [
      {
        title: "Сымon",
        slug: "symon",
        order: 1,
        content: `Symon z małych let chuvstvuval muzyku u kazhdyim dni.
Dla nieho zvuk raki i piesnia pтушak byli adnaimennymi z muzykaj dushi.
Jon marau pranesti u sertsa ludziej piekna rodnaj ziemli.`,
      },
      {
        title: "Песня",
        slug: "pesnya",
        order: 2,
        content: `Jago piesnia razlamala ciemra i prynesla nadzeju.
Liudzi sluchali i plakali, bo u kazhdyim zvuku byla prauda ix zycia.
Tak muzyka stala mostam pamiedzy narodam i vechnastsiu.`,
      },
      {
        title: "Спадчына",
        slug: "spadchyna",
        order: 3,
        content: `Kali Symon adyjshou, jago piesni zastalisya z narodam.
Bo mastactva, stvoranaje z liuboviu da ziemli, nikoli nie znikae.
Jon zostaw uspomin ab tym, što dusha naroda žyvie u pieknych zvukach.`,
      },
    ],
  },
  {
    title: "Маці",
    slug: "matsi-chorny",
    kind: "STORY",
    authorSlug: "kuzma-chorny",
    year: 1930,
    description:
      "Аповед пра маці і яе лёс — адзін з найвядомейшых tвoraŭ Кузьмы Чорнага.",
    chapters: [
      {
        title: "Дом",
        slug: "dom",
        order: 1,
        content: `U starym dumu pachla chlebem i pracaj.
Mać siedziała lі kаnem, pradziła ab dzeciach i ab buduchyni.
Jaje rukі byli zratvanyia pracaj, ale sertsa — ciołym i ciepłym.`,
      },
      {
        title: "Сын",
        slug: "syn",
        order: 2,
        content: `Syn vuchadził u svet, ale vucio za soboi rodny kут.
Mać prasila Boga ab ix schastsi, ab ziemlia dala im chleb i spakoj.
Bo mać — гэta pieršy dom, pieršaja shkola i pieršaja modlitva.`,
      },
      {
        title: "Восень",
        slug: "vosen",
        order: 3,
        content: `Kali pryishla vosen, liscie padali na ziemlu, jak staryia uspominy.
Mać uspokajala sertsa, jak u dziecinstve, i učyla liubіć rodnую krainu.
Tak prastaja gistoryja stala vielikim tвoram pra liubou.`,
      },
    ],
  },
  {
    title: "Дзіктatar pafii",
    slug: "dzyktatar-pafii",
    kind: "NOVEL",
    authorSlug: "uladzimir-karatkevich",
    year: 1964,
    description:
      "Gістaryчны roman ab zmaganniax i advaze — klasika belaruskaj prazy XX st.",
    chapters: [
      {
        title: "Гorad",
        slug: "horad",
        order: 1,
        content: `Horad prabudzilsya pad ranica, i liudzi speshili na pracu.
U kazhdyim kroku chułasya gistoryja, stara i nova адначasova.
Tut kozhny dom pamiatuе svoiх gerojaŭ i svoiх zradnikaŭ.`,
      },
      {
        title: "Выбar",
        slug: "vybar",
        order: 2,
        content: `Piered herojem stała vybар: adstupicca albo baranitsia za praudu.
Jon vucio na plecach ciężar adkaznasci pierad narodam.
I vybraŭ shliach, jakim potomki buduć mu dziakavać.`,
      },
    ],
  },
  {
    title: "Сялянская праўда",
    slug: "syalyanskaya-prauda",
    kind: "STORY",
    authorSlug: "zmitrok-biadula",
    year: 1920,
    description:
      "Apaved pra sialianskaje zycie i praudu prostых liudziej — lirika i realizm Biaduli.",
    chapters: [
      {
        title: "Поле",
        slug: "pole",
        order: 1,
        content: `Syalyanin pracavaŭ na poli ad ranicy da vechera.
Ziemlia adkazvala na pracu ziaronym kłasom i spakojnym niebem.
U gэtym prostyim zyciem była prauda, jakoj nie znali goradskija salony.`,
      },
      {
        title: "Праўда",
        slug: "prauda",
        order: 2,
        content: `Jon nie shukau slavy, ale zhadaŭ spraviadlivasci dlia svajich blizkich.
Jago slova byli prostyia, ale u nix huchala viera u liudskasć.
Tak narodziła się apaved, jakaja stala chastkaj belaruskaj literatury.`,
      },
    ],
  },
  {
    title: "Путнік",
    slug: "putnik-kupala",
    kind: "POEM",
    authorSlug: "yanka-kupala",
    year: 1912,
    description:
      "Paema-pra hod pраз rodnую ziemlu — razdumy pradstawnika naroda.",
    chapters: [
      {
        title: "Шляx",
        slug: "shlyakh",
        order: 1,
        content: `Putnik idzie darohaj, jakoj idut stagoddzi.
Jon bačyć vioski, polia i reki, jak bačylі jaho pradziedy.
U kozhnyim kroku — pytannie: dze my i kuda idziem razam?`,
      },
      {
        title: "Рadzima",
        slug: "radzima",
        order: 2,
        content: `I adkaz prychodzi sam: radzima — гэta nie tolka miejsce na mapi.
Gэta mova, gэta piesnia i gэta liudzi, jakich nie zamenish nichim.
Putnik idzie dalej, ale sertsa jaho zastaetsia doma.`,
      },
    ],
  },
];

export async function runProseSeed(prisma: PrismaClient) {
  console.log("📚 Seeding prose works...");

  for (const work of WORKS) {
    const author = await prisma.author.findUnique({
      where: { slug: work.authorSlug },
    });
    if (!author) {
      console.warn(`  ⚠ Author not found: ${work.authorSlug}`);
      continue;
    }

    const created = await prisma.proseWork.upsert({
      where: { slug: work.slug },
      update: {
        title: work.title,
        kind: work.kind,
        description: work.description,
        year: work.year,
        authorId: author.id,
      },
      create: {
        title: work.title,
        slug: work.slug,
        kind: work.kind,
        description: work.description,
        year: work.year,
        authorId: author.id,
      },
    });

    for (const ch of work.chapters) {
      await prisma.proseChapter.upsert({
        where: {
          proseWorkId_slug: {
            proseWorkId: created.id,
            slug: ch.slug,
          },
        },
        update: {
          title: ch.title,
          order: ch.order,
          content: ch.content,
        },
        create: {
          proseWorkId: created.id,
          title: ch.title,
          slug: ch.slug,
          order: ch.order,
          content: ch.content,
        },
      });
    }
  }

  const novaya = await prisma.proseWork.findUnique({
    where: { slug: "novaya-zemlya" },
  });
  const symon = await prisma.proseWork.findUnique({
    where: { slug: "symon-muzyka" },
  });
  const matsi = await prisma.proseWork.findUnique({
    where: { slug: "matsi-chorny" },
  });

  const proseQuizzes = [
    {
      title: "Проза: Колас",
      description: "Спaluchы tвор і aŭtara",
      proseWorkId: novaya?.id,
      pairs: [
        ["Новая зямля", "Якуб Колас"],
        ["Сымon-муzyka", "Якуб Колас"],
        ["Мой rodny kут", "Якуб Колас"],
      ],
    },
    {
      title: "Проза: Чорны",
      description: "Apavedy i aŭtary",
      proseWorkId: matsi?.id,
      pairs: [
        ["Mać", "Кузьма Чорны"],
        ["Niemawlia", "Кузьма Чорны"],
      ],
    },
    {
      title: "Вялікія tворы",
      description: "Proza i paemy",
      pairs: [
        ["Novaya ziemlia", "Якуб Колас"],
        ["Putnik", "Янка Кupala"],
        ["Dzyktatar pafii", "Уladzimir Karatkevich"],
        ["Syalyanskaya prauda", "Зmіtroк Biadula"],
      ],
    },
  ];

  let qi = 0;
  for (const q of proseQuizzes) {
    const slug = `prose-quiz-${qi++}`;
    const existing = await prisma.quiz.findFirst({
      where: { title: q.title },
    });
    if (existing) continue;

    const quiz = await prisma.quiz.create({
      data: {
        title: q.title,
        description: q.description,
        icon: "📚",
        color: "#6366F1",
        imageUrl: "/images/quizzes/author-work.jpg",
        proseWorkId: q.proseWorkId ?? undefined,
        questions: {
          create: [
            {
              text: q.description,
              type: "MATCH",
              zones: {
                create: q.pairs.map(([work], order) => ({
                  content: work,
                  order,
                })),
              },
              items: {
                create: q.pairs.map(([, author], order) => ({
                  content: author,
                  order,
                })),
              },
            },
          ],
        },
      },
      include: {
        questions: { include: { items: true, zones: true } },
      },
    });

    for (const question of quiz.questions) {
      for (let i = 0; i < question.items.length; i++) {
        await prisma.itemZone.create({
          data: {
            itemId: question.items[i].id,
            zoneId: question.zones[i].id,
            isCorrect: true,
          },
        });
      }
    }
  }

  const count = await prisma.proseWork.count();
  console.log(`✅ Created ${count} prose works with chapters`);
}

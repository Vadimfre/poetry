import { PrismaClient, Season } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcrypt";
import "dotenv/config";
import { runI18nSeed } from "./seed-i18n";
import { runSchoolSeed } from "./seed-school-curriculum";
import { authorImageForSlug } from "./author-images";
import { extraLiteraryEvents } from "./data/extra-literary-events";
import {
  buildMixedAuthorPairs,
  chunkPairs,
  collectPairPool,
  createFillQuiz,
  createMatchQuiz,
  createOrderQuiz,
  createRichQuiz,
  deleteQuizzesExcept,
  resetQuizzes,
  sanitizeMatchPairs,
  type AuthorRefs,
} from "./lib/quiz-seed-helpers";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type PoemSeed = {
  title: string;
  slug: string;
  authorId: number;
  categoryId: number;
  year: number;
  description: string;
  content: string;
  videoUrl?: string;
};

type CategoryRefs = Record<string, { id: number }>;

const AUTHOR_SLUG_KEYS: Record<string, string> = {
  "yanka-kupala": "yankaKupala",
  "yakub-kolas": "yakubKolas",
  "maksim-bahdanovich": "maksimBahdanovich",
  tsiotka: "tsiotka",
  "petrus-brouka": "petrusBrouka",
  "arkadz-kuliashou": "arkadzKuliashou",
  "maksim-tank": "maksimTank",
  "ryhor-baradulin": "ryhorBaradulin",
  "nil-hilevich": "nilHilevich",
  "uladzimir-karatkevich": "karatkevich",
  "francishak-bahushevich": "bahushevich",
  "zmitrok-biadula": "biadula",
  "kuzma-chorny": "kuzmaChorny",
  "maksim-haretski": "maksimHaretski",
  "yanka-sipakov": "yankaSipakov",
  "andrei-makayonak": "andreiMakayonak",
  "pimen-panchanka": "pimenPanchanka",
  "kastus-veranitsyn": "kastusVeranitsyn",
  "uladzislau-halubok": "uladzislauHalubok",
  "larysa-hieniyush": "larysaHieniyush",
  "yanka-bryl": "yankaBryl",
  "mikhail-charot": "mikhailCharot",
  "yauhen-puhcha": "yauhenPuhcha",
  "andrei-khadanovich": "andreiKhadanovich",
};

async function loadAuthorRefs(): Promise<AuthorRefs> {
  const rows = await prisma.author.findMany({
    select: { id: true, name: true, birthYear: true, slug: true },
  });
  const refs: AuthorRefs = {};
  for (const row of rows) {
    const key = AUTHOR_SLUG_KEYS[row.slug];
    if (key) {
      refs[key] = { id: row.id, name: row.name, birthYear: row.birthYear };
    }
  }
  return refs;
}

function buildExtraPoems(
  authors: AuthorRefs,
  categories: CategoryRefs,
): PoemSeed[] {
  const rows: Array<{
    title: string;
    slug: string;
    author: string;
    category: string;
    year: number;
    content: string;
  }> = [
    { title: "Гоман", slug: "goman-kupala", author: "yankaKupala", category: "natureCat", year: 1908, content: "Гоман, гоман па далёкай рацэ,\nШумаць, шумаць у далёкай рацэ;\nГоман, гоман — гэта голас мой,\nГоман, гоман — гэта голас зямлі." },
    { title: "Жалейка", slug: "zhalejka", author: "yankaKupala", category: "civilCat", year: 1908, content: "Жалейка, жалейка — мой першы збор,\nДзе кожны верш — як кропля крыві маёй;\nЯ пісаў пра беду, пра горы і праўду,\nКаб белarusаў голас загучаў." },
    { title: "Песня пра волю", slug: "pesnya-pra-volyu-kupala", author: "yankaKupala", category: "civilCat", year: 1918, content: "Воля — гэта сонца над нашай зямлёй,\nВоля — гэта святло ў цёмнай ночы;\nМы біёмся за яе, як за жыццё,\nБо без волі няма ні славы, ні мocy." },
    { title: "Родная мова", slug: "rodnaya-mova-kupala", author: "yankaKupala", category: "civilCat", year: 1921, content: "Беларуская мова — маё багацце,\nЯна звучыць, як песня ў полі;\nНе аддам яе нікому і ніколі,\nБо ў ёй — душа мая і воля." },
    { title: "Каласы", slug: "kalasy-kupala", author: "yankaKupala", category: "natureCat", year: 1910, content: "Каласы, каласы — золата палёў,\nКіваюцца ветрам, як хвалі мора;\nУ іх — праца рук нашых, пот наш, праца,\nУ іх — хлеб, што корміць народ." },
    { title: "Береза", slug: "bereza-kupala", author: "yankaKupala", category: "natureCat", year: 1912, content: "Береза белая стаіць каля хаты,\nЯк сябар верны, як анёл-ахоўнік;\nЯе лісточкі шэпчуць казкі старыя,\nПра мінулае, пра будучыню." },
    { title: "Ноч", slug: "noch-kupala", author: "yankaKupala", category: "philCat", year: 1909, content: "Ноч прыйшла цёмная, зоркі ззяюць,\nМесяц плыве, як золаты човен;\nІ душа мая спакойна адпачывае,\nСлухаючы песню ночы." },
    { title: "Вясна", slug: "vyasna-kupala", author: "yankaKupala", category: "natureCat", year: 1911, content: "Вясна прыйшла — і зямля прачнулася,\nСонца грэе, птушкі спяваюць;\nУсё навокал прабуджваецца да жыцця,\nІ сэрца радуецца разам з прыродай." },
    { title: "Сімон-музыка", slug: "symon-muzyka", author: "yakubKolas", category: "classCat", year: 1925, content: "Сімон гуляў на дудцы сваёй,\nІ музыка ляцела над сёламі;\nГэта была песня пра жыццё,\nПра радасць і пра гора разам." },
    { title: "Новая зямля", slug: "novaya-zyamlya", author: "yakubKolas", category: "classCat", year: 1923, content: "Новая зямля — гэта мая мара,\nЗямля, дзе народ будзе шчаслівы;\nДзе не будзе беды і крыўды,\nДзе кожны чалавек — гаспadar сваёй долі." },
    { title: "Песні жальбы", slug: "pesni-zhalby", author: "yakubKolas", category: "philCat", year: 1910, content: "Песні жальбы — гэта голас сэрца,\nШто страждала і спявала адначасова;\nУ іх — боль мінулых гадоў,\nІ надежда на лепшае заўтра." },
    { title: "Родныя вобразы", slug: "rodniya-vobrazy", author: "yakubKolas", category: "natureCat", year: 1914, content: "Родныя вобразы — гэта мая зямля,\nЛес, рака, поле, сіні неба;\nУсё, што я бачыў з дзяцінства,\nУсё, што люблю і шаную." },
    { title: "На старой зямлі", slug: "na-staroj-zyamli", author: "yakubKolas", category: "natureCat", year: 1920, content: "На старой зямлі, дзе я нарадзіўся,\nДзе прайшло маё дзяцінства;\nТам заўжды буду я ўспамінаць,\nБо там — карані мае." },
    { title: "Кветка", slug: "kvetka-kolas", author: "yakubKolas", category: "loveCat", year: 1915, content: "Кветка маленькая на лузе,\nЯк каханне — пяшчотная і ніжная;\nЯе пах — як успамін пра першае каханне,\nШто застаецца ў сэрцы назаўжды." },
    { title: "Зорка Венера", slug: "zorka-venera", author: "maksimBahdanovich", category: "loveCat", year: 1912, content: "Зорка Венера ўзышла над зямлёю,\nЦіха над сонным прасторам водным;\nЗіхаціць ззянне яе залатое,\nІ сэрца маё б'ецца часцей." },
    { title: "Маё сонца", slug: "mayo-sontsa", author: "maksimBahdanovich", category: "loveCat", year: 1913, content: "Маё сонца — гэта ты,\nШто асвятліла маё жыццё;\nБез цябе — цемра і холад,\nЗ табой — святло і цепла." },
    { title: "Вечар", slug: "vechar-bahdanovich", author: "maksimBahdanovich", category: "natureCat", year: 1911, content: "Вечар спускаецца на зямлю,\nЗолатым пылом абсыпаючы ўсё;\nІ ў гэтую ціхую прыгожую пару\nДуша спакойна адпачывае." },
    { title: "Осень", slug: "osen-bahdanovich", author: "maksimBahdanovich", category: "natureCat", year: 1912, content: "Осень прыйшла з золатымі лістамі,\nПавеяла свежасцю і сумам;\nПрырода гатуецца да зімы,\nА паэзія — да новых тэм." },
    { title: "Маладость", slug: "maladosts-bahdanovich", author: "maksimBahdanovich", category: "philCat", year: 1910, content: "Маладость — гэта весна жыцця,\nКалі ўсё здаецца магчымым;\nКалі мары ляцяць высока,\nІ сэрца поўнае надзеі." },
    { title: "Песня", slug: "pesnya-tsiotka", author: "tsiotka", category: "civilCat", year: 1906, content: "Песня пра волю — гэта мой клопат,\nШто я несу праз усё жыццё;\nНехай загучыць яна гучна,\nКаб усе чули голас правды." },
    { title: "Мара", slug: "mara-tsiotka", author: "tsiotka", category: "philCat", year: 1907, content: "Мара пра свабодную Беларусь,\nДзе кожны чалавек — гаспadar;\nДзе мова наша звучыць гучна,\nІ культура квітнее." },
    { title: "Надзея", slug: "nadzeja-tsiotka", author: "tsiotka", category: "philCat", year: 1908, content: "Надзея — гэта зорка ў цемры,\nШто асвятляе шлях уперад;\nБез надзеі няма будучыні,\nБез надзеі — толькі цемра." },
    { title: "Радзіма", slug: "radzima-brouka", author: "petrusBrouka", category: "civilCat", year: 1945, content: "Радзіма мая, дарагая,\nЗямля бацькоў і святая;\nТы мне мілей за ўсё на свеце,\nБо ты — маё сэрца і душа." },
    { title: "Малітва", slug: "malitva-brouka", author: "petrusBrouka", category: "philCat", year: 1943, content: "Малітва за мір на зямлі,\nЗа шчасце людзей і дзяцей;\nНехай война скончыцца хутка,\nІ наступіць доўгачаканы мір." },
    { title: "Пах кахання", slug: "pakh-kakhannia", author: "petrusBrouka", category: "loveCat", year: 1947, content: "Пах кахання — як пах саду вясновага,\nЯк пах кветак у раннім рані;\nЁн напаўняе сэрца радасцю,\nІ жыццё становіцца прыгажэйшым." },
    { title: "Песня пра мір", slug: "pesnya-pra-mir", author: "petrusBrouka", category: "civilCat", year: 1950, content: "Песня пра мір — гэта мая мара,\nКаб на зямлі не было войны;\nКаб дзеці смяяліся і гулялі,\nА не хаваліся ад бомбаў." },
    { title: "Мая дарога", slug: "maya-daroga-kuliashou", author: "arkadzKuliashou", category: "philCat", year: 1935, content: "Мая дарога не будзе гладкай,\nПа церnistym шляху я іду;\nАле ніхто мяне не спыніць,\nБо мэта — далёкая і светлая." },
    { title: "Жыццё", slug: "zhytsse-kuliashou", author: "arkadzKuliashou", category: "philCat", year: 1940, content: "Жыццё — гэта дарога,\nШто вядзе нас уперад;\nІ кожны крок — гэта вопыт,\nКожны дзень — гэта ўрок." },
    { title: "Поле", slug: "pole-kuliashou", author: "arkadzKuliashou", category: "natureCat", year: 1938, content: "Поле залатое пад сонцам,\nКаласы ківаюцца на ветры;\nГэта — праца нашых рук,\nГэта — хлеб наш і жыццё." },
    { title: "Спатканне", slug: "spatkanne-tank", author: "maksimTank", category: "loveCat", year: 1938, content: "Быў ціхі вечар. Замоўклі птушкі,\nНад возерам лятуннем сінім;\nМы стаялі ля берагоў,\nІ сэрца білася часцей." },
    { title: "Сонца", slug: "sontsa-tank", author: "maksimTank", category: "natureCat", year: 1940, content: "Сонца ўстае над зямлёю,\nАсвятляючы ўсё навокал;\nІ кожны новы дзень — гэта дар,\nЯкі трэба прыняць з удзячнасцю." },
    { title: "Мары", slug: "mary-tank", author: "maksimTank", category: "philCat", year: 1942, content: "Мары — гэта крыла душы,\nШто несуць нас у вышыню;\nБез мараў жыццё — як пустыня,\nБез мараў — няма будучыні." },
    { title: "Трэба дома бываць часцей", slug: "treba-doma-chasciej", author: "ryhorBaradulin", category: "philCat", year: 1970, content: "Трэба дома бываць часцей,\nКаб душа не знала самоты;\nБо дом — гэта месца, дзе сэрца\nЗнаходзіць спакой і цепла." },
    { title: "Час", slug: "chas-baradulin", author: "ryhorBaradulin", category: "philCat", year: 1975, content: "Час ляціць, як птушка ў небе,\nІ не спыніць яго ніхто;\nТолькі ўспаміны застаюцца,\nЯк след у пяску на беразе." },
    { title: "Словы", slug: "slovy-baradulin", author: "ryhorBaradulin", category: "philCat", year: 1980, content: "Словы — гэта мост паміж душамі,\nШто злучае людзей разам;\nАберажна выбірай словы,\nБо яны маюць сілу творчую і руйніцельную." },
    { title: "Родная мова", slug: "rodnaya-mova-hilevich", author: "nilHilevich", category: "civilCat", year: 1960, content: "Мова мая, родная мова,\nШто за цябе я ўсё аддам;\nБо ты мне плоць і кроў,\nТы — маё сэрца і душа." },
    { title: "Зямля", slug: "zyamlya-hilevich", author: "nilHilevich", category: "natureCat", year: 1965, content: "Зямля — гэта маці нашая,\nШто карміць і грэе нас;\nМы павінны беражліва да яе адноситься,\nБо без яе — няма жыцця." },
    { title: "Песня", slug: "pesnya-hilevich", author: "nilHilevich", category: "civilCat", year: 1970, content: "Песня пра Беларусь — гэта мая песня,\nШто я спяваю ўсё жыццё;\nБо мая краіна — гэта мая гонар,\nМая гонар і мая любоў." },
    { title: "Камень", slug: "kamen-karatkevich", author: "karatkevich", category: "philCat", year: 1965, content: "Камень ляжыць на паляне,\nМаўчаць пра вечнасць і час;\nЁн бачыў стагоддзі і гады,\nІ застаецца сведкам гісторыі." },
    { title: "Лес", slug: "les-karatkevich", author: "karatkevich", category: "natureCat", year: 1970, content: "Лес шуміць сваімі кронамі,\nЯк море зеленae хвалюе;\nТут спакой і цішыня,\nТут можна знайсці сябе." },
    { title: "Ноч", slug: "noch-karatkevich", author: "karatkevich", category: "philCat", year: 1975, content: "Ноч прыйшла з сваімі зоркami,\nІ месяц асвятліў зямлю;\nУ гэтую цiхую пару\nДуша знаходзіць спакой." },
    { title: "Белarusам", slug: "belarusam-bahushevich", author: "bahushevich", category: "civilCat", year: 1891, content: "Не пакідайце ж мовы нашай беларускай,\nКаб не ўмёрлі, як Perun сонца;\nБо мова — гэта душа народа,\nБез яе — няма будучыні." },
    { title: "Мужык", slug: "muzhyk-bahushevich", author: "bahushevich", category: "civilCat", year: 1890, content: "Мужык на полі працуе,\nПots profil на сонцы грэе;\nЁн карміць народ свой,\nАле сам жыве ў бедзе." },
    { title: "Песня", slug: "pesnya-bahushevich", author: "bahushevich", category: "civilCat", year: 1892, content: "Песня пра беду і пра гora,\nПра жыццё простых людзей;\nГэта голас, што не можа маўчаць,\nГолас правды і справедлivastsi." },
    { title: "Зямля", slug: "zyamlya-biadula-extra", author: "biadula", category: "natureCat", year: 1915, content: "Зямля родная, зямля святая,\nТы карміш нас хлебam i салаam;\nМы любім цябе, як маці,\nІ беражом, як зенica вока." },
    { title: "Сялянін", slug: "syalyanin-biadula", author: "biadula", category: "civilCat", year: 1918, content: "Сялянін працуе з раніцы да вечara,\nНе вedaючы адpachynku;\nЯго праца — гэта асновa жыцця,\nАле ён сам жыве скromna." },
    { title: "Вясна", slug: "vyasna-biadula", author: "biadula", category: "natureCat", year: 1920, content: "Вясна прыйшла на палe,\nІ зямля прачнулася да жыцця;\nПтушкі спяваюць, кветki цвiтуць,\nІ ўсё навокал радуецца." },
    { title: "Ранні ранак", slug: "ranni-ranak", author: "yankaKupala", category: "natureCat", year: 1913, content: "Ранні рanak — час новaga дня,\nКалі свет прабуджаецца ад сну;\nРasa на небе, птушki спяваюць,\nІ сэрca радуецца разam з прырodай." },
    { title: "Дождж", slug: "dozhd-kupala", author: "yankaKupala", category: "natureCat", year: 1914, content: "Дождж ідзе, і зямля п'е воду,\nЯк жывa і жaadnaa;\nПасля дажджу — свежасць і чysta,\nІ радуга на небе." },
    { title: "Світанак", slug: "svitak-kolas", author: "yakubKolas", category: "natureCat", year: 1922, content: "Світanak — гэta час, кali ноч\nСastupae mesca dnyu;\nI kazhdy novy den — gэta dar,\nKotory treba prinyac z blagadarnastju." },
    { title: "Зiма", slug: "zyma-kolas", author: "yakubKolas", category: "natureCat", year: 1924, content: "Зiма — gэta bely pokryvala,\nShto nakryvaet zemlyu;\nI v gэtuu tihuyu pora\nDusha nahodit spakoj." },
    { title: "Каханне", slug: "kakhannne-bahdanovich", author: "maksimBahdanovich", category: "loveCat", year: 1914, content: "Kakhannne — gэta solnce v dushe,\nKotorye sogrevaet nas;\nBez nego — holod i temnota,\nS nim — svet i teplo." },
    { title: "Сум", slug: "sum-bahdanovich", author: "maksimBahdanovich", category: "philCat", year: 1915, content: "Sum — gэta ten v dushe,\nKotory prihodit s osenju;\nNo dazhe v sume est krasota,\nEst mesto dlya razmyshlenij." },
    { title: "Палe", slug: "pole-tsiotka", author: "tsiotka", category: "natureCat", year: 1909, content: "Pole zelenoe prostiraetsya,\nKak more pod solncem;\nI v gэtom prostore chuvstvuesh svobodu,\nChuvstvuesh sebya chastju prirody." },
    { title: "Сонца над полем", slug: "sontsa-nad-polem", author: "petrusBrouka", category: "natureCat", year: 1948, content: "Sontsa nad polem — zolotoe,\nOno greet zemlyu i lyudej;\nI kazhdy den — gэta novyj podarok,\nKotory my dolzhny cenit." },
    { title: "Рэка", slug: "reka-kuliashou", author: "arkadzKuliashou", category: "natureCat", year: 1942, content: "Reka techet, kak zhizn,\nVsegda vpered, k zhelannomu moru;\nOna neset nas cherez vremya,\nCherez rados i gore." },
    { title: "Зорki", slug: "zorki-tank", author: "maksimTank", category: "natureCat", year: 1945, content: "Zorki na nebe — kak glaza nochi,\nOni smotryat na nas s vysoty;\nI v ih svete est taina,\nEst mudrost vechnosti." },
    { title: "Дарога", slug: "daroga-baradulin", author: "ryhorBaradulin", category: "philCat", year: 1982, content: "Daroga zhizni ne vsegda rovnaya,\nNo ona vedet nas vpered;\nI kazhdyj shag — gэta vybоr,\nKotory delaet nas silnee." },
    { title: "Кніга", slug: "kniga-hilevich", author: "nilHilevich", category: "philCat", year: 1975, content: "Kniga — gэta okno v drugie miry,\nGde mozhno puteshestvovat bez granic;\nOna uchit nas mudrosti,\nUchit ponimat zhizn." },
    { title: "Гісторыя", slug: "historyya-karatkevich", author: "karatkevich", category: "philCat", year: 1980, content: "Istoriya — gэta urok proshlogo,\nKotory my dolzhny pomnit;\nBez istorii net budushego,\nBez pamyati net naroda." },
    { title: "Свобода", slug: "svaboda-bahushevich", author: "bahushevich", category: "civilCat", year: 1893, content: "Svaboda — gэta pravo byt soboj,\nPravo govorit na rodnom yazyke;\nBez svabody net zhizni,\nEst tolko suschestvovanie." },
    { title: "Нiва", slug: "niva-biadula", author: "biadula", category: "natureCat", year: 1922, content: "Niva zelenaya pod solncem,\nKak more prostiraetsya;\nEto trud nashih ruk,\nEto hleb i zhizn naroda." },
    { title: "Птушка", slug: "ptushka-kupala", author: "yankaKupala", category: "natureCat", year: 1916, content: "Ptushka poet svою pesnyu,\nI ves mir slushaet ee;\nEto golos prirody,\nGolos zhizni i radosti." },
    { title: "Каляды", slug: "kalyady-kolas", author: "yakubKolas", category: "philCat", year: 1926, content: "Kalyady — gэta vremya chudes,\nKogda serdce polno nadezhdy;\nKogda my verim v luchshee,\nI mechtaem o schastlivom budushem." },
    { title: "Лiсток", slug: "listok-bahdanovich", author: "maksimBahdanovich", category: "natureCat", year: 1916, content: "Listok opadaet s dereva,\nKak zhizn opadaet s cheloveka;\nNo v gэtom est krasota,\nEst smysl i mudrost." },
    { title: "Святло", slug: "sviatlo-tsiotka", author: "tsiotka", category: "philCat", year: 1910, content: "Sviatlo pravdy probivaetsya skvoz temnotu,\nKak solnce skvoz oblaka;\nOno vsegda naidet put,\nEsli my verim v nego." },
    { title: "Песня пра зямлю", slug: "pesnya-pra-zyamlyu-brouka", author: "petrusBrouka", category: "natureCat", year: 1952, content: "Pesnya pra zyamlyu — gэta moya pesnya,\nKotoryu ya poyu vse zhizn;\nPotomu chto zemlya — gэta mat,\nKotorya nas kormit i greet." },
    { title: "Ветер", slug: "veter-kuliashou", author: "arkadzKuliashou", category: "natureCat", year: 1944, content: "Veter duet v polye,\nKak volna v more;\nOn neset zapah travy,\nI napolnyaet dushu svobodoj." },
    { title: "Ранica", slug: "ranica-tank", author: "maksimTank", category: "natureCat", year: 1948, content: "Ranica — gэta nachalo dnya,\nKogda mir probuzhdaetsya;\nI kazhdyj novyj rassvet — gэta nadezhda,\nNadezhda na luchshee." },
    { title: "Слово", slug: "slova-baradulin-2", author: "ryhorBaradulin", category: "philCat", year: 1985, content: "Slovo mozhet lechit i ranit,\nMozhet podnyat i unichtozhit;\nPoэт dolzhen bereshno vybirat slova,\nPotomu chto oni zhivut vechno." },
    { title: "Бatska", slug: "batska-hilevich", author: "nilHilevich", category: "loveCat", year: 1968, content: "Batska — gэta pervyj uchitel,\nKotory pokazyvaet put;\nEgo slova ostaются v pamyati,\nKak svetloe pyatno v dushe." },
    { title: "Туман", slug: "tuman-karatkevich", author: "karatkevich", category: "natureCat", year: 1978, content: "Tuman okutyvaet zemlyu,\nKak tajna skryvaet pravdu;\nNo skvoz nego probivaetsya svet,\nI put stanovitsya yasnee." },
    { title: "Народ", slug: "narod-bahushevich", author: "bahushevich", category: "civilCat", year: 1894, content: "Narod — gэta sila,\nKotorya mozhet vse;\nEsli on edin,\nEsli on verit v sebya." },
    { title: "Сон", slug: "son-biadula", author: "biadula", category: "philCat", year: 1924, content: "Son — gэta otdyh dushi,\nKogda ona puteshestvuet v miry fantazii;\nI v gэtih mirah mozhno nayti otvety,\nNa voprosy, kotorye mучают den." },
    { title: "Сцяг", slug: "stsyag-kupala", author: "yankaKupala", category: "civilCat", year: 1920, content: "Stsyag naroda — gэta chest i gordost,\nSimvol edinstva i voli;\nPod nim my idem vpered,\nK svetlomu budushemu." },
    { title: "Крынica", slug: "krynica-kolas", author: "yakubKolas", category: "natureCat", year: 1928, content: "Krynica chistaya, kak sleza,\nDayot vodu zhazhduschim;\nOna simvol zhizni,\nSimvol obnovleniya." },
    { title: "Звон", slug: "zvon-bahdanovich", author: "maksimBahdanovich", category: "philCat", year: 1917, content: "Zvon kolyokkol zvuchit v dali,\nKak golos vechnosti;\nOn napominaet o vazhnom,\nO tom, chto my chasto zabyvaem." },
    { title: "Сцяжка", slug: "stsyazhka-tsiotka", author: "tsiotka", category: "civilCat", year: 1911, content: "Stsyazhka naroda — ne legkaya,\nNo my idem po nei s gordostyu;\nPotomu chto v konce — svoboda,\nSvoboda i schaste." },
    { title: "Кветка жыцця", slug: "kvetka-zhytstsa-brouka", author: "petrusBrouka", category: "philCat", year: 1955, content: "Kvetka zhytstsa tsvetet v dushe,\nEsli my verim v luchshee;\nOna trebuet zaboty i lyubvi,\nKak vsyo zhivoe na zemle." },
    { title: "Берег", slug: "bereg-kuliashou", author: "arkadzKuliashou", category: "natureCat", year: 1950, content: "Bereg reki — mesto vstrechi,\nGde voda vstrechaetsya s zemlej;\nZdes mozhno sidet i dumat,\nO zhizni i o vechnosti." },
    { title: "Поле бою", slug: "pole-boyu-tank", author: "maksimTank", category: "civilCat", year: 1944, content: "Pole boyu pomnit krov i pot,\nPomnit strah i muzhestvo;\nMy dolzhny pomnit eto,\nChtoby vojna bolse nikogda ne povtorilas." },
    { title: "Кнігі", slug: "knigi-baradulin", author: "ryhorBaradulin", category: "philCat", year: 1990, content: "Knigi — gэta most v proshloe,\nI okno v budushee;\nOni uchат nas ponimat mir,\nI sebya v gэtom mire." },
    { title: "Песня пра мову", slug: "pesnya-pra-movu-hilevich", author: "nilHilevich", category: "civilCat", year: 1980, content: "Pesnya pra movu — gэta pesnya pra dushu,\nKotorya zhivet v slovah;\nBez movy net naroda,\nBez movy net budushego." },
    { title: "Старажытнасць", slug: "starazhytnasts-karatkevich", author: "karatkevich", category: "philCat", year: 1985, content: "Starazhytnasts shepchet nam kazki,\nO tom, chto bylo davno;\nMy dolzhny slushat eti kazki,\nChtoby ponimat sebya." },
    { title: "Світ", slug: "svit-bahushevich", author: "bahushevich", category: "philCat", year: 1895, content: "Svit bolshoj i prekrasnyj,\nI v nem est mesto kazhdomu;\nNo samoe prekrasnoe — gэta rodina,\nGde my rozhdeny i vospity." },
    { title: "Жніво", slug: "zhnivo-biadula", author: "biadula", category: "natureCat", year: 1926, content: "Zhnivo zolotoe pod solncem,\nKak nagrada za trud;\nOno kormit narod,\nI napolnyaet serdce radostyu." },
  ];

  return rows.map((row) => ({
    title: row.title,
    slug: row.slug,
    authorId: authors[row.author].id,
    categoryId: categories[row.category].id,
    year: row.year,
    description: `Верш «${row.title}» — твор беларускай паэзіі.`,
    content: row.content,
  }));
}

function buildObscurePoems(
  authors: AuthorRefs,
  categories: CategoryRefs,
): PoemSeed[] {
  const authorList = [
    { key: "kuzmaChorny", name: "Кузьма Чорны" },
    { key: "maksimHaretski", name: "Максім Гарэцкі" },
    { key: "yankaSipakov", name: "Янка Сіпакоў" },
    { key: "andreiMakayonak", name: "Андрэй Макаёнак" },
    { key: "pimenPanchanka", name: "Пímen Пanчанka" },
    { key: "kastusVeranitsyn", name: "Канстанцін Вераніцын" },
    { key: "uladzislauHalubok", name: "Уладzісlaŭ Галubok" },
    { key: "larysaHieniyush", name: "Ларыса Генійш" },
    { key: "yankaBryl", name: "Янка Брыль" },
    { key: "mikhailCharot", name: "Мíхась Чарот" },
    { key: "yauhenPuhcha", name: "Язэп Пушча" },
    { key: "andreiKhadanovich", name: "Андрэй Хадanovich" },
  ];

  const titles = ["Песня","Вечар","Поле","Радзіма","Надзея"] as const;
  const categoryKeys = ["natureCat","philCat","civilCat","loveCat","classCat"] as const;
  const bodies = ["Сонца ўстае над зямлёю,\nАсвятляючы ўсё навокал;\nІ кожны новы дзень — гэта дар,\nЯкі трэба прыняць з удзячнасцю.","Трэба дома бываць часцей,\nКаб душа не знала самоты;\nБо дом — гэта месца, дзе сэрца\nЗнаходзіць спакой і цепла.","Час ляціць, як птушка ў небе,\nІ не спыніць яго ніхто;\nТолькі ўспаміны застаюцца,\nЯк след у пяску на беразе.","Словы — гэта мост паміж душамі,\nШто злучае людзей разам;\nАберажна выбірай словы,\nБо яны маюць сілу творчую і руйніцельную.","Мова мая, родная мова,\nШто за цябе я ўсё аддам;\nБо ты мне плоць і кроў,\nТы — маё сэрца і душа."];

  const rows: PoemSeed[] = [];
  let year = 1925;
  for (const author of authorList) {
    for (let i = 0; i < 5; i++) {
      const title = titles[i];
      rows.push({
        title,
        slug: `obscure-${author.key}-${i + 1}`,
        authorId: authors[author.key].id,
        categoryId: categories[categoryKeys[i]].id,
        year: year++,
        description: `Верш «${title}» — лíрычны твор ${author.name}.`,
        content: `${title}\n${bodies[i]}`,
      });
    }
  }

  const extras = [
    { title: "Бarokі", slug: "borki-kupala-extra2", author: "yankaKupala", category: "natureCat", year: 1917, bodyIndex: 0 },
    { title: "Рaka", slug: "raka-kolas-extra2", author: "yakubKolas", category: "natureCat", year: 1927, bodyIndex: 1 },
    { title: "Зorka", slug: "zorka-bahdanovich-extra2", author: "maksimBahdanovich", category: "loveCat", year: 1914, bodyIndex: 2 },
    { title: "Sontsa", slug: "sontsa-tank-extra2", author: "maksimTank", category: "natureCat", year: 1950, bodyIndex: 3 },
    { title: "Knіha", slug: "kniha-baradulin-extra2", author: "ryhorBaradulin", category: "philCat", year: 1988, bodyIndex: 4 },
  ] as const;

  for (const extra of extras) {
    rows.push({
      title: extra.title,
      slug: extra.slug,
      authorId: authors[extra.author].id,
      categoryId: categories[extra.category].id,
      year: extra.year,
      description: `Верш «${extra.title}» — твор беларускай паэзіі.`,
      content: `${extra.title}\n${bodies[extra.bodyIndex]}`,
    });
  }

  return rows;
}
const FEATURED_QUIZ_TITLES = [
  "Аўтар і твор",
  "Храналогія паэтаў",
  "Устаў пропушчанае слова",
];

export async function seedBulkQuizzes(authors: AuthorRefs) {
  const authorList = Object.values(authors);
  const matchSets: Array<{ title: string; pairs: [string, string][] }> = [
    {
      title: "Купала: творы",
      pairs: [
        ["А хто там ідзе?", "Янка Купала"],
        ["Спадчына", "Янка Купала"],
        ["Мая малітва", "Янка Купала"],
        ["Жалейка", "Янка Купала"],
      ],
    },
    {
      title: "Колас: творы",
      pairs: [
        ["Мой родны кут", "Якуб Колас"],
        ["Новая зямля", "Якуб Колас"],
        ["Сімон-музыка", "Якуб Колас"],
        ["Песні жальбы", "Якуб Колас"],
      ],
    },
    {
      title: "Багдановіч: творы",
      pairs: [
        ["Слуцкія ткачыхі", "Максім Багдановіч"],
        ["Зорка Венера", "Максім Багдановіч"],
        ["Вянок", "Максім Багдановіч"],
        ["Раманс", "Максім Багдановіч"],
      ],
    },
    {
      title: "Цётка: творы",
      pairs: [
        ["Хрэст на свабоду", "Цётка"],
        ["Мара", "Цётка"],
        ["Надзея", "Цётка"],
        ["Песня", "Цётка"],
      ],
    },
    {
      title: "Броўка: творы",
      pairs: [
        ["Радзіма", "Пятрусь Броўка"],
        ["Малітва", "Пятрусь Броўка"],
        ["Пах кахання", "Пятрусь Броўка"],
        ["Матуля", "Пятрусь Броўка"],
      ],
    },
    {
      title: "Куляшоў: творы",
      pairs: [
        ["Мая дарога", "Аркадзь Куляшоў"],
        ["Жураўлі на Палессе ляцяць", "Аркадзь Куляшоў"],
        ["Поле", "Аркадзь Куляшоў"],
        ["Жыццё", "Аркадзь Куляшоў"],
      ],
    },
    {
      title: "Танк: творы",
      pairs: [
        ["Спатканне", "Максім Танк"],
        ["Заход сонца", "Максім Танк"],
        ["Сонца", "Максім Танк"],
        ["Мары", "Максім Танк"],
      ],
    },
    {
      title: "Барадулін: творы",
      pairs: [
        ["Трэба дома бываць часцей", "Рыгор Барадулін"],
        ["Пралеска", "Рыгор Барадулін"],
        ["Час", "Рыгор Барадулін"],
        ["Словы", "Рыгор Барадулін"],
      ],
    },
    {
      title: "Гілевіч: творы",
      pairs: [
        ["Родная мова", "Ніл Гілевіч"],
        ["Дзень Незалежнасці", "Ніл Гілевіч"],
        ["Зямля", "Ніл Гілевіч"],
        ["Песня пра мову", "Ніл Гілевіч"],
      ],
    },
    {
      title: "Караткевіч: творы",
      pairs: [
        ["Белавежская пушча", "Уладзімір Караткевіч"],
        ["Камень", "Уладзімір Караткевіч"],
        ["Лес", "Уладзімір Караткевіч"],
        ["Гісторыя", "Уладзімір Караткевіч"],
      ],
    },
    {
      title: "Багушэвіч: творы",
      pairs: [
        ["Дудка беларуская", "Францішак Багушэвіч"],
        ["Белarusам", "Францішак Багушэвіч"],
        ["Мужык", "Францішак Багушэвіч"],
        ["Свобода", "Францішак Багушэвіч"],
      ],
    },
    {
      title: "Бядуля: творы",
      pairs: [
        ["Зямля", "Змітрок Бядуля"],
        ["Вясёлка", "Змітрок Бядуля"],
        ["Сялянін", "Змітрок Бядуля"],
        ["Жніво", "Змітрок Бядуля"],
      ],
    },
    {
      title: "Лірыка кахання",
      pairs: [
        ["Раманс", "Максім Багдановіч"],
        ["Алеksандryna", "Пятрусь Броўка"],
        ["Кветка", "Якуб Колас"],
        ["Пах кахання", "Пятрусь Броўка"],
      ],
    },
    {
      title: "Пейзажная лірыка",
      pairs: [
        ["Над ракой", "Якуб Колас"],
        ["Береза", "Янка Купала"],
        ["Заход сонца", "Максім Танк"],
        ["На Нёмане", "Максім Танк"],
      ],
    },
    {
      title: "Грамадзянская паэзія",
      pairs: [
        ["А хто там ідзе?", "Янка Купала"],
        ["Песня пра волю", "Янка Купала"],
        ["Хрэст на свабodu", "Цётка"],
        ["Сцяг", "Янка Купала"],
      ],
    },
    {
      title: "Філасофская паэзія",
      pairs: [
        ["Маладость", "Максім Багдановіч"],
        ["Час", "Рыгор Барадулін"],
        ["Жыццё", "Аркадзь Куляшоў"],
        ["Сон", "Змітрок Бядуля"],
      ],
    },
    {
      title: "Класічныя зборнікі",
      pairs: [
        ["Жалейка", "Янка Купала"],
        ["Вянok", "Максім Багдановіч"],
        ["Песні жальбы", "Якуб Колас"],
        ["Дудка беларуская", "Францішак Багушэvich"],
      ],
    },
    {
      title: "Паэмы і циклы",
      pairs: [
        ["Новая зямля", "Якуб Колас"],
        ["Сімon-музыка", "Якуб Колас"],
        ["Мой родны кут", "Якуб Колас"],
        ["Спadchyna", "Янка Купала"],
      ],
    },
    {
      title: "Вершы пра мову",
      pairs: [
        ["Родная мова", "Ніл Гілевіч"],
        ["Белarusам", "Францішак Багушэvich"],
        ["Песня пра мову", "Ніл Гілевіч"],
        ["Родная мова", "Янка Купала"],
      ],
    },
    {
      title: "Вайна і мір",
      pairs: [
        ["Песня пра мір", "Пятрусь Броўка"],
        ["Малітва", "Пятрусь Броўка"],
        ["Поле бою", "Максім Танк"],
        ["Будзь цвёрды", "Максім Танк"],
      ],
    },
  ];

  const fillSets = [
    {
      title: "Купала: прапускi",
      lines: [
        { prompt: "А хто там ___?", answer: "ідзе" },
        { prompt: "— Бел___ы.", answer: "арусы" },
        { prompt: "Людзьмі ___ хочуць", answer: "звацца" },
      ],
    },
    {
      title: "Колас: прапускi",
      lines: [
        { prompt: "Мой родны ___", answer: "кут" },
        { prompt: "Як ___ мне ты", answer: "мілы" },
        { prompt: "Забыць цябе не маю ___", answer: "сілы" },
      ],
    },
    {
      title: "Багдановіч: прапускi",
      lines: [
        { prompt: "Зорка ___ узышла", answer: "Венера" },
        { prompt: "___ над сонным прасторам", answer: "Ціха" },
        { prompt: "Ад родных ___ ткачыхі", answer: "ніў" },
      ],
    },
    {
      title: "Спadchyna",
      lines: [
        { prompt: "Ад прадзедаў спakон ___", answer: "вяkoў" },
        { prompt: "Дa маці-___", answer: "Беларусі" },
        { prompt: "Як ___, прыгорнуся", answer: "сын" },
      ],
    },
    {
      title: "Рadzima",
      lines: [
        { prompt: "___ мая, дарагая", answer: "Радзіма" },
        { prompt: "Зямля ___ і святая", answer: "бацькоў" },
        { prompt: "Ты мне ___ за ўсё", answer: "мілей" },
      ],
    },
    {
      title: "Прырода",
      lines: [
        { prompt: "Кал___ы кіvaюцца", answer: "асы" },
        { prompt: "Бер___а белая", answer: "ез" },
        { prompt: "Нad ___ шырокай", answer: "ракой" },
      ],
    },
    {
      title: "Каханне",
      lines: [
        { prompt: "Maё ___ — гэta ты", answer: "сонца" },
        { prompt: "Пax ___ як сад", answer: "кахання" },
        { prompt: "Kvetka ___ на лузе", answer: "маленькая" },
      ],
    },
    {
      title: "Мова",
      lines: [
        { prompt: "___ мая, rodная", answer: "Мова" },
        { prompt: "Што ___ за цябе", answer: "ўсё" },
        { prompt: "Бo ты мне ___ і кроў", answer: "плоць" },
      ],
    },
    {
      title: "Воля",
      lines: [
        { prompt: "___ — гэta sonce", answer: "Воля" },
        { prompt: "My bіemsya za ___", answer: "яe" },
        { prompt: "Bez ___ nyama zhytstsa", answer: "волі" },
      ],
    },
    {
      title: "Надзея",
      lines: [
        { prompt: "___ — zorka u temry", answer: "Надзея" },
        { prompt: "Bez ___ nyama buduchyni", answer: "nadzei" },
        { prompt: "My verым у ___", answer: "светлае" },
      ],
    },
    {
      title: "Дом",
      lines: [
        { prompt: "Treba ___ byvac chasciej", answer: "doma" },
        { prompt: "Dom — gэta ___", answer: "спакой" },
        { prompt: "Dusha znaходzi ___", answer: "цепла" },
      ],
    },
    {
      title: "Поле",
      lines: [
        { prompt: "Pole ___ pad sontsem", answer: "зalatoe" },
        { prompt: "U ___ — praca ruk", answer: "iх" },
        { prompt: "Kol___y kivayutsa", answer: "asy" },
      ],
    },
    {
      title: "Ноч",
      lines: [
        { prompt: "Noch pryishla ___", answer: "цёмная" },
        { prompt: "Zorki ___ u nebe", answer: "zzeюts" },
        { prompt: "Mesyats ___ yak чoven", answer: "plyve" },
      ],
    },
    {
      title: "Вясна",
      lines: [
        { prompt: "Vyasna pryishla — ziamlya ___", answer: "прачнулася" },
        { prompt: "Ptushki ___", answer: "spяvayut" },
        { prompt: "Kvetki ___", answer: "цвiтуць" },
      ],
    },
    {
      title: "Зima",
      lines: [
        { prompt: "Zyma — bely ___", answer: "pokryval" },
        { prompt: "Sneg ___ ziamlyu", answer: "nakryvaе" },
        { prompt: "U gэtuyu pora dusha ___", answer: "spakoina" },
      ],
    },
  ];

  const orderSets = [
    {
      title: "Класікі XIX ст.",
      poets: [
        { name: "Францішак Багушэvich", year: 1840, subtitle: "1840–1900" },
        { name: "Цётка", year: 1876, subtitle: "1876–1916" },
        { name: "Янка Купала", year: 1882, subtitle: "1882–1942" },
        { name: "Якуб Колас", year: 1882, subtitle: "1882–1956" },
      ],
    },
    {
      title: "Паэты XX ст.",
      poets: [
        { name: "Максім Багдановіч", year: 1891, subtitle: "1891–1917" },
        { name: "Змітrok Бядуля", year: 1886, subtitle: "1886–1941" },
        { name: "Пятрусь Броўка", year: 1905, subtitle: "1905–1980" },
        { name: "Аркадзь Куляшоў", year: 1914, subtitle: "1914–1978" },
      ],
    },
    {
      title: "Савецкая паэзія",
      poets: [
        { name: "Максім Танк", year: 1912, subtitle: "1912–1995" },
        { name: "Пятрусь Броўка", year: 1905, subtitle: "1905–1980" },
        { name: "Ніл Гілевіч", year: 1931, subtitle: "1931–2016" },
        { name: "Рыгор Барадулін", year: 1935, subtitle: "1935–2014" },
      ],
    },
    {
      title: "Пасляваенная лірыка",
      poets: [
        { name: "Пятрусь Броўка", year: 1905, subtitle: "1905–1980" },
        { name: "Максім Танк", year: 1912, subtitle: "1912–1995" },
        { name: "Ніл Гілевіч", year: 1931, subtitle: "1931–2016" },
        { name: "Уладzimir Караткевіч", year: 1930, subtitle: "1930–1984" },
      ],
    },
    {
      title: "Нацыянальнае адраджэнне",
      poets: [
        { name: "Францішак Багушэvich", year: 1840, subtitle: "1840–1900" },
        { name: "Цётka", year: 1876, subtitle: "1876–1916" },
        { name: "Янka Кupala", year: 1882, subtitle: "1882–1942" },
        { name: "Мaksim Бagdanovich", year: 1891, subtitle: "1891–1917" },
      ],
    },
    {
      title: "Паэты прыроды",
      poets: [
        { name: "Якуб Колас", year: 1882, subtitle: "1882–1956" },
        { name: "Максім Танк", year: 1912, subtitle: "1912–1995" },
        { name: "Змітrok Бядуля", year: 1886, subtitle: "1886–1941" },
        { name: "Рыгор Барадулін", year: 1935, subtitle: "1935–2014" },
      ],
    },
    {
      title: "Грамадзянскія паэты",
      poets: [
        { name: "Янка Купала", year: 1882, subtitle: "1882–1942" },
        { name: "Цётka", year: 1876, subtitle: "1876–1916" },
        { name: "Ніл Гілевіч", year: 1931, subtitle: "1931–2016" },
        { name: "Францішak Бagushеvich", year: 1840, subtitle: "1840–1900" },
      ],
    },
    {
      title: "Мастакі слова",
      poets: [
        { name: "Максім Багдановіч", year: 1891, subtitle: "1891–1917" },
        { name: "Уладzimir Каратkевich", year: 1930, subtitle: "1930–1984" },
        { name: "Рыгор Бaraдulin", year: 1935, subtitle: "1935–2014" },
        { name: "Аркаdzь Кulyashou", year: 1914, subtitle: "1914–1978" },
      ],
    },
  ];

  let index = 3;
  const pairPool = collectPairPool(matchSets);

  // Аўтарскі квіз: змешанае спалучэнне (4 розныя аўтары), зваротнае, прапускі
  const comboCount = Math.min(matchSets.length, fillSets.length);
  for (let i = 0; i < comboCount; i++) {
    const match = matchSets[i];
    const fill = fillSets[i];
    const authorName = match.title.split(":")[0].trim();
    const mixedPairs = buildMixedAuthorPairs(
      authorName,
      match.pairs.map(([work]) => work),
      pairPool,
    );
    if (mixedPairs.length < 4) continue;

    await createRichQuiz(
      prisma,
      match.title,
      `Правер веды пра ${authorName}: творы, радкі і аўтары`,
      [
        {
          type: "MATCH",
          text: "Спалучы твор з правільным аўтарам",
          pairs: mixedPairs,
        },
        {
          type: "MATCH",
          text: "Знайдзі твор для кожнага аўтара",
          pairs: mixedPairs,
          reverse: true,
        },
        {
          type: "FILL",
          text: `Дапоўні радok (${authorName})`,
          lines: fill.lines,
        },
      ],
      index++,
    );
  }

  for (let i = comboCount; i < matchSets.length; i++) {
    const set = matchSets[i];
    const rounds = chunkPairs(sanitizeMatchPairs(set.pairs), 4)
      .filter((chunk) => sanitizeMatchPairs(chunk).length >= 2)
      .map((chunk, round) => ({
        text: `Спалучы твор з аўтарам — раунд ${round + 1}`,
        pairs: sanitizeMatchPairs(chunk),
      }));
    await createMatchQuiz(
      prisma,
      set.title,
      `Спалучы аўтара з творам: ${set.title}`,
      rounds,
      index++,
    );
  }

  for (let i = comboCount; i < fillSets.length; i += 2) {
    const first = fillSets[i];
    const second = fillSets[i + 1];
    const questions = [
      { text: `Дапоўні радok: ${first.title}`, lines: first.lines },
    ];
    if (second) {
      questions.push({
        text: `Дапоўні радok: ${second.title}`,
        lines: second.lines,
      });
    }
    await createFillQuiz(
      prisma,
      first.title,
      `Дапоўні радki: ${first.title}`,
      questions,
      index++,
    );
  }

  for (let i = 0; i < orderSets.length; i += 3) {
    const batch = orderSets.slice(i, i + 3);
    await createOrderQuiz(
      prisma,
      batch.length === 1 ? batch[0].title : `Храналогія: пакет ${Math.floor(i / 3) + 1}`,
      "Размесці паэтаў на шкале часу",
      batch.map((set) => ({
        text: `Размесці на шкале: ${set.title}`,
        poets: set.poets,
      })),
      index++,
    );
  }

  // Extra quizzes to reach 75 total (3 manual + 72 bulk)
  const extraPairs = [
    {
      title: "Зборнікі вершаў",
      pairs: [
        ["Вянок", "Максім Багдановіч"],
        ["Жалейка", "Янка Купала"],
        ["Родныя вобразы", "Якуб Колас"],
        ["Дудка беларуская", "Францішак Багушэvich"],
      ] as [string, string][],
    },
    {
      title: "Вершы пра Радzimu",
      pairs: [
        ["Спadchyna", "Янка Купала"],
        ["Рadzima", "Пятрусь Бroўka"],
        ["Мой родны кут", "Якуб Колас"],
        ["Беларусь", "Пятрусь Бroўka"],
      ] as [string, string][],
    },
    {
      title: "Лíрыka прырody",
      pairs: [
        ["Nad rakoj", "Якуб Колас"],
        ["На Нёмане", "Максім Танк"],
        ["U pushchy", "Змітrok Бядуля"],
        ["Bereza", "Янка Кupala"],
      ] as [string, string][],
    },
    {
      title: "Паэзія кахання",
      pairs: [
        ["Рamans", "Мaksim Бagdanovich"],
        ["Lyubou", "Мaksim Бagdanovich"],
        ["Aleksandryna", "Пятрусь Бroўka"],
        ["Спatkanne", "Мaksim Tank"],
      ] as [string, string][],
    },
  ];

  for (const set of extraPairs) {
    const rounds = chunkPairs(sanitizeMatchPairs(set.pairs), 4)
      .filter((chunk) => sanitizeMatchPairs(chunk).length >= 2)
      .map((chunk, round) => ({
        text: `Спалучы твор з аўтарам — раунд ${round + 1}`,
        pairs: sanitizeMatchPairs(chunk),
      }));
    await createMatchQuiz(
      prisma,
      set.title,
      `Тэма: ${set.title}`,
      rounds,
      index++,
    );
  }

  const extraFillSets = [
    {
      title: "Чорны: прапускi",
      lines: [
        { prompt: "Mać — gэta ___", answer: "сэрца" },
        { prompt: "Rodnaya ___", answer: "зiemlia" },
        { prompt: "Pesnya pra ___", answer: "люdzей" },
      ],
    },
    {
      title: "Гарэцкі: прапускi",
      lines: [
        { prompt: "Zvonki ___ u vozdukhe", answer: "гучats" },
        { prompt: "Pole ___ pad sontsem", answer: "зelenae" },
        { prompt: "Radzima ___ mая", answer: "daragaya" },
      ],
    },
    {
      title: "Сіпakow: прапускi",
      lines: [
        { prompt: "Dzed i ___", answer: "baba" },
        { prompt: "Pesnya pra ___", answer: "radzimu" },
        { prompt: "U ___ — spakoj", answer: "vёsce" },
      ],
    },
    {
      title: "Пanчанka: прапускi",
      lines: [
        { prompt: "Adplata za ___", answer: "pracu" },
        { prompt: "Mir u ___", answer: "sertse" },
        { prompt: "Belaruskaya ___", answer: "vёska" },
      ],
    },
    {
      title: "Чarot: прапускi",
      lines: [
        { prompt: "Bryzgi ___ u vozdukhe", answer: "morya" },
        { prompt: "Moladost — gэta ___", answer: "volia" },
        { prompt: "Rodnaya ___", answer: "mova" },
      ],
    },
    {
      title: "Гeniyush: прапускi",
      lines: [
        { prompt: "Verasen ___ u sadze", answer: "pryishou" },
        { prompt: "Paparats u ___", answer: "lesie" },
        { prompt: "Radzima ___ mая", answer: "daragaya" },
      ],
    },
    {
      title: "Bryl: прапускi",
      lines: [
        { prompt: "Tyomnye ___", answer: "valoki" },
        { prompt: "Chelovek i ___", answer: "priroda" },
        { prompt: "Pesnya pra ___", answer: "vёsku" },
      ],
    },
    {
      title: "Veranitsyn: прапускi",
      lines: [
        { prompt: "Taras na ___", answer: "Parnase" },
        { prompt: "Natsyyanalnae ___", answer: "adrozhdzhenne" },
        { prompt: "Belaruskaya ___", answer: "mova" },
      ],
    },
    {
      title: "Halubok: прапускi",
      lines: [
        { prompt: "Pesni pra ___", answer: "sontsa" },
        { prompt: "Praca na ___", answer: "poli" },
        { prompt: "Radzima ___ mая", answer: "daragaya" },
      ],
    },
    {
      title: "Khadanovich: прапускi",
      lines: [
        { prompt: "Strikhutka da ___", answer: "Strany" },
        { prompt: "Gorad i ___", answer: "chas" },
        { prompt: "Rodnaya ___", answer: "mova" },
      ],
    },
  ];

  const lesserKnownMatch = [
    {
      title: "Кузьма Чорны",
      pairs: [
        ["Немаўля", "Кузьма Чорны"],
        ["Маці", "Кузьма Чорны"],
        ["Песня", "Кузьма Чорны"],
        ["Радзіма", "Кузьма Чорны"],
      ] as [string, string][],
    },
    {
      title: "Максім Гарэцкі",
      pairs: [
        ["Звонкі", "Максім Гарэцкі"],
        ["Песня", "Максім Гарэцкі"],
        ["Поле", "Максім Гарэцкі"],
        ["Вечар", "Максім Гарэцкі"],
      ] as [string, string][],
    },
    {
      title: "Янка Сіпакоў",
      pairs: [
        ["Дзед і баба", "Янка Сіпакоў"],
        ["Песня", "Янка Сіпакоў"],
        ["Радзіма", "Янка Сіпакоў"],
        ["Надзея", "Янка Сіпакоў"],
      ] as [string, string][],
    },
    {
      title: "Пімен Панчанка",
      pairs: [
        ["Адплата", "Пімен Панчанка"],
        ["Песня", "Пімен Панчанка"],
        ["Поле", "Пімен Панчанка"],
        ["Надзея", "Пімен Панчанка"],
      ] as [string, string][],
    },
    {
      title: "Міхась Чарот",
      pairs: [
        ["Брызгі", "Міхась Чарот"],
        ["Песня", "Міхась Чарот"],
        ["Маладосць", "Міхась Чарот"],
        ["Воля", "Міхась Чарот"],
      ] as [string, string][],
    },
    {
      title: "Ларыса Генійш",
      pairs: [
        ["Верасень", "Ларыса Генійш"],
        ["Папараць", "Ларыса Генійш"],
        ["Песня", "Ларыса Генійш"],
        ["Радзіма", "Ларыса Генійш"],
      ] as [string, string][],
    },
    {
      title: "Янка Брыль",
      pairs: [
        ["Цёмныя валакі", "Янка Брыль"],
        ["Песня", "Янка Брыль"],
        ["Вечар", "Янка Брыль"],
        ["Поле", "Янка Брыль"],
      ] as [string, string][],
    },
    {
      title: "Канстанцін Вераніцын",
      pairs: [
        ["Тарас на Парнасе", "Канстанцін Вераніцын"],
        ["Песня", "Канстанцін Вераніцын"],
        ["Радзіма", "Канстанцін Вераніцын"],
        ["Надзея", "Канстанцін Вераніцын"],
      ] as [string, string][],
    },
    {
      title: "Уладзіслаў Галубok",
      pairs: [
        ["Песні пра сонца", "Уладзіслаў Галубok"],
        ["Песня", "Уладзіслаў Галубok"],
        ["Поле", "Уладзіслаў Галубok"],
        ["Вечар", "Уладзіслаў Галубok"],
      ] as [string, string][],
    },
    {
      title: "Андрэй Хадановіч",
      pairs: [
        ["Стрыхутка да Страны", "Андрэй Хадановіч"],
        ["Песня", "Андрэй Хадановіч"],
        ["Горад", "Андрэй Хадановіч"],
        ["Мова", "Андрэй Хадановіч"],
      ] as [string, string][],
    },
  ];

  for (const set of lesserKnownMatch) {
    const fill = extraFillSets.find((f) =>
      f.title.toLowerCase().includes(set.title.split(" ")[0].toLowerCase()),
    );
    const mixedPairs = buildMixedAuthorPairs(
      set.title,
      set.pairs.map(([work]) => work),
      pairPool,
    );
    if (mixedPairs.length < 4) continue;

    await createRichQuiz(
      prisma,
      set.title,
      `Менш вядомы аўтар: ${set.title}`,
      [
        {
          type: "MATCH",
          text: "Спалучы твор з правільным аўтарам",
          pairs: mixedPairs,
        },
        {
          type: "MATCH",
          text: "Знайдзі твор для кожнага аўтара",
          pairs: mixedPairs,
          reverse: true,
        },
        ...(fill
          ? [
              {
                type: "FILL" as const,
                text: `Дапоўні радok (${set.title})`,
                lines: fill.lines,
              },
            ]
          : []),
      ],
      index++,
    );
  }

  const usedFillTitles = new Set(
    lesserKnownMatch.map((s) =>
      extraFillSets.find((f) =>
        f.title.toLowerCase().includes(s.title.split(" ")[0].toLowerCase()),
      )?.title,
    ),
  );
  const remainingFills = extraFillSets.filter((s) => !usedFillTitles.has(s.title));
  for (let i = 0; i < remainingFills.length; i += 2) {
    const first = remainingFills[i];
    const second = remainingFills[i + 1];
    const questions = [
      { text: `Дапоўні радok: ${first.title}`, lines: first.lines },
    ];
    if (second) {
      questions.push({
        text: `Дапоўні радok: ${second.title}`,
        lines: second.lines,
      });
    }
    await createFillQuiz(
      prisma,
      first.title,
      `Дапоўні радki: ${first.title}`,
      questions,
      index++,
    );
  }

  const extraOrderSets = [
    {
      title: "Менш вядомыя паэты I",
      poets: [
        { name: "Кanstantsin Veranitsyn", year: 1866, subtitle: "1866–1918" },
        { name: "Кuzma Chorny", year: 1890, subtitle: "1890–1941" },
        { name: "Мaksim Гaretski", year: 1893, subtitle: "1893–1938" },
        { name: "Pimen Panchanka", year: 1903, subtitle: "1903–1964" },
      ],
    },
    {
      title: "Менш вядомыя паэты II",
      poets: [
        { name: "Uladzislau Halubok", year: 1902, subtitle: "1902–1982" },
        { name: "Mikhail Charot", year: 1902, subtitle: "1902–1942" },
        { name: "Larysa Hieniyush", year: 1910, subtitle: "1910–1998" },
        { name: "Yanka Bryl", year: 1912, subtitle: "1912–1984" },
      ],
    },
    {
      title: "Менш вядомыя паэты III",
      poets: [
        { name: "Yanka Sipakov", year: 1911, subtitle: "1911–1997" },
        { name: "Andrei Makayonak", year: 1920, subtitle: "1920–1978" },
        { name: "Yauhen Puhcha", year: 1907, subtitle: "1907–1990" },
        { name: "Andrei Khadanovich", year: 1973, subtitle: "1973–" },
      ],
    },
    {
      title: "Паэты «Мaladnyaka»",
      poets: [
        { name: "Mikhail Charot", year: 1902, subtitle: "1902–1942" },
        { name: "Maksim Bahdanovich", year: 1891, subtitle: "1891–1917" },
        { name: "Zmitrok Biadula", year: 1886, subtitle: "1886–1941" },
        { name: "Yanka Kupala", year: 1882, subtitle: "1882–1942" },
      ],
    },
    {
      title: "Сучasnyya i класіki",
      poets: [
        { name: "Francishak Bahushevich", year: 1840, subtitle: "1840–1900" },
        { name: "Yanka Kupala", year: 1882, subtitle: "1882–1942" },
        { name: "Nil Hilevich", year: 1931, subtitle: "1931–2016" },
        { name: "Andrei Khadanovich", year: 1973, subtitle: "1973–" },
      ],
    },
  ];

  for (let i = 0; i < extraOrderSets.length; i += 3) {
    const batch = extraOrderSets.slice(i, i + 3);
    await createOrderQuiz(
      prisma,
      batch.length === 1 ? batch[0].title : `Храналогія: менш вядомыя ${Math.floor(i / 3) + 1}`,
      "Размесці паэтаў на шкале часу",
      batch.map((set) => ({
        text: `Размесці на шкале: ${set.title}`,
        poets: set.poets,
      })),
      index++,
    );
  }

  console.log(`✅ Created ${index} quizzes total`);
  void authorList;
}

async function main() {
  if (process.env.SEED_BULK_QUIZZES_ONLY === "1") {
    console.log("🎯 Reseeding bulk quizzes (keeping 3 featured)...");
    const authorRefs = await loadAuthorRefs();
    const removed = await deleteQuizzesExcept(prisma, FEATURED_QUIZ_TITLES);
    console.log(`Removed ${removed} old quizzes`);
    await seedBulkQuizzes(authorRefs);
    console.log("✅ Bulk quizzes reseeded with multi-question sets");
    return;
  }

  console.log("🌱 Seeding database...");

  const hashedPassword = await bcrypt.hash("password123", 10);
  const testPassword = await bcrypt.hash("Vadimfre1z!", 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: "vsemashko260@gmail.com" },
    update: { role: "SUPER_ADMIN", isVerified: true },
    create: {
      email: "vsemashko260@gmail.com",
      password: hashedPassword,
      name: "Галоўны адміністратар",
      role: "SUPER_ADMIN",
      isVerified: true,
    },
  });
  console.log("✅ Created super admin:", superAdmin.email);

  await prisma.siteAdmin.upsert({
    where: { userId: superAdmin.id },
    update: { note: "Галоўны адміністратар" },
    create: {
      userId: superAdmin.id,
      note: "Галоўны адміністратар",
    },
  });
  console.log("✅ SiteAdmin record for super admin");

  const user = await prisma.user.upsert({
    where: { email: "test@poetry.com" },
    update: { isVerified: true },
    create: {
      email: "test@poetry.com",
      password: hashedPassword,
      name: "Тэставы карыстальнік",
      role: "USER",
      isVerified: true,
    },
  });
  console.log("✅ Created test user:", user.email);

  const teacher = await prisma.user.upsert({
    where: { email: "1@gmail.com" },
    update: { role: "TEACHER", isVerified: true, password: testPassword },
    create: {
      email: "1@gmail.com",
      password: testPassword,
      name: "Тэставы настаўнік",
      role: "TEACHER",
      isVerified: true,
    },
  });
  console.log("✅ Created test teacher:", teacher.email);

  const student = await prisma.user.upsert({
    where: { email: "2@gmail.com" },
    update: { role: "STUDENT", isVerified: true, password: testPassword },
    create: {
      email: "2@gmail.com",
      password: testPassword,
      name: "Тэставы вучань",
      role: "STUDENT",
      isVerified: true,
    },
  });
  console.log("✅ Created test student:", student.email);

  // ============ АВТОРЫ ============
  const authorsData = [
    {
      name: "Янка Купала",
      slug: "yanka-kupala",
      bio: `Янка Купала (сапраўднае імя — Іван Дамінікавіч Луцэвіч; 7 ліпеня 1882, Вязынка, Мінская губерня — 28 чэрвеня 1942, Масква) — беларускі паэт, драматург, публіцыст, перакладчык, грамадскі дзеяч. Народны паэт Беларусі (1925). Класік беларускай літаратуры, адзін з заснавальнікаў сучаснай беларускай мовы і літаратуры.

Нарадзіўся ў сям'і дробнага шляхціца. Скончыў толькі народную школу, але дзякуючы самаадукацыі стаў адным з найадукаванейшых людзей свайго часу. Працаваў на розных пасадах, у тым ліку ў рэдакцыі газеты "Наша ніва".

Яго творчая дзейнасць пачалася ў 1903 годзе. Першы зборнік вершаў "Жалейка" выйшаў у 1908 годзе. Стварыў шматлікія вершы, паэмы, драматычныя творы. Найбольш вядомыя творы: "А хто там ідзе?", "Спадчына", "Мая малітва", драма "Раскіданае гняздо".

Янка Купала стаў сімвалам беларускага нацыянальнага адраджэння. Яго творчасць аказала вялізны ўплыў на развіццё беларускай нацыянальнай свядомасці і культуры. Паэт памёр пры загадкавых абставінах у Маскве, упаўшы з лесвіцы ў гатэлі.`,
      birthYear: 1882,
      deathYear: 1942,
      image: null,
    },
    {
      name: "Якуб Колас",
      slug: "yakub-kolas",
      bio: `Якуб Колас (сапраўднае імя — Канстанцін Міхайлавіч Міцкевіч; 3 лістапада 1882, вёска Акінчыцы, Мінская губерня — 13 жніўня 1956, Мінск) — беларускі савецкі пісьменнік, паэт, драматург, перакладчык, грамадскі дзеяч. Народны паэт Беларусі (1926). Акадэмік Акадэміі навук БССР (1928). Адзін з класікаў беларускай літаратуры, стваральнік беларускай літаратурнай мовы разам з Янкам Купалам.

Нарадзіўся ў сям'і лесніка. Скончыў Нясвіжскую настаўніцкую семінарыю (1902). Працаваў настаўнікам, затым у рэдакцыі газеты "Наша ніва". Удзельнічаў у рэвалюцыйным руху, быў арыштаваны і адбываў зняволенне.

Яго творчая дзейнасць пачалася ў 1906 годзе. Найбольш вядомыя творы: паэмы "Новая зямля" (1923) і "Сымон-музыка" (1925), зборнікі вершаў "Песні жальбы" (1910), "Родныя вобразы" (1914). Яго творы вызначаюцца глыбокай любоўю да роднай зямлі, народа, прыроды.

Якуб Колас быў адным з заснавальнікаў беларускай савецкай літаратуры. Яго творчасць аказала вялізны ўплыў на развіццё беларускай культуры. Памёр у Мінску, пахаваны на вайсковых могілках.`,
      birthYear: 1882,
      deathYear: 1956,
      image: null,
    },
    {
      name: "Максім Багдановіч",
      slug: "maksim-bahdanovich",
      bio: `Максім Адамавіч Багдановіч (9 снежня 1891, Мінск — 25 мая 1917, Ялта) — беларускі паэт, публіцыст, літаратуразнаўца, перакладчык, крытык. Класік беларускай літаратуры. Аўтар адзінага прыжыццёвага зборніка вершаў "Вянок" (1913), які лічыцца адным з лепшых твораў беларускай паэзіі.

Нарадзіўся ў сям'і вучонага-этнографа Адама Багдановіча. Дзяцінства правёў у Гродне, дзе бацька працаваў настаўнікам. У 1908 годзе сям'я пераехала ў Яраслаўль (Расія). Там Максім скончыў гімназію і паступіў у Дэмідаўскі юрыдычны ліцэй.

Яго творчая дзейнасць пачалася ў 1907 годзе. Першы верш апублікаваў у газеце "Наша ніва". Стварыў каля 200 вершаў, шматлікія артыкулы, пераклады. Яго паэзія вызначаецца высокай мастацкай культурай, філасофскай глыбінёй, зваротам да сусветнай культуры.

Хварэў на сухоты, памёр у Ялце ва ўзросце 25 гадоў. Нягледзячы на кароткае жыццё, пакінуў вялікую творчую спадчыну, якая аказала вялізны ўплыў на развіццё беларускай паэзіі.`,
      birthYear: 1891,
      deathYear: 1917,
      image: null,
    },
    {
      name: "Цётка",
      slug: "tsiotka",
      bio: `Цётка (сапраўднае імя — Алаіза Сцяпанаўна Пашкевіч; 15 ліпеня 1876, вёска Пешчанка, Віленская губерня — 5 лютага 1916, Вільня) — беларуская паэтка, празаік, публіцыстка, педагог, грамадская дзейніца. Адна з заснавальніц новай беларускай літаратуры і жаночага руху ў Беларусі.

Нарадзілася ў сям'і дробнага шляхціца. Скончыла Віленскую жаночую гімназію. Працавала настаўніцай, актыўна ўдзельнічала ў грамадскім жыцці. Была адной з першых беларускіх жанчын-пісьменніц.

Яе творчая дзейнасць пачалася ў 1905 годзе. Пісала вершы, апавяданні, артыкулы. Яе творчасць прасякнута любоўю да роднага краю і народа, заклікам да свабоды і незалежнасці. Была актыўнай удзельніцай беларускага нацыянальнага руху.

Памёрла ад сухот у Вільні ва ўзросце 39 гадоў. Яе творчасць заклала асновы для развіцця беларускай жаночай літаратуры.`,
      birthYear: 1876,
      deathYear: 1916,
      image: null,
    },
    {
      name: "Пятрусь Броўка",
      slug: "petrus-brouka",
      bio: `Пятрусь Усцінавіч Броўка (12 чэрвеня 1905, вёска Пуцілкавічы, Мінская губерня — 24 сакавіка 1980, Мінск) — беларускі савецкі паэт, перакладчык, грамадскі дзеяч. Народны паэт Беларусі (1962). Герой Сацыялістычнай Працы (1975). Лаўрэат Сталінскай прэміі (1947).

Нарадзіўся ў сялянскай сям'і. Скончыў Беларускі дзяржаўны ўніверсітэт (1931). Працаваў рэдактарам, затым на кіруючых пасадах у літаратурных арганізацыях.

Яго творчая дзейнасць пачалася ў 1926 годзе. Стварыў шматлікія зборнікі вершаў, паэмы. Найбольш вядомыя творы: "Малітва", "Пах кахання", "А хто там ідзе?". Яго песні сталі народнымі і спяваюцца да гэтага часу.

Быў адным з найпопулярнейшых паэтаў савецкай Беларусі. Яго творчасць вызначаецца патрыятызмам, любоўю да роднай зямлі, прастатой і даступнасцю. Памёр у Мінску, пахаваны на Усходніх могілках.`,
      birthYear: 1905,
      deathYear: 1980,
      image: null,
    },
    {
      name: "Аркадзь Куляшоў",
      slug: "arkadz-kuliashou",
      bio: `Аркадзь Аляксандравіч Куляшоў (6 лютага 1914, вёска Самахвалавічы, Мінская губерня — 4 лістапада 1978, Мінск) — беларускі савецкі паэт, перакладчык, грамадскі дзеяч. Народны паэт Беларусі (1968). Лаўрэат Дзяржаўнай прэміі СССР (1971). Адзін з найбуйнейшых прадстаўнікоў беларускай паэзіі XX стагоддзя.

Нарадзіўся ў сялянскай сям'і. Скончыў Мінскі педагагічны інстытут (1931). Працаваў настаўнікам, журналістам, рэдактарам. Удзельнічаў у Вялікай Айчыннай вайне.

Яго творчая дзейнасць пачалася ў 1930 годзе. Стварыў шматлікія зборнікі вершаў, паэмы. Майстар лірычнай паэзіі, яго творы вызначаюцца глыбокай эмацыйнасцю, любоўю да прыроды, філасофскімі развагамі.

Быў адным з найбольш шанаваных паэтаў Беларусі. Яго творчасць аказала вялізны ўплыў на развіццё беларускай паэзіі. Памёр у Мінску, пахаваны на Усходніх могілках.`,
      birthYear: 1914,
      deathYear: 1978,
      image: null,
    },
    {
      name: "Максім Танк",
      slug: "maksim-tank",
      bio: `Максім Танк (сапраўднае імя — Яўген Іванавіч Скурко; 17 верасня 1912, вёска Пількаўшчына, Віленская губерня — 7 жніўня 1995, Мінск) — беларускі савецкі паэт, перакладчык, грамадскі дзеяч. Народны паэт Беларусі (1968). Герой Сацыялістычнай Працы (1974). Лаўрэат Ленінскай прэміі (1978).

Нарадзіўся ў сялянскай сям'і. Скончыў Віленскі ўніверсітэт (1936). Працаваў настаўнікам, журналістам. Удзельнічаў у антыфашысцкім супраціве.

Яго творчая дзейнасць пачалася ў 1931 годзе. Стварыў шматлікія зборнікі вершаў, паэмы. Яго паэзія вызначаецца філасофскай глыбінёй, лірызмам, патрыятызмам. Быў адным з найбольш плённых беларускіх паэтаў.

Быў старшынёй Саюза пісьменнікаў БССР (1966—1971). Яго творчасць аказала вялізны ўплыў на развіццё беларускай паэзіі. Памёр у Мінску, пахаваны на Усходніх могілках.`,
      birthYear: 1912,
      deathYear: 1995,
      image: null,
    },
    {
      name: "Рыгор Барадулін",
      slug: "ryhor-baradulin",
      bio: `Рыгор Іванавіч Барадулін (24 студзеня 1935, вёска Верасоўка, Віцебская вобласць — 2 сакавіка 2014, Мінск) — беларускі паэт, перакладчык, грамадскі дзеяч. Народны паэт Беларусі (1992). Лаўрэат Дзяржаўнай прэміі Беларусі (1996). Адзін з найяркіх прадстаўнікоў беларускай паэзіі другой паловы XX стагоддзя.

Нарадзіўся ў сялянскай сям'і. Скончыў Беларускі дзяржаўны ўніверсітэт (1959). Працаваў рэдактарам, журналістам. Быў актыўным удзельнікам беларускага нацыянальнага руху.

Яго творчая дзейнасць пачалася ў 1953 годзе. Стварыў шматлікія зборнікі вершаў. Вядомы сваімі вершамі пра родную зямлю, маці, прыроду. Яго паэзія вызначаецца глыбокай эмацыйнасцю, філасофскімі развагамі.

Быў адным з найбольш шанаваных паэтаў незалежнай Беларусі. Яго творчасць аказала вялізны ўплыў на развіццё сучаснай беларускай паэзіі. Памёр у Мінску.`,
      birthYear: 1935,
      deathYear: 2014,
      image: null,
    },
    {
      name: "Ніл Гілевіч",
      slug: "nil-hilevich",
      bio: `Ніл Сымонавіч Гілевіч (30 верасня 1931, вёска Слабада, Мінская вобласць — 29 сакавіка 2016, Мінск) — беларускі паэт, перакладчык, літаратуразнаўца, грамадскі дзеяч. Народны паэт Беларусі (1991). Акадэмік Нацыянальнай акадэміі навук Беларусі (1994). Вялікі абаронца беларускай мовы і культуры.

Нарадзіўся ў сялянскай сям'і. Скончыў Беларускі дзяржаўны ўніверсітэт (1954). Працаваў выкладчыкам, рэдактарам, дырэктарам Інстытута літаратуры імя Янкі Купалы.

Яго творчая дзейнасць пачалася ў 1949 годзе. Стварыў шматлікія зборнікі вершаў, паэмы, пераклады. Яго творчасць вызначаецца патрыятызмам, любоўю да роднай мовы і культуры.

Быў адным з найбольш актыўных абаронцаў беларускай мовы і культуры. Яго творчасць і грамадская дзейнасць аказалі вялізны ўплыў на развіццё беларускай культуры. Памёр у Мінску.`,
      birthYear: 1931,
      deathYear: 2016,
      image: null,
    },
    {
      name: "Уладзімір Караткевіч",
      slug: "uladzimir-karatkevich",
      bio: `Уладзімір Сямёнавіч Караткевіч (26 лістапада 1930, Орша — 25 ліпеня 1984, Мінск) — беларускі пісьменнік, паэт, драматург, сцэнарыст, грамадскі дзеяч. Адзін з найбуйнейшых беларускіх пісьменнікаў XX стагоддзя. Лаўрэат Дзяржаўнай прэміі БССР (1984).

Нарадзіўся ў сям'і службоўца. Скончыў Кіеўскі ўніверсітэт (1954). Працаваў настаўнікам, журналістам, рэдактарам. Быў адным з найбольш папулярных беларускіх пісьменнікаў.

Яго творчая дзейнасць пачалася ў 1951 годзе. Стварыў шматлікія раманы, апавяданні, вершы, драмы. Найбольш вядомыя творы: "Каласы пад сярпом тваім" (1965), "Хрыстос прызямліўся ў Гародні" (1972), "Дзікае паляванне караля Стаха" (1964).

Яго творчасць вызначаецца глыбокай любоўю да гісторыі Беларусі, мастацкай выразнасцю, філасофскімі развагамі. Памёр у Мінску, пахаваны на Усходніх могілках.`,
      birthYear: 1930,
      deathYear: 1984,
      image: null,
    },
    {
      name: "Франтішак Багушэвіч",
      slug: "francishak-bahushevich",
      bio: 'Франтішак Казіміравіч Багушэвіч (1840—1900) — беларускі паэт, празаік, публіцыст. Адзін з заснавальнікаў новай беларускай літаратуры. Аўтар зборнікаў "Дудка беларуская" і "Смык беларускі". Яго прадмова да "Дудкі беларускай" стала маніфестам беларускага нацыянальнага адраджэння.',
      birthYear: 1840,
      deathYear: 1900,
      image: null,
    },
    {
      name: "Змітрок Бядуля",
      slug: "zmitrok-biadula",
      bio: `Змітрок Бядуля (сапраўднае імя — Самуіл Яфімавіч Плаўнік; 23 красавіка 1886, вёска Пасада, Віленская губерня — 3 лістапада 1941, Казань) — беларускі пісьменнік, паэт, публіцыст. Класік беларускай літаратуры. Адзін з заснавальнікаў беларускай дзіцячай літаратуры.

Нарадзіўся ў сям'і дробнага гандляра. Скончыў Віленскую настаўніцкую семінарыю (1906). Працаваў настаўнікам, журналістам. Удзельнічаў у беларускім нацыянальным руху.

Яго творчая дзейнасць пачалася ў 1906 годзе. Стварыў шматлікія апавяданні, вершы, п'есы для дзяцей. Яго творы вызначаюцца глыбокім лірызмам, любоўю да роднай прыроды, даступнасцю для дзяцей.

Быў адным з першых беларускіх пісьменнікаў, якія пісалі спецыяльна для дзяцей. Яго творчасць заклала асновы для развіцця беларускай дзіцячай літаратуры. Памёр у эвакуацыі ў Казані.`,
      birthYear: 1886,
      deathYear: 1941,
      image: null,
    },
    {
      name: "Кузьма Чорны",
      slug: "kuzma-chorny",
      bio: "Кузьма Чорны (1890—1941) — беларускі пісьменнік і паэт, аўтар апавяданняў «Маці» і «Немаўля». Яго лірыка пра простых людзей і родную зямлю застаецца важнай часткай беларускай літаратуры.",
      birthYear: 1890,
      deathYear: 1941,
      image: null,
    },
    {
      name: "Максім Гарэцкі",
      slug: "maksim-haretski",
      bio: "Максім Гарэцкі (1893—1938) — беларускі пісьменнік і паэт, адзін з пачаткоўцаў беларускай дзіцячай літературы. Аўтар зборніка «Звонкі» і шматлікіх лірычных вершаў.",
      birthYear: 1893,
      deathYear: 1938,
      image: null,
    },
    {
      name: "Янка Сіпакоў",
      slug: "yanka-sipakov",
      bio: "Янка Сіпакоў (1911—1997) — беларускі паэт, драматург і перакладчык. Аўтар паэмы «Дзед і баба» і шматлікіх лірычных зборнікаў пра родную зямлю.",
      birthYear: 1911,
      deathYear: 1997,
      image: null,
    },
    {
      name: "Андрэй Макаёнак",
      slug: "andrei-makayonak",
      bio: "Андрэй Макаёнак (1920—1978) — беларускі паэт і драматург. Аўтар п'ес «Трыбунал» і лірычных зборнікаў, якія адлюструюць гісторыю і дух сваёго часу.",
      birthYear: 1920,
      deathYear: 1978,
      image: null,
    },
    {
      name: "Пімен Панчанка",
      slug: "pimen-panchanka",
      bio: "Пімен Панчанка (1903—1964) — беларускі паэт і драматург. Аўтар паэмы «Адплата» і вершаў пра працу, мір і беларускую вёску.",
      birthYear: 1903,
      deathYear: 1964,
      image: null,
    },
    {
      name: "Канстанцін Вераніцын",
      slug: "kastus-veranitsyn",
      bio: "Канстанцін Вераніцын (1866—1918) — беларускі паэт і публіцыст. Аўтар паэмы «Тарас на Парнасе» і вершаў пра нацыянальнае адраджэнне.",
      birthYear: 1866,
      deathYear: 1918,
      image: null,
    },
    {
      name: "Уладзіслаў Галубок",
      slug: "uladzislau-halubok",
      bio: "Уладzіслаў Галубok (1902—1982) — беларускі паэт і публіцыст. Аўтар зборніка «Песні пра сонца» і вершаў пра вёску, працу і прыроду.",
      birthYear: 1902,
      deathYear: 1982,
      image: null,
    },
    {
      name: "Ларыса Генійш",
      slug: "larysa-hieniyush",
      bio: "Ларыса Генійш (1910—1998) — беларуская паэтка, аўтарка лірычных зборнікаў «Верасень» і «Папараць». Яе паэзія пра родную зямлю і жаночы лёс вельмі цеплая і щирая.",
      birthYear: 1910,
      deathYear: 1998,
      image: null,
    },
    {
      name: "Янка Брыль",
      slug: "yanka-bryl",
      bio: `Янка Брыль (сапраўднае імя — Іван Антонавіч Брыль; 4 жніўня 1917, Адэса — 6 ліпеня 2006, Мінск) — беларускі пісьменнік, паэт, перакладчык. Народны пісьменнік БССР (1981).

Жыццёвыя карані пісьменніка — на Навагрудчыне. Дзяцінства прайшло ў вёсцы Загора. Першыя творы апублікаваў у 1938 годзе. У гады Другой сусветнай вайны быў партызанам, пасля вайны працаваў у мінскіх часопісах.

Найвядомейшыя творы: «Сірочы хлеб», «Цюцік», раман «Птушкі і гнёзды», зборнікі «Нёманскія казкі», «Золак, убачаны здалёк».`,
      birthYear: 1917,
      deathYear: 2006,
      image: "/images/authors/yanka-bryl.jpg",
    },
    {
      name: "Міхась Чарот",
      slug: "mikhail-charot",
      bio: "Міхась Чарот (1902—1942) — беларускі паэт, адзін з лідараў «Маладняка». Аўтар зборніка «Брызгі» і вершаў пра молadость, волю і родную мову.",
      birthYear: 1902,
      deathYear: 1942,
      image: null,
    },
    {
      name: "Язэп Пушча",
      slug: "yauhen-puhcha",
      bio: "Язэп Пушча (1907—1990) — беларускі паэт і публіцыст. Аўтар зборніка «Песні пра зямлю» і вершаў пра вёску, прыроду і гісторыю.",
      birthYear: 1907,
      deathYear: 1990,
      image: null,
    },
    {
      name: "Андрэй Хадановіч",
      slug: "andrei-khadanovich",
      bio: `Андрэй Хадановіч (нар. 28 снежня 1973, Мінск) — сучасны беларускі паэт, перакладчык, літаратуразнаўец. Аўтар зборнікаў «Стрыжутка да Страны» і шматлікіх перакладаў еўрапейскай паэзіі.`,
      birthYear: 1973,
      deathYear: null,
      image: null,
    },
  ];

  for (const authorData of authorsData) {
    const image = authorImageForSlug(authorData.slug) ?? authorData.image;
    await prisma.author.upsert({
      where: { slug: authorData.slug },
      update: {
        name: authorData.name,
        bio: authorData.bio,
        birthYear: authorData.birthYear,
        deathYear: authorData.deathYear,
        image,
      },
      create: { ...authorData, image },
    });
  }
  console.log("✅ Created authors");

  // ============ КАТЕГОРИИ ============
  const categoriesData = [
    {
      name: "Лірыка кахання",
      slug: "love-poetry",
      description: "Вершы пра каханне і пачуцці",
    },
    {
      name: "Грамадзянская лірыка",
      slug: "civil-poetry",
      description: "Вершы пра Радзіму, народ і волю",
    },
    {
      name: "Пейзажная лірыка",
      slug: "nature-poetry",
      description: "Вершы пра прыроду Беларусі",
    },
    {
      name: "Філасофская лірыка",
      slug: "philosophical-poetry",
      description: "Развагі пра жыццё і вечнасць",
    },
    {
      name: "Класічная паэзія",
      slug: "classical-poetry",
      description: "Лепшыя творы беларускіх класікаў",
    },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Created categories");

  // Получаем авторов и категории
  const authorRefs = await loadAuthorRefs();
  const yankaKupala = authorRefs.yankaKupala;
  const yakubKolas = authorRefs.yakubKolas;
  const maksimBahdanovich = authorRefs.maksimBahdanovich;
  const tsiotka = authorRefs.tsiotka;
  const petrusBrouka = authorRefs.petrusBrouka;
  const arkadzKuliashou = authorRefs.arkadzKuliashou;
  const maksimTank = authorRefs.maksimTank;
  const ryhorBaradulin = authorRefs.ryhorBaradulin;
  const nilHilevich = authorRefs.nilHilevich;
  const karatkevich = authorRefs.karatkevich;
  const bahushevich = authorRefs.bahushevich;
  const biadula = authorRefs.biadula;

  const loveCat = await prisma.category.findUnique({
    where: { slug: "love-poetry" },
  });
  const civilCat = await prisma.category.findUnique({
    where: { slug: "civil-poetry" },
  });
  const natureCat = await prisma.category.findUnique({
    where: { slug: "nature-poetry" },
  });
  const philCat = await prisma.category.findUnique({
    where: { slug: "philosophical-poetry" },
  });
  const classCat = await prisma.category.findUnique({
    where: { slug: "classical-poetry" },
  });

  // ============ СТИХИ (50+) ============
  const poemsData = [
    // Янка Купала
    {
      title: "А хто там ідзе?",
      slug: "a-khto-tam-idze",
      authorId: yankaKupala?.id!,
      categoryId: classCat?.id!, // Классический верш
      year: 1905,
      description:
        "Гэты верш — гімн беларускага народа, які ўпершыню загучаў на ўвесь свет. Купала стварыў вобраз народа, які прачынаецца да новага жыцця.",
      videoUrl:
        "/invideo-ai-720 Гукі Купалы_ «А хто там ідзе_» за 70 сек 2026-01-25.mp4",
      content: `А хто там ідзе, а хто там ідзе
У агромністай такой грамадзе?
— Беларусы.

А што яны нясуць на худых плячах,
На руках ў крыві, на нагах у лапцях?
— Сваю крыўду.

А куды ж нясуць гэту крыўду ўсю,
А куды ж нясуць на паказ сваю?
— На свет цэлы.

А хто гэта іх, не адзін мільён,
Крыўду несць наўчыў, разбудзіў іх сон?
— Бяда, гора.

А чаго ж, чаго захацелась ім,
Пагарджаным век, ім, сляпым, глухім?
— Людзьмі звацца.`,
    },
    {
      title: "Спадчына",
      slug: "spadchyna",
      authorId: yankaKupala?.id!,
      categoryId: classCat?.id!, // Классический верш
      year: 1918,
      description:
        'Верш "Спадчына" — адзін з самых вядомых твораў Янкі Купалы. У ім паэт разважае пра тое, што ён пакіне нашчадкам.',
      content: `Ад прадзедаў спакон вякоў
Мне засталася спадчына;
Паміж сваіх і чужакоў
Яна мне ласкай матчынай.

Аб ёй мне баюць казкі-сны
Вясёлкі ў небе ясненькім,
Аб ёй мне сняцца ў час вясны
Лугоў абшар зялёненькі.

Яна глядзіць мне ў вочы зор
З сузор'яў беласнежненькіх;
Шуміць даўнейшы цёмны бор
У песнях аб мінуўшчыне.

Не адракуся я яе,
Маёй спадчыны-радасці;
Як сын, прыгорнуся к ёй,
Да маці-Беларусі.`,
    },
    {
      title: "Мая малітва",
      slug: "maya-malitva",
      authorId: yankaKupala?.id!,
      categoryId: philCat?.id!,
      year: 1905,
      description:
        "Верш-малітва, у якім паэт звяртаецца да Бога з просьбай дапамагчы яго роднаму народу.",
      content: `Мой божа мілы! Як цяжка жыці!
Як сэрца млее, як дух маркоціць!
Нашлі ты долі — цярпець няма як,
А ты — надзея, а ты — паратунак.

О мой ты божа, зірні на гора
Людзей пакорных! Ніхто не зворыць
Цяжкой іх долі, — над імі вісне
Сярпом пакоса жыццё прыснае!..

Пашлі ім ласкі — яна патрэбна
На гэтым свеце — яна цалебна:
Ад хвор' і гора, ад злой нядолі
Пашлі ім ласку — вялікай долі!`,
    },
    // Якуб Колас
    {
      title: "Мой родны кут",
      slug: "moj-rodny-kut",
      authorId: yakubKolas?.id!,
      categoryId: classCat?.id!, // Классический верш
      year: 1923,
      description:
        'Урывак з паэмы "Новая зямля" — адзін з самых вядомых твораў Якуба Коласа. Гэтыя радкі сталі сімвалам любові да роднай зямлі.',
      content: `Мой родны кут, як ты мне мілы!..
Забыць цябе не маю сілы!
Не раз, утомлены дарогай,
Жыццём вясны мае убогай,
К табе я ў думках залятаю
І там душою спачываю.

Бывае, вобразы былога
Ўстаюць прада мною як жывыя,
І сэрца поўніцца маркотай
Па мілай бацькаўшчыне той —
Па гэтых пожнях, па лясочках,
Гаях, сялібах, хутарочках.

Як ты мне мілы, родны кут!
Тут, дзе па сцежцы маладое
Хадзіла ты, — маё жыццё —
Тут пачалось; тут першы раз
Пачуў я голас твой, прырода,
І мілай маці галасок...`,
    },
    {
      title: "Над ракой",
      slug: "nad-rakoj",
      authorId: yakubKolas?.id!,
      categoryId: natureCat?.id!,
      year: 1910,
      description:
        "Верш, напоўнены замілаваннем роднай прыродай. Колас майстэрскі перадае настрой ціхага летняга вечара над ракой.",
      content: `Над ракой шырокай,
На пясчаным лузе,
Уткнуўшы ў зямлю кій,
Сядзіць стары, задумаўшыся глыбока.

Цішыня. На небе зоркі
Паволі займаюцца.
А рака ўсё цячэ і цячэ
Між берагоў зялёных.

І гэтак жа, як гэта рака,
Плылі мае гады,
І думкі, і мары, і жаданні
Плылі і не вярталіся.`,
    },
    {
      title: "Дзед Мароз",
      slug: "dzed-maroz",
      authorId: yakubKolas?.id!,
      categoryId: natureCat?.id!,
      year: 1910,
      description: "Верш пра зімовую казку і Дзеда Мароза.",
      videoUrl:
        "/invideo-ai-720 Вы пачуеце Коласа_ «Дзед Мароз» за 90 се 2026-01-25.mp4",
      content: `Дзед Мароз ідзе па снезе,
Снег скрыпіць пад нагамі;
Ён нясе падарункі ўсе,
Дзецям радасць дае.

Ён у белай шапцы,
Ён у белай бародзе;
Ён — казка зімы,
Ён — цуд на зямлі.

Дзеці чакаюць яго,
Дзеці верыць у цуды;
Дзед Мароз прыйдзе,
Прынясе шчасце ўсюды.`,
    },
    {
      title: "Песня аб вясне",
      slug: "pesnya-ab-vyasne",
      authorId: yakubKolas?.id!,
      categoryId: natureCat?.id!,
      year: 1908,
      description: "Радасны, светлы верш пра абуджэнне прыроды вясной.",
      content: `Ой вясна, вясна, красна,
Што ты нам прынесла?
Прынесла я вам цяпло,
Красачак, кветак многа!

Зацвілі сады, лугі,
Запяюць салаўі,
Загудуць чмялі, пчолы
У зялёных далінах.

Засінее неба ўвысь,
Заблішчаць расою травы,
І заззяе сонца яркім
Святлом над зямлёю!`,
    },
    {
      title: "Не бядуй",
      slug: "ne-byaduj",
      authorId: yakubKolas?.id!,
      categoryId: philCat?.id!,
      year: 1912,
      description:
        "Верш-суцяшэнне, верш-падтрымка. Колас заклікае не здавацца, нягледзячы на цяжкасці жыцця.",
      content: `Не бядуй, мой браце мілы,
Хоць жыццё цяжкое:
Будзе ў нас яшчэ заўтра,
Будзе шчасце з намі!

Не журыся, не сумуй,
Весялей глядзі!
Хмары з неба разыйдуцца,
Сонца заблішчыць.

Пасля ночкі цёмнай, доўгай
Ранак прыйдзе ясны;
Пасля буры, навальніцы
Дзень настане красны!`,
    },
    // Максім Багдановіч
    {
      title: "Слуцкія ткачыхі",
      slug: "slutskiya-tkachykhi",
      authorId: maksimBahdanovich?.id!,
      categoryId: classCat?.id!, // Классический верш
      year: 1912,
      description:
        "Верш пра слуцкіх ткачых, якія тчылі знакамітыя слуцкія паясы. Гэта гісторыя пра жанчын, якія марылі пра волю.",
      content: `Ад родных ніў, ад роднай хаты
У панскі двор дзеля красы
Яны, бяздольныя, узяты
Ткаць залатыя паясы.

І цягам доўгія часіны,
Дзявочыя забыўшы сны,
Свае шырокія тканіны
На лад персідскі ткуць яны.

А за сцяной смяецца поле,
Зіяе неба з-за акна...
І думкі мкнуцца мімаволі
Туды, дзе расцвіла вясна;

Дзе блішча збожжа ў яснай далі,
Сінеюць міла васількі,
Халодным срэбрам ззяюць хвалі
Між верб плакучых ля ракі;

Дзе ў полі — песня залівае,
А ў небе — звон і перагуд...
Ды польскі пан сваё жадае,
І ўсё заходзіцца ім люд.

Цямнее край зубчаты бору...
Ах, колькі ж там было красы!
І тчэ, забыўшыся, ткачыха
Замест персідскага узору
Цвяток радзімы васількі.`,
    },
    {
      title: "Раманс",
      slug: "ramans",
      authorId: maksimBahdanovich?.id!,
      categoryId: loveCat?.id!,
      year: 1910,
      description:
        "Адзін з самых лірычных вершаў Багдановіча. Ніжны, мелодычны твор пра каханне.",
      content: `Зорка Венера ўзышла над зямлёю,
Светлыя згадкі з сабой прывяла...
Помніш, калі я спаткаўся з табою,
Зорка Венера ўзышла.

Месяц паглядваў на сонныя воды,
Вецер прыносіў пяшчотны духмень.
Помніш, як шмат нам давала прыгоды
Ў гэты шчаслівенькі дзень!

Зорка Венера заблішча над намі,
Светлыя згадкі яна аддае...
Толькі не знойдзем мы шчасця з табою, —
Зорка Венера — не тое.`,
    },
    {
      title: "Вянок",
      slug: "vyanok",
      authorId: maksimBahdanovich?.id!,
      categoryId: classCat?.id!, // Классический верш
      year: 1913,
      description:
        "Праграмны верш, які даў назву адзінаму прыжыццёваму зборніку паэта.",
      content: `Вянок
Вязаў я, ліра, табе
Не адзін раз на год,
Ды што зроблю, калі ён
Хутка завяне, прападзе?

Кветкі завянуць, спадуць
Лісты за лістом;
Толькі памяць аб цябе
Застанецца ў сэрцы маім.

Ты — маё шчасце жыцця,
Ты — мая радасць адна;
Табе аддаю я ўсё,
Мая дарагая страна!`,
    },
    {
      title: "Маладыя гады",
      slug: "maladyya-hady",
      authorId: maksimBahdanovich?.id!,
      categoryId: philCat?.id!,
      year: 1909,
      description: "Элегічны верш пра хуткаплыннасць маладосці і жыцця.",
      videoUrl:
        "/invideo-ai-720 1 хвіліна чыстай лірыкі_ «Маладыя гады» 2026-01-25.mp4",
      content: `Маладыя гады
Праляцелі, як сон;
Не вярнуцца яны
Ніколі назад.

Усё, што было,
Ужо не вернеш;
Засталіся толькі
Успаміны адны.

Але ў сэрцы жыве
Тая радасць жыцця,
Што калісьці была
У маладыя гады.`,
    },
    // Цётка
    {
      title: "Мой родны край",
      slug: "moj-rodny-kraj",
      authorId: tsiotka?.id!,
      categoryId: civilCat?.id!,
      year: 1906,
      description:
        "Верш-гімн роднаму краю. Цётка з любоўю і болем апісвае Беларусь.",
      content: `Мой родны край, мая старонка,
Як ты прыгожа, як ты міла!
Тваіх палёў шырокіх звонка
Маё дзяцінства там прайшло.

Твае лясы і пушчы цёмны,
Твае азёры і рэкі,
Твае лугі зялёны-зялёны,
Я іх люблю на вечныя вякі!

Люблю цябе, мой край убогі,
Люблю твой сум і твой жаль;
Люблю твае жытнёвыя дарогі
І сіні-сіні твой прастор!`,
    },
    {
      title: "Хрэст на свабоду",
      slug: "khrest-na-svabodu",
      authorId: tsiotka?.id!,
      categoryId: civilCat?.id!,
      year: 1906,
      description: "Рэвалюцыйны верш, заклік да барацьбы за волю.",
      content: `Хрэст на свабоду нясём мы высока,
Смела ідзём праз цярністы шлях;
Наша надзея глыбока-глыбока,
Воля жыве ў маладых сэрцах!

Браты, сёстры, усе ўставайце!
Час прыйшоў нам звязацца ў адно;
Долу тыранаў усіх пасылайце,
Сонца свабоды ўзыходзіць даўно!

Хай жыве воля! Хай гіне няволя!
Хай засвеціць зара над краём!
Вольнаму — воля, шчасліваму — доля,
Мы за свабоду сваю пастаім!`,
    },
    // Пятрусь Броўка
    {
      title: "Беларусь",
      slug: "belarus-brouka",
      authorId: petrusBrouka?.id!,
      categoryId: civilCat?.id!,
      year: 1943,
      description:
        "Верш, напісаны ў гады Вялікай Айчыннай вайны. Гэта прызнанне ў любові да Радзімы.",
      content: `Беларусь мая, краіна мілая,
Ты заўсёды ў маім сэрцы жывеш!
Як бы доля ні была нам няміла,
Ты ніколі сваіх дзяцей не забудзеш.

Твае нівы, твае пушчы зялёныя,
Твае вёскі і гарады —
Усё гэта нам з дзяцінства знаёмае,
Усё гэта — нашы святыя сляды.

Хай вякі прайдуць, хай змены настануць,
Ты заўсёды будзеш жыць!
Беларусь мая, ніколі не ўстане
Той, хто здолее цябе забыць!`,
    },
    {
      title: "Александрына",
      slug: "aleksandryna",
      authorId: petrusBrouka?.id!,
      categoryId: loveCat?.id!,
      year: 1950,
      description: "Адзін з самых вядомых вершаў Броўкі, пакладзены на музыку.",
      content: `Александрына, Александрына!
Песню гэту складаў я даўно,
Як стаяў над ракой каля млына
І глядзеў на тваё акно.

Александрына, Александрына!
Можа, ты пазабыла мяне?
А мне помніцца хвіліна тая,
Як сустрэліся мы на вясне.

Над ракой сонца яснае ззяла,
Пеў салоўка ў зялёным садзе,
Ты са мною тады размаўляла,
Я любіў цябе, любая, здаецца, найбольш на свеце.`,
    },
    // Аркадзь Куляшоў
    {
      title: "Бывай",
      slug: "byvaj",
      authorId: arkadzKuliashou?.id!,
      categoryId: loveCat?.id!,
      year: 1942,
      description: "Верш-развітанне, напісаны ў гады вайны.",
      content: `Бывай, дарагая! Развітвацца трэба.
Няпэўнай дарогай мне заўтра ісці.
Засталося ўсё — і зямля, і неба,
Засталіся толькі — да лепшых дзён — сны.

Бывай! Не сумуй! Не шукай сустрэчы,
Якой, можа, нам не давядзецца мець;
Хай сэрца маё не заб'ецца ў грудзях,
Калі не судзіла нам доля сустрэць.

Бывай, дарагая! Вачамі сваімі
Яшчэ адзін раз гляну ў твае вочы,
І памяць аб гэтым, што было між намі,
Заўсёды будзе са мной — і днём, і ўночы.`,
    },
    {
      title: "Маладосць",
      slug: "maladosts-kuliashou",
      authorId: arkadzKuliashou?.id!,
      categoryId: philCat?.id!,
      year: 1960,
      description: "Развагі паэта пра маладосць, яе сэнс і значэнне.",
      content: `Маладосць — гэта сонца на золку,
Гэта песня ў душы маладой;
Маладосць — гэта самае волькае
Шчасце ў свеце вялікім і новым.

Маладосць не вяртаецца болей,
Як і рэкі не цякуць назад;
Толькі памяць аб шчасці і долі
Назаўжды застаецца ў нас.

Будзем жыць! Будзем верыць у заўтра!
Маладосць — гэта вера ў жыццё;
І няхай нам дарогі не аднакавы,
Маладосць — наша агульнае ўсё!`,
    },
    // Максім Танк
    {
      title: "Мой хлеб надзённы",
      slug: "moj-khleb-nadzenny",
      authorId: maksimTank?.id!,
      categoryId: philCat?.id!,
      year: 1962,
      description: "Філасофскі верш пра сэнс жыцця і творчасці.",
      videoUrl:
        "/invideo-ai-720 Горкі, салодкі хлеб_ 1_20 па Максіму Тан 2026-01-25.mp4",
      content: `Мой хлеб надзённы — гэта слова,
Якое я шукаю штодзень;
Мой хлеб надзённы — гэта мова,
Якую я люблю заўсёды.

Без слова — я не чалавек,
Без мовы — я нямы і глухі;
Слова — мой водсвет у свеце,
Мова — маё жыццё і рух.

Мой хлеб надзённы — праўда жыцця,
Якую я шукаю ўсюды;
І пакуль б'ецца сэрца маё,
Я буду верны гэтай праўдзе.`,
    },
    {
      title: "Ave Maria",
      slug: "ave-maria",
      authorId: maksimTank?.id!,
      categoryId: philCat?.id!,
      year: 1970,
      description: "Верш-медытацыя, звернуты да вечных тэм жыцця.",
      videoUrl: "/invideo-ai-720 Звон кафедры і цені_ Ave Maria 2026-01-25.mp4",
      content: `Ave Maria! Ты — святло
Над цёмнай бездняй нашых дзён;
Ave Maria! Ты — цяпло
Сярод зімовых халадоў.

Ave Maria! Ты — надзея
Для тых, хто ў роспачы і скрусе;
Ave Maria! Не старэе
Твая любоў да Беларусі.

Ave Maria! Голас твой
Гучыць праз стагоддзі, праз вякі;
Ave Maria! Мы з табой
На гэтай цудоўнай зямлі.`,
    },
    // Рыгор Барадулін
    {
      title: "Трэба дома бываць часцей",
      slug: "treba-doma-byvats-chasciej",
      authorId: ryhorBaradulin?.id!,
      categoryId: civilCat?.id!,
      year: 1980,
      description:
        "Адзін з самых вядомых вершаў Барадуліна. Напамін пра важнасць сувязі з родным домам.",
      content: `Трэба дома бываць часцей,
Трэба дома бываць не госцем,
Каб душой не зарасці
Гарадскім халодным лёдам.

Трэба бачыць матчыны вочы,
Трэба чуць бацькоўскі голас,
Трэба помніць свае вытокі,
Каб не згубіцца ў свеце.

Трэба дома бываць часцей,
Да зямлі прыпадаць вачамі,
Каб не страціць у жыцці мэты,
Каб застацца заўжды з сабой.`,
    },
    {
      title: "Босыя ў расе",
      slug: "bosyya-u-rase",
      authorId: ryhorBaradulin?.id!,
      categoryId: natureCat?.id!,
      year: 1975,
      description: "Ностальгічны верш пра дзяцінства, пра беззваротны час.",
      content: `Босыя ў расе
Беглі мы па лузе,
І ніхто не ведаў,
Што гады ляцяць.

Сонца ўставала,
Пеў салоўка ў гаі,
І здавалася нам,
Што так будзе заўжды.

Дзе тыя гады?
Дзе тое дзяцінства?
Толькі памяць жыве
Пра расу на траве.`,
    },
    // Ніл Гілевіч
    {
      title: "Жураўлі на Палессе ляцяць",
      slug: "zhuravli-na-palessie-lyatsyats",
      authorId: nilHilevich?.id!,
      categoryId: natureCat?.id!,
      year: 1968,
      description: "Лірычны верш пра журавоў, якія вяртаюцца на радзіму.",
      content: `Жураўлі на Палессе ляцяць,
Жураўлі на Палессе ляцяць!
Вось яны над лясамі, палямі,
Крыламі махаюць угару.

Там, дзе рэкі цякуць між балот,
Дзе сасновыя боры шумяць,
Там Радзіма чакае вяртання,
Там жураўлі на Палессе ляцяць!

Як і мы вяртаемся з выраю
Да сваёй дарагой зямлі,
Так і жураўлі нястомна
Да Палесся свайго ляцяць.`,
    },
    {
      title: "Родная мова",
      slug: "rodnaya-mova",
      authorId: nilHilevich?.id!,
      categoryId: civilCat?.id!,
      year: 1985,
      description: "Верш-гімн беларускай мове.",
      content: `Родная мова — матчына мова,
Колькі ў табе цеплыні!
Кожнае слова — жывое слова,
Ты — мая радасць адна.

Родная мова — песня народа,
Ты — наша слава і боль;
Родная мова — наша свабода,
Ты — нашых продкаў любоў.

Не адракуся цябе ніколі,
Мова мая дарагая!
Ты — мая сіла, ты — мая воля,
Ты — мая Беларусь-маці!`,
    },
    // Уладзімір Караткевіч
    {
      title: "Беларуская песня",
      slug: "belaruskaya-pesnya",
      authorId: karatkevich?.id!,
      categoryId: civilCat?.id!,
      year: 1963,
      description: "Верш-гімн роднаму краю.",
      content: `Мой родны край, зямля бацькоў маіх,
Твой воблік мілы — у сэрцы маім!
Твае лясы, азёры і ракі,
Твае паданні — помню праз вякі.

Тут продкі нашы жылі і тварылі,
Тут нашу мову, песню захавалі;
І мы — нашчадкі — гэты скарб цанілі,
І ўнукам нашым яго перадалі.

Зямля мая! Ты — вечная і новая,
Ты — наша маці, наша Беларусь!
І пакуль сэрца б'ецца ў грудзях,
Я за цябе стаяць буду, баюсь!`,
    },
    {
      title: "Дзікае паляванне",
      slug: "dzikae-palyavanne",
      authorId: karatkevich?.id!,
      categoryId: philCat?.id!,
      year: 1964,
      description:
        "Верш, звязаны з аднайменнай аповесцю. Містычны і таямнічы твор.",
      content: `Над Палессем імгла залягла,
Над балотам туман паплыў;
У начы нешта страшнае было,
Нехта крыкнуў — і ўсё змоўкла.

Гэта дзікае паляванне караля,
Гэта конікі мёртвых нясуць;
Гэта помста даўніх гадоў
Праз стагоддзі да нас ідзе.

Хто парушыць спакой мёртвых,
Той ніколі не знойдзе спакой;
Дзікае паляванне караля Стаха
Будзе вечна блукаць над зямлёй.`,
    },
    // Франтішак Багушэвіч
    {
      title: "Дудка беларуская",
      slug: "dudka-belaruskaya",
      authorId: bahushevich?.id!,
      categoryId: civilCat?.id!,
      year: 1891,
      description:
        "Праграмны верш, маніфест беларускага нацыянальнага адраджэння.",
      content: `Не пакідайце ж мовы нашай беларускай,
Каб не ўмёрлі!
Бо мёртвыя народы ўжо не ўваскрэсаюць,
Іх зоры патухаюць назаўжды.

Я — беларус, і ганаруся гэтым!
Я — беларус, і мова мая жыве!
Хай сотні год прайшло — яна не ўмёрла,
Яна гучыць, як песня, на зямлі!

Дудка мая беларуская звоніць,
Дудка мая — душа майго народа;
Пакуль яна гучыць — народ мой жыве,
Пакуль яна гучыць — ёсць у нас свабода!`,
    },
    {
      title: "Бог не роўна дзеле",
      slug: "boh-ne-rouna-dzele",
      authorId: bahushevich?.id!,
      categoryId: philCat?.id!,
      year: 1891,
      description: "Сацыяльны верш пра няроўнасць у грамадстве.",
      content: `Бог не роўна дзеле:
Адным — панства, другім — гора;
Адным — золата шмат,
Другім — злыдні да пары.

Адзін п'е і гуляе,
Другі працуе ўвесь дзень;
Адзін жыве ў палацах,
Другі — у хаце ў цень.

Але прыйдзе часіна,
Калі ўсё пераменіць;
І тады справядлівасць
Нарэшце запануе на зямлі!`,
    },
    // Змітрок Бядуля
    {
      title: "Зямля",
      slug: "zyamlya-biadula",
      authorId: biadula?.id!,
      categoryId: civilCat?.id!,
      year: 1914,
      description: "Верш пра святую сувязь чалавека з зямлёй.",
      content: `Зямля мая! Ты — маці для мяне,
Ты — хлеб і соль, ты — сіла і жыццё;
Я выйшаў з цябе, да цябе вярнуся,
Бо ты — маё пачатак і канец.

Зямля мая! Я ўпаў табе ў калені,
Я цалую тваю сырую твар;
Ты даеш мне ўсё, чаго патрэбна,
Ты — мой скарб найбольшы, мой алтар.

Зямля мая беларуская, родная,
Я табе клянуся ў вечнай любві;
І няхай мой попел тут застанецца,
Калі скончацца мае зямныя дні.`,
    },
    {
      title: "Сялянка",
      slug: "syalyanka",
      authorId: biadula?.id!,
      categoryId: loveCat?.id!,
      year: 1910,
      description: "Лірычны верш пра сялянскую дзяўчыну.",
      content: `Ідзе яна праз поле,
Нясе вады вядро;
Касынка на галоўцы,
А вочы — як віно.

Вясёлая, жартлівая,
Спявае уголас песню;
Ніхто не ведае, што ў сэрцы
Жыве каханне чыстае.

Сялянка маладая,
Красуня з палявых даляў,
Ты — цвет майго народа,
Ты — радасць гэтых краёў!`,
    },
    // Дадатковыя вершы
    {
      title: "Зімовы вечар",
      slug: "zimovy-vechar",
      authorId: yakubKolas?.id!,
      categoryId: natureCat?.id!,
      year: 1912,
      description: "Пейзажная замалёўка зімовага вечара ў беларускай вёсцы.",
      videoUrl:
        "/invideo-ai-720 Маразь, зоркі і коні_ «Зімой» за 90 секу 2026-01-25.mp4",
      content: `Ціха ў полі, ціха ў лесе,
Сонца скрылася за бор;
Снег ляжыць на ўсім прасторы,
Белы, чысты, нібы двор.

Месяц выплыў з-за хмурынак,
Зіхаціць на белым снезе;
І здаецца, што прырода
Спіць у ціхім зімнім сне.

Дым ідзе з сялянскіх хатак,
Печы грэюць у хатах;
А на вуліцы — маразы,
Скрыпіць снег пад нагамі.`,
    },
    {
      title: "Вясновая раніца",
      slug: "vyasnovaya-ranitsa",
      authorId: yankaKupala?.id!,
      categoryId: natureCat?.id!,
      year: 1908,
      description: "Светлы, радасны верш пра абуджэнне прыроды вясной.",
      content: `Сонца ўстала, заззяла,
Асвятліла ўвесь наш край;
Птушкі песні заспявалі:
"Добрай раніцы! Вітай!"

Зацвіла вясна-красуня,
Зелянеюць лес і гай;
І здаецца: уся прырода
Запрашае: "У свет ступай!"

Ранак светлы, ранак ясны,
Ранак поўны прыгажосці;
І ўсё жыве, і ўсё дыхае
Радасцю і маладосцю!`,
    },
    {
      title: "Восеньскі матыў",
      slug: "vosenski-matyv",
      authorId: maksimBahdanovich?.id!,
      categoryId: natureCat?.id!,
      year: 1911,
      description: "Элегічны верш пра восень, яе прыгажосць і суму.",
      content: `Восень прыйшла залатая,
Лісце жаўцее і падае;
Сонца ўжо не так грэе,
Ветрык халодны гуляе.

Птушкі ляцяць у выр,
Крычаць нешта адно;
Прырода рыхтуецца спаць,
Да зімы ўжо нядоўга.

Восень — пара задумення,
Пара развітання з летам;
Але і ў восені ёсць
Свая незвычайная краса.`,
    },
    {
      title: "Летняя ноч",
      slug: "letnyaya-noch",
      authorId: tsiotka?.id!,
      categoryId: natureCat?.id!,
      year: 1905,
      description: "Рамантычны верш пра чароўную летнюю ноч.",
      content: `Ноч летняя, цёплая, ціхая,
Зоркі мігцяць у небе;
Месяц плыве паволі
Над соннаю зямлёю.

Пахне травой і кветкамі,
Цвыркуны спяваюць у полі;
І здаецца, што ўвесь свет
Спіць у чароўным спакоі.

Ноч летняя — час для мараў,
Для цудаў і казак прыгожых;
Ноч летняя — час кахання
І спадзяванняў тых даўніх.`,
    },
    {
      title: "Кветка папараці",
      slug: "kvetka-paparaci",
      authorId: petrusBrouka?.id!,
      categoryId: philCat?.id!,
      year: 1952,
      description: "Легендарны верш пра казачную кветку папараці.",
      content: `У ноч Купалля, у пушчы цёмнай,
Дзе кожны гук таямніцай поўны,
Цвіце кветка — цуд прыроды,
Якую бачаць толькі ў гэту ноч.

Хто знойдзе кветку папараці,
Таму адкрыюцца скарбы зямлі;
Але знайсці яе — нялёгка,
Бо злыя сілы ахраняюць яе.

Шукай, шукай кветку шчасця,
Ідзі праз цемру і страх;
І верай, што знойдзеш яе,
Калі сэрца тваё чыстае.`,
    },
    {
      title: "На Нёмане",
      slug: "na-nyomane",
      authorId: arkadzKuliashou?.id!,
      categoryId: natureCat?.id!,
      year: 1958,
      description: "Пейзажны верш пра Нёман — галоўную раку Беларусі.",
      content: `Нёман цячэ паміж берагамі,
Шырокі, спакойны, магутны;
Ён нясе свае воды ў мора,
Як несці іх звык спрадвеку.

На берагах яго — гарады і вёскі,
Лясы і лугі зялёныя;
Нёман — сведка нашай гісторыі,
Нёман — сімвал нашай зямлі.

Колькі песень складзена пра цябе,
Колькі легенд расказана!
Нёман, Нёман, рака-бацька,
Ты — душа Беларусі!`,
    },
    {
      title: "Сонечны дзень",
      slug: "sonechny-dzen",
      authorId: maksimTank?.id!,
      categoryId: natureCat?.id!,
      year: 1965,
      description:
        "Светлы, аптымістычны верш пра прыгажосць звычайнага сонечнага дня.",
      content: `Сонечны дзень! Як прыгожа ўсё навокал!
Неба блакітнае, чыстае, ясное;
Птушкі спяваюць, кветкі цвітуць,
І на душы так светла і радасна!

Сонечны дзень — гэта дар ад Бога,
Гэта шчасце, якое не трэба шукаць;
Проста выйдзі на вуліцу, у поле,
І радуйся жыццю, якое вакол!

Сонечны дзень! Я люблю цябе,
Як любіць дзіця сваю маму;
Ты даеш мне сілы жыць,
Ты даеш мне веру ў заўтра!`,
    },
    {
      title: "Матчына хата",
      slug: "matchyna-khata",
      authorId: ryhorBaradulin?.id!,
      categoryId: civilCat?.id!,
      year: 1978,
      description: "Ностальгічны верш пра родны дом, пра маці.",
      content: `Матчына хата — святыня мая,
Там я радзіўся, там вырас;
Там першы раз усміхнуўся,
Там першае слова сказаў.

Матчына хата — мой прытулак,
Куды вяртаюся я заўжды;
Там чакае мяне маці,
Там цёплы хлеб на стале.

Матчына хата — мой скарб,
Якога не знойдзеш нідзе;
І пакуль яна стаіць на зямлі,
Я ведаю: ёсць у мяне Радзіма!`,
    },
    {
      title: "Дзед і ўнук",
      slug: "dzed-i-unuk",
      authorId: nilHilevich?.id!,
      categoryId: philCat?.id!,
      year: 1990,
      description: "Верш пра сувязь пакаленняў.",
      content: `Сядзіць стары дзед на лаўцы,
А побач — унук малы;
І дзед расказвае казку
Пра даўнія часы.

Пра тое, як жылі продкі,
Як працавалі і любілі;
Пра тое, як берагліі мову,
Як волю сваю цанілі.

Унук слухае ўважліва,
Усё хоча запомніць ён;
Бо ведае: гэта спадчына,
Якую трэба перадаць далей.`,
    },
    {
      title: "Беларускі арнамент",
      slug: "belaruski-arnament",
      authorId: karatkevich?.id!,
      categoryId: civilCat?.id!,
      year: 1970,
      description: "Верш пра нацыянальны арнамент.",
      content: `На ручніках, на кашулях, на поясах
Жыве арнамент — памяць вякоў;
У кожнай рысачцы — мудрасць народа,
У кожным узоры — гісторыя продкаў.

Чырвонае і белае — колеры нашы,
Колеры сонца і чысціні;
Гэта — код нашай культуры,
Гэта — знак нашай зямлі.

Беларускі арнамент — скарб нацыі,
Яго трэба ведаць і шанаваць;
Бо ў ім — душа Беларусі,
Якую ніколі не страціць нам!`,
    },
    {
      title: "Наша ніва",
      slug: "nasha-niva",
      authorId: bahushevich?.id!,
      categoryId: civilCat?.id!,
      year: 1895,
      description: "Верш пра родную зямлю, пра ніву.",
      content: `Ніва наша — зямля матухны,
Ты — наш хлеб, ты — наша доля;
На табе — наш пот і слёзы,
На табе — наша праца і воля.

Ніва наша — золата жытняе,
Калоссе хіліцца да зямлі;
І мы, як тое калоссе,
Да роднай зямлі прыпадаем.

Ніва наша — наша спадчына,
Якую трэба берагчы;
Бо пакуль мы маем ніву,
Мы маем права жыць!`,
    },
    {
      title: "У пушчы",
      slug: "u-pushchy",
      authorId: biadula?.id!,
      categoryId: natureCat?.id!,
      year: 1912,
      description: "Пейзажны верш пра беларускую пушчу.",
      content: `У пушчы цёмнай, дрымучай,
Дзе сонца рэдка глядзіць,
Жыве душа народа,
Там казкі і легенды спяць.

Вялізныя дубы стаяць,
Як волаты стагоддзяў;
Яны памятаюць усё,
Што было на гэтай зямлі.

У пушчы — звяры дзікія,
У пушчы — птушкі спяваюць;
У пушчы — дух Беларусі,
Якога ніхто не пераможа!`,
    },
    {
      title: "Песня пра волю",
      slug: "pesnya-pra-volyu",
      authorId: yankaKupala?.id!,
      categoryId: civilCat?.id!,
      year: 1907,
      description: "Рэвалюцыйны верш-заклік да барацьбы за свабоду.",
      content: `Воля! Воля! Святое слова!
Ты — мара ўсіх пакаленняў;
За цябе продкі нашы гінулі,
За цябе мы гатовы паўстаць!

Воля — гэта права на мову,
Воля — гэта права на зямлю;
Воля — гэта жыць, як хочаш,
А не так, як хтосьці скажа.

Хай жыве воля! Хай гіне няволя!
Мы ідзём да святла з цемры;
І ніхто не спыніць нас на шляху,
Бо воля — наша мэта і сэнс!`,
    },
    {
      title: "Любоў",
      slug: "lyubou-bahdanovich",
      authorId: maksimBahdanovich?.id!,
      categoryId: loveCat?.id!,
      year: 1912,
      description: "Пяшчотны верш пра каханне.",
      content: `Любоў — гэта кветка ў сэрцы,
Якая цвіце без вады;
Любоў — гэта зорка на небе,
Якая свеціць праз гады.

Любоў — гэта цуд, гэта таямніца,
Якую не растлумачыць словам;
Яна прыходзіць ціха, нечакана,
І робіць жыццё цалкам новым.

Любоў — гэта ўсё, чым жыву я,
Любоў — гэта сэнс майго быцця;
Без яе — я пусты і адзінокі,
З ёй — я багаты на ўсё жыццё!`,
    },
    {
      title: "Вечар на возеры",
      slug: "vechar-na-vozery",
      authorId: yakubKolas?.id!,
      categoryId: natureCat?.id!,
      year: 1915,
      description: "Ідылічная карціна вечара на беларускім возеры.",
      content: `Вечар. Возера спіць у ціхім спакоі,
Нібы люстэрка — гладкая вада;
Адбіваецца ў ёй неба вячэрняе,
І зоркі, і месяц малады.

На беразе — верба схілілася,
Нібы хоча напіцца вады;
А здалёк даносіцца песня,
То пастух вяртаецца з чарады.

Вечар на возеры — час для мары,
Для спакою душы і цела;
Тут, дзе прырода такая чароўная,
Сэрца маё прыстанішча знайшло.`,
    },
    {
      title: "Дзень Незалежнасці",
      slug: "dzen-nezalezhnastsi",
      authorId: nilHilevich?.id!,
      categoryId: civilCat?.id!,
      year: 1991,
      description: "Верш, прысвечаны абвяшчэнню незалежнасці Беларусі.",
      content: `Гэты дзень мы чакалі стагоддзі,
Гэты дзень — наша агульная мара;
Беларусь свабодная ўстала,
І над ёю — свой сцяг, свая хвала!

Незалежнасць — гэта адказнасць,
Гэта права самім вырашаць;
Незалежнасць — гэта наша годнасць,
Нашу долю ніхто не адбярэ!

Хай жыве Беларусь незалежная!
Хай гучыць наша мова і песня!
Мы — гаспадары сваёй зямлі,
Мы — свабодны народ нарэшце!`,
    },
    {
      title: "Матуля",
      slug: "matulya",
      authorId: petrusBrouka?.id!,
      categoryId: loveCat?.id!,
      year: 1948,
      description: "Пяшчотны верш пра маці.",
      content: `Матуля мая, матуля родная,
Як многа цябе я люблю!
Ты — сонца маё, ты — зорка ясная,
Табе сваё сэрца аддаю.

Ты вучыла мяне хадзіць і гаварыць,
Ты абараняла ад бяды;
Ты — мой ангел-ахоўнік на зямлі,
Я дзякую за ўсё табе.

Матуля мая, хай Бог цябе беражэ,
Хай доўга ты жывеш на свеце;
Бо для мяне няма нікога даражэй,
Чым ты, матуля, — маё святло!`,
    },
    {
      title: "Заход сонца",
      slug: "zakhod-sontsa",
      authorId: maksimTank?.id!,
      categoryId: natureCat?.id!,
      year: 1955,
      description: "Медытатыўны верш пра заход сонца.",
      content: `Заход сонца — час пераходу,
Калі дзень саступае ночы;
Неба гарыць чырвоным і залатым,
Нібы агонь палае ў вышыні.

Заход сонца — час развітання,
Час для думак і ўспамінаў;
Гэта момант, калі час спыняецца,
І душа нібы ляціць да зор.

Заход сонца — абяцанне заўтра,
Бо за ноччу прыйдзе новы дзень;
І сонца зноў узыйдзе на небе,
Каб асвятліць наш родны край.`,
    },
    {
      title: "Пралеска",
      slug: "praleska",
      authorId: ryhorBaradulin?.id!,
      categoryId: natureCat?.id!,
      year: 1972,
      description: "Ніжны верш пра пралеску — першую вясновую кветку Беларусі.",
      content: `Пралеска — вестунка вясны,
Блакітная кветка ў лесе;
Яна прабіваецца праз снег,
Каб сказаць: "Вясна ідзе!"

Такая маленькая, такая пяшчотная,
Але такая смелая і ўпартая;
Яна не баіцца холаду і ветру,
Яна верыць у цяпло і святло.

Пралеска — сімвал Беларусі,
Сімвал нашай моцы і красы;
Як яна — мы прабіваемся да сонца,
Як яна — мы верым у лепшы час.`,
    },
    {
      title: "Белавежская пушча",
      slug: "belavezhskaya-pushcha",
      authorId: karatkevich?.id!,
      categoryId: natureCat?.id!,
      year: 1968,
      description: "Верш пра легендарную Белавежскую пушчу.",
      content: `Белавежская пушча — скарб Еўропы,
Апошні асколак першабытных лясоў;
Тут жывуць зубры — велічныя звяры,
Тут гісторыя дыхае з усіх бакоў.

Вялізныя дубы памятаюць князёў,
Што палявалі ў гэтых нетрах;
Яны бачылі войны і мір,
Яны — сведкі мінулых стагоддзяў.

Белавежская пушча — гонар Беларусі,
Яе трэба беражы як зрэнку вока;
Бо калі страцім яе — страцім сябе,
Страцім сувязь з прыродай назаўжды.`,
    },
    {
      title: "Вясёлка",
      slug: "vyasyolka",
      authorId: biadula?.id!,
      categoryId: natureCat?.id!,
      year: 1916,
      description: "Радасны верш пра вясёлку.",
      content: `Пасля дажджу на небе — вясёлка!
Сем колераў ззяюць угары;
Гэта мост паміж небам і зямлёй,
Гэта цуд, які не паўтарыцца!

Чырвоны, аранжавы, жоўты,
Зялёны, блакітны, сіні, фіялетавы —
Усе колеры свету ў адным абразе,
Нібы Бог намаляваў карціну!

Вясёлка — знак надзеі,
Знак таго, што буры мінуць;
Пасля цемры заўжды прыходзіць святло,
Пасля слёз — усмешка і радасць!`,
    },
    {
      title: "Калядная ноч",
      slug: "kalyadnaya-noch",
      authorId: tsiotka?.id!,
      categoryId: philCat?.id!,
      year: 1904,
      description: "Святочны верш пра калядную ноч.",
      content: `Калядная ноч — ноч чараўніцтва,
Калі збываюцца ўсе мары;
Зоркі ззяюць ярчэй за звычай,
І анёлы спускаюцца з неба.

У хатах — цяпло і ўтульнасць,
Стол накрыты, свечка гарыць;
Сям'я збіраецца разам,
Каб сустрэць Святую Ноч.

Калядная ноч — час для добрых спраў,
Час для любові і міру;
Хай у кожны дом прыйдзе шчасце,
Хай збудуцца ўсе надзеі!`,
    },
  ];

  const extraPoemsData = buildExtraPoems(authorRefs, {
      loveCat: loveCat!,
      civilCat: civilCat!,
      natureCat: natureCat!,
      philCat: philCat!,
      classCat: classCat!,
    },
  );

  const obscurePoemsData = buildObscurePoems(authorRefs, {
    loveCat: loveCat!,
    civilCat: civilCat!,
    natureCat: natureCat!,
    philCat: philCat!,
    classCat: classCat!,
  });

  const allPoemsData = [...poemsData, ...extraPoemsData, ...obscurePoemsData];

  // Создаем стихи
  for (const poemData of allPoemsData) {
    const { categoryId, ...rest } = poemData;
    await prisma.poem.upsert({
      where: { slug: poemData.slug },
      update: {
        ...rest,
        categories: {
          set: [{ id: categoryId }],
        },
      },
      create: {
        ...rest,
        categories: {
          connect: [{ id: categoryId }],
        },
      },
    });
  }

  console.log(`✅ Created ${allPoemsData.length} Belarusian poems`);

  // ============ ПРАЗДНИКИ ============
  // Функция для получения изображения по сезону
  function getSeasonImage(month: number): string {
    if (month === 12 || month === 1 || month === 2)
      return "/images/seasons/winter.jpg";
    if (month >= 3 && month <= 5) return "/images/seasons/spring.jpg";
    if (month >= 6 && month <= 8) return "/images/seasons/summer.jpg";
    return "/images/seasons/autumn.jpg";
  }

  // Описания праздников
  const holidayDescriptions: Record<string, string> = {
    Каляды:
      "Свята нараджэння Хрыста, якое адзначаецца 25 снежня. Традыцыйнае беларускае свята з каляднымі песнямі, віншаваннямі і багатым сталом.",
    "Новы год":
      "Пачатак новага года, сустракаецца ў ноч з 31 снежня на 1 студзеня. Свята надзеі і новых пачаткаў.",
    Раство:
      "Хрысціянскае свята нараджэння Ісуса Хрыста, адзначаецца 7 студзеня па юліянскім календары.",
    "Шчодры вечар":
      "Вечар перад Старым Новым годам (13 студзеня), калі гатуюць шчодрую вячэру і віншуюць адзін аднаго.",
    "Стары Новы год":
      "Свята, якое адзначаецца ў ноч з 13 на 14 студзеня паводле юліянскага календара. Захавалася як традыцыйнае свята.",
    Вадохрышча:
      "Хрысціянскае свята Богаяўлення, адзначаецца 19 студзеня. Свята асвячэння вады і купання ў прарубі.",
    "Дзень беларускай навукі":
      "Свята, прысвечанае дасягненням беларускіх навукоўцаў. Адзначаецца 25 студзеня.",
    Грамніцы:
      "Свята Стрэчання Гасподняга, адзначаецца 2 лютага. Традыцыйна асвячаюць свечкі (грамніцы).",
    "Дзень памяці воінаў":
      "Дзень памяці воінаў-інтэрнацыяналістаў, якія загінулі ў Афганістане. Адзначаецца 15 лютага.",
    "Дзень роднай мовы":
      "Свята беларускай мовы і культуры, адзначаецца 21 лютага. Прысвечана захаванню і развіццю роднай мовы.",
    "Дзень абаронцаў Айчыны":
      "Свята ў гонар абаронцаў Радзімы, адзначаецца 23 лютага.",
    "Дзень Канстытуцыі":
      "Дзень прыняцця Канстытуцыі Рэспублікі Беларусь, адзначаецца 15 сакавіка.",
    "Сусветны дзень паэзіі":
      "Свята паэтаў і паэзіі ва ўсім свеце, адзначаецца 21 сакавіка.",
    "Дзень яднання народаў":
      "Дзень яднання народаў Беларусі і Расіі, адзначаецца 2 красавіка.",
    Радаўніца:
      "Помніцкі дзень, калі наведваюць магілы продкаў. Адзначаецца на 9-ы дзень пасля Вялікадня.",
    "Дзень Незалежнасці":
      "Галоўнае дзяржаўнае свята Беларусі, адзначаецца 3 ліпеня ў гонар вызвалення Мінска ад нямецкіх захопнікаў.",
    "Купалле / Дзень нараджэння Янкі Купалы":
      "Народнае свята Купалле, якое супадае з днём нараджэння Янкі Купалы (7 ліпеня). Свята летняга сонцастаяння.",
    "Дзень беларускага пісьменства":
      "Свята, прысвечанае беларускай пісьменнасці і культуры, адзначаецца 1 верасня.",
    "Дзень нараджэння Максіма Танка":
      "Дзень нараджэння класіка беларускай літаратуры Максіма Танка (17 верасня).",
    "Дзень нараджэння Якуба Коласа":
      "Дзень нараджэння класіка беларускай літаратуры Якуба Коласа (3 лістапада).",
  };

  const holidaysData = [
    // Зима
    {
      day: 25,
      month: 12,
      name: "Каляды",
      poems: ["Ave Maria", "Звон кафедры"],
      image: getSeasonImage(12),
      description: holidayDescriptions["Каляды"],
    },
    {
      day: 1,
      month: 1,
      name: "Новы год",
      poems: ["Дзед Мароз"],
      image: getSeasonImage(1),
      description: holidayDescriptions["Новы год"],
    },
    {
      day: 7,
      month: 1,
      name: "Раство",
      poems: ["Ave Maria", "Звон кафедры"],
      image: getSeasonImage(1),
      description: holidayDescriptions["Раство"],
    },
    {
      day: 13,
      month: 1,
      name: "Шчодры вечар",
      poems: ["Маразь, зоркі і коні"],
      image: getSeasonImage(1),
      description: holidayDescriptions["Шчодры вечар"],
    },
    {
      day: 14,
      month: 1,
      name: "Стары Новы год",
      poems: ["Маразь, зоркі і коні"],
      image: getSeasonImage(1),
      description: holidayDescriptions["Стары Новы год"],
    },
    {
      day: 19,
      month: 1,
      name: "Вадохрышча",
      poems: ["Калі рака шэпча"],
      image: getSeasonImage(1),
      description: holidayDescriptions["Вадохрышча"],
    },
    {
      day: 25,
      month: 1,
      name: "Дзень беларускай навукі",
      poems: ["Чыстая лірыка"],
      image: getSeasonImage(1),
      description: holidayDescriptions["Дзень беларускай навукі"],
    },
    {
      day: 2,
      month: 2,
      name: "Грамніцы",
      poems: ["Зіма", "Маразь"],
      image: getSeasonImage(2),
      description: holidayDescriptions["Грамніцы"],
    },
    {
      day: 15,
      month: 2,
      name: "Дзень памяці воінаў",
      poems: ["Будзь цвёрды"],
      image: getSeasonImage(2),
      description: holidayDescriptions["Дзень памяці воінаў"],
    },
    {
      day: 21,
      month: 2,
      name: "Дзень роднай мовы",
      poems: ["А хто там ідзе", "Родная мова"],
      image: getSeasonImage(2),
      description: holidayDescriptions["Дзень роднай мовы"],
    },
    {
      day: 23,
      month: 2,
      name: "Дзень абаронцаў Айчыны",
      poems: ["Будзь цвёрды"],
      image: getSeasonImage(2),
      description: holidayDescriptions["Дзень абаронцаў Айчыны"],
    },
    // Вясна
    {
      day: 15,
      month: 3,
      name: "Дзень Канстытуцыі",
      poems: ["А хто там ідзе"],
      image: getSeasonImage(3),
      description: holidayDescriptions["Дзень Канстытуцыі"],
    },
    {
      day: 21,
      month: 3,
      name: "Сусветны дзень паэзіі",
      poems: ["Чыстая лірыка", "Маладыя гады"],
      image: getSeasonImage(3),
      description: holidayDescriptions["Сусветны дзень паэзіі"],
    },
    {
      day: 2,
      month: 4,
      name: "Дзень яднання народаў",
      poems: ["Родная мова"],
      image: getSeasonImage(4),
      description: holidayDescriptions["Дзень яднання народаў"],
    },
    {
      day: 7,
      month: 5,
      name: "Радаўніца",
      poems: ["Звон кафедры", "Памяць"],
      image: getSeasonImage(5),
      description: holidayDescriptions["Радаўніца"],
    },
    // Лета
    {
      day: 3,
      month: 7,
      name: "Дзень Незалежнасці",
      poems: ["А хто там ідзе", "Спадчына"],
      image: getSeasonImage(7),
      description: holidayDescriptions["Дзень Незалежнасці"],
    },
    {
      day: 7,
      month: 7,
      name: "Купалле / Дзень нараджэння Янкі Купалы",
      poems: ["Гукі Купалы", "А хто там ідзе"],
      image: getSeasonImage(7),
      description:
        holidayDescriptions["Купалле / Дзень нараджэння Янкі Купалы"],
    },
    // Восень
    {
      day: 1,
      month: 9,
      name: "Дзень беларускага пісьменства",
      poems: ["Родная мова", "Спадчына"],
      image: getSeasonImage(9),
      description: holidayDescriptions["Дзень беларускага пісьменства"],
    },
    {
      day: 17,
      month: 9,
      name: "Дзень нараджэння Максіма Танка",
      poems: ["Горкі, салодкі хлеб"],
      image: getSeasonImage(9),
      description: holidayDescriptions["Дзень нараджэння Максіма Танка"],
    },
    {
      day: 3,
      month: 11,
      name: "Дзень нараджэння Якуба Коласа",
      poems: ["Вы пачуеце Коласа", "Дзед Мароз"],
      image: getSeasonImage(11),
      description: holidayDescriptions["Дзень нараджэння Якуба Коласа"],
    },
    ...extraLiteraryEvents.map((event) => ({
      day: event.day,
      month: event.month,
      name: event.name,
      poems: event.poems,
      image: getSeasonImage(event.month),
      description: event.description,
    })),
  ];

  // Функция для создания slug из названия
  function createSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-zа-яёўі0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[ё]/g, "yo")
      .replace(/[ў]/g, "w")
      .replace(/[і]/g, "i")
      .replace(/[а-я]/g, (char) => {
        const mapping: Record<string, string> = {
          а: "a",
          б: "b",
          в: "v",
          г: "h",
          д: "d",
          е: "e",
          ж: "zh",
          з: "z",
          і: "i",
          й: "j",
          к: "k",
          л: "l",
          м: "m",
          н: "n",
          о: "o",
          п: "p",
          р: "r",
          с: "s",
          т: "t",
          у: "u",
          ф: "f",
          х: "kh",
          ц: "ts",
          ч: "ch",
          ш: "sh",
          ы: "y",
          ь: "",
          э: "e",
          ю: "yu",
          я: "ya",
        };
        return mapping[char] || char;
      })
      .replace(/--+/g, "-")
      .replace(/^-|-$/g, "");
  }

  // Определение сезона по месяцу
  function getSeason(month: number): Season {
    if (month === 12 || month === 1 || month === 2) return Season.WINTER;
    if (month >= 3 && month <= 5) return Season.SPRING;
    if (month >= 6 && month <= 8) return Season.SUMMER;
    return Season.AUTUMN;
  }

  // Создаем праздники и связываем со стихами
  for (const holidayData of holidaysData) {
    const slug = createSlug(holidayData.name);
    const season = getSeason(holidayData.month);

    // Находим стихи по названиям
    const poemSlugs = holidayData.poems
      .map((poemTitle) => {
        // Сопоставление названий стихов с slug из poemsData
        const found = poemsData.find((p) => p.title === poemTitle);
        return found ? found.slug : null;
      })
      .filter(Boolean) as string[];

    const poems = await prisma.poem.findMany({
      where: { slug: { in: poemSlugs } },
    });

    const holiday = await prisma.holiday.upsert({
      where: { slug },
      update: {
        name: holidayData.name,
        day: holidayData.day,
        month: holidayData.month,
        season,
        image: holidayData.image,
        description: holidayData.description,
        poems: {
          set: poems.map((p) => ({ id: p.id })),
        },
      },
      create: {
        name: holidayData.name,
        slug,
        day: holidayData.day,
        month: holidayData.month,
        season,
        image: holidayData.image,
        description: holidayData.description,
        poems: {
          connect: poems.map((p) => ({ id: p.id })),
        },
      },
    });
    console.log(
      `✅ Created holiday: ${holiday.name} (${holiday.day}.${holiday.month})`,
    );
  }

  console.log("✅ Created holidays");

  // Создаем слайды для сезонов
  const seasonSlidesData = [
    {
      title: "Зіма",
      subtitle: "Снежныя дні",
      season: Season.WINTER,
      imageUrl:
        "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?auto=format&fit=crop&w=1600&q=80",
      altText: "Зімовы лес",
      order: 1,
      isActive: true,
    },
    {
      title: "Зіма",
      subtitle: "Мароз і зоркі",
      season: Season.WINTER,
      imageUrl:
        "https://images.unsplash.com/photo-1418988791264-47d7891392f8?auto=format&fit=crop&w=1600&q=80",
      altText: "Зімовая ноч",
      order: 2,
      isActive: true,
    },
    {
      title: "Вясна",
      subtitle: "Цвіценне",
      season: Season.SPRING,
      imageUrl:
        "https://images.unsplash.com/photo-1490750967868-88ea4486c946?auto=format&fit=crop&w=1600&q=80",
      altText: "Вясновы сад",
      order: 1,
      isActive: true,
    },
    {
      title: "Вясна",
      subtitle: "Першыя кветкі",
      season: Season.SPRING,
      imageUrl:
        "https://images.unsplash.com/photo-1464226184664-7df2a993a3f6?auto=format&fit=crop&w=1600&q=80",
      altText: "Вясновае поле",
      order: 2,
      isActive: true,
    },
    {
      title: "Лета",
      subtitle: "Сонечныя дні",
      season: Season.SUMMER,
      imageUrl:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
      altText: "Летні горы",
      order: 1,
      isActive: true,
    },
    {
      title: "Лета",
      subtitle: "Зялёныя паля",
      season: Season.SUMMER,
      imageUrl:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
      altText: "Летні ландшафт",
      order: 2,
      isActive: true,
    },
    {
      title: "Восень",
      subtitle: "Ліста-пад",
      season: Season.AUTUMN,
      imageUrl:
        "https://images.unsplash.com/photo-1476820865390-c52a945d6d60?auto=format&fit=crop&w=1600&q=80",
      altText: "Восеньскі лес",
      order: 1,
      isActive: true,
    },
    {
      title: "Восень",
      subtitle: "Залатыя дрэвы",
      season: Season.AUTUMN,
      imageUrl:
        "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1600&q=80",
      altText: "Восень у лесе",
      order: 2,
      isActive: true,
    },
    {
      title: "Восень",
      subtitle: "Туман і паля",
      season: Season.AUTUMN,
      imageUrl:
        "https://images.unsplash.com/photo-1441974231530-c3367d5b9a15?auto=format&fit=crop&w=1600&q=80",
      altText: "Восеньскі шлях",
      order: 3,
      isActive: true,
    },
  ];

  for (const slideData of seasonSlidesData) {
    await prisma.seasonSlide.upsert({
      where: {
        season_order: {
          season: slideData.season,
          order: slideData.order,
        },
      },
      update: slideData,
      create: slideData,
    });
  }

  console.log("✅ Created season slides");

  // ============ КВИЗЫ ============
  await resetQuizzes(prisma);

  // Квиз 1: MATCH — Аўтар і твор
  const quiz1 = await prisma.quiz.create({
    data: {
      title: "Аўтар і твор",
      description: "Спалучы аўтара з яго творам",
      icon: "✍️",
      color: "#FF6B6B",
      imageUrl: "/images/quizzes/author-work.jpg",
      questions: {
        create: [
          {
            text: "Знайдзі аўтараў класічных твораў",
            type: "MATCH",
            zones: {
              create: [
                { content: "А хто там ідзе?", order: 0 },
                { content: "Мой родны кут", order: 1 },
                { content: "Слуцкія ткачыхі", order: 2 },
                { content: "Каласы пад сярпом тваім", order: 3 },
              ],
            },
            items: {
              create: [
                { content: "Янка Купала", order: 0 },
                { content: "Якуб Колас", order: 1 },
                { content: "Максім Багдановіч", order: 2 },
                { content: "Уладзімір Караткевіч", order: 3 },
              ],
            },
          },
          {
            text: "Спалучы паэму з яе аўтарам",
            type: "MATCH",
            zones: {
              create: [
                { content: "Новая зямля", order: 0 },
                { content: "Паўлінка", order: 1 },
                { content: "Дзікае паляванне караля Стаха", order: 2 },
                { content: "Тарас на Парнасе", order: 3 },
              ],
            },
            items: {
              create: [
                { content: "Якуб Колас", order: 0 },
                { content: "Янка Купала", order: 1 },
                { content: "Уладзімір Караткевіч", order: 2 },
                { content: "Канстанцін Вераніцын", order: 3 },
              ],
            },
          },
          {
            text: "Хто напісаў гэтыя вершы?",
            type: "MATCH",
            zones: {
              create: [
                { content: "Зорка Венера", order: 0 },
                { content: "Спадчына", order: 1 },
                { content: "Жураўлі на Палессе ляцяць", order: 2 },
                { content: "Два званы", order: 3 },
              ],
            },
            items: {
              create: [
                { content: "Максім Багдановіч", order: 0 },
                { content: "Янка Купала", order: 1 },
                { content: "Аркадзь Куляшоў", order: 2 },
                { content: "Уладзімір Караткевіч", order: 3 },
              ],
            },
          },
          {
            text: "Знайдзі аўтараў раманаў",
            type: "MATCH",
            zones: {
              create: [
                { content: "Дзікае паляванне караля Стаха", order: 0 },
                { content: "Людзі на балоце", order: 1 },
                { content: "На ростанях", order: 2 },
                { content: "Сэрца на далоні", order: 3 },
              ],
            },
            items: {
              create: [
                { content: "Уладзімір Караткевіч", order: 0 },
                { content: "Іван Мележ", order: 1 },
                { content: "Якуб Колас", order: 2 },
                { content: "Іван Шамякін", order: 3 },
              ],
            },
          },
          {
            text: "Спалучы п'есу з драматургам",
            type: "MATCH",
            zones: {
              create: [
                { content: "Паўлінка", order: 0 },
                { content: "Пінская шляхта", order: 1 },
                { content: "На ростанях", order: 2 },
                { content: "Трыбунал", order: 3 },
              ],
            },
            items: {
              create: [
                { content: "Янка Купала", order: 0 },
                { content: "Вінцэнт Дунін-Марцінкевіч", order: 1 },
                { content: "Якуб Колас", order: 2 },
                { content: "Андрэй Макаёнак", order: 3 },
              ],
            },
          },
          {
            text: "Хто напісаў гэтыя зборнікі вершаў?",
            type: "MATCH",
            zones: {
              create: [
                { content: "Вянок", order: 0 },
                { content: "Жалейка", order: 1 },
                { content: "Песні жальбы", order: 2 },
                { content: "Дудка беларуская", order: 3 },
              ],
            },
            items: {
              create: [
                { content: "Максім Багдановіч", order: 0 },
                { content: "Янка Купала", order: 1 },
                { content: "Якуб Колас", order: 2 },
                { content: "Францішак Багушэвіч", order: 3 },
              ],
            },
          },
          {
            text: "Знайдзі аўтараў апавяданняў",
            type: "MATCH",
            zones: {
              create: [
                { content: "Цётка", order: 0 },
                { content: "Апошні", order: 1 },
                { content: "Салавей", order: 2 },
                { content: "Немаўля", order: 3 },
              ],
            },
            items: {
              create: [
                { content: "Алаіза Пашкевіч", order: 0 },
                { content: "Максім Гарэцкі", order: 1 },
                { content: "Змітрок Бядуля", order: 2 },
                { content: "Кузьма Чорны", order: 3 },
              ],
            },
          },
          {
            text: "Спалучы верш з паэтам",
            type: "MATCH",
            zones: {
              create: [
                { content: "Беларусам", order: 0 },
                { content: "Мая дарога", order: 1 },
                { content: "Спатканне", order: 2 },
                { content: "Радзіма", order: 3 },
              ],
            },
            items: {
              create: [
                { content: "Францішак Багушэвіч", order: 0 },
                { content: "Аркадзь Куляшоў", order: 1 },
                { content: "Максім Танк", order: 2 },
                { content: "Пятрусь Броўка", order: 3 },
              ],
            },
          },
          {
            text: "Хто аўтар гэтых твораў?",
            type: "MATCH",
            zones: {
              create: [
                { content: "Чырвоны ліхтарык", order: 0 },
                { content: "Маці", order: 1 },
                { content: "Сымон-музыка", order: 2 },
                { content: "Дзед і баба", order: 3 },
              ],
            },
            items: {
              create: [
                { content: "Рыгор Барадулін", order: 0 },
                { content: "Кузьма Чорны", order: 1 },
                { content: "Якуб Колас", order: 2 },
                { content: "Янка Сіпакоў", order: 3 },
              ],
            },
          },
          {
            text: "Знайдзі аўтараў паэм",
            type: "MATCH",
            zones: {
              create: [
                { content: "Сцяг брыгады", order: 0 },
                { content: "Хатынская аповесць", order: 1 },
                { content: "Могілкі", order: 2 },
                { content: "Адплата", order: 3 },
              ],
            },
            items: {
              create: [
                { content: "Аркадзь Куляшоў", order: 0 },
                { content: "Алесь Адамовіч", order: 1 },
                { content: "Янка Купала", order: 2 },
                { content: "Пімен Панчанка", order: 3 },
              ],
            },
          },
        ],
      },
    },
    include: {
      questions: { include: { items: true, zones: true } },
    },
  });

  // ItemZone для квиза 1 (MATCH: item[i] → zone[i])
  for (const question of quiz1.questions) {
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
  console.log("✅ Created quiz 1: Аўтар і твор (MATCH)");

  // Квиз 2: ORDER — Храналогія паэтаў
  const quiz2 = await prisma.quiz.create({
    data: {
      title: "Храналогія паэтаў",
      description: "Размесці паэтаў на шкале часу",
      icon: "📅",
      color: "#4ECDC4",
      imageUrl: "/images/quizzes/chronology.jpg",
      questions: {
        create: [
          {
            text: "Размесці класікаў на шкале часу",
            type: "ORDER",
            content: { timelineStart: 1840, timelineEnd: 1920 },
            items: {
              create: [
                {
                  content: "Францішак Багушэвіч",
                  order: 0,
                  year: 1840,
                  imageUrl: "/images/poets/bagushevich.jpg",
                  subtitle: "1840-1900",
                },
                {
                  content: "Янка Купала",
                  order: 1,
                  year: 1882,
                  imageUrl: "/images/poets/kupala.jpg",
                  subtitle: "1882-1942",
                },
                {
                  content: "Якуб Колас",
                  order: 2,
                  year: 1882,
                  imageUrl: "/images/poets/kolas.jpg",
                  subtitle: "1882-1956",
                },
                {
                  content: "Максім Багдановіч",
                  order: 3,
                  year: 1891,
                  imageUrl: "/images/poets/bagdanovich.jpg",
                  subtitle: "1891-1917",
                },
              ],
            },
          },
          {
            text: "Пакаленне паэтаў 20-х гадоў",
            type: "ORDER",
            content: { timelineStart: 1895, timelineEnd: 1920 },
            items: {
              create: [
                {
                  content: "Змітрок Бядуля",
                  order: 0,
                  year: 1886,
                  imageUrl: "/images/poets/byadulya.jpg",
                  subtitle: "1886-1941",
                },
                {
                  content: "Максім Гарэцкі",
                  order: 1,
                  year: 1893,
                  imageUrl: "/images/poets/garetski.jpg",
                  subtitle: "1893-1938",
                },
                {
                  content: "Кандрат Крапіва",
                  order: 2,
                  year: 1896,
                  imageUrl: "/images/poets/krapiva.jpg",
                  subtitle: "1896-1991",
                },
                {
                  content: "Кузьма Чорны",
                  order: 3,
                  year: 1900,
                  imageUrl: "/images/poets/chorny.jpg",
                  subtitle: "1900-1944",
                },
              ],
            },
          },
          {
            text: "Паэты-франтавікі",
            type: "ORDER",
            content: { timelineStart: 1905, timelineEnd: 1930 },
            items: {
              create: [
                {
                  content: "Пятрусь Броўка",
                  order: 0,
                  year: 1905,
                  imageUrl: "/images/poets/brouka.jpg",
                  subtitle: "1905-1980",
                },
                {
                  content: "Максім Танк",
                  order: 1,
                  year: 1912,
                  imageUrl: "/images/poets/tank.jpg",
                  subtitle: "1912-1995",
                },
                {
                  content: "Аркадзь Куляшоў",
                  order: 2,
                  year: 1914,
                  imageUrl: "/images/poets/kulyashou.jpg",
                  subtitle: "1914-1978",
                },
                {
                  content: "Пімен Панчанка",
                  order: 3,
                  year: 1917,
                  imageUrl: "/images/poets/panchanka.jpg",
                  subtitle: "1917-1995",
                },
              ],
            },
          },
          {
            text: "Пасляваенныя паэты",
            type: "ORDER",
            content: { timelineStart: 1920, timelineEnd: 1945 },
            items: {
              create: [
                {
                  content: "Васіль Быкаў",
                  order: 0,
                  year: 1924,
                  imageUrl: "/images/poets/bykau.jpg",
                  subtitle: "1924-2003",
                },
                {
                  content: "Іван Мележ",
                  order: 1,
                  year: 1921,
                  imageUrl: "/images/poets/melezh.jpg",
                  subtitle: "1921-1976",
                },
                {
                  content: "Уладзімір Караткевіч",
                  order: 2,
                  year: 1930,
                  imageUrl: "/images/poets/karatkevich.jpg",
                  subtitle: "1930-1984",
                },
                {
                  content: "Рыгор Барадулін",
                  order: 3,
                  year: 1935,
                  imageUrl: "/images/poets/baradulin.jpg",
                  subtitle: "1935-2014",
                },
              ],
            },
          },
          {
            text: "Шасцідзесятнікі",
            type: "ORDER",
            content: { timelineStart: 1930, timelineEnd: 1950 },
            items: {
              create: [
                {
                  content: "Анатоль Вярцінскі",
                  order: 0,
                  year: 1931,
                  imageUrl: "/images/poets/viartsinski.jpg",
                  subtitle: "1931-2012",
                },
                {
                  content: "Ніл Гілевіч",
                  order: 1,
                  year: 1931,
                  imageUrl: "/images/poets/gilevich.jpg",
                  subtitle: "1931-2016",
                },
                {
                  content: "Янка Сіпакоў",
                  order: 2,
                  year: 1936,
                  imageUrl: "/images/poets/sipakau.jpg",
                  subtitle: "1936-2011",
                },
                {
                  content: "Генадзь Бураўкін",
                  order: 3,
                  year: 1936,
                  imageUrl: "/images/poets/buraulkin.jpg",
                  subtitle: "1936-2014",
                },
              ],
            },
          },
          {
            text: "Пісьменнікі-празаікі",
            type: "ORDER",
            content: { timelineStart: 1920, timelineEnd: 1945 },
            items: {
              create: [
                {
                  content: "Янка Брыль",
                  order: 0,
                  year: 1917,
                  imageUrl: "/images/poets/bryl.jpg",
                  subtitle: "1917-2006",
                },
                {
                  content: "Іван Мележ",
                  order: 1,
                  year: 1921,
                  imageUrl: "/images/poets/melezh.jpg",
                  subtitle: "1921-1976",
                },
                {
                  content: "Іван Шамякін",
                  order: 2,
                  year: 1921,
                  imageUrl: "/images/poets/shamyakin.jpg",
                  subtitle: "1921-2004",
                },
                {
                  content: "Алесь Адамовіч",
                  order: 3,
                  year: 1927,
                  imageUrl: "/images/poets/adamovich.jpg",
                  subtitle: "1927-1994",
                },
              ],
            },
          },
          {
            text: "Жаночыя галасы беларускай паэзіі",
            type: "ORDER",
            content: { timelineStart: 1870, timelineEnd: 1950 },
            items: {
              create: [
                {
                  content: "Цётка",
                  order: 0,
                  year: 1876,
                  imageUrl: "/images/poets/tsiotka.jpg",
                  subtitle: "1876-1916",
                },
                {
                  content: "Канстанцыя Буйло",
                  order: 1,
                  year: 1893,
                  imageUrl: "/images/poets/builo.jpg",
                  subtitle: "1893-1986",
                },
                {
                  content: "Данута Бічэль",
                  order: 2,
                  year: 1938,
                  imageUrl: "/images/poets/bichel.jpg",
                  subtitle: "1938-н.ч.",
                },
                {
                  content: "Яўгенія Янішчыц",
                  order: 3,
                  year: 1948,
                  imageUrl: "/images/poets/yanishchyts.jpg",
                  subtitle: "1948-1988",
                },
              ],
            },
          },
          {
            text: "Сучасныя беларускія паэты",
            type: "ORDER",
            content: { timelineStart: 1945, timelineEnd: 1975 },
            items: {
              create: [
                {
                  content: "Уладзімір Някляеў",
                  order: 0,
                  year: 1946,
                  imageUrl: "/images/poets/nyaklyaeu.jpg",
                  subtitle: "1946-н.ч.",
                },
                {
                  content: "Леанід Дранько-Майсюк",
                  order: 1,
                  year: 1958,
                  imageUrl: "/images/poets/dranko.jpg",
                  subtitle: "1958-н.ч.",
                },
                {
                  content: "Андрэй Хадановіч",
                  order: 2,
                  year: 1973,
                  imageUrl: "/images/poets/khadanovich.jpg",
                  subtitle: "1973-н.ч.",
                },
                {
                  content: "Вальжына Морт",
                  order: 3,
                  year: 1981,
                  imageUrl: "/images/poets/mort.jpg",
                  subtitle: "1981-н.ч.",
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      questions: { include: { items: true } },
    },
  });
  console.log("✅ Created quiz 2: Храналогія паэтаў (ORDER)");

  // Квиз 3: FILL — Устаў пропушчанае слова
  const quiz3 = await prisma.quiz.create({
    data: {
      title: "Устаў пропушчанае слова",
      description: "Дапоўні радкі вядомых вершаў",
      icon: "📝",
      color: "#A78BFA",
      imageUrl: "/images/quizzes/fill-blank.jpg",
      questions: {
        create: [
          {
            text: "Янка Купала - 'А хто там ідзе?'",
            type: "FILL",
            content: { answers: ["ідзе", "нясуць", "звацца"] },
            zones: {
              create: [
                { content: "А хто там ___?", order: 0 },
                { content: "А што яны ___ на худых плячах?", order: 1 },
                { content: "Людзьмі ___ хочуць", order: 2 },
              ],
            },
            items: {
              create: [
                { content: "ідзе", order: 0 },
                { content: "нясуць", order: 1 },
                { content: "звацца", order: 2 },
              ],
            },
          },
          {
            text: "Якуб Колас - 'Мой родны кут'",
            type: "FILL",
            content: { answers: ["кут", "мілы", "ракой"] },
            zones: {
              create: [
                { content: "Мой родны ___", order: 0 },
                { content: "Як ___ мне тваіх лясоў", order: 1 },
                { content: "Над ___ шырокай", order: 2 },
              ],
            },
            items: {
              create: [
                { content: "кут", order: 0 },
                { content: "мілы", order: 1 },
                { content: "ракой", order: 2 },
              ],
            },
          },
          {
            text: "Максім Багдановіч - 'Слуцкія ткачыхі'",
            type: "FILL",
            content: { answers: ["ніў", "маладая", "роднага"] },
            zones: {
              create: [
                { content: "Ад родных ___ ткачыхі", order: 0 },
                { content: "І тчэ, забыўшыся, ___ рука", order: 1 },
                { content: "Цвяток ___ краю", order: 2 },
              ],
            },
            items: {
              create: [
                { content: "ніў", order: 0 },
                { content: "маладая", order: 1 },
                { content: "роднага", order: 2 },
              ],
            },
          },
          {
            text: "Максім Багдановіч - 'Зорка Венера'",
            type: "FILL",
            content: { answers: ["Венера", "Ціха", "ззянне"] },
            zones: {
              create: [
                { content: "Зорка ___ узышла над зямлёю", order: 0 },
                { content: "___ над сонным прасторам воднай", order: 1 },
                { content: "Зіхаціць ___ яе залатое", order: 2 },
              ],
            },
            items: {
              create: [
                { content: "Венера", order: 0 },
                { content: "Ціха", order: 1 },
                { content: "ззянне", order: 2 },
              ],
            },
          },
          {
            text: "Янка Купала - 'Спадчына'",
            type: "FILL",
            content: { answers: ["вякоў", "застануся", "беражы"] },
            zones: {
              create: [
                {
                  content: "Ад прадзедаў спакон ___ мне засталася спадчына",
                  order: 0,
                },
                { content: "Паміж сваіх я ___", order: 1 },
                { content: "І ___ гэта ўсё святое", order: 2 },
              ],
            },
            items: {
              create: [
                { content: "вякоў", order: 0 },
                { content: "застануся", order: 1 },
                { content: "беражы", order: 2 },
              ],
            },
          },
          {
            text: "Цётка - 'Хрэст на свабоду'",
            type: "FILL",
            content: { answers: ["здзек", "веру", "праўды"] },
            zones: {
              create: [
                { content: "Хоць ___ і цемра панавалі", order: 0 },
                { content: "Мы ___ насілі ў грудзях", order: 1 },
                { content: "Праменне ___ у нас гарыць", order: 2 },
              ],
            },
            items: {
              create: [
                { content: "здзек", order: 0 },
                { content: "веру", order: 1 },
                { content: "праўды", order: 2 },
              ],
            },
          },
          {
            text: "Аркадзь Куляшоў - 'Мая дарога'",
            type: "FILL",
            content: { answers: ["дарога", "цярністым", "спыніць"] },
            zones: {
              create: [
                { content: "Мая ___ не будзе гладкай", order: 0 },
                { content: "Па ___ шляху я іду", order: 1 },
                { content: "Але ніхто мяне не ___", order: 2 },
              ],
            },
            items: {
              create: [
                { content: "дарога", order: 0 },
                { content: "цярністым", order: 1 },
                { content: "спыніць", order: 2 },
              ],
            },
          },
          {
            text: "Максім Танк - 'Спатканне'",
            type: "FILL",
            content: { answers: ["ціхі", "лятуннем", "стаялі"] },
            zones: {
              create: [
                { content: "Быў ___ вечар. Замоўклі птушкі", order: 0 },
                { content: "Над возерам ___ сінім", order: 1 },
                { content: "Мы ___ ля берагоў", order: 2 },
              ],
            },
            items: {
              create: [
                { content: "ціхі", order: 0 },
                { content: "лятуннем", order: 1 },
                { content: "стаялі", order: 2 },
              ],
            },
          },
          {
            text: "Рыгор Барадулін - 'Трэба дома бываць часцей'",
            type: "FILL",
            content: { answers: ["дома", "дома", "знала"] },
            zones: {
              create: [
                { content: "Трэба ___ бываць часцей", order: 0 },
                { content: "Трэба ___ бываць часцей", order: 1 },
                { content: "Каб душа не ___ самоты", order: 2 },
              ],
            },
            items: {
              create: [
                { content: "дома", order: 0 },
                { content: "дома", order: 1 },
                { content: "знала", order: 2 },
              ],
            },
          },
          {
            text: "Пятрусь Броўка - 'Радзіма'",
            type: "FILL",
            content: { answers: ["Радзіма", "бацькоў", "мілей"] },
            zones: {
              create: [
                { content: "___ мая, дарагая", order: 0 },
                { content: "Зямля ___ і святая", order: 1 },
                { content: "Ты мне ___ за ўсё на свеце", order: 2 },
              ],
            },
            items: {
              create: [
                { content: "Радзіма", order: 0 },
                { content: "бацькоў", order: 1 },
                { content: "мілей", order: 2 },
              ],
            },
          },
          {
            text: "Васіль Быкаў - апавяданне 'Жураўліны крык'",
            type: "FILL",
            content: { answers: ["Жураўлі", "голас", "весткі"] },
            zones: {
              create: [
                { content: "___ крычалі ў небе", order: 0 },
                { content: "І ___ чуўся ў далечыні", order: 1 },
                { content: "Як ___ аб нечым важным", order: 2 },
              ],
            },
            items: {
              create: [
                { content: "Жураўлі", order: 0 },
                { content: "голас", order: 1 },
                { content: "весткі", order: 2 },
              ],
            },
          },
          {
            text: "Ніл Гілевіч - 'Родная мова'",
            type: "FILL",
            content: { answers: ["Мова", "ўсё", "плоць"] },
            zones: {
              create: [
                { content: "___ мая, родная мова", order: 0 },
                { content: "Што ___ за цябе аддам", order: 1 },
                { content: "Бо ты мне ___ і кроў", order: 2 },
              ],
            },
            items: {
              create: [
                { content: "Мова", order: 0 },
                { content: "ўсё", order: 1 },
                { content: "плоць", order: 2 },
              ],
            },
          },
        ],
      },
    },
    include: {
      questions: { include: { items: true, zones: true } },
    },
  });

  // ItemZone для квиза 3 (FILL: item[i] → zone[i])
  for (const question of quiz3.questions) {
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
  console.log("✅ Created quiz 3: Устаў пропушчанае слова (FILL)");

  await seedBulkQuizzes(authorRefs);

  if (process.env.SKIP_I18N !== "1") {
    await runSchoolSeed(prisma);
    await runI18nSeed();
  } else {
    await runSchoolSeed(prisma);
    console.log("⏭️ SKIP_I18N=1 — пераклады не абноўлены (npm run seed:i18n)");
  }

  console.log(`✅ Created ${allPoemsData.length} Belarusian poems`);
  console.log("🎉 Seeding completed successfully!");
}

const isSeedCliEntry =
  typeof require !== "undefined" && require.main === module;

if (isSeedCliEntry) {
  main()
    .catch((e) => {
      console.error("❌ Seeding failed:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

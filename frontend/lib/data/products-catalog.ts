// ─── Mashouf Security Door Catalog — 46 Models ────────────────────────────────
// Prices are defaults; they get overwritten by Google Sheets sync every 6 hours.
// All dimensions: 115 × 210 cm | thickness: 1.25 mm anti-crowbar
// Hardware: Turkish-type fitting with 2-year warranty

export type DoorCategory =
  | 'rush'     // روکش سوپر راش ترک
  | 'baloot'   // روکش بلوط
  | 'cnc'      // سری CNC
  | 'shishe'   // دارای شیشه / ترمو
  | 'laminox'  // لامینوکس
  | 'felz'     // رویه فلز

export interface CatalogProduct {
  code: number            // 1001–1046
  sku: string             // 'MSH-1001'
  name: string            // Full Persian name
  slug: string            // URL slug
  price: number           // Default price in Tomans
  category: DoorCategory
  handle: string          // دستگیره
  // Veneer / surface
  veneer?: string         // e.g. 'سوپر راش ترک', 'بلوط', 'لامینوکس'
  metalFace?: boolean     // true for 1033–1046
  metalColor?: string     // رنگ رویه فلز
  hasWoodCarving?: boolean // منبت چوب
  hasMdf: boolean         // most products; false when no MDF
  // Content
  shortDescription: string
  description: string
  // Listing flags
  isFeatured?: boolean
  isNew?: boolean
  badge?: string | null
  customColor?: boolean   // "قابل سفارش با رنگ دلخواه"
}

const BASE_DESC = (name: string, handle: string, veneer = 'روکش سوپر راش ترک') =>
  `مدل ${name} با ورق فولادی سرتاسری و ام‌دی‌اف وارداتی ۸ میلی‌متری، استحکام ساختاری بالایی دارد. ` +
  `${veneer} در ترکیب با رنگ رویه پلی‌اورتان، سطحی مقاوم در برابر خش و ضربه ایجاد می‌کند. ` +
  `دستگیره ${handle} در کنار یراق تیپ ترک با ۲ سال ضمانت رسمی، این درب را به انتخابی مطمئن تبدیل کرده است.`

const METAL_DESC = (name: string, handle: string, color: string) =>
  `مدل ${name} با رویه فلزی رنگ ${color}، قابل سفارش با هر رنگ دلخواه است. ` +
  `ساختار فولادی سرتاسری با ورق ضد دیلم ۱.۲۵ میلی‌متری بالاترین سطح ایمنی را فراهم می‌کند. ` +
  `دستگیره ${handle} و یراق تیپ ترک با ۲ سال ضمانت رسمی، تکمیل‌کننده این محصول لوکس هستند.`

export const CATALOG: CatalogProduct[] = [
  // ── سری راش ─────────────────────────────────────────────────────────────────
  {
    code: 1001, sku: 'MSH-1001', name: 'درب ضد سرقت سپیدار',
    slug: 'darb-zed-sereqat-sepidaar', price: 38_000_000, category: 'rush',
    handle: 'سفید صدفی', veneer: 'سوپر راش ترک', hasMdf: true,
    shortDescription: 'روکش سوپر راش ترک — دستگیره سفید صدفی — ضخامت ۱.۲۵ ضد دیلم',
    description: BASE_DESC('سپیدار', 'سفید صدفی'),
    isFeatured: true, isNew: false, badge: 'ویژه',
  },
  {
    code: 1002, sku: 'MSH-1002', name: 'درب ضد سرقت ونوس راش',
    slug: 'darb-zed-sereqat-venus-rush', price: 35_000_000, category: 'rush',
    handle: 'آنتیک زیتونی', veneer: 'سوپر راش ترک', hasMdf: true,
    shortDescription: 'روکش سوپر راش ترک — دستگیره آنتیک زیتونی — طراحی کلاسیک',
    description: BASE_DESC('ونوس راش', 'آنتیک زیتونی'),
    isFeatured: true, isNew: false, badge: null,
  },
  {
    code: 1003, sku: 'MSH-1003', name: 'درب ضد سرقت آرسام',
    slug: 'darb-zed-sereqat-arsam', price: 36_000_000, category: 'rush',
    handle: 'آنتیک زیتونی', veneer: 'سوپر راش ترک', hasMdf: true,
    shortDescription: 'طراحی معاصر — دستگیره آنتیک زیتونی — روکش راش ترک',
    description: BASE_DESC('آرسام', 'آنتیک زیتونی'),
    isNew: true, badge: 'جدید',
  },
  {
    code: 1004, sku: 'MSH-1004', name: 'درب ضد سرقت آبنوس راش',
    slug: 'darb-zed-sereqat-abnus-rush', price: 35_000_000, category: 'rush',
    handle: 'آنتیک زیتونی', veneer: 'سوپر راش ترک', hasMdf: true,
    shortDescription: 'تُن تیره آبنوس — دستگیره آنتیک زیتونی — مناسب فضاهای لوکس',
    description: `مدل آبنوس راش با الهام از تیرگی گرم چوب آبنوس، فضایی پر از شکوه به ورودی می‌بخشد. روکش سوپر راش ترک با تُن تیره منحصربه‌فرد، این درب را به انتخاب اول خریداران باذوق تبدیل کرده است.`,
    badge: null,
  },
  {
    code: 1005, sku: 'MSH-1005', name: 'درب ضد سرقت سی‌ان‌سی کلاسیک',
    slug: 'darb-zed-sereqat-cnc-classic', price: 32_500_000, category: 'rush',
    handle: '۴×۲ | ۶۰ سانتی', veneer: 'سوپر راش ترک', hasMdf: true,
    shortDescription: 'برش دقیق CNC — دستگیره ۶۰ سانتی — طرح هندسی کلاسیک',
    description: `مدل سی‌ان‌سی کلاسیک محصول فناوری برش دقیق CNC است. طرح‌های هندسی منظم ایجاد شده با ماشین‌های پیشرفته، این درب را به یک اثر هنری تبدیل کرده‌اند. دستگیره ۴×۲ با اندازه ۶۰ سانتی‌متر، جلوه‌ای مدرن ایجاد می‌کند.`,
    isFeatured: true, isNew: true, badge: 'جدید',
  },
  {
    code: 1006, sku: 'MSH-1006', name: 'درب ضد سرقت سایون',
    slug: 'darb-zed-sereqat-sayon', price: 51_000_000, category: 'rush',
    handle: 'سفید صدفی', veneer: 'سوپر راش ترک', hasWoodCarving: true, hasMdf: true,
    shortDescription: 'منبت چوب دست‌ساز — دستگیره سفید صدفی — هنر اصیل ایرانی',
    description: `مدل سایون با بهره‌گیری از هنر منبت‌کاری چوب، یک اثر هنری بی‌نظیر را در کنار امنیت فولادین ارائه می‌دهد. هر درب سایون توسط هنرمندان ماهر ایرانی ساخته شده و یک تکه منحصربه‌فرد است.`,
    badge: 'ویژه',
  },
  {
    code: 1007, sku: 'MSH-1007', name: 'درب ضد سرقت نگین',
    slug: 'darb-zed-sereqat-negin', price: 39_000_000, category: 'rush',
    handle: 'سفید صدفی', veneer: 'سوپر راش ترک', hasWoodCarving: true, hasMdf: true,
    shortDescription: 'منبت چوب پیچیده — دستگیره سفید صدفی — جلوه‌ای درخشان',
    description: `مدل نگین با الهام از جواهرات ارزشمند، طراحی‌ای پیچیده و درخشان دارد. منبت‌کاری چوب با دقت بالا بافت‌های ظریف و چشم‌نوازی ایجاد کرده که در هر نوری جلوه‌ای متفاوت دارد.`,
    isFeatured: true, isNew: true, badge: 'لوکس',
  },
  {
    code: 1008, sku: 'MSH-1008', name: 'درب ضد سرقت آرامیس',
    slug: 'darb-zed-sereqat-aramis', price: 41_000_000, category: 'rush',
    handle: 'آنتیک زیتونی', veneer: 'سوپر راش ترک', hasMdf: true,
    shortDescription: 'طراحی آرام و متعادل — دستگیره آنتیک زیتونی — سادگی اصیل',
    description: BASE_DESC('آرامیس', 'آنتیک زیتونی'),
    badge: null,
  },
  {
    code: 1009, sku: 'MSH-1009', name: 'درب ضد سرقت تاوریژ',
    slug: 'darb-zed-sereqat-tavriz', price: 48_000_000, category: 'rush',
    handle: 'آنتیک زیتونی', veneer: 'سوپر راش ترک', hasMdf: true,
    shortDescription: 'الهام از معماری تبریز — دستگیره آنتیک زیتونی — طراحی اصیل',
    description: `مدل تاوریژ با الهام از معماری کلاسیک تبریز، ظاهری اصیل و چشم‌نواز دارد. این درب ترکیبی از هنر ایرانی و فناوری مدرن اروپایی است که هم ایمنی و هم زیبایی را به ورودی شما می‌بخشد.`,
    badge: null,
  },
  {
    code: 1010, sku: 'MSH-1010', name: 'درب ضد سرقت سوین ۳ بعدی',
    slug: 'darb-zed-sereqat-sovin-3d', price: 37_000_000, category: 'rush',
    handle: 'سفید صدفی', veneer: 'سوپر راش ترک', hasMdf: true,
    shortDescription: 'طرح سه‌بعدی برجسته — دستگیره سفید صدفی — عمق بصری منحصربه‌فرد',
    description: `مدل سوین ۳ بعدی با بهره‌گیری از طرح‌های برجسته سه‌بعدی، عمق و شخصیت بصری خاصی به ورودی می‌بخشد. این درب با روکش راش ترک و رنگ پلی‌اورتان، دوامی بلندمدت دارد.`,
    badge: null,
  },
  {
    code: 1011, sku: 'MSH-1011', name: 'درب ضد سرقت دو قاب گلدون',
    slug: 'darb-zed-sereqat-do-gab-goldoon', price: 38_000_000, category: 'rush',
    handle: 'آنتیک زیتونی', veneer: 'سوپر راش ترک', hasMdf: true,
    shortDescription: 'طرح دو قاب گلدون — دستگیره آنتیک زیتونی — ظاهری کلاسیک',
    description: BASE_DESC('دو قاب گلدون', 'آنتیک زیتونی'),
    badge: null,
  },

  // ── سری بلوط ─────────────────────────────────────────────────────────────────
  {
    code: 1012, sku: 'MSH-1012', name: 'درب ضد سرقت بلوط دو قاب جناقی سفید',
    slug: 'darb-zed-sereqat-baloot-do-gab-janaghi-sefid', price: 65_000_000, category: 'baloot',
    handle: 'سفید صدفی', veneer: 'بلوط اصل', hasMdf: true,
    shortDescription: 'روکش بلوط اصل — دو قاب جناقی — دستگیره سفید صدفی',
    description: `مدل بلوط دو قاب جناقی سفید با روکش اصل چوب بلوط، لوکس‌ترین حالت ممکن را ارائه می‌دهد. طرح جناقی دو قاب در ترکیب با رنگ سفید و دستگیره سفید صدفی، جلوه‌ای مدرن و پر از شکوه خلق می‌کند.`,
    badge: 'لوکس',
  },
  {
    code: 1013, sku: 'MSH-1013', name: 'درب ضد سرقت بلوط دو قاب جناقی',
    slug: 'darb-zed-sereqat-baloot-do-gab-janaghi', price: 58_000_000, category: 'baloot',
    handle: 'سفید صدفی', veneer: 'بلوط اصل', hasMdf: true,
    shortDescription: 'روکش بلوط اصل — دو قاب جناقی — رنگ طبیعی',
    description: `مدل بلوط دو قاب جناقی با روکش اصل چوب بلوط و طرح جناقی دو قاب، ظاهری کلاسیک و باوقار دارد. رنگ طبیعی چوب بلوط در کنار رویه پلی‌اورتان، دوامی بلندمدت را تضمین می‌کند.`,
    badge: 'لوکس',
  },
  {
    code: 1014, sku: 'MSH-1014', name: 'درب ضد سرقت بلوط تک قاب جناقی',
    slug: 'darb-zed-sereqat-baloot-tak-gab-janaghi', price: 56_000_000, category: 'baloot',
    handle: 'درین طلایی', veneer: 'بلوط اصل', hasMdf: true,
    shortDescription: 'روکش بلوط اصل — تک قاب جناقی — دستگیره درین طلایی',
    description: `مدل بلوط تک قاب جناقی با دستگیره طلایی درین و روکش بلوط اصل، ترکیبی از اصالت و شکوه ایجاد می‌کند. این درب برای ورودی‌های ویلایی و آپارتمان‌های لوکس بسیار مناسب است.`,
    badge: 'لوکس',
  },
  {
    code: 1015, sku: 'MSH-1015', name: 'درب ضد سرقت سی‌ان‌سی بلوط دو رنگ',
    slug: 'darb-zed-sereqat-cnc-baloot-do-rang', price: 35_000_000, category: 'baloot',
    handle: 'تسمه‌ای', veneer: 'بلوط و MDF رنگی', hasMdf: true,
    shortDescription: 'ترکیب بلوط و MDF رنگی — دستگیره تسمه‌ای — برش CNC',
    description: `مدل سی‌ان‌سی بلوط دو رنگ با ترکیب روکش بلوط طبیعی و MDF رنگی، یک کنتراست بصری جذاب ایجاد می‌کند. برش‌های دقیق CNC الگویی زیبا و مدرن روی این درب می‌آفریند.`,
    badge: null,
  },

  // ── سری CNC ──────────────────────────────────────────────────────────────────
  {
    code: 1016, sku: 'MSH-1016', name: 'درب ضد سرقت سی‌ان‌سی زنبوری',
    slug: 'darb-zed-sereqat-cnc-zanbouri', price: 32_800_000, category: 'cnc',
    handle: '۴×۲ | ۴۰ سانتی', veneer: 'سوپر راش ترک', hasMdf: true,
    shortDescription: 'طرح لانه زنبوری CNC — دستگیره ۴۰ سانتی — ظاهری خاص',
    description: `مدل سی‌ان‌سی زنبوری با الهام از ساختار شش‌ضلعی لانه زنبوری، یک طراحی هندسی منحصربه‌فرد دارد. برش‌های دقیق CNC این الگو را با دقت فوق‌العاده بر روی سطح درب اجرا کرده است.`,
    badge: null,
  },
  {
    code: 1017, sku: 'MSH-1017', name: 'درب ضد سرقت سی‌ان‌سی رُهام',
    slug: 'darb-zed-sereqat-cnc-roham', price: 32_500_000, category: 'cnc',
    handle: '۴×۲ | ۱۲۰ سانتی', veneer: 'سوپر راش ترک', hasMdf: true,
    shortDescription: 'دستگیره تمام‌قد ۱۲۰ سانتی — طرح CNC رُهام — پر از شخصیت',
    description: `مدل رُهام با دستگیره ۱۲۰ سانتی‌متری تمام‌قد و طرح CNC اختصاصی، ظاهری مدرن و با شخصیت دارد. این درب انتخاب کسانی است که می‌خواهند ورودی منزلشان متفاوت و بولد باشد.`,
    badge: null,
  },
  {
    code: 1018, sku: 'MSH-1018', name: 'درب ضد سرقت سی‌ان‌سی نسترن',
    slug: 'darb-zed-sereqat-cnc-nastaran', price: 33_000_000, category: 'cnc',
    handle: 'عثمانی', veneer: 'سوپر راش ترک', hasMdf: true,
    shortDescription: 'دستگیره عثمانی ویژه — طرح CNC نسترن — الهام از گل نسترن',
    description: `مدل سی‌ان‌سی نسترن با الهام از ظرافت گل نسترن، طرح‌هایی繊細 و زیبا بر روی سطح ایجاد کرده است. دستگیره عثمانی این درب به طراحی کلاسیک و اصیل آن می‌افزاید.`,
    badge: null,
  },
  {
    code: 1019, sku: 'MSH-1019', name: 'درب ضد سرقت گل یخ',
    slug: 'darb-zed-sereqat-gol-yakh', price: 33_800_000, category: 'cnc',
    handle: 'آنتیک زیتونی', veneer: 'سوپر راش ترک', hasMdf: true,
    shortDescription: 'طرح کریستال گل یخ — دستگیره آنتیک زیتونی — زیبایی زمستانی',
    description: `مدل گل یخ با طرح کریستال‌های یخ، یکی از زیباترین طرح‌های مجموعه مشعوف است. این الگوی پیچیده و繊細 توسط فناوری CNC با دقت بالا اجرا شده است.`,
    badge: null,
  },
  {
    code: 1020, sku: 'MSH-1020', name: 'درب ضد سرقت سی‌ان‌سی طوسی راش',
    slug: 'darb-zed-sereqat-cnc-tosi-rush', price: 33_800_000, category: 'cnc',
    handle: '۴×۲ | ۱۲۰ سانتی', veneer: 'سوپر راش ترک', hasMdf: true,
    shortDescription: 'رنگ طوسی مدرن — دستگیره ۱۲۰ سانتی — راش ترک',
    description: BASE_DESC('سی‌ان‌سی طوسی راش', '۴×۲ | ۱۲۰ سانتی'),
    badge: null,
  },
  {
    code: 1021, sku: 'MSH-1021', name: 'درب ضد سرقت سی‌ان‌سی دو قاب سفید - چهارچوب مشکی',
    slug: 'darb-zed-sereqat-cnc-do-gab-sefid-moshki', price: 34_000_000, category: 'cnc',
    handle: 'تسمه‌ای', veneer: 'سوپر راش ترک', hasMdf: true,
    shortDescription: 'کنتراست سفید و مشکی — دو قاب CNC — طراحی دو رنگ بولد',
    description: `مدل سی‌ان‌سی دو قاب سفید با چهارچوب مشکی، با بازی رنگ‌های کنتراست سفید و مشکی یک طراحی مدرن و جسورانه ایجاد کرده است. این ترکیب برای فضاهای مینیمالیست بسیار مناسب است.`,
    badge: null,
  },
  {
    code: 1022, sku: 'MSH-1022', name: 'درب ضد سرقت سی‌ان‌سی دو قاب سفید - چهارچوب سفید',
    slug: 'darb-zed-sereqat-cnc-do-gab-sefid-sefid', price: 34_000_000, category: 'cnc',
    handle: 'تسمه‌ای', veneer: 'سوپر راش ترک', hasMdf: true,
    shortDescription: 'یکدست سفید خالص — دو قاب CNC — طراحی مینیمالیست',
    description: `مدل سی‌ان‌سی دو قاب سفید با چهارچوب سفید، انتخاب کسانی است که طراحی مینیمالیست و یکدست سفید را می‌پسندند. این درب در فضاهای مدرن با دیوارهای روشن کاملاً می‌درخشد.`,
    badge: null,
  },
  {
    code: 1030, sku: 'MSH-1030', name: 'درب ضد سرقت سی‌ان‌سی هندسی',
    slug: 'darb-zed-sereqat-cnc-hendesi', price: 32_000_000, category: 'cnc',
    handle: '۴×۲ | ۱۲۰ سانتی', veneer: 'سوپر راش ترک', hasMdf: true,
    shortDescription: 'طرح هندسی دقیق CNC — دستگیره ۱۲۰ سانتی — ظاهر مدرن',
    description: `مدل سی‌ان‌سی هندسی با الگوهای هندسی دقیق و منظم، یک طراحی مدرن و منسجم دارد. برش‌های CNC با دقت میلی‌متری این الگوها را با کیفیتی بی‌نقص اجرا کرده‌اند.`,
    badge: null,
  },

  // ── سری شیشه / ترمو ──────────────────────────────────────────────────────────
  {
    code: 1023, sku: 'MSH-1023', name: 'درب ضد سرقت ورتی گلس',
    slug: 'darb-zed-sereqat-verti-glass', price: 45_000_000, category: 'shishe',
    handle: '۴×۲ | ۱۲۰ سانتی', veneer: 'سوپر راش ترک', hasMdf: true,
    shortDescription: 'شیشه ایمنی عمودی — دستگیره ۱۲۰ سانتی — نور طبیعی',
    description: `مدل ورتی گلس با وجود شیشه ایمنی عمودی، جریان نور طبیعی را به داخل ساختمان منتقل می‌کند. شیشه ایمنی ضدضربه در ترکیب با ساختار فولادی، هم ایمنی هم زیبایی را فراهم می‌کند.`,
    badge: null,
  },
  {
    code: 1024, sku: 'MSH-1024', name: 'درب ضد سرقت شیشه بتن',
    slug: 'darb-zed-sereqat-shishe-beton', price: 45_000_000, category: 'shishe',
    handle: '۴×۲ | ۱۲۰ سانتی', veneer: 'سوپر راش ترک', hasMdf: true,
    shortDescription: 'ترکیب شیشه و بافت بتن — دستگیره ۱۲۰ سانتی — صنعتی مدرن',
    description: `مدل شیشه بتن ترکیبی از بافت صنعتی بتن و شیشه ایمنی است که ظاهری منحصربه‌فرد و مدرن ایجاد می‌کند. این درب برای فضاهای industrial و مدرن بسیار مناسب است.`,
    badge: null,
  },
  {
    code: 1025, sku: 'MSH-1025', name: 'درب ضد سرقت سی‌ان‌سی شیشه راش',
    slug: 'darb-zed-sereqat-cnc-shishe-rush', price: 38_000_000, category: 'shishe',
    handle: 'تسمه‌ای', veneer: 'سوپر راش ترک', hasMdf: true,
    shortDescription: 'شیشه CNC راش — ترکیب شیشه و راش — طراحی ویژه',
    description: `مدل سی‌ان‌سی شیشه راش ترکیبی از برش‌های CNC دقیق، روکش راش ترک و شیشه ایمنی است. این ترکیب یک طراحی نوآورانه ایجاد می‌کند که در بین محصولات مشعوف کاملاً منحصربه‌فرد است.`,
    badge: null,
  },
  {
    code: 1026, sku: 'MSH-1026', name: 'درب ضد سرقت ترمو شیشه ۳۰ سانتی',
    slug: 'darb-zed-sereqat-termo-shishe-30', price: 48_000_000, category: 'shishe',
    handle: '۴×۲ | ۱۲۰ سانتی', veneer: 'سوپر راش ترک', hasMdf: true,
    shortDescription: 'ترمو شیشه ۳۰ سانتی — عایق صدا — دستگیره ۱۲۰ سانتی',
    description: `مدل ترمو شیشه ۳۰ سانتی با شیشه ترمو عایق‌بندی‌شده، علاوه بر ایمنی، عایق صوتی و حرارتی مناسبی فراهم می‌کند. شیشه ۳۰ سانتی‌متری نور طبیعی کافی را به ورودی می‌رساند.`,
    badge: null,
  },
  {
    code: 1027, sku: 'MSH-1027', name: 'درب ضد سرقت فول ترمو سینی خور',
    slug: 'darb-zed-sereqat-fool-termo-sini-khor', price: 45_000_000, category: 'shishe',
    handle: '۴×۲ | ۱۲۰ سانتی', veneer: 'سوپر راش ترک', hasMdf: true,
    shortDescription: 'فول ترمو سینی خور — حداکثر عایق‌بندی — دستگیره ۱۲۰ سانتی',
    description: `مدل فول ترمو سینی خور با پوشش ترمو کامل سرتاسری، بهترین عایق‌بندی حرارتی و صوتی را ارائه می‌دهد. این درب برای آب‌وهوای سرد و مناطق پرسروصدا ایده‌آل است.`,
    badge: null,
  },

  // ── سری لامینوکس ─────────────────────────────────────────────────────────────
  {
    code: 1028, sku: 'MSH-1028', name: 'درب ضد سرقت لامینوکس رُهام',
    slug: 'darb-zed-sereqat-laminox-roham', price: 24_000_000, category: 'laminox',
    handle: '۴×۲ | ۱۲۰ سانتی', veneer: 'لامینوکس', hasMdf: true,
    shortDescription: 'روکش لامینوکس — دستگیره ۱۲۰ سانتی — اقتصادی با کیفیت',
    description: `مدل لامینوکس رُهام با روکش لامینوکس با کیفیت و ساختار فولادی محکم، گزینه‌ای اقتصادی با ایمنی بالا است. این درب برای کسانی که به دنبال ترکیب قیمت مناسب و کیفیت هستند ایده‌آل است.`,
    badge: null,
  },
  {
    code: 1029, sku: 'MSH-1029', name: 'درب ضد سرقت لامینوکس مشکی دو رنگ',
    slug: 'darb-zed-sereqat-laminox-moshki-do-rang', price: 24_000_000, category: 'laminox',
    handle: '۴×۲ | ۱۲۰ سانتی', veneer: 'لامینوکس', hasMdf: true,
    shortDescription: 'دو رنگ مشکی و روشن — لامینوکس — دستگیره ۱۲۰ سانتی',
    description: `مدل لامینوکس مشکی دو رنگ با ترکیب کنتراست مشکی و رنگ روشن، ظاهری مدرن و جذاب دارد. این درب با قیمت مناسب، انتخاب هوشمندانه‌ای برای ورودی‌های شیک است.`,
    badge: null,
  },
  {
    code: 1031, sku: 'MSH-1031', name: 'درب ضد سرقت لامینوکس طرح سنگ',
    slug: 'darb-zed-sereqat-laminox-tarh-sang', price: 24_000_000, category: 'laminox',
    handle: '۴×۲ | ۱۲۰ سانتی', veneer: 'لامینوکس طرح سنگ', hasMdf: true,
    shortDescription: 'شبیه‌سازی بافت سنگ — لامینوکس — مقاوم و زیبا',
    description: `مدل لامینوکس طرح سنگ با روکشی که بافت سنگ طبیعی را شبیه‌سازی می‌کند، ظاهری لوکس با قیمت مناسب ارائه می‌دهد. این درب برای فضاهایی که می‌خواهند نمای سنگی داشته باشند ایده‌آل است.`,
    badge: null,
  },
  {
    code: 1032, sku: 'MSH-1032', name: 'درب ضد سرقت لامینوکس طوسی دو رنگ',
    slug: 'darb-zed-sereqat-laminox-tosi-do-rang', price: 24_000_000, category: 'laminox',
    handle: '۴×۲ | ۱۲۰ سانتی', veneer: 'لامینوکس', hasMdf: true,
    shortDescription: 'دو رنگ طوسی مدرن — لامینوکس — دستگیره ۱۲۰ سانتی',
    description: `مدل لامینوکس طوسی دو رنگ با ترکیب زیبای دو سایه طوسی، ظاهری شیک و مدرن دارد. این درب با مقاومت لامینوکس در برابر رطوبت و خش، گزینه‌ای پرطرفدار است.`,
    badge: null,
  },

  // ── سری رویه فلز ─────────────────────────────────────────────────────────────
  {
    code: 1033, sku: 'MSH-1033', name: 'درب ضد سرقت آبنوس دکورال',
    slug: 'darb-zed-sereqat-abnus-decoral', price: 44_000_000, category: 'felz',
    handle: 'آنتیک زیتونی', metalFace: true, metalColor: 'دکورال', hasMdf: false,
    shortDescription: 'رویه فلز دکورال — دستگیره آنتیک زیتونی — قابل سفارش با رنگ دلخواه',
    description: METAL_DESC('آبنوس دکورال', 'آنتیک زیتونی', 'دکورال'),
    customColor: true, badge: null,
  },
  {
    code: 1034, sku: 'MSH-1034', name: 'درب ضد سرقت آبنوس ونگه',
    slug: 'darb-zed-sereqat-abnus-wenge', price: 34_000_000, category: 'felz',
    handle: 'آنتیک زیتونی', metalFace: true, metalColor: 'قهوه‌ای سوخته', hasMdf: false,
    shortDescription: 'رویه فلز قهوه‌ای سوخته — دستگیره آنتیک زیتونی — قابل سفارش',
    description: METAL_DESC('آبنوس ونگه', 'آنتیک زیتونی', 'قهوه‌ای سوخته'),
    customColor: true, badge: null,
  },
  {
    code: 1035, sku: 'MSH-1035', name: 'درب ضد سرقت آراز ونگه',
    slug: 'darb-zed-sereqat-araz-wenge', price: 34_000_000, category: 'felz',
    handle: 'آنتیک زیتونی', metalFace: true, metalColor: 'قهوه‌ای سوخته', hasMdf: false,
    shortDescription: 'رویه فلز ونگه — دستگیره آنتیک زیتونی — طراحی آراز',
    description: METAL_DESC('آراز ونگه', 'آنتیک زیتونی', 'قهوه‌ای سوخته'),
    customColor: true, badge: null,
  },
  {
    code: 1036, sku: 'MSH-1036', name: 'درب ضد سرقت خورشیدی ونگه',
    slug: 'darb-zed-sereqat-khorshidi-wenge', price: 34_000_000, category: 'felz',
    handle: 'آنتیک زیتونی', metalFace: true, metalColor: 'قهوه‌ای سوخته', hasMdf: false,
    shortDescription: 'طرح خورشیدی — رویه فلز ونگه — دستگیره آنتیک زیتونی',
    description: METAL_DESC('خورشیدی ونگه', 'آنتیک زیتونی', 'قهوه‌ای سوخته'),
    customColor: true, badge: null,
  },
  {
    code: 1037, sku: 'MSH-1037', name: 'درب ضد سرقت الین دکورال',
    slug: 'darb-zed-sereqat-elin-decoral', price: 42_000_000, category: 'felz',
    handle: '۴×۲ | ۱۲۰ سانتی', metalFace: true, metalColor: 'دکورال', hasMdf: false,
    shortDescription: 'رویه فلز دکورال — دستگیره ۱۲۰ سانتی — طراحی الین',
    description: METAL_DESC('الین دکورال', '۴×۲ | ۱۲۰ سانتی', 'دکورال'),
    customColor: true, badge: null,
  },
  {
    code: 1038, sku: 'MSH-1038', name: 'درب ضد سرقت الین سفید فلز',
    slug: 'darb-zed-sereqat-elin-sefid-felz', price: 35_000_000, category: 'felz',
    handle: '۴×۲ | ۱۲۰ سانتی', metalFace: true, metalColor: 'سفید', hasMdf: false,
    shortDescription: 'رویه فلز سفید خالص — دستگیره ۱۲۰ سانتی — مینیمال',
    description: METAL_DESC('الین سفید', '۴×۲ | ۱۲۰ سانتی', 'سفید'),
    customColor: true, badge: null,
  },
  {
    code: 1039, sku: 'MSH-1039', name: 'درب ضد سرقت الین مشکی فلز',
    slug: 'darb-zed-sereqat-elin-moshki-felz', price: 34_000_000, category: 'felz',
    handle: '۴×۲ | ۱۲۰ سانتی', metalFace: true, metalColor: 'مشکی', hasMdf: false,
    shortDescription: 'رویه فلز مشکی — دستگیره ۱۲۰ سانتی — بولد و خاص',
    description: METAL_DESC('الین مشکی', '۴×۲ | ۱۲۰ سانتی', 'مشکی'),
    customColor: true, badge: null,
  },
  {
    code: 1040, sku: 'MSH-1040', name: 'درب ضد سرقت ونوس دورسنگ',
    slug: 'darb-zed-sereqat-venus-dorsang', price: 35_000_000, category: 'felz',
    handle: 'سفید صدفی', metalFace: true, metalColor: 'مشکی', hasMdf: false,
    shortDescription: 'رویه فلز مشکی دورسنگ — دستگیره سفید صدفی — کنتراست زیبا',
    description: METAL_DESC('ونوس دورسنگ', 'سفید صدفی', 'مشکی'),
    customColor: true, badge: null,
  },
  {
    code: 1041, sku: 'MSH-1041', name: 'درب ضد سرقت ونوس سفید',
    slug: 'darb-zed-sereqat-venus-sefid', price: 35_000_000, category: 'felz',
    handle: 'سفید صدفی', metalFace: true, metalColor: 'سفید', hasMdf: false,
    shortDescription: 'رویه فلز سفید — دستگیره سفید صدفی — یکدست و مدرن',
    description: METAL_DESC('ونوس سفید', 'سفید صدفی', 'سفید'),
    customColor: true, badge: null,
  },
  {
    code: 1042, sku: 'MSH-1042', name: 'درب ضد سرقت ونوس شطرنجی دکورال',
    slug: 'darb-zed-sereqat-venus-shatranjji-decoral', price: 44_000_000, category: 'felz',
    handle: 'آنتیک زیتونی', metalFace: true, metalColor: 'دکورال', hasMdf: false,
    shortDescription: 'طرح شطرنجی دکورال — رویه فلز — دستگیره آنتیک زیتونی',
    description: METAL_DESC('ونوس شطرنجی دکورال', 'آنتیک زیتونی', 'دکورال'),
    customColor: true, badge: null,
  },
  {
    code: 1043, sku: 'MSH-1043', name: 'درب ضد سرقت ونوس دکورال',
    slug: 'darb-zed-sereqat-venus-decoral', price: 44_000_000, category: 'felz',
    handle: 'آنتیک زیتونی', metalFace: true, metalColor: 'ونگه', hasMdf: false,
    shortDescription: 'رویه فلز ونگه — دستگیره آنتیک زیتونی — طراحی ونوس',
    description: METAL_DESC('ونوس دکورال', 'آنتیک زیتونی', 'ونگه'),
    customColor: true, badge: null,
  },
  {
    code: 1044, sku: 'MSH-1044', name: 'درب ضد سرقت ونوس شطرنجی ونگه',
    slug: 'darb-zed-sereqat-venus-shatranjji-wenge', price: 34_000_000, category: 'felz',
    handle: 'آنتیک زیتونی', metalFace: true, metalColor: 'قهوه‌ای سوخته', hasMdf: false,
    shortDescription: 'طرح شطرنجی ونگه — رویه فلز — دستگیره آنتیک زیتونی',
    description: METAL_DESC('ونوس شطرنجی ونگه', 'آنتیک زیتونی', 'قهوه‌ای سوخته'),
    customColor: true, badge: null,
  },
  {
    code: 1045, sku: 'MSH-1045', name: 'درب ضد سرقت میلانو دکورال',
    slug: 'darb-zed-sereqat-milano-decoral', price: 42_000_000, category: 'felz',
    handle: '۴×۲ | ۱۲۰ سانتی', metalFace: true, metalColor: 'دکورال', hasMdf: false,
    shortDescription: 'رویه فلز دکورال — دستگیره ۱۲۰ سانتی — طراحی میلانو',
    description: METAL_DESC('میلانو دکورال', '۴×۲ | ۱۲۰ سانتی', 'دکورال'),
    customColor: true, badge: 'لوکس',
  },
  {
    code: 1046, sku: 'MSH-1046', name: 'درب ضد سرقت نگین دکورال رویه فلز',
    slug: 'darb-zed-sereqat-negin-decoral-felz', price: 44_000_000, category: 'felz',
    handle: 'آنتیک زیتونی', metalFace: true, metalColor: 'دکورال', hasMdf: false,
    shortDescription: 'رویه فلز دکورال نگین — دستگیره آنتیک زیتونی — قابل سفارش',
    description: METAL_DESC('نگین دکورال', 'آنتیک زیتونی', 'دکورال'),
    customColor: true, badge: 'لوکس',
  },
]

// ─── Derived lookups ────────────────────────────────────────────────────────────

/** Slug → catalog entry */
export const BY_SLUG: Record<string, CatalogProduct> = Object.fromEntries(
  CATALOG.map((p) => [p.slug, p]),
)

/** SKU → catalog entry */
export const BY_SKU: Record<string, CatalogProduct> = Object.fromEntries(
  CATALOG.map((p) => [p.sku, p]),
)

/** Code → catalog entry */
export const BY_CODE: Record<number, CatalogProduct> = Object.fromEntries(
  CATALOG.map((p) => [p.code, p]),
)

/** Apply price overrides from Google Sheets sync */
export function applyPriceOverrides(
  overrides: Record<number, number>,
): CatalogProduct[] {
  return CATALOG.map((p) =>
    overrides[p.code] !== undefined
      ? { ...p, price: overrides[p.code] }
      : p,
  )
}

export const CATEGORY_LABELS: Record<DoorCategory, string> = {
  rush:    'سری راش',
  baloot:  'سری بلوط',
  cnc:     'سری CNC',
  shishe:  'سری شیشه',
  laminox: 'لامینوکس',
  felz:    'رویه فلز',
}

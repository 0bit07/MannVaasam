import "dotenv/config"
import bcrypt from "bcryptjs"
import pg from "pg"

const { Pool } = pg

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error(
    "DATABASE_URL is not set. Add it to .env.local (or export it) before running this script.",
  )
  process.exit(1)
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : undefined,
})

const schema = `
create table if not exists admin_users (
  id serial primary key,
  username text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists enquiries (
  id serial primary key,
  type text not null default 'buy',
  name text not null,
  company text not null default '',
  email text not null,
  phone text not null default '',
  product text not null default '',
  volume text not null default '',
  message text not null,
  status text not null default 'todo',
  created_at timestamptz not null default now()
);

create table if not exists products (
  slug text primary key,
  name text not null,
  category text not null,
  origin text not null,
  price text not null,
  unit text not null,
  grade text not null,
  image text not null,
  alt text not null,
  description text not null,
  secondary_image text,
  secondary_alt text,
  specs jsonb,
  note_lead text,
  note_emphasis text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists faqs (
  id text primary key,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reviews (
  id text primary key,
  name text not null,
  company text not null default '',
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);

create table if not exists rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  count integer not null default 1
);

create table if not exists daily_prices (
  id serial primary key,
  product_name text unique not null,
  price text not null,
  unit text not null,
  currency text not null default 'USD',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table enquiries add column if not exists status text not null default 'todo';
`

const seedProducts = [
  {
    slug: "erode-turmeric",
    name: "Erode Turmeric",
    category: "Spices",
    origin: "Tamil Nadu, India",
    price: "$2.48",
    unit: "per kg",
    grade: "Salem Finger · 3% Curcumin",
    image:
      "https://images.unsplash.com/photo-1770999131111-590d9eaadcdb?auto=format&fit=crop&w=1400&q=88",
    alt: "Rich golden turmeric powder in a traditional spice market",
    description:
      "Sun-cured turmeric with a deep natural colour and clean, earthy aroma. Sourced directly from audited farms in the Erode belt.",
    secondaryImage:
      "https://images.unsplash.com/photo-1775433205046-86e060feff06?auto=format&fit=crop&w=1400&q=88",
    secondaryAlt:
      "Traditional Indian spice market with bowls of colourful spices",
    specs: [
      { label: "Grade", value: "Salem Finger, FAQ" },
      { label: "Curcumin", value: "3% minimum" },
      { label: "Packaging", value: "25 kg / 50 kg PP bags" },
      { label: "Minimum order", value: "5 metric tonnes" },
      { label: "HS code", value: "091030" },
    ],
    noteLead: "Selected for natural colour,",
    noteEmphasis: "processed for purity.",
    note: "Our turmeric is boiled, sun-dried and polished close to source. Each lot is cleaned, metal-detected and independently tested for moisture, curcumin, pesticide residue and microbiological parameters.",
  },
  {
    slug: "fresh-coconuts",
    name: "Fresh Coconuts",
    category: "Fresh Produce",
    origin: "Pollachi, India",
    price: "$0.42",
    unit: "per piece",
    grade: "Semi-husked · 550g+",
    image:
      "https://images.unsplash.com/photo-1708884476326-b232fb6ce72c?auto=format&fit=crop&w=1400&q=88",
    alt: "Fresh mature coconuts ready for sorting",
    description:
      "Mature, hand-selected Pollachi coconuts with consistent kernel quality, carefully de-husked and packed for long transit.",
    secondaryImage:
      "https://images.unsplash.com/photo-1749026314459-3fb459710f01?auto=format&fit=crop&w=1500&q=88",
    secondaryAlt: "Palm trees among lush green farmland in Tamil Nadu",
    specs: [
      { label: "Grade", value: "Semi-husked, 550g+" },
      { label: "Selection", value: "Mature, sound nuts" },
      { label: "Packaging", value: "Mesh bags" },
      { label: "Minimum order", value: "10,000 pieces" },
      { label: "HS code", value: "080119" },
    ],
    noteLead: "Hand-selected at maturity,",
    noteEmphasis: "packed for the journey.",
    note: "Coconuts are de-husked close to the grove, checked for weight and soundness, then packed so kernel quality holds through long transit.",
  },
  {
    slug: "yellow-maize",
    name: "Yellow Maize",
    category: "Grains",
    origin: "Karnataka, India",
    price: "$286",
    unit: "per MT",
    grade: "Feed Grade · 14% Moisture",
    image:
      "https://images.unsplash.com/photo-1668885309844-5bb50f7c2e61?auto=format&fit=crop&w=1400&q=88",
    alt: "Harvested yellow maize kernels",
    description:
      "Uniform yellow maize cleaned to export specification, with low foreign matter and dependable year-round availability.",
    secondaryImage:
      "https://images.unsplash.com/photo-1744358399532-9769248a6d58?auto=format&fit=crop&w=1800&q=88",
    secondaryAlt: "Lush agricultural fields in South India",
    specs: [
      { label: "Grade", value: "Feed grade" },
      { label: "Moisture", value: "14% maximum" },
      { label: "Packaging", value: "Bulk or PP bags" },
      { label: "Minimum order", value: "One 20-foot container" },
      { label: "HS code", value: "100590" },
    ],
    noteLead: "Cleaned to specification,",
    noteEmphasis: "ready for feed buyers.",
    note: "Yellow maize is cleaned for foreign matter and held to the agreed moisture before loading, with year-round availability from verified sources.",
  },
  {
    slug: "green-cardamom",
    name: "Green Cardamom",
    category: "Spices",
    origin: "Idukki, India",
    price: "$18.60",
    unit: "per kg",
    grade: "8mm Bold · AGEB",
    image:
      "https://images.unsplash.com/photo-1775433205046-86e060feff06?auto=format&fit=crop&w=1400&q=88",
    alt: "Aromatic spices displayed at an Indian market",
    description:
      "Bold, aromatic capsules selected for colour, oil content and size, sourced from the misty high ranges of the Western Ghats.",
    secondaryImage:
      "https://images.unsplash.com/photo-1770999131111-590d9eaadcdb?auto=format&fit=crop&w=1400&q=88",
    secondaryAlt: "Ground spices arranged for inspection",
    specs: [
      { label: "Grade", value: "8mm Bold, AGEB" },
      { label: "Selection", value: "Colour, size and oil" },
      { label: "Packaging", value: "5 kg cartons" },
      { label: "Minimum order", value: "5 metric tonnes" },
      { label: "HS code", value: "090831" },
    ],
    noteLead: "Bold capsules,",
    noteEmphasis: "chosen for aroma.",
    note: "Cardamom is graded for size, colour and oil character in the high ranges, then packed to protect volatile aroma on the way to the buyer.",
  },
]

async function migrate() {
  console.log("Creating tables if they do not exist...")
  await pool.query(schema)

  const seedReviews = [
    {
      id: "layla-haddad",
      name: "Layla Haddad",
      company: "Al Noor Foods · UAE",
      rating: 5,
      comment:
        "The difference is their communication. We knew where the cargo was, what had been checked and exactly when every document would land.",
      createdAt: "2025-02-15T00:00:00Z",
    },
    {
      id: "martin-de-vries",
      name: "Martin de Vries",
      company: "Nord Produce · Netherlands",
      rating: 5,
      comment:
        "Their coconut quality has been remarkably consistent across six shipments. Any question is answered quickly and with real detail.",
      createdAt: "2025-01-15T00:00:00Z",
    },
    {
      id: "kenji-sato",
      name: "Kenji Sato",
      company: "Hikari Trading · Japan",
      rating: 4,
      comment:
        "Mannvaasam feels less like a supplier and more like our sourcing team in India. Transparent, practical and dependable.",
      createdAt: "2024-12-15T00:00:00Z",
    },
    {
      id: "nadia-hassan",
      name: "Nadia Hassan",
      company: "Crescent Markets · Qatar",
      rating: 5,
      comment:
        "The sample, final cargo and lab report all aligned. That level of control makes repeat buying an easy decision.",
      createdAt: "2024-11-15T00:00:00Z",
    },
  ]

  console.log("Seeding products (skipping any that already exist)...")
  for (const product of seedProducts) {
    await pool.query(
      `insert into products
         (slug, name, category, origin, price, unit, grade, image, alt, description,
          secondary_image, secondary_alt, specs, note_lead, note_emphasis, note)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       on conflict (slug) do nothing`,
      [
        product.slug,
        product.name,
        product.category,
        product.origin,
        product.price,
        product.unit,
        product.grade,
        product.image,
        product.alt,
        product.description,
        product.secondaryImage,
        product.secondaryAlt,
        JSON.stringify(product.specs),
        product.noteLead,
        product.noteEmphasis,
        product.note,
      ],
    )
  }

  console.log("Seeding reviews (skipping any that already exist)...")
  for (const review of seedReviews) {
    await pool.query(
      `insert into reviews (id, name, company, rating, comment, created_at)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (id) do nothing`,
      [
        review.id,
        review.name,
        review.company,
        review.rating,
        review.comment,
        review.createdAt,
      ],
    )
  }

  const seedFaqs = [
    [
      "export-countries",
      "Which countries do you export to?",
      "We currently serve buyers across the GCC, Southeast Asia, Europe and East Asia. New destinations are evaluated with our freight and compliance partners before quotation.",
    ],
    [
      "samples",
      "Can you provide samples before an order?",
      "Yes. Representative samples can be arranged for most dry commodities. Courier and testing costs may apply and can be adjusted against a confirmed order.",
    ],
    [
      "trade-terms",
      "What trade terms do you offer?",
      "We commonly quote FOB, CFR and CIF from Karur, Tuticorin, Cochin and Mundra. Other Incoterms can be discussed based on the product and destination.",
    ],
    [
      "quality",
      "How do you verify product quality?",
      "Lots are checked against an agreed specification before dispatch. Depending on the product, this may include moisture, size, residue, microbiological and third-party inspection reports.",
    ],
    [
      "minimum-order",
      "What is your typical minimum order quantity?",
      "Minimums vary by product: generally 5 MT for spices, one 20-foot container for grains, and 10,000 pieces for fresh coconuts.",
    ],
    [
      "private-label",
      "Do you support private-label packaging?",
      "Yes. Retail and foodservice formats are available for selected products, subject to packaging development, label compliance and minimum volumes.",
    ],
  ]

  const seedPrices = [
    ["Erode Turmeric", "$2.48", "kg", "USD"],
    ["Green Cardamom 8mm", "$18.60", "kg", "USD"],
    ["Fresh Coconut 550g+", "$0.42", "piece", "USD"],
    ["Yellow Maize", "$286.00", "MT", "USD"],
    ["Indian Red Onion", "$0.54", "kg", "USD"],
    ["Sona Masoori Rice", "$742.00", "MT", "USD"],
  ]

  console.log("Seeding daily prices (skipping any that already exist)...")
  for (const [index, price] of seedPrices.entries()) {
    await pool.query(
      `insert into daily_prices (product_name, price, unit, currency, sort_order)
       values ($1, $2, $3, $4, $5)
       on conflict (product_name) do nothing`,
      [price[0], price[1], price[2], price[3], index + 1],
    )
  }

  console.log("Seeding FAQs (skipping any that already exist)...")
  for (const [index, faq] of seedFaqs.entries()) {
    await pool.query(
      `insert into faqs (id, question, answer, sort_order)
       values ($1, $2, $3, $4)
       on conflict (id) do nothing`,
      [faq[0], faq[1], faq[2], index + 1],
    )
  }

  const adminUsername = process.env.ADMIN_DEFAULT_USERNAME || "admin"
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "ChangeMe123!"
  const existing = await pool.query(
    "select id from admin_users where username = $1",
    [adminUsername],
  )
  if (existing.rows.length === 0) {
    const passwordHash = await bcrypt.hash(adminPassword, 10)
    await pool.query(
      "insert into admin_users (username, password_hash) values ($1, $2)",
      [adminUsername, passwordHash],
    )
    console.log(
      `Seeded default admin user "${adminUsername}". This is a mock password for first login — change it (or add a new user and remove this one) once you're in.`,
    )
  } else {
    console.log(`Admin user "${adminUsername}" already exists, skipping seed.`)
  }

  console.log("Migration complete.")
  await pool.end()
}

migrate().catch((error) => {
  console.error(error)
  process.exit(1)
})

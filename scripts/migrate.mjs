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
  {
    slug: "red-onion-big",
    name: "Red Onion, Big",
    category: "Fresh Produce",
    origin: "Maharashtra, India",
    price: "$0.38",
    unit: "per kg",
    grade: "Large · 60mm+",
    image: "catalogue/red-onion-big.jpg",
    alt: "Three large red onions on a linen cloth",
    description:
      "Large red onions with firm bulbs and a deep colour, sorted for size and packed for export transit.",
    secondaryImage: null,
    secondaryAlt: null,
    specs: [
      { label: "Grade", value: "Large, 60mm and above" },
      { label: "Selection", value: "Firm, well-cured bulbs" },
      { label: "Packaging", value: "Mesh bags" },
      { label: "Minimum order", value: "One 20-foot container" },
      { label: "HS code", value: "070310" },
    ],
    noteLead: "Sized and cured,",
    noteEmphasis: "ready for the voyage.",
    note: "Bulbs are cured, graded by diameter and packed in mesh so they arrive sound. Smaller sizes are offered separately.",
  },
  {
    slug: "red-onion-small",
    name: "Red Onion, Small",
    category: "Fresh Produce",
    origin: "Karnataka, India",
    price: "$0.46",
    unit: "per kg",
    grade: "Small · 40–55mm",
    image: "catalogue/red-onion-small.jpg",
    alt: "A cluster of small red onions",
    description:
      "Smaller red onions with a tighter bulb, preferred where buyers want a finer size and quicker cooking.",
    secondaryImage: null,
    secondaryAlt: null,
    specs: [
      { label: "Grade", value: "Small, 40–55mm" },
      { label: "Selection", value: "Firm, well-cured bulbs" },
      { label: "Packaging", value: "Mesh bags" },
      { label: "Minimum order", value: "One 20-foot container" },
      { label: "HS code", value: "070310" },
    ],
    noteLead: "A finer size,",
    noteEmphasis: "the same care.",
    note: "Small bulbs are sorted away from the large grade so each shipment matches the size the buyer specified.",
  },
  {
    slug: "turmeric",
    name: "Turmeric",
    category: "Spices",
    origin: "Tamil Nadu, India",
    price: "$2.20",
    unit: "per kg",
    grade: "Finger · FAQ",
    image: "catalogue/turmeric.jpg",
    alt: "Fresh turmeric roots beside golden turmeric powder",
    description:
      "Finger turmeric with a clean aroma and natural colour, offered as whole fingers or as a powder on request.",
    secondaryImage: null,
    secondaryAlt: null,
    specs: [
      { label: "Grade", value: "Finger, FAQ" },
      { label: "Form", value: "Whole or powder" },
      { label: "Packaging", value: "25 kg / 50 kg bags" },
      { label: "Minimum order", value: "5 metric tonnes" },
      { label: "HS code", value: "091030" },
    ],
    noteLead: "Whole or ground,",
    noteEmphasis: "colour kept honest.",
    note: "Lots are cleaned and checked for moisture and foreign matter. Powder is milled only against a confirmed order.",
  },
  {
    slug: "dried-red-chilli",
    name: "Dried Red Chilli",
    category: "Spices",
    origin: "Andhra Pradesh, India",
    price: "$2.10",
    unit: "per kg",
    grade: "With stem · S17",
    image: "catalogue/dried-red-chilli.jpg",
    alt: "A pile of whole dried red chillies",
    description:
      "Sun-dried red chillies with a steady heat and deep colour, stemmed or with stem as the buyer prefers.",
    secondaryImage: null,
    secondaryAlt: null,
    specs: [
      { label: "Grade", value: "S17, with stem" },
      { label: "Moisture", value: "12% maximum" },
      { label: "Packaging", value: "Jute or PP bags" },
      { label: "Minimum order", value: "5 metric tonnes" },
      { label: "HS code", value: "090421" },
    ],
    noteLead: "Dried close to the field,",
    noteEmphasis: "graded for colour.",
    note: "Chillies are dried, destalked when requested, and checked so broken pods and foreign matter stay within the agreed limit.",
  },
  {
    slug: "cocopeat-block",
    name: "Cocopeat Block",
    category: "Agri Inputs",
    origin: "Tamil Nadu, India",
    price: "$220",
    unit: "per MT",
    grade: "5 kg block · Low EC",
    image: "catalogue/cocopeat-block.jpg",
    alt: "A compressed brown cocopeat block",
    description:
      "Washed, compressed cocopeat blocks for nurseries and soilless growing, with low electrical conductivity.",
    secondaryImage: null,
    secondaryAlt: null,
    specs: [
      { label: "Grade", value: "Low EC, 5 kg block" },
      { label: "Expansion", value: "About 15 litres per kg" },
      { label: "Packaging", value: "Blocks on pallets" },
      { label: "Minimum order", value: "One 20-foot container" },
      { label: "HS code", value: "530500" },
    ],
    noteLead: "Washed and pressed,",
    noteEmphasis: "ready to hydrate.",
    note: "Coir pith is washed, dried and compressed so buyers receive a stable block that opens cleanly when watered.",
  },
  {
    slug: "black-pepper",
    name: "Black Pepper",
    category: "Spices",
    origin: "Kerala, India",
    price: "$6.40",
    unit: "per kg",
    grade: "550 GL · FAQ",
    image: "catalogue/black-pepper.jpg",
    alt: "Whole black peppercorns in a wooden bowl",
    description:
      "Whole black pepper with a bold aroma, graded by density so the lot stays even from sack to sack.",
    secondaryImage: null,
    secondaryAlt: null,
    specs: [
      { label: "Grade", value: "550 GL, FAQ" },
      { label: "Moisture", value: "12% maximum" },
      { label: "Packaging", value: "25 kg / 50 kg bags" },
      { label: "Minimum order", value: "5 metric tonnes" },
      { label: "HS code", value: "090411" },
    ],
    noteLead: "Graded by density,",
    noteEmphasis: "kept whole.",
    note: "Pepper is cleaned, gravity-separated and packed to hold aroma. Pinheads and light berries are kept out of the export grade.",
  },
  {
    slug: "cardamom",
    name: "Cardamom",
    category: "Spices",
    origin: "Idukki, India",
    price: "$18.60",
    unit: "per kg",
    grade: "8mm Bold · Green",
    image: "catalogue/cardamom.jpg",
    alt: "A pile of green cardamom pods",
    description:
      "Green cardamom capsules selected for size, colour and a fresh oil character from the Western Ghats.",
    secondaryImage: null,
    secondaryAlt: null,
    specs: [
      { label: "Grade", value: "8mm bold, green" },
      { label: "Selection", value: "Colour, size and oil" },
      { label: "Packaging", value: "5 kg cartons" },
      { label: "Minimum order", value: "1 metric tonne" },
      { label: "HS code", value: "090831" },
    ],
    noteLead: "Capsules kept whole,",
    noteEmphasis: "aroma kept in.",
    note: "Pods are sized and packed in cartons so the volatile oil is not lost on the way to the buyer.",
  },
  {
    slug: "coriander-seeds",
    name: "Coriander Seeds",
    category: "Spices",
    origin: "Rajasthan, India",
    price: "$1.35",
    unit: "per kg",
    grade: "Eagle · Machine cleaned",
    image: "catalogue/coriander-seeds.jpg",
    alt: "Tan coriander seeds in a ceramic bowl",
    description:
      "Machine-cleaned coriander seed with an even split and a mild citrus aroma, packed for spice grinders.",
    secondaryImage: null,
    secondaryAlt: null,
    specs: [
      { label: "Grade", value: "Eagle, machine cleaned" },
      { label: "Purity", value: "99% minimum" },
      { label: "Packaging", value: "25 kg / 50 kg bags" },
      { label: "Minimum order", value: "5 metric tonnes" },
      { label: "HS code", value: "090921" },
    ],
    noteLead: "Cleaned and even,",
    noteEmphasis: "ready to mill.",
    note: "Seed is aspirated and graded so stones, stems and split dust stay out of the export bag.",
  },
  {
    slug: "coconut",
    name: "Coconut",
    category: "Fresh Produce",
    origin: "Pollachi, India",
    price: "$0.42",
    unit: "per piece",
    grade: "Semi-husked · Mature",
    image: "catalogue/coconut.jpg",
    alt: "Mature coconuts, one split to show the flesh",
    description:
      "Mature coconuts with a sound kernel, de-husked close to the grove and packed for a long sea passage.",
    secondaryImage: null,
    secondaryAlt: null,
    specs: [
      { label: "Grade", value: "Semi-husked, mature" },
      { label: "Selection", value: "Sound nuts, 550g+" },
      { label: "Packaging", value: "Mesh bags" },
      { label: "Minimum order", value: "10,000 pieces" },
      { label: "HS code", value: "080119" },
    ],
    noteLead: "Cut at maturity,",
    noteEmphasis: "checked for soundness.",
    note: "Each nut is checked for weight and a clean kernel before it is bagged.",
  },
  {
    slug: "rice",
    name: "Rice",
    category: "Grains",
    origin: "Andhra Pradesh, India",
    price: "$480",
    unit: "per MT",
    grade: "Sona Masoori · Sortex",
    image: "catalogue/rice.jpg",
    alt: "Long-grain white rice in a shallow bowl",
    description:
      "Sortex-cleaned rice with a light grain and a clean cook, offered in the grade and pack the buyer names.",
    secondaryImage: null,
    secondaryAlt: null,
    specs: [
      { label: "Grade", value: "Sona Masoori, sortexed" },
      { label: "Broken", value: "As agreed" },
      { label: "Packaging", value: "PP bags or bulk" },
      { label: "Minimum order", value: "One 20-foot container" },
      { label: "HS code", value: "100630" },
    ],
    noteLead: "Milled and sorted,",
    noteEmphasis: "ready to cook.",
    note: "Rice is milled, sortexed and bagged to the broken percentage on the contract. Other varieties can be quoted.",
  },
  {
    slug: "dal",
    name: "Dal",
    category: "Pulses",
    origin: "Madhya Pradesh, India",
    price: "$720",
    unit: "per MT",
    grade: "Toor · Polished",
    image: "catalogue/dal.jpg",
    alt: "Yellow split dal in a shallow bowl",
    description:
      "Polished toor dal with an even yellow colour, milled for kitchens and packers who want a consistent split.",
    secondaryImage: null,
    secondaryAlt: null,
    specs: [
      { label: "Grade", value: "Toor dal, polished" },
      { label: "Foreign matter", value: "1% maximum" },
      { label: "Packaging", value: "25 kg / 50 kg bags" },
      { label: "Minimum order", value: "5 metric tonnes" },
      { label: "HS code", value: "071360" },
    ],
    noteLead: "Milled even,",
    noteEmphasis: "colour kept bright.",
    note: "Other dals, including moong and chana, can be offered against the same specification process.",
  },
  {
    slug: "fruits-and-vegetables",
    name: "Fruits and Vegetables",
    category: "Fresh Produce",
    origin: "South India",
    price: "On request",
    unit: "per lot",
    grade: "Seasonal · Export grade",
    image: "catalogue/fruits-vegetables.jpg",
    alt: "A small arrangement of mango, banana, tomato and okra",
    description:
      "Seasonal fruits and vegetables from audited farms, quoted by crop, grade and the week of shipment.",
    secondaryImage: null,
    secondaryAlt: null,
    specs: [
      { label: "Grade", value: "Export, as specified" },
      { label: "Selection", value: "Seasonal availability" },
      { label: "Packaging", value: "Cartons or crates" },
      { label: "Minimum order", value: "By crop" },
      { label: "HS code", value: "By crop" },
    ],
    noteLead: "Picked for the week,",
    noteEmphasis: "packed for the lane.",
    note: "Tell us the crop and destination. We confirm what is in season, the grade, and a firm packing plan before we quote.",
  },
  {
    slug: "tamarind",
    name: "Tamarind",
    category: "Spices",
    origin: "Tamil Nadu, India",
    price: "$1.10",
    unit: "per kg",
    grade: "Seedless · Block",
    image: "catalogue/tamarind.jpg",
    alt: "Tamarind pods, some split to show the pulp",
    description:
      "Seedless tamarind pressed into blocks, with a clean sourness and no excess fibre.",
    secondaryImage: null,
    secondaryAlt: null,
    specs: [
      { label: "Grade", value: "Seedless block" },
      { label: "Moisture", value: "18% maximum" },
      { label: "Packaging", value: "Cartons" },
      { label: "Minimum order", value: "5 metric tonnes" },
      { label: "HS code", value: "081090" },
    ],
    noteLead: "Pulp without the seed,",
    noteEmphasis: "pressed into blocks.",
    note: "Pods are shelled, deseeded and pressed so the buyer receives a block that is easy to portion.",
  },
  {
    slug: "wheat",
    name: "Wheat",
    category: "Grains",
    origin: "Madhya Pradesh, India",
    price: "$280",
    unit: "per MT",
    grade: "Milling · FAQ",
    image: "catalogue/wheat.jpg",
    alt: "Golden wheat grains in a shallow bowl",
    description:
      "Milling wheat cleaned to a fair average quality, with low foreign matter and a steady test weight.",
    secondaryImage: null,
    secondaryAlt: null,
    specs: [
      { label: "Grade", value: "Milling, FAQ" },
      { label: "Moisture", value: "12% maximum" },
      { label: "Packaging", value: "PP bags or bulk" },
      { label: "Minimum order", value: "One 20-foot container" },
      { label: "HS code", value: "100199" },
    ],
    noteLead: "Cleaned for the mill,",
    noteEmphasis: "held to moisture.",
    note: "Wheat is cleaned and sampled for moisture and foreign matter before it is loaded.",
  },
  {
    slug: "lemon",
    name: "Lemon",
    category: "Fresh Produce",
    origin: "Andhra Pradesh, India",
    price: "$0.55",
    unit: "per kg",
    grade: "45–55mm · Export",
    image: "catalogue/lemon.jpg",
    alt: "Bright yellow lemons, one cut in half",
    description:
      "Firm lemons in an even size band, waxed only when the destination asks for it.",
    secondaryImage: null,
    secondaryAlt: null,
    specs: [
      { label: "Grade", value: "45–55mm" },
      { label: "Selection", value: "Firm, even colour" },
      { label: "Packaging", value: "Cartons" },
      { label: "Minimum order", value: "One pallet" },
      { label: "HS code", value: "080550" },
    ],
    noteLead: "Sized and firm,",
    noteEmphasis: "packed to breathe.",
    note: "Fruit is graded for size and blemish, then cartoned so it holds through a short air or sea move.",
  },
  {
    slug: "moringa-powder",
    name: "Moringa Powder",
    category: "Spices",
    origin: "Tamil Nadu, India",
    price: "$4.80",
    unit: "per kg",
    grade: "Leaf · Fine mesh",
    image: "catalogue/moringa-powder.jpg",
    alt: "Green moringa powder with fresh leaves beside the bowl",
    description:
      "Fine moringa leaf powder milled from dried leaves, with a clean green colour and no stem grit.",
    secondaryImage: null,
    secondaryAlt: null,
    specs: [
      { label: "Grade", value: "Leaf powder, fine mesh" },
      { label: "Moisture", value: "8% maximum" },
      { label: "Packaging", value: "Food-grade pouches in cartons" },
      { label: "Minimum order", value: "500 kg" },
      { label: "HS code", value: "071290" },
    ],
    noteLead: "Leaves, not stems,",
    noteEmphasis: "milled fine.",
    note: "Leaves are dried in the shade, destemmed and milled. Each lot can be tested for moisture and microbiology.",
  },
  {
    slug: "curry-leaves",
    name: "Curry Leaves",
    category: "Spices",
    origin: "Tamil Nadu, India",
    price: "$2.90",
    unit: "per kg",
    grade: "Dried · Stemless",
    image: "catalogue/curry-leaves.jpg",
    alt: "A sprig of fresh dark green curry leaves",
    description:
      "Dried curry leaves, stripped from the stem, for kitchens and blends that want the leaf and not the twig.",
    secondaryImage: null,
    secondaryAlt: null,
    specs: [
      { label: "Grade", value: "Dried, stemless" },
      { label: "Moisture", value: "10% maximum" },
      { label: "Packaging", value: "Cartons" },
      { label: "Minimum order", value: "500 kg" },
      { label: "HS code", value: "091099" },
    ],
    noteLead: "Stripped and dried,",
    noteEmphasis: "aroma kept in the leaf.",
    note: "Fresh leaves can be discussed for air freight. The standing offer is the dried, stemless leaf.",
  },
  {
    slug: "groundnuts",
    name: "Groundnuts",
    category: "Oilseeds",
    origin: "Gujarat, India",
    price: "$1.15",
    unit: "per kg",
    grade: "Bold · Java",
    image: "catalogue/groundnuts.jpg",
    alt: "Groundnuts in their shells with a few shelled nuts",
    description:
      "Bold groundnuts, in shell or as kernels, cleaned and sized for oil and snack buyers.",
    secondaryImage: null,
    secondaryAlt: null,
    specs: [
      { label: "Grade", value: "Bold Java" },
      { label: "Form", value: "In shell or kernel" },
      { label: "Packaging", value: "Jute or vacuum bags" },
      { label: "Minimum order", value: "One 20-foot container" },
      { label: "HS code", value: "120242" },
    ],
    noteLead: "Sized and cleaned,",
    noteEmphasis: "in shell or kernel.",
    note: "Nuts are graded for count and checked for moisture. Aflatoxin testing can be arranged before shipment.",
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
    ["Red Onion, Big", "$0.38", "kg", "USD"],
    ["Red Onion, Small", "$0.46", "kg", "USD"],
    ["Turmeric", "$2.20", "kg", "USD"],
    ["Dried Red Chilli", "$2.10", "kg", "USD"],
    ["Cocopeat Block", "$220.00", "MT", "USD"],
    ["Black Pepper", "$6.40", "kg", "USD"],
    ["Cardamom", "$18.60", "kg", "USD"],
    ["Coriander Seeds", "$1.35", "kg", "USD"],
    ["Coconut", "$0.42", "piece", "USD"],
    ["Rice", "$480.00", "MT", "USD"],
    ["Dal", "$720.00", "MT", "USD"],
    ["Fruits and Vegetables", "On request", "lot", "USD"],
    ["Tamarind", "$1.10", "kg", "USD"],
    ["Wheat", "$280.00", "MT", "USD"],
    ["Lemon", "$0.55", "kg", "USD"],
    ["Moringa Powder", "$4.80", "kg", "USD"],
    ["Curry Leaves", "$2.90", "kg", "USD"],
    ["Groundnuts", "$1.15", "kg", "USD"],
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

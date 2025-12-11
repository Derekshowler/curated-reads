// shelves.ts
// -----------------------------------------------------------------------------
// Purpose:
// Curated homepage shelves for Curated Reads.
// This file is intentionally lightweight and UI-friendly.
// You can expand items later with IDs, cover URLs, or API references.
//
// If your app expects a different export name (e.g., `shelves`, `HOME`),
// rename the export at the bottom.
// -----------------------------------------------------------------------------

export type ShelfItem = {
  title: string;
  author: string;

  // Optional future-friendly fields:
  slug?: string;     // e.g. "project-hail-mary"
  reason?: string;   // short editorial blurb
  tags?: string[];   // e.g. ["cozy", "found-family"]

  // ✅ Optional hard override for problematic titles/editions
  isbn?: string;
};

export type ShelfSection = {
  key: string;
  title: string;
  subtitle?: string;
  limit?: number;
  items: ShelfItem[];
};

// -----------------------------------------------------------------------------
// HOMEPAGE SHELVES
// -----------------------------------------------------------------------------

export const HOME_SHELVES: ShelfSection[] = [
  // 1) Staff Picks
  {
    key: 'staff-picks',
    title: 'Staff Picks',
    subtitle: 'Our favorites right now',
    limit: 12,
    items: [
      { title: 'Remarkably Bright Creatures', author: 'Shelby Van Pelt' },
      { title: 'Tomorrow, and Tomorrow, and Tomorrow', author: 'Gabrielle Zevin' },
      { title: 'Project Hail Mary', author: 'Andy Weir' },
      { title: 'Pachinko', author: 'Min Jin Lee' },
      { title: 'Circe', author: 'Madeline Miller' },
      { title: 'The Night Circus', author: 'Erin Morgenstern' },
      { title: 'The House in the Cerulean Sea', author: 'TJ Klune' },
      { title: 'The Song of Achilles', author: 'Madeline Miller' },
      { title: 'The Thursday Murder Club', author: 'Richard Osman' },
      { title: 'Educated', author: 'Tara Westover' },
      { title: 'Braiding Sweetgrass', author: 'Robin Wall Kimmerer' },
      { title: 'A Man Called Ove', author: 'Fredrik Backman' },
    ],
  },

  // 2) New & Notable
  {
    key: 'new-notable',
    title: 'New & Notable',
    subtitle: 'Fresh releases and recent standouts',
    limit: 12,
    items: [
      { title: 'The Women', author: 'Kristin Hannah' },
      { title: 'The Wedding People', author: 'Alison Espach' },
      { title: 'The God of the Woods', author: 'Liz Moore' },
      { title: 'The Ministry of Time', author: 'Kaliane Bradley' },
      { title: 'Somewhere Beyond the Sea', author: 'TJ Klune' },
      { title: 'James', author: 'Percival Everett' },
      { title: 'Soldiers and Kings', author: 'Jason De León' },
      { title: 'Intermezzo', author: 'Sally Rooney' },
      { title: 'Welcome to the Hyunam-Dong Bookshop', author: 'Hwang Bo-Reum' },
      { title: 'The Anxious Generation', author: 'Jonathan Haidt' },
      { title: 'The Wager', author: 'David Grann' },
      { title: 'The Heaven & Earth Grocery Store', author: 'James McBride' },
    ],
  },

  // 3) Book Club Energy
  {
    key: 'book-club',
    title: 'Book Club Energy',
    subtitle: 'Big feelings, big conversations',
    limit: 12,
    items: [
      { title: 'Demon Copperhead', author: 'Barbara Kingsolver' },
      { title: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid' },
      { title: 'The Nightingale', author: 'Kristin Hannah' },
      { title: 'Hello Beautiful', author: 'Ann Napolitano' },
      { title: 'The Invisible Life of Addie LaRue', author: 'V.E. Schwab', isbn: '9780765387578' },
      { title: 'The Midnight Library', author: 'Matt Haig' },
      { title: 'Little Fires Everywhere', author: 'Celeste Ng' },
      { title: 'The Vanishing Half', author: 'Brit Bennett' },
      { title: 'Where the Crawdads Sing', author: 'Delia Owens' },
      { title: 'Anxious People', author: 'Fredrik Backman' },
      { title: 'The Lincoln Highway', author: 'Amor Towles' },
      { title: 'The Netherlands House', author: 'Ann Patchett' },
    ],
  },

  // 4) Genre Gateways
  {
    key: 'genre-gateways',
    title: 'Genre Gateways',
    subtitle: 'Easy entry points into your next obsession',
    limit: 12,
    items: [
      { title: 'Mistborn: The Final Empire', author: 'Brandon Sanderson', tags: ['fantasy'] },
      { title: 'A Wizard of Earthsea', author: 'Ursula K. Le Guin', tags: ['fantasy'] },
      { title: 'The Name of the Wind', author: 'Patrick Rothfuss', tags: ['fantasy'] },
      { title: 'Project Hail Mary', author: 'Andy Weir', tags: ['sci-fi'] },
      { title: 'The Martian', author: 'Andy Weir', tags: ['sci-fi'] },
      { title: 'Dark Matter', author: 'Blake Crouch', tags: ['sci-fi'] },
      { title: 'The Thursday Murder Club', author: 'Richard Osman', tags: ['mystery'] },
      { title: 'Gone Girl', author: 'Gillian Flynn', tags: ['thriller'] },
      { title: 'Book Lovers', author: 'Emily Henry', tags: ['romance'] },
      { title: 'Beach Read', author: 'Emily Henry', tags: ['romance'] },
      { title: 'Red, White & Royal Blue', author: 'Casey McQuiston', tags: ['romance'] },
      { title: 'Mexican Gothic', author: 'Silvia Moreno-Garcia', tags: ['gothic'] },
    ],
  },

  // 5) Nonfiction That Reads Like Fiction
  {
    key: 'narrative-nonfiction',
    title: 'Nonfiction That Reads Like Fiction',
    subtitle: 'True stories with page-turning momentum',
    limit: 12,
    items: [
      { title: 'The Wager', author: 'David Grann' },
      { title: 'Into Thin Air', author: 'Jon Krakauer' },
      { title: 'Educated', author: 'Tara Westover' },
      { title: 'Born a Crime', author: 'Trevor Noah' },
      { title: 'Bad Blood', author: 'John Carreyrou' },
      { title: 'Killers of the Flower Moon', author: 'David Grann' },
      { title: 'The Immortal Life of Henrietta Lacks', author: 'Rebecca Skloot' },
      { title: 'Sapiens', author: 'Yuval Noah Harari' },
      { title: 'Braiding Sweetgrass', author: 'Robin Wall Kimmerer' },
      { title: 'Atomic Habits', author: 'James Clear' },
      { title: 'Hidden Valley Road', author: 'Robert Kolker' },
      { title: 'Unbroken', author: 'Laura Hillenbrand' },
    ],
  },

  // 6) Cozy & Comfort
  {
    key: 'cozy-comfort',
    title: 'Cozy & Comfort',
    subtitle: 'Warm, hopeful, low-stress favorites',
    limit: 12,
    items: [
      { title: 'The House in the Cerulean Sea', author: 'TJ Klune' },
      { title: 'Legends & Lattes', author: 'Travis Baldree' },
      { title: 'A Psalm for the Wild-Built', author: 'Becky Chambers' },
      { title: 'The Very Secret Society of Irregular Witches', author: 'Sangu Mandanna' },
      { title: 'The Guncle', author: 'Steven Rowley' },
      { title: 'Eleanor Oliphant Is Completely Fine', author: 'Gail Honeyman' },
      { title: 'A Man Called Ove', author: 'Fredrik Backman' },
      { title: 'Howl’s Moving Castle', author: 'Diana Wynne Jones', isbn: '9780007380459' },
      { title: 'Anne of Green Gables', author: 'L.M. Montgomery' },
      { title: 'The Little Prince', author: 'Antoine de Saint-Exupéry' },
      { title: 'The Secret Garden', author: 'Frances Hodgson Burnett' },
      { title: 'The Rosie Project', author: 'Graeme Simsion' },
    ],
  },
];

// Default export for convenience if your code prefers it.
export default HOME_SHELVES;

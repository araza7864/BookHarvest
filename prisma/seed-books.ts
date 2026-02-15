import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Open Library cover URLs (by ISBN) + picsum fallback for variety
const BOOKS = [
  { title: "The Very Hungry Caterpillar", author: "Eric Carle", gradeMin: 1, gradeMax: 3, genre: "children", theme: "nature", stock: 250, popularity: 95, description: "A caterpillar eats through various foods before transforming into a butterfly.", coverImage: "https://covers.openlibrary.org/b/isbn/0399226907-M.jpg" },
  { title: "Where the Wild Things Are", author: "Maurice Sendak", gradeMin: 1, gradeMax: 4, genre: "children", theme: "adventure", stock: 180, popularity: 92, description: "Max sails to an island of wild creatures who make him their king.", coverImage: "https://covers.openlibrary.org/b/isbn/0060254920-M.jpg" },
  { title: "Goodnight Moon", author: "Margaret Wise Brown", gradeMin: 1, gradeMax: 2, genre: "children", theme: "bedtime", stock: 300, popularity: 90, description: "A little bunny says goodnight to everything.", coverImage: "https://covers.openlibrary.org/b/isbn/0060775858-M.jpg" },
  { title: "The Cat in the Hat", author: "Dr. Seuss", gradeMin: 1, gradeMax: 3, genre: "children", theme: "fun", stock: 220, popularity: 94, description: "A mischievous cat brings chaos to a rainy day.", coverImage: "https://covers.openlibrary.org/b/isbn/039480001X-M.jpg" },
  { title: "Charlotte's Web", author: "E.B. White", gradeMin: 3, gradeMax: 6, genre: "fiction", theme: "friendship", stock: 150, popularity: 88, description: "A spider saves a pig's life with her web messages.", coverImage: "https://covers.openlibrary.org/b/isbn/0064400557-M.jpg" },
  { title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", gradeMin: 4, gradeMax: 8, genre: "fiction", theme: "adventure", stock: 200, popularity: 98, description: "A young wizard discovers his magical heritage.", coverImage: "https://covers.openlibrary.org/b/isbn/0439708184-M.jpg" },
  { title: "Wonder", author: "R.J. Palacio", gradeMin: 4, gradeMax: 8, genre: "fiction", theme: "empathy", diversity: "disability", stock: 120, popularity: 85, description: "A boy with facial differences navigates fifth grade.", coverImage: "https://covers.openlibrary.org/b/isbn/0375869026-M.jpg" },
  { title: "Hidden Figures", author: "Margot Lee Shetterly", gradeMin: 5, gradeMax: 12, genre: "nonfiction", theme: "STEM", diversity: "Black women", stock: 90, popularity: 82, description: "The true story of Black women mathematicians at NASA.", coverImage: "https://covers.openlibrary.org/b/isbn/0062363596-M.jpg" },
  { title: "Brown Girl Dreaming", author: "Jacqueline Woodson", gradeMin: 4, gradeMax: 8, genre: "fiction", theme: "culture", diversity: "Black author", stock: 85, popularity: 80, description: "A memoir in verse about growing up Black.", coverImage: "https://picsum.photos/seed/browngirl/200/300" },
  { title: "The Magic School Bus: Inside the Human Body", author: "Joanna Cole", gradeMin: 2, gradeMax: 5, genre: "fiction", theme: "STEM", stock: 140, popularity: 78, description: "Ms. Frizzle's class takes a trip inside the human body.", coverImage: "https://covers.openlibrary.org/b/isbn/0590414275-M.jpg" },
  { title: "Last Stop on Market Street", author: "Matt de la Peña", gradeMin: 1, gradeMax: 4, genre: "children", theme: "community", diversity: "urban", stock: 100, popularity: 76, description: "A boy and his grandmother ride the bus across town.", coverImage: "https://covers.openlibrary.org/b/isbn/0399257748-M.jpg" },
  { title: "National Geographic Kids: Space", author: null, gradeMin: 2, gradeMax: 6, genre: "nonfiction", theme: "STEM", stock: 110, popularity: 75, description: "Explore the solar system and beyond.", coverImage: "https://picsum.photos/seed/ngspace/200/300" },
  { title: "The Giving Tree", author: "Shel Silverstein", gradeMin: 1, gradeMax: 5, genre: "children", theme: "friendship", stock: 170, popularity: 87, description: "A tree gives everything to a boy throughout his life.", coverImage: "https://covers.openlibrary.org/b/isbn/0060256654-M.jpg" },
  { title: "The Day the Crayons Quit", author: "Drew Daywalt", gradeMin: 1, gradeMax: 4, genre: "children", theme: "creativity", stock: 130, popularity: 84, description: "Crayons write letters explaining why they quit.", coverImage: "https://covers.openlibrary.org/b/isbn/0399255370-M.jpg" },
  { title: "Diary of a Wimpy Kid", author: "Jeff Kinney", gradeMin: 3, gradeMax: 7, genre: "fiction", theme: "humor", stock: 160, popularity: 91, description: "Greg Heffley navigates middle school life.", coverImage: "https://covers.openlibrary.org/b/isbn/0810993139-M.jpg" },
  { title: "The Lightning Thief", author: "Rick Riordan", gradeMin: 4, gradeMax: 8, genre: "fiction", theme: "adventure", stock: 95, popularity: 86, description: "Percy Jackson discovers he's a demigod.", coverImage: "https://covers.openlibrary.org/b/isbn/0786838655-M.jpg" },
  { title: "I Am Malala", author: "Malala Yousafzai", gradeMin: 6, gradeMax: 12, genre: "nonfiction", theme: "culture", diversity: "international", stock: 70, popularity: 79, description: "A girl's fight for education and survival.", coverImage: "https://covers.openlibrary.org/b/isbn/0316322407-M.jpg" },
  { title: "The Snowy Day", author: "Ezra Jack Keats", gradeMin: 1, gradeMax: 3, genre: "children", theme: "nature", diversity: "Black protagonist", stock: 145, popularity: 81, description: "Peter explores his neighborhood on a snowy day.", coverImage: "https://covers.openlibrary.org/b/isbn/0670654000-M.jpg" },
  { title: "Stella Díaz Has Something to Say", author: "Angela Dominguez", gradeMin: 2, gradeMax: 5, genre: "fiction", theme: "culture", diversity: "Latinx", stock: 80, popularity: 72, description: "A shy girl finds her voice in third grade.", coverImage: "https://picsum.photos/seed/stella/200/300" },
  { title: "Hair Love", author: "Matthew A. Cherry", gradeMin: 1, gradeMax: 4, genre: "children", theme: "family", diversity: "Black family", stock: 95, popularity: 77, description: "A father learns to do his daughter's hair.", coverImage: "https://picsum.photos/seed/hairlove/200/300" },
  { title: "The Bad Seed", author: "Jory John", gradeMin: 1, gradeMax: 4, genre: "children", theme: "empathy", stock: 125, popularity: 74, description: "A bad seed tries to change his ways.", coverImage: "https://picsum.photos/seed/badseed/200/300" },
  { title: "Ada Twist, Scientist", author: "Andrea Beaty", gradeMin: 1, gradeMax: 4, genre: "children", theme: "STEM", diversity: "Black girl", stock: 105, popularity: 83, description: "A curious girl uses science to ask questions.", coverImage: "https://covers.openlibrary.org/b/isbn/1419721372-M.jpg" },
  { title: "The One and Only Ivan", author: "Katherine Applegate", gradeMin: 3, gradeMax: 6, genre: "fiction", theme: "animals", stock: 88, popularity: 71, description: "A silverback gorilla tells his story.", coverImage: "https://covers.openlibrary.org/b/isbn/0061992275-M.jpg" },
  { title: "Number the Stars", author: "Lois Lowry", gradeMin: 4, gradeMax: 8, genre: "fiction", theme: "history", stock: 75, popularity: 73, description: "A girl helps her Jewish friend escape the Nazis.", coverImage: "https://covers.openlibrary.org/b/isbn/0547577095-M.jpg" },
  { title: "Because of Winn-Dixie", author: "Kate DiCamillo", gradeMin: 3, gradeMax: 6, genre: "fiction", theme: "friendship", stock: 92, popularity: 69, description: "A girl and a dog change a small town.", coverImage: "https://covers.openlibrary.org/b/isbn/0763644321-M.jpg" },
  { title: "Matilda", author: "Roald Dahl", gradeMin: 3, gradeMax: 6, genre: "fiction", theme: "adventure", stock: 115, popularity: 89, description: "A brilliant girl uses her powers against her cruel parents.", coverImage: "https://covers.openlibrary.org/b/isbn/0142410373-M.jpg" },
  { title: "The BFG", author: "Roald Dahl", gradeMin: 3, gradeMax: 6, genre: "fiction", theme: "adventure", stock: 98, popularity: 70, description: "A girl befriends a friendly giant.", coverImage: "https://covers.openlibrary.org/b/isbn/0142410381-M.jpg" },
  { title: "A Wrinkle in Time", author: "Madeleine L'Engle", gradeMin: 4, gradeMax: 8, genre: "fiction", theme: "STEM", stock: 82, popularity: 68, description: "Children travel through space to save their father.", coverImage: "https://covers.openlibrary.org/b/isbn/0312367546-M.jpg" },
  { title: "The Fault in Our Stars", author: "John Green", gradeMin: 8, gradeMax: 12, genre: "fiction", theme: "empathy", stock: 65, popularity: 93, description: "Two teens with cancer fall in love.", coverImage: "https://covers.openlibrary.org/b/isbn/0525478817-M.jpg" },
  { title: "The Hobbit", author: "J.R.R. Tolkien", gradeMin: 5, gradeMax: 12, genre: "fiction", theme: "adventure", stock: 90, popularity: 96, description: "A hobbit is swept into an epic quest.", coverImage: "https://covers.openlibrary.org/b/isbn/054792822X-M.jpg" },
  { title: "Hatchet", author: "Gary Paulsen", gradeMin: 5, gradeMax: 9, genre: "fiction", theme: "adventure", stock: 78, popularity: 67, description: "A boy survives in the wilderness with only a hatchet.", coverImage: "https://covers.openlibrary.org/b/isbn/1416936475-M.jpg" },
  { title: "Holes", author: "Louis Sachar", gradeMin: 4, gradeMax: 8, genre: "fiction", theme: "adventure", stock: 85, popularity: 66, description: "A boy is sent to a desert camp where he digs holes.", coverImage: "https://covers.openlibrary.org/b/isbn/0439244196-M.jpg" },
  { title: "Esperanza Rising", author: "Pam Muñoz Ryan", gradeMin: 4, gradeMax: 8, genre: "fiction", theme: "culture", diversity: "Latinx", stock: 72, popularity: 65, description: "A girl flees Mexico and starts over in California.", coverImage: "https://picsum.photos/seed/esperanza/200/300" },
  { title: "Front Desk", author: "Kelly Yang", gradeMin: 4, gradeMax: 8, genre: "fiction", theme: "culture", diversity: "Asian American", stock: 68, popularity: 64, description: "A girl helps run a motel while dreaming of writing.", coverImage: "https://picsum.photos/seed/frontdesk/200/300" },
  { title: "New Kid", author: "Jerry Craft", gradeMin: 4, gradeMax: 8, genre: "fiction", theme: "school", diversity: "Black protagonist", stock: 88, popularity: 97, description: "A graphic novel about being the new kid.", coverImage: "https://covers.openlibrary.org/b/isbn/0062691200-M.jpg" },
  { title: "Dog Man", author: "Dav Pilkey", gradeMin: 2, gradeMax: 5, genre: "children", theme: "humor", stock: 200, popularity: 99, description: "A police dog and a cop combine into a crime-fighting hero.", coverImage: "https://covers.openlibrary.org/b/isbn/0545581607-M.jpg" },
  { title: "Captain Underpants", author: "Dav Pilkey", gradeMin: 2, gradeMax: 5, genre: "children", theme: "humor", stock: 175, popularity: 94, description: "Two kids hypnotize their principal into a superhero.", coverImage: "https://covers.openlibrary.org/b/isbn/0439043999-M.jpg" },
  { title: "The Very Impatient Caterpillar", author: "Ross Burach", gradeMin: 1, gradeMax: 3, genre: "children", theme: "humor", stock: 112, popularity: 63, description: "A caterpillar can't wait to become a butterfly.", coverImage: "https://picsum.photos/seed/impatient/200/300" },
  { title: "Pete the Cat: I Love My White Shoes", author: "Eric Litwin", gradeMin: 1, gradeMax: 3, genre: "children", theme: "fun", stock: 165, popularity: 62, description: "Pete steps in different things and his shoes change colors.", coverImage: "https://covers.openlibrary.org/b/isbn/0061906220-M.jpg" },
  { title: "If You Give a Mouse a Cookie", author: "Laura Numeroff", gradeMin: 1, gradeMax: 3, genre: "children", theme: "humor", stock: 155, popularity: 61, description: "A mouse's endless requests after getting a cookie.", coverImage: "https://covers.openlibrary.org/b/isbn/0060245867-M.jpg" },
  { title: "Dragons Love Tacos", author: "Adam Rubin", gradeMin: 1, gradeMax: 4, genre: "children", theme: "humor", stock: 135, popularity: 60, description: "Dragons love tacos but hate spicy salsa.", coverImage: "https://covers.openlibrary.org/b/isbn/0803736800-M.jpg" },
];

async function main() {
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.book.deleteMany({});

  for (const b of BOOKS) {
    await prisma.book.create({
      data: {
        ...b,
        author: b.author ?? undefined,
        genre: b.genre ?? undefined,
        theme: b.theme ?? undefined,
        diversity: (b as { diversity?: string }).diversity ?? undefined,
        coverImage: (b as { coverImage?: string }).coverImage ?? undefined,
      },
    });
  }
  console.log(`Seeded ${BOOKS.length} books`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

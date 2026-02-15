import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@bookharvest.org" },
    create: {
      email: "admin@bookharvest.org",
      password: hashed,
      name: "Admin",
      role: "admin",
      approved: true,
    },
    update: {},
  });
  console.log("Admin:", admin.email);

  let school = await prisma.school.findFirst({ where: { name: "Durham Elementary" } });
  if (!school) {
    school = await prisma.school.create({
      data: {
        name: "Durham Elementary",
        address: "123 Main St",
        city: "Durham",
        state: "NC",
        zip: "27701",
        region: "NC",
      },
    });
  }

  const schoolPw = await bcrypt.hash("school123", 12);
  const schoolUser = await prisma.user.upsert({
    where: { email: "school@example.com" },
    create: {
      email: "school@example.com",
      password: schoolPw,
      name: "School Admin",
      role: "school",
      schoolId: school.id,
      approved: true,
    },
    update: {},
  });
  console.log("School user:", schoolUser.email);

  const books = [
    { title: "The Very Hungry Caterpillar", author: "Eric Carle", gradeMin: 1, gradeMax: 2, genre: "fiction", theme: "nature", diversity: null, stock: 200, bundleSize: 40 },
    { title: "Wonder", author: "R.J. Palacio", gradeMin: 4, gradeMax: 6, genre: "fiction", theme: "empathy", diversity: "disability representation", stock: 150, bundleSize: 40 },
    { title: "Hidden Figures", author: "Margot Lee Shetterly", gradeMin: 4, gradeMax: 6, genre: "nonfiction", theme: "STEM", diversity: "Black women in STEM", stock: 120, bundleSize: 40 },
    { title: "Where the Wild Things Are", author: "Maurice Sendak", gradeMin: 1, gradeMax: 3, genre: "fiction", theme: "adventure", diversity: null, stock: 180, bundleSize: 40 },
    { title: "National Geographic Kids: Space", author: null, gradeMin: 2, gradeMax: 5, genre: "nonfiction", theme: "STEM", diversity: null, stock: 100, bundleSize: 40 },
    { title: "Last Stop on Market Street", author: "Matt de la Peña", gradeMin: 1, gradeMax: 3, genre: "fiction", theme: "community", diversity: "urban, multicultural", stock: 140, bundleSize: 40 },
    { title: "Brown Girl Dreaming", author: "Jacqueline Woodson", gradeMin: 4, gradeMax: 6, genre: "fiction", theme: "culture", diversity: "Black author, memoir", stock: 90, bundleSize: 40 },
    { title: "The Magic School Bus: Inside the Human Body", author: "Joanna Cole", gradeMin: 2, gradeMax: 4, genre: "fiction", theme: "STEM", diversity: null, stock: 160, bundleSize: 40 },
  ];

  const existing = await prisma.book.count();
  if (existing === 0) {
    for (const b of books) {
      await prisma.book.create({ data: b });
    }
    console.log("Seeded", books.length, "books");
  } else {
    console.log("Books already exist, skipping");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

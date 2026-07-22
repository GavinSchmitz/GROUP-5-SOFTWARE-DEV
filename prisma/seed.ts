import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const skills = [
  // Education
  { name: "Guitar Lessons", slug: "guitar-lessons", category: "Education", icon: "guitar", description: "Learn acoustic or electric guitar from beginner to advanced" },
  { name: "Math Tutoring", slug: "math-tutoring", category: "Education", icon: "calculator", description: "Help with algebra, calculus, statistics and more" },
  { name: "Language Teaching", slug: "language-teaching", category: "Education", icon: "languages", description: "Teach or learn a new language with a native speaker" },
  { name: "Piano Lessons", slug: "piano-lessons", category: "Education", icon: "music", description: "Learn piano from classical to contemporary styles" },

  // Home & Garden
  { name: "Plumbing Repair", slug: "plumbing-repair", category: "Home & Garden", icon: "wrench", description: "Fix leaky taps, unclog drains, basic plumbing" },
  { name: "Gardening", slug: "gardening", category: "Home & Garden", icon: "flower", description: "Garden design, planting, maintenance and landscaping" },
  { name: "Painting & Decorating", slug: "painting-decorating", category: "Home & Garden", icon: "paintbrush", description: "Interior/exterior painting, wallpapering, decorating" },
  { name: "Furniture Assembly", slug: "furniture-assembly", category: "Home & Garden", icon: "hammer", description: "Build flat-pack furniture, basic carpentry" },

  // Technology
  { name: "Web Development", slug: "web-development", category: "Technology", icon: "code", description: "Build websites, web apps, and learn to code" },
  { name: "Computer Support", slug: "computer-support", category: "Technology", icon: "monitor", description: "Fix computer issues, setup software, tech support" },
  { name: "Photography", slug: "photography", category: "Technology", icon: "camera", description: "Learn photography, editing, and post-processing" },
  { name: "Video Editing", slug: "video-editing", category: "Technology", icon: "film", description: "Edit videos, create content, learn production" },

  // Creative
  { name: "Drawing & Illustration", slug: "drawing-illustration", category: "Creative", icon: "pen", description: "Learn to draw, sketch, and illustrate" },
  { name: "Cooking & Baking", slug: "cooking-baking", category: "Creative", icon: "chef-hat", description: "Learn to cook meals, bake bread, pastries" },
  { name: "Knitting & Sewing", slug: "knitting-sewing", category: "Creative", icon: "scissors", description: "Learn to knit, sew, and create textiles" },

  // Health & Fitness
  { name: "Personal Training", slug: "personal-training", category: "Health & Fitness", icon: "dumbbell", description: "Get fit with personalized workout plans" },
  { name: "Yoga Instruction", slug: "yoga-instruction", category: "Health & Fitness", icon: "heart", description: "Learn yoga poses, breathing, meditation" },
  { name: "Nutrition Advice", slug: "nutrition-advice", category: "Health & Fitness", icon: "apple", description: "Meal planning, dietary advice, healthy eating" },

  // Professional
  { name: "CV & Resume Writing", slug: "cv-resume-writing", category: "Professional", icon: "file-text", description: "Craft compelling resumes and cover letters" },
  { name: "Public Speaking", slug: "public-speaking", category: "Professional", icon: "mic", description: "Improve presentation and public speaking skills" },
];

const categories = [
  { name: "Education", icon: "book-open", description: "Teach and learn academic subjects and creative skills" },
  { name: "Home & Garden", icon: "home", description: "Fix, build, and beautify your living space" },
  { name: "Technology", icon: "laptop", description: "Digital skills, computer help, and tech projects" },
  { name: "Creative", icon: "palette", description: "Art, cooking, crafts, and creative expression" },
  { name: "Health & Fitness", icon: "heart-pulse", description: "Wellness, exercise, and healthy living" },
  { name: "Professional", icon: "briefcase", description: "Career development and professional skills" },
];

async function main() {
  console.log("Seeding database...");

  // Create categories as skills with high-level descriptions
  for (const cat of categories) {
    await prisma.skill.upsert({
      where: { slug: cat.name.toLowerCase().replace(/ & /g, "-") },
      update: {},
      create: {
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/ & /g, "-"),
        category: "Category",
        icon: cat.icon,
        description: cat.description,
      },
    });
  }

  // Create skills
  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { slug: skill.slug },
      update: {},
      create: skill,
    });
  }

  // Create demo users
  const passwordHash = await bcrypt.hash("password123", 10);

  const demoUsers = [
    {
      name: "Sarah Chen",
      email: "sarah@example.com",
      bio: "Professional music teacher with 10 years of experience. Love sharing the joy of music!",
      location: "London, UK",
      skills: [
        { slug: "guitar-lessons", proficiency: "EXPERT", isOffered: true },
        { slug: "piano-lessons", proficiency: "ADVANCED", isOffered: true },
        { slug: "web-development", proficiency: "BEGINNER", isOffered: false },
      ],
    },
    {
      name: "James Wilson",
      email: "james@example.com",
      bio: "Handyman and gardener. Happy to help fix things around the house!",
      location: "Manchester, UK",
      skills: [
        { slug: "plumbing-repair", proficiency: "EXPERT", isOffered: true },
        { slug: "gardening", proficiency: "ADVANCED", isOffered: true },
        { slug: "furniture-assembly", proficiency: "ADVANCED", isOffered: true },
        { slug: "guitar-lessons", proficiency: "BEGINNER", isOffered: false },
      ],
    },
    {
      name: "Priya Patel",
      email: "priya@example.com",
      bio: "Full-stack developer and coding enthusiast. Let me help you learn to code!",
      location: "Birmingham, UK",
      skills: [
        { slug: "web-development", proficiency: "EXPERT", isOffered: true },
        { slug: "computer-support", proficiency: "ADVANCED", isOffered: true },
        { slug: "cooking-baking", proficiency: "BEGINNER", isOffered: false },
        { slug: "yoga-instruction", proficiency: "BEGINNER", isOffered: false },
      ],
    },
    {
      name: "Marcus Thompson",
      email: "marcus@example.com",
      bio: "Personal trainer and nutrition coach. Fitness is for everyone!",
      location: "Leeds, UK",
      skills: [
        { slug: "personal-training", proficiency: "EXPERT", isOffered: true },
        { slug: "yoga-instruction", proficiency: "ADVANCED", isOffered: true },
        { slug: "nutrition-advice", proficiency: "ADVANCED", isOffered: true },
        { slug: "math-tutoring", proficiency: "INTERMEDIATE", isOffered: false },
      ],
    },
    {
      name: "Emma Rodriguez",
      email: "emma@example.com",
      bio: "Professional photographer and creative soul. Let's capture beautiful moments together!",
      location: "Edinburgh, UK",
      skills: [
        { slug: "photography", proficiency: "EXPERT", isOffered: true },
        { slug: "video-editing", proficiency: "ADVANCED", isOffered: true },
        { slug: "drawing-illustration", proficiency: "INTERMEDIATE", isOffered: true },
        { slug: "language-teaching", proficiency: "EXPERT", isOffered: true, note: "Spanish native speaker" },
        { slug: "personal-training", proficiency: "BEGINNER", isOffered: false },
      ],
    },
  ];

  for (const userData of demoUsers) {
    const { skills: userSkills, ...userInfo } = userData;

    const user = await prisma.user.upsert({
      where: { email: userInfo.email },
      update: {},
      create: {
        ...userInfo,
        passwordHash,
        creditBalance: 3,
      },
    });

    // Create starter credit entry
    await prisma.timeCredit.create({
      data: {
        userId: user.id,
        amount: 3,
        type: "INITIAL",
        description: "Welcome to HourBank! Here are your starter credits.",
      },
    });

    // Create skills
    for (const skillData of userSkills) {
      const skill = await prisma.skill.findUnique({
        where: { slug: skillData.slug },
      });
      if (skill) {
        await prisma.userSkill.upsert({
          where: {
            userId_skillId_isOffered: {
              userId: user.id,
              skillId: skill.id,
              isOffered: skillData.isOffered,
            },
          },
          update: {},
          create: {
            userId: user.id,
            skillId: skill.id,
            proficiency: skillData.proficiency,
            isOffered: skillData.isOffered,
            note: (skillData as Record<string, unknown>).note as string | undefined,
          },
        });
      }
    }

    console.log(`Created user: ${user.name} (${user.email})`);
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

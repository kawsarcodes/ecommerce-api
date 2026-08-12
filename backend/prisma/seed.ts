import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
import prisma from '../src/lib/prisma';

async function main() {
  // Clean up existing data
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@test.dev';
  const adminPasswordPlain = process.env.ADMIN_PASSWORD || 'admin123';
  const userEmail = process.env.USER_EMAIL || 'user@test.dev';
  const userPasswordPlain = process.env.USER_PASSWORD || 'user123';

  const passwordAdmin = await bcrypt.hash(adminPasswordPlain, 10);
  const passwordUser = await bcrypt.hash(userPasswordPlain, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Admin',
      email: adminEmail,
      password: passwordAdmin,
      role: 'ADMIN',
    },
  });

  const regular = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      name: 'Regular User',
      email: userEmail,
      password: passwordUser,
      role: 'USER',
    },
  });

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Electronics' },
      update: {},
      create: { name: 'Electronics' },
    }),
    prisma.category.upsert({
      where: { name: 'Clothing' },
      update: {},
      create: { name: 'Clothing' },
    }),
    prisma.category.upsert({
      where: { name: 'Books' },
      update: {},
      create: { name: 'Books' },
    }),
    prisma.category.upsert({
      where: { name: 'Home & Kitchen' },
      update: {},
      create: { name: 'Home & Kitchen' },
    }),
    prisma.category.upsert({
      where: { name: 'Sports & Outdoors' },
      update: {},
      create: { name: 'Sports & Outdoors' },
    }),
  ]);

  // Products
  const productsData = [
    // Electronics
    {
      name: 'Pixel 8',
      description: 'Advanced Android smartphone featuring an updated camera system and bright OLED screen.',
      price: 699.99,
      categoryId: categories[0].id,
      userId: admin.id,
    },
    {
      name: 'Sony Headphones',
      description: 'Over ear wireless headphones with active noise cancellation and 30 hour battery life.',
      price: 199.0,
      categoryId: categories[0].id,
      userId: regular.id,
    },
    {
      name: 'Smart TV',
      description: 'Ultra high definition Smart TV with deep blacks and fast refresh rates for gaming.',
      price: 799.99,
      categoryId: categories[0].id,
      userId: admin.id,
    },
    {
      name: 'Gaming Laptop',
      description: 'High performance gaming laptop featuring RTX graphics and a 160Hz display.',
      price: 1499.99,
      categoryId: categories[0].id,
      userId: regular.id,
    },
    {
      name: 'Bluetooth Speaker',
      description: 'Compact portable Bluetooth speaker with dual passive radiators and IP67 rating.',
      price: 89.99,
      categoryId: categories[0].id,
      userId: admin.id,
    },
    {
      name: 'Apple Watch',
      description: 'Smartwatch with advanced health tracking sensors and bright always on display.',
      price: 249.99,
      categoryId: categories[0].id,
      userId: regular.id,
    },

    // Clothing
    {
      name: 'Denim Jacket',
      description: 'Timeless dark wash denim trucker jacket built for daily wear.',
      price: 59.99,
      categoryId: categories[1].id,
      userId: regular.id,
    },
    {
      name: 'Graphic Tee',
      description: 'Heavyweight cotton jersey shirt featuring small chest logo print.',
      price: 19.99,
      categoryId: categories[1].id,
      userId: admin.id,
    },
    {
      name: 'Running Shoes',
      description: 'Neutral road running shoes with responsive React foam cushioning.',
      price: 79.99,
      categoryId: categories[1].id,
      userId: regular.id,
    },
    {
      name: 'Wool Overcoat',
      description: 'Tailored single breasted winter coat made with warm wool fabric.',
      price: 149.99,
      categoryId: categories[1].id,
      userId: admin.id,
    },
    {
      name: 'Leather Wallet',
      description: 'Slim leather bifold wallet with hidden bill section and RFID protection.',
      price: 29.99,
      categoryId: categories[1].id,
      userId: regular.id,
    },
    {
      name: 'Yoga Leggings',
      description: 'Soft weightless yoga pants with high waist coverage.',
      price: 34.99,
      categoryId: categories[1].id,
      userId: admin.id,
    },

    // Books
    {
      name: 'Silent Patient',
      description: 'Psychological thriller novel written by Alex Michaelides.',
      price: 14.99,
      categoryId: categories[2].id,
      userId: admin.id,
    },
    {
      name: 'Recipe Cookbook',
      description: 'Essential kitchen guidebook and cookbook written by Samin Nosrat.',
      price: 24.99,
      categoryId: categories[2].id,
      userId: regular.id,
    },
    {
      name: 'SciFi Trilogy',
      description: 'Hardcover sci fi trilogy collection written by Cixin Liu.',
      price: 39.99,
      categoryId: categories[2].id,
      userId: admin.id,
    },
    {
      name: 'Atomic Habits',
      description: 'Practical guide to building good habits and breaking bad ones by James Clear.',
      price: 19.99,
      categoryId: categories[2].id,
      userId: regular.id,
    },
    {
      name: 'Sapiens',
      description: 'Exploration of human history and evolution written by Yuval Noah Harari.',
      price: 34.99,
      categoryId: categories[2].id,
      userId: admin.id,
    },

    // Home & Kitchen
    {
      name: 'Coffee Maker',
      description: 'Drip coffee maker with precise temperature control and custom brew settings.',
      price: 89.99,
      categoryId: categories[3].id,
      userId: regular.id,
    },
    {
      name: 'Cookware Set',
      description: 'Hard anodized nonstick cookware set with stay cool handles.',
      price: 129.99,
      categoryId: categories[3].id,
      userId: admin.id,
    },
    {
      name: 'Memory Pillow',
      description: 'Adaptive memory foam pillow providing targeted neck support.',
      price: 39.99,
      categoryId: categories[3].id,
      userId: regular.id,
    },
    {
      name: 'Air Purifier',
      description: 'True HEPA filter air purifier designed for quiet indoor operation.',
      price: 159.99,
      categoryId: categories[3].id,
      userId: admin.id,
    },
    {
      name: 'Knife Set',
      description: 'German stainless steel kitchen knife set with hardwood storage block.',
      price: 74.99,
      categoryId: categories[3].id,
      userId: regular.id,
    },

    // Sports & Outdoors
    {
      name: 'Yoga Mat',
      description: 'High density cushion yoga mat designed for joint support and grip.',
      price: 29.99,
      categoryId: categories[4].id,
      userId: admin.id,
    },
    {
      name: 'Camping Tent',
      description: 'Weatherproof dome tent with quick setup system for outdoor camping.',
      price: 189.99,
      categoryId: categories[4].id,
      userId: regular.id,
    },
    {
      name: 'Dumbbell Set',
      description: 'Adjustable dumbbell set replaces 15 pairs of weight plates.',
      price: 99.99,
      categoryId: categories[4].id,
      userId: admin.id,
    },
    {
      name: 'Mountain Bike',
      description: 'Versatile hardtail trail bike with disc brakes and front suspension.',
      price: 499.99,
      categoryId: categories[4].id,
      userId: regular.id,
    },
    {
      name: 'Fitness Band',
      description: 'Water resistant fitness band featuring built in GPS and heart rate monitoring.',
      price: 44.99,
      categoryId: categories[4].id,
      userId: admin.id,
    },
  ];

  const productPromises = productsData.map((p) =>
    prisma.product.create({ data: p })
  );
  const products = await Promise.all(productPromises);

  // Reviews
  await prisma.review.createMany({
    data: [
      // Pixel 8
      {
        rating: 5,
        comment: 'Excellent phone! Camera speed and photo quality are top tier.',
        productId: products[0].id,
        userId: regular.id,
      },
      {
        rating: 4,
        comment: 'Great overall device, though battery life could be slightly longer.',
        productId: products[0].id,
        userId: admin.id,
      },
      // Sony Headphones
      {
        rating: 5,
        comment: 'Amazing sound quality and noise cancellation!',
        productId: products[1].id,
        userId: admin.id,
      },
      {
        rating: 4,
        comment: 'Very comfortable for long listening sessions.',
        productId: products[1].id,
        userId: regular.id,
      },
      // Smart TV
      {
        rating: 5,
        comment: 'Incredible picture quality and deep blacks!',
        productId: products[2].id,
        userId: regular.id,
      },
      // Gaming Laptop
      {
        rating: 5,
        comment: 'Perfect for gaming and heavy workloads.',
        productId: products[3].id,
        userId: admin.id,
      },
      // Denim Jacket
      {
        rating: 4,
        comment: 'Good quality denim and classic style.',
        productId: products[6].id,
        userId: admin.id,
      },
      {
        rating: 5,
        comment: 'Perfect fit and very stylish!',
        productId: products[6].id,
        userId: regular.id,
      },
      // Graphic Tee
      {
        rating: 4,
        comment: 'Nice design, material feels comfortable.',
        productId: products[7].id,
        userId: regular.id,
      },
      // Running Shoes
      {
        rating: 4,
        comment: 'Very comfortable for daily road running.',
        productId: products[8].id,
        userId: admin.id,
      },
      // Silent Patient
      {
        rating: 3,
        comment: 'Good read with an interesting twist near the end.',
        productId: products[12].id,
        userId: regular.id,
      },
      // Coffee Maker
      {
        rating: 5,
        comment: 'Makes great coffee every single morning!',
        productId: products[17].id,
        userId: admin.id,
      },
      // Mountain Bike
      {
        rating: 4,
        comment: 'Great entry level bike for riding local trails.',
        productId: products[25].id,
        userId: regular.id,
      },
    ],
  });

  console.log(`Seeding completed. Created ${products.length} products, ${categories.length} categories, and multiple reviews.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
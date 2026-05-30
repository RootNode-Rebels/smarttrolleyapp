import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      name: 'Admin',
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  
  // Create Worker User
  const worker = await prisma.user.upsert({
    where: { username: 'worker' },
    update: {},
    create: {
      name: 'Adhi (Worker)',
      username: 'worker',
      password: hashedPassword,
      role: 'WORKER',
    },
  })

  // Sample Products
  const products = [
    { barcode: '101', name: 'Fresh Milk 500ml', price: 28, stock: 50 },
    { barcode: '102', name: 'Whole Wheat Bread', price: 45, stock: 20 },
    { barcode: '103', name: 'Farm Eggs (6pcs)', price: 55, stock: 30 },
    { barcode: '104', name: 'Maggi Noodles', price: 14, stock: 100 },
    { barcode: '105', name: 'Coca Cola 750ml', price: 40, stock: 40 },
    { barcode: '106', name: 'Lays Chips', price: 20, stock: 60 },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { barcode: product.barcode },
      update: {},
      create: product,
    })
  }

  console.log('Seed completed successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

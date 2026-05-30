'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

import bcrypt from 'bcryptjs'

export async function loginWithCredentials(username: string, passwordString: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  })

  if (user) {
    const isValid = await bcrypt.compare(passwordString, user.password)
    if (isValid) {
      const cookieStore = await cookies()
      cookieStore.set('auth_token', user.id, { httpOnly: true, path: '/' })
      return { success: true, role: user.role, name: user.name }
    }
  }

  return { success: false, error: 'Invalid username or password' }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return null

  const user = await prisma.user.findUnique({
    where: { id: token },
  })

  return user
}

export async function lookupProduct(barcode: string) {
  // Check local DB first
  let product = await prisma.product.findUnique({
    where: { barcode },
  })

  if (!product) {
    // Try Open Food Facts API
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
      const data = await res.json()
      
      if (data.status === 1) {
        // Automatically add it to local DB with a default price if found
        product = await prisma.product.create({
          data: {
            barcode,
            name: data.product.product_name || 'Unknown Product',
            price: 50, // Default fallback price
            stock: 10, // Default stock
            imageUrl: data.product.image_url,
          },
        })
      }
    } catch (e) {
      console.error("Open Food Facts lookup failed:", e)
    }
  }

  return product
}

export async function getInventory() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') throw new Error("Unauthorized")

  return await prisma.product.findMany({
    orderBy: { name: 'asc' },
  })
}

export async function processTransaction(items: { barcode: string; qty: number }[]) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  // Calculate total and prepare items
  let totalAmount = 0
  const transactionItems = []
  
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { barcode: item.barcode } })
    if (product) {
      totalAmount += product.price * item.qty
      transactionItems.push({
        productBarcode: product.barcode,
        quantity: item.qty,
        price: product.price,
        costPrice: product.costPrice,
      })
      
      // Update stock
      await prisma.product.update({
        where: { barcode: product.barcode },
        data: { stock: product.stock - item.qty }
      })
    }
  }

  // Create transaction
  const transaction = await prisma.transaction.create({
    data: {
      totalAmount,
      paymentMode: 'CASH', // Hardcoded for this prototype
      cashierId: user.id,
      items: {
        create: transactionItems
      }
    },
    include: { items: { include: { product: true } }, cashier: true }
  })

  return transaction
}

export async function addProduct(data: { barcode: string, name: string, price: number, costPrice: number, stock: number }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') throw new Error("Unauthorized")

  return await prisma.product.upsert({
    where: { barcode: data.barcode },
    update: data,
    create: data,
  })
}

export async function deleteProduct(barcode: string) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') throw new Error("Unauthorized")

  return await prisma.product.delete({
    where: { barcode }
  })
}

export async function getFinanceData() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') throw new Error("Unauthorized")

  const transactions = await prisma.transaction.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  })

  let totalRevenue = 0
  let totalCost = 0

  transactions.forEach(tx => {
    totalRevenue += tx.totalAmount
    tx.items.forEach(item => {
      totalCost += (item.costPrice * item.quantity)
    })
  })

  // To account for tax logic in the POS (18%), we calculate actual gross profit roughly.
  // The UI currently just adds 18% tax on top. The totalAmount in DB includes tax.
  // Subtotal = totalAmount / 1.18.
  // Real profit = Subtotal - TotalCost
  
  const subtotal = totalRevenue / 1.18
  const taxCollected = totalRevenue - subtotal
  const grossProfit = subtotal - totalCost

  return {
    transactions,
    metrics: {
      totalRevenue,
      subtotal,
      taxCollected,
      totalCost,
      grossProfit
    }
  }
}

export async function getUsers() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') throw new Error("Unauthorized")

  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, username: true, name: true, role: true, createdAt: true }
  })
}

export async function createUser(data: { name: string, username: string, passwordString: string, role: string }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') throw new Error("Unauthorized")

  const hashedPassword = await bcrypt.hash(data.passwordString, 10)
  
  return await prisma.user.create({
    data: {
      name: data.name,
      username: data.username,
      password: hashedPassword,
      role: data.role
    }
  })
}

export async function deleteUser(id: string) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') throw new Error("Unauthorized")

  return await prisma.user.delete({
    where: { id }
  })
}

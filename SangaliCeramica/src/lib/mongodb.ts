import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const isConfigured = !!(uri && !uri.includes('placeholder'))

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

if (isConfigured && uri) {
  try {
    if (process.env.NODE_ENV === 'development') {
      let globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>
      }

      if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri)
        globalWithMongo._mongoClientPromise = client.connect()
      }
      clientPromise = globalWithMongo._mongoClientPromise
    } else {
      client = new MongoClient(uri)
      clientPromise = client.connect()
    }
  } catch (err) {
    console.error('Failed to initialize MongoDB client:', err)
  }
}

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!clientPromise) return null
  return clientPromise
}

export async function getDb() {
  const client = await getMongoClient()
  if (!client) return null
  return client.db('sangli_ceramica')
}

export function isMongoConfigured(): boolean {
  return isConfigured
}

import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "MONGODB_URI environment variable is not defined in production."
        );
      }
    }

    const finalUri = uri || "mongodb://127.0.0.1:27017/mykit";
    const dbName = process.env.MONGODB_DB_NAME || "mykit";

    const opts = {
      bufferCommands: false,
      dbName,
    };

    cached.promise = mongoose.connect(finalUri, opts).then((m) => {
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;

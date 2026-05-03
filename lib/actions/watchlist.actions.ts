'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    // Better Auth stores users in the "user" collection
    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}

export async function addWatchlistItem(symbol: string, company: string) {
  try {
    const { auth } = await import('@/lib/better-auth/auth');
    const { headers } = await import('next/headers');
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error('Unauthorized');

    await connectToDatabase();
    
    await Watchlist.findOneAndUpdate(
      { userId: session.user.id, symbol: symbol.toUpperCase() },
      { userId: session.user.id, symbol: symbol.toUpperCase(), company },
      { upsert: true, new: true }
    );
    return { success: true };
  } catch (err: any) {
    console.error('addWatchlistItem error:', err);
    return { success: false, error: err.message };
  }
}

export async function removeWatchlistItem(symbol: string) {
  try {
    const { auth } = await import('@/lib/better-auth/auth');
    const { headers } = await import('next/headers');
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error('Unauthorized');

    await connectToDatabase();
    await Watchlist.findOneAndDelete({ userId: session.user.id, symbol: symbol.toUpperCase() });
    return { success: true };
  } catch (err: any) {
    console.error('removeWatchlistItem error:', err);
    return { success: false, error: err.message };
  }
}

export async function getWatchlist() {
  try {
    const { auth } = await import('@/lib/better-auth/auth');
    const { headers } = await import('next/headers');
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return [];

    await connectToDatabase();
    const items = await Watchlist.find({ userId: session.user.id }).sort({ addedAt: -1 }).lean();
    return JSON.parse(JSON.stringify(items));
  } catch (err) {
    console.error('getWatchlist error:', err);
    return [];
  }
}

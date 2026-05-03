'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Alert } from '@/database/models/alert.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';

export async function createAlert(data: {
  name: string;
  symbol: string;
  type: string;
  condition: string;
  targetPrice: number;
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error('Unauthorized');

    await connectToDatabase();

    const existingAlertsCount = await Alert.countDocuments({ userId: session.user.id });
    if (existingAlertsCount >= 10) {
      return { success: false, error: "You have reached the maximum limit of 10 alerts." };
    }

    const newAlert = await Alert.create({
      userId: session.user.id,
      ...data,
      frequency: 'Once per day', // Hardcoded default to satisfy model
      isActive: true,
    });

    return { success: true, data: JSON.parse(JSON.stringify(newAlert)) };
  } catch (error: any) {
    console.error('Error creating alert:', error);
    return { success: false, error: error.message };
  }
}

export async function getAlerts() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return [];

    await connectToDatabase();

    const alerts = await Alert.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(alerts));
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
}

export async function toggleAlert(alertId: string, isActive: boolean) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error('Unauthorized');

    await connectToDatabase();

    await Alert.findOneAndUpdate(
      { _id: alertId, userId: session.user.id },
      { isActive },
      { new: true }
    );

    return { success: true };
  } catch (error: any) {
    console.error('Error toggling alert:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteAlert(alertId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error('Unauthorized');

    await connectToDatabase();

    await Alert.findOneAndDelete({ _id: alertId, userId: session.user.id });

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting alert:', error);
    return { success: false, error: error.message };
  }
}

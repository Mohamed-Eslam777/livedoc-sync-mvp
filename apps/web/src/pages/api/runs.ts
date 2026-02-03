import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { prisma } from '@livedoc-sync/shared';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const runs = await prisma.run.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
                repo: true,
            },
        });

        return res.status(200).json(runs);
    } catch (error) {
        console.error('Error fetching runs:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

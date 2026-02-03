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
        const repos = await prisma.repo.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                installation: true,
            },
        });

        return res.status(200).json(repos);
    } catch (error) {
        console.error('Error fetching repos:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

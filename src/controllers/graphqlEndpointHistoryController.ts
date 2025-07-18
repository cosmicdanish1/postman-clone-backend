import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { GraphQLEndpointHistory } from '../entities/GraphQLEndpointHistory';

export const createGraphQLEndpointHistory = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'Url is required.' });
    }
    const repo = AppDataSource.getRepository(GraphQLEndpointHistory);
    const entry = repo.create({ url });
    await repo.save(entry);
    return res.json({ success: true, data: entry });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getGraphQLEndpointHistory = async (_req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(GraphQLEndpointHistory);
    const entries = await repo.find({ order: { created_at: 'DESC' } });
    return res.json({ success: true, data: entries });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteGraphQLEndpointHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const repo = AppDataSource.getRepository(GraphQLEndpointHistory);
    await repo.delete(id);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

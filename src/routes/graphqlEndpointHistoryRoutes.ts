import { Router } from 'express';
import {
  createGraphQLEndpointHistory,
  getGraphQLEndpointHistory,
  deleteGraphQLEndpointHistory,
} from '../controllers/graphqlEndpointHistoryController';

const router = Router();

// POST /api/graphql-endpoints - save a new endpoint+query
router.post('/', createGraphQLEndpointHistory);

// GET /api/graphql-endpoints - list all endpoint+query history
router.get('/', getGraphQLEndpointHistory);

// DELETE /api/graphql-endpoints/:id - delete an entry
router.delete('/:id', deleteGraphQLEndpointHistory);

export default router;

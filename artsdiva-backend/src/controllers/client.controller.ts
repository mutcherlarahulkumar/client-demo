import type { Request, Response } from "express";
import * as clientService from "../services/client.service";
import type { CreateClientInput, ListClientsQuery, UpdateClientInput } from "../validators/client.validator";

function handleClientError(err: unknown, res: Response): void {
  if (err instanceof clientService.ClientNotFoundError) {
    res.status(404).json({ message: err.message });
    return;
  }
  if (err instanceof clientService.ClientHasLeasesError) {
    res.status(400).json({ message: err.message });
    return;
  }
  throw err;
}

export async function listClientsHandler(_req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ListClientsQuery;
  const result = await clientService.listClients(query);
  res.status(200).json(result);
}

export async function exportClientsHandler(_req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ListClientsQuery;
  const data = await clientService.exportClients(query);
  res.status(200).json({ data });
}

export async function getClientHandler(req: Request, res: Response): Promise<void> {
  try {
    const client = await clientService.getClientById(req.params.id as string);
    res.status(200).json({ client });
  } catch (err) {
    handleClientError(err, res);
  }
}

export async function createClientHandler(req: Request, res: Response): Promise<void> {
  const input = req.body as CreateClientInput;
  const client = await clientService.createClient(input);
  res.status(201).json({ client });
}

export async function updateClientHandler(req: Request, res: Response): Promise<void> {
  const input = req.body as UpdateClientInput;
  try {
    const client = await clientService.updateClient(req.params.id as string, input);
    res.status(200).json({ client });
  } catch (err) {
    handleClientError(err, res);
  }
}

export async function deleteClientHandler(req: Request, res: Response): Promise<void> {
  try {
    await clientService.deleteClient(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    handleClientError(err, res);
  }
}

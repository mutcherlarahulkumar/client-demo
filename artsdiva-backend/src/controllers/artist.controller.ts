import type { Request, Response } from "express";
import * as artistService from "../services/artist.service";
import type { CreateArtistInput, ListArtistsQuery, UpdateArtistInput } from "../validators/artist.validator";

export async function listArtistsHandler(_req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ListArtistsQuery;
  const result = await artistService.listArtists(query);
  res.status(200).json(result);
}

export async function exportArtistsHandler(_req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ListArtistsQuery;
  const data = await artistService.exportArtists(query);
  res.status(200).json({ data });
}

export async function getArtistHandler(req: Request, res: Response): Promise<void> {
  try {
    const artist = await artistService.getArtistById(req.params.id as string);
    res.status(200).json({ artist });
  } catch (err) {
    if (err instanceof artistService.ArtistNotFoundError) {
      res.status(404).json({ message: err.message });
      return;
    }
    throw err;
  }
}

export async function createArtistHandler(req: Request, res: Response): Promise<void> {
  const input = req.body as CreateArtistInput;
  const artist = await artistService.createArtist(input);
  res.status(201).json({ artist });
}

export async function updateArtistHandler(req: Request, res: Response): Promise<void> {
  const input = req.body as UpdateArtistInput;

  try {
    const artist = await artistService.updateArtist(req.params.id as string, input);
    res.status(200).json({ artist });
  } catch (err) {
    if (err instanceof artistService.ArtistNotFoundError) {
      res.status(404).json({ message: err.message });
      return;
    }
    throw err;
  }
}

export async function deleteArtistHandler(req: Request, res: Response): Promise<void> {
  try {
    await artistService.deleteArtist(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    if (err instanceof artistService.ArtistNotFoundError) {
      res.status(404).json({ message: err.message });
      return;
    }
    if (err instanceof artistService.ArtistHasArtworksError) {
      res.status(400).json({ message: err.message });
      return;
    }
    throw err;
  }
}

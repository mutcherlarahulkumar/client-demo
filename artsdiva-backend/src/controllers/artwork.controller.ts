import type { Request, Response } from "express";
import * as artworkService from "../services/artwork.service";
import { uploadFiles } from "../services/upload.service";
import type {
  CreateArtworkInput,
  ListArtworksQuery,
  UpdateArtworkInput,
  UpdateArtworkStatusInput,
} from "../validators/artwork.validator";

function handleArtworkError(err: unknown, res: Response): void {
  if (
    err instanceof artworkService.ArtworkNotFoundError ||
    err instanceof artworkService.ArtistNotFoundForArtworkError
  ) {
    res.status(404).json({ message: err.message });
    return;
  }
  if (err instanceof artworkService.ArtworkHasLeasesError) {
    res.status(400).json({ message: err.message });
    return;
  }
  throw err;
}

export async function listArtworksHandler(_req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ListArtworksQuery;
  const result = await artworkService.listArtworks(query);
  res.status(200).json(result);
}

export async function getArtworkHandler(req: Request, res: Response): Promise<void> {
  try {
    const artwork = await artworkService.getArtworkById(req.params.id as string);
    res.status(200).json({ artwork });
  } catch (err) {
    handleArtworkError(err, res);
  }
}

export async function createArtworkHandler(req: Request, res: Response): Promise<void> {
  const input = req.body as CreateArtworkInput;
  try {
    const artwork = await artworkService.createArtwork(input);
    res.status(201).json({ artwork });
  } catch (err) {
    handleArtworkError(err, res);
  }
}

export async function updateArtworkHandler(req: Request, res: Response): Promise<void> {
  const input = req.body as UpdateArtworkInput;
  try {
    const artwork = await artworkService.updateArtwork(req.params.id as string, input);
    res.status(200).json({ artwork });
  } catch (err) {
    handleArtworkError(err, res);
  }
}

export async function updateArtworkStatusHandler(req: Request, res: Response): Promise<void> {
  const input = req.body as UpdateArtworkStatusInput;
  try {
    const artwork = await artworkService.updateArtworkStatus(req.params.id as string, input);
    res.status(200).json({ artwork });
  } catch (err) {
    handleArtworkError(err, res);
  }
}

export async function deleteArtworkHandler(req: Request, res: Response): Promise<void> {
  try {
    await artworkService.deleteArtwork(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    handleArtworkError(err, res);
  }
}

export async function uploadArtworkImagesHandler(req: Request, res: Response): Promise<void> {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];

  if (files.length === 0) {
    res.status(400).json({ message: "No image files provided" });
    return;
  }

  try {
    const urls = await uploadFiles(files);
    const artwork = await artworkService.addArtworkImages(req.params.id as string, urls);
    res.status(200).json({ artwork });
  } catch (err) {
    handleArtworkError(err, res);
  }
}

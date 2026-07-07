import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate, validateQuery } from "../middleware/validate.middleware";
import { uploadImages } from "../middleware/upload.middleware";
import {
  createArtworkSchema,
  listArtworksQuerySchema,
  updateArtworkSchema,
  updateArtworkStatusSchema,
} from "../validators/artwork.validator";
import {
  createArtworkHandler,
  deleteArtworkHandler,
  exportArtworksHandler,
  getArtworkHandler,
  listArtworksHandler,
  updateArtworkHandler,
  updateArtworkStatusHandler,
  uploadArtworkImagesHandler,
} from "../controllers/artwork.controller";

const router: Router = Router();

// All artwork routes require a logged-in user (STAFF or ADMIN).
router.use(authenticate);

router.get("/", validateQuery(listArtworksQuerySchema), asyncHandler(listArtworksHandler));
// Must precede /:id — otherwise Express would treat "export" as an id.
router.get("/export", validateQuery(listArtworksQuerySchema), asyncHandler(exportArtworksHandler));
router.get("/:id", asyncHandler(getArtworkHandler));
router.post("/", validate(createArtworkSchema), asyncHandler(createArtworkHandler));
router.put("/:id", validate(updateArtworkSchema), asyncHandler(updateArtworkHandler));
router.patch("/:id/status", validate(updateArtworkStatusSchema), asyncHandler(updateArtworkStatusHandler));
router.post("/:id/images", uploadImages.array("images", 10), asyncHandler(uploadArtworkImagesHandler));
router.delete("/:id", authorize("ADMIN"), asyncHandler(deleteArtworkHandler));

export default router;

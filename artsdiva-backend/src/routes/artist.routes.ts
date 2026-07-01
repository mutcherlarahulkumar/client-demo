import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate, validateQuery } from "../middleware/validate.middleware";
import { createArtistSchema, listArtistsQuerySchema, updateArtistSchema } from "../validators/artist.validator";
import {
  createArtistHandler,
  deleteArtistHandler,
  getArtistHandler,
  listArtistsHandler,
  updateArtistHandler,
} from "../controllers/artist.controller";

const router: Router = Router();

// All artist routes require a logged-in user (STAFF or ADMIN).
router.use(authenticate);

router.get("/", validateQuery(listArtistsQuerySchema), asyncHandler(listArtistsHandler));
router.get("/:id", asyncHandler(getArtistHandler));
router.post("/", validate(createArtistSchema), asyncHandler(createArtistHandler));
router.put("/:id", validate(updateArtistSchema), asyncHandler(updateArtistHandler));
router.delete("/:id", authorize("ADMIN"), asyncHandler(deleteArtistHandler));

export default router;

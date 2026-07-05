import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate, validateQuery } from "../middleware/validate.middleware";
import { createClientSchema, listClientsQuerySchema, updateClientSchema } from "../validators/client.validator";
import {
  createClientHandler,
  deleteClientHandler,
  exportClientsHandler,
  getClientHandler,
  listClientsHandler,
  updateClientHandler,
} from "../controllers/client.controller";

const router: Router = Router();

// All client routes require a logged-in user (STAFF or ADMIN).
router.use(authenticate);

router.get("/", validateQuery(listClientsQuerySchema), asyncHandler(listClientsHandler));
// Must precede /:id — otherwise Express would treat "export" as an id.
router.get("/export", validateQuery(listClientsQuerySchema), asyncHandler(exportClientsHandler));
router.get("/:id", asyncHandler(getClientHandler));
router.post("/", validate(createClientSchema), asyncHandler(createClientHandler));
router.put("/:id", validate(updateClientSchema), asyncHandler(updateClientHandler));
router.delete("/:id", authorize("ADMIN"), asyncHandler(deleteClientHandler));

export default router;

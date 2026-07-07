import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate, validateQuery } from "../middleware/validate.middleware";
import { uploadDocument } from "../middleware/upload.middleware";
import { createDocumentSchema, listDocumentsQuerySchema } from "../validators/document.validator";
import { createDocumentHandler, deleteDocumentHandler, listDocumentsHandler } from "../controllers/document.controller";

const router: Router = Router();

router.use(authenticate);

router.get("/", validateQuery(listDocumentsQuerySchema), asyncHandler(listDocumentsHandler));
// multer must run before validate() — req.body's non-file fields are only
// populated once multer has parsed the multipart stream.
router.post("/", uploadDocument.single("file"), validate(createDocumentSchema), asyncHandler(createDocumentHandler));
router.delete("/:id", authorize("ADMIN"), asyncHandler(deleteDocumentHandler));

export default router;

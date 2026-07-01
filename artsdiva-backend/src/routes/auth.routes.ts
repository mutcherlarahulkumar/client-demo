import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate } from "../middleware/validate.middleware";
import { createUserSchema, loginSchema } from "../validators/auth.validator";
import {
  createUserHandler,
  loginHandler,
  logoutHandler,
  meHandler,
} from "../controllers/auth.controller";

const router: Router = Router();

router.post("/login", validate(loginSchema), asyncHandler(loginHandler));

router.post(
  "/create-user",
  authenticate,
  authorize("ADMIN"),
  validate(createUserSchema),
  asyncHandler(createUserHandler)
);

router.get("/me", authenticate, asyncHandler(meHandler));

router.post("/logout", authenticate, logoutHandler);

export default router;

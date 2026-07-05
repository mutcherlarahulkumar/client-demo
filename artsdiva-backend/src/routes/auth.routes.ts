import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate, validateQuery } from "../middleware/validate.middleware";
import {
  changePasswordSchema,
  createUserSchema,
  listUsersQuerySchema,
  loginSchema,
} from "../validators/auth.validator";
import {
  changePasswordHandler,
  createUserHandler,
  deactivateUserHandler,
  listUsersHandler,
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

router.get(
  "/users",
  authenticate,
  authorize("ADMIN"),
  validateQuery(listUsersQuerySchema),
  asyncHandler(listUsersHandler)
);

router.patch(
  "/users/:id/deactivate",
  authenticate,
  authorize("ADMIN"),
  asyncHandler(deactivateUserHandler)
);

router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(changePasswordHandler)
);

router.get("/me", authenticate, asyncHandler(meHandler));

router.post("/logout", authenticate, logoutHandler);

export default router;

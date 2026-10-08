import { Router } from "express"
import {
  createArticle,
  getAIDescription,
  getAllArticles,
  getArticleById,
  getMyArticles,
  getAdminArticles,
  toggleVisibility,
  toggleFavorite
} from "../controllers/article.controller"
import { authenticate } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { UserRole } from "../models/user.model"
import { upload } from "../middleware/upload"

const router = Router()

router.get("/", getAllArticles)
router.get(
  "/admin/all",
  authenticate,
  requireRole([UserRole.ADMIN]),
  getAdminArticles
)
router.get("/my-articles", authenticate, getMyArticles)
router.post("/generate-description", authenticate, getAIDescription)

router.patch(
  "/:id/visibility",
  authenticate,
  requireRole([UserRole.ADMIN]),
  toggleVisibility
)
router.patch("/:id/favorite", authenticate, toggleFavorite)

router.get("/:id", getArticleById)

router.post(
  "/",
  authenticate,
  requireRole([UserRole.ADMIN, UserRole.WRITER]),
  upload.single("image"),
  createArticle
)

export default router

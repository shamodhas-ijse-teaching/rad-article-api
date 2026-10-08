import { Router } from "express"
import {
  getMyDetails,
  getRefreshToken,
  login,
  register
} from "../controllers/auth.controller"
import { authenticate } from "../middleware/auth"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.post("/refresh", getRefreshToken)
router.get("/me", authenticate, getMyDetails)

export default router

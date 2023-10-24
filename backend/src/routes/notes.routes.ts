import { Router } from "express";
import notesController from "../controllers/notes.controller.js";

const router = Router();

// router.post("/register", sessionsController.register)

router.post("/category/:id", notesController.saveOneCategory)

router.post("/:id", notesController.saveOneItem)

router.get("/:id", notesController.getAll)

// router.get("/logout", sessionsController.logout)

export default router

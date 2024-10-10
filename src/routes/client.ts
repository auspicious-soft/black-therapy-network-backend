import { Router } from "express";
import { upload } from "../configF/multer";
import { checkMulter } from "../lib/errors/error-response-handler"
import { login, signup, getClientVideos, forgotPassword, newPassswordAfterEmailSent, passwordReset, getClientInfo, editClientInfo } from "../controllers/client/client";
import { requestAppointment, getClientAppointments } from "../controllers/appointments/appointments";
const router = Router();

router.post("/signup", signup)
router.post("/login", login)
router.patch("/forgot-password", forgotPassword)
router.patch("/new-password-email-sent", newPassswordAfterEmailSent)
router.patch("/update-password/:id", passwordReset)


router.get("/videos", getClientVideos)
router.route("/:id").get(getClientInfo).put(upload.single("profilePic"), checkMulter, editClientInfo)
router.post("/appointment", requestAppointment)
router.get("/appointment/:id", getClientAppointments)

export { router }
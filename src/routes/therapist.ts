import { Router } from "express";
// import { checkAdminAuth } from "../middleware/check-auth";
import { upload } from "../configF/multer";
import { checkMulter } from "../lib/errors/error-response-handler"
import { login, signup, onBoarding, getTherapistVideos, forgotPassword, getTherapistClients, newPassswordAfterEmailSent, getTherapistDashboardStats } from "../controllers/therapist/therapist";
import { addPaymentRequest, getPaymentRequestByTherapistId } from "../controllers/payment-request/payment-request";
import { getAppointmentsByTherapistId } from "../controllers/appointments/appointments";
const router = Router();

router.post("/signup", signup)
router.post("/login", login)
router.post("/onboarding", upload.single("profilePic"), checkMulter, onBoarding)
router.patch("/forgot-password", forgotPassword)
router.patch("/new-password-email-sent", newPassswordAfterEmailSent)

router.route("/dashboard/:id").get(getTherapistDashboardStats)

router.get("/:id/clients", getTherapistClients)
router.get("/videos", getTherapistVideos)

router.post("/payment-requests", addPaymentRequest)
router.get("/payment-requests/:id", getPaymentRequestByTherapistId)


router.get("/appointment/:id", getAppointmentsByTherapistId)
// router.get("/verify-session", verifySession);
// router.patch("/update-password", passwordReset)
// router.patch("/forgot-password", forgotPassword)
// router.patch("/new-password-email-sent", newPassswordAfterEmailSent)
// router.put("/edit-info", upload.single("profilePic"), checkMulter, editAdminInfo)
// router.get("/info", getAdminInfo)

// Protected routes
// router.route("/card").post(upload.single("image"), checkMulter, createCard).get(getCards)
// router.route("/card/:id").delete(deleteACard).patch(changeCardStatus)
// router.route("/cards-per-spinner").get(getCardsPerSpinner).patch(updateCardsPerSpinner)


export { router }
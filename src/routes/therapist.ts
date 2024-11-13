import { Router } from "express";
// import { checkAdminAuth } from "../middleware/check-auth";
import { upload } from "../configF/multer";
import { checkMulter } from "../lib/errors/error-response-handler"
import { signup, onBoarding, getTherapistVideos, forgotPassword, getTherapistClients, newPassswordAfterEmailSent, getTherapistDashboardStats, getTherapist, updateTherapist } from "../controllers/therapist/therapist";
import { addPaymentRequest, getPaymentRequestByTherapistId } from "../controllers/payment-request/payment-request";
import { getAppointmentsByTherapistId } from "../controllers/appointments/appointments";
import { checkAuth } from "src/middleware/check-auth";
import { getClients } from "src/controllers/admin/admin";
import { getATherapistTasks, updateTaskStatus } from "src/controllers/tasks/tasks-controllers";
const router = Router();

router.post("/signup", signup)
router.post("/onboarding", onBoarding)
router.patch("/forgot-password", forgotPassword)
router.patch("/new-password-email-sent", newPassswordAfterEmailSent)

router.get("/clients", checkAuth, getClients)
router.route("/dashboard/:id").get(checkAuth, getTherapistDashboardStats)

router.get("/:id/clients", checkAuth, getTherapistClients)
router.get("/:id/videos", checkAuth, getTherapistVideos)

router.post("/payment-requests", checkAuth, addPaymentRequest)
router.get("/payment-requests/:id", checkAuth, getPaymentRequestByTherapistId)

router.route("/:id").get(checkAuth, getTherapist).put(checkAuth, updateTherapist)
router.get("/appointment/:id", checkAuth, getAppointmentsByTherapistId)
router.route("/tasks/:id").get(checkAuth, getATherapistTasks).patch(checkAuth, updateTaskStatus)
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
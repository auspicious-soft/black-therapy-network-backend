import { Router } from "express";
import { signup, onBoarding, getTherapistVideos, getTherapistClients, getTherapistDashboardStats, getTherapist, updateTherapist, getTherapistsSpecificClients } from "../controllers/therapist/therapist";
import { addPaymentRequest, getPaymentRequestByTherapistId } from "../controllers/payment-request/payment-request";
import { getAppointmentsByTherapistId } from "../controllers/appointments/appointments";
import { checkAuth } from "src/middleware/check-auth";
import { getClients } from "src/controllers/admin/admin";
import { getATherapistTasks, updateTaskStatus } from "src/controllers/tasks/tasks-controllers";
import { deleteClientAndClinicianAlert, getClinicianAlerts, marksClinicianAlertAsRead } from "src/controllers/alerts/alerts-controllers";
const router = Router();

router.post("/signup", signup)
router.post("/onboarding", onBoarding)

router.get("/clients", checkAuth, getClients)
router.route("/dashboard/:id").get(checkAuth, getTherapistDashboardStats)

router.get("/my-clients/:id", checkAuth, getTherapistsSpecificClients)
router.get("/:id/clients", checkAuth, getTherapistClients)
router.get("/:id/videos", checkAuth, getTherapistVideos)

router.post("/payment-requests", checkAuth, addPaymentRequest)
router.get("/payment-requests/:id", checkAuth, getPaymentRequestByTherapistId)

router.route("/:id").get(checkAuth, getTherapist).put(checkAuth, updateTherapist)
router.get("/appointment/:id", checkAuth, getAppointmentsByTherapistId)
router.route("/tasks/:id").get(checkAuth, getATherapistTasks).patch(checkAuth, updateTaskStatus)
//Notifications
router.route("/notifications/:id").get(checkAuth, getClinicianAlerts).patch(checkAuth, marksClinicianAlertAsRead).delete(checkAuth, deleteClientAndClinicianAlert)


export { router }
import { Router } from "express";
import express from "express";
import { signup, getClientWellness, passwordReset, getClientInfo, editClientInfo } from "../controllers/client/client";
import { requestAppointment, getAllAppointmentsOfAClient, getASingleAppointment } from "../controllers/appointments/appointments";
import { checkAuth } from "src/middleware/check-auth";
import { afterSubscriptionCreated, createSubscription, cancelSubscription } from "src/controllers/client/plans-controller";
import { getTherapistEmployeeRecords } from "src/controllers/admin/admin";
import { getTherapist } from "src/controllers/therapist/therapist";
import { clearNotifications, deleteClientAndClinicianAlert, getClientAlerts, marksClientAlertAsRead } from "src/controllers/alerts/alerts-controllers";
import { getClientTickets, getTicketByRoomId, postATicket } from "src/controllers/tickets/ticket-controllers";

const router = Router();

// router.patch("/forgot-password", forgotPassword)
// router.patch("/new-password-email-sent", newPassswordAfterEmailSent)
router.post("/signup", signup)
router.patch("/update-password/:id", passwordReset)


router.get("/:id/wellness", checkAuth, getClientWellness)
router.route("/:id").get(checkAuth, getClientInfo).put(checkAuth, editClientInfo)
router.post("/appointment", checkAuth, requestAppointment)
router.get("/appointment/:id", checkAuth, getAllAppointmentsOfAClient)
router.get("/appointment-by-id/:appointmentId", checkAuth, getASingleAppointment)

router.route("/therapists/employee-records/:id").get(checkAuth, getTherapistEmployeeRecords)
router.get("/therapists/:id", checkAuth, getTherapist)


router.route("/notifications/:id").get(checkAuth, getClientAlerts).patch(checkAuth, marksClientAlertAsRead).delete(checkAuth, deleteClientAndClinicianAlert)
router.delete("/notifications/:id/clearNotifications", checkAuth, clearNotifications)
router.route("/tickets/:id").post(checkAuth, postATicket).get(checkAuth, getClientTickets)
router.get("/tickets/get-ticket-by-room-id/:roomId", checkAuth, getTicketByRoomId)

router.post("/create-subscription/:id", checkAuth, createSubscription)
router.delete("/:id/cancel-subscription/:subscriptionId", checkAuth, cancelSubscription)
router.post('/webhook', express.raw({ type: 'application/json' }), afterSubscriptionCreated)
export { router }
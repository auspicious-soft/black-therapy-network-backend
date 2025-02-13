import { Router } from "express";
import { getDashboardStats, getClientBillings, addClientBilling, getClients, getTherapists, postATherapist, postAClient, deleteClient, deleteTherapist, updateClient, getAClient, updateTherapist, addClientServiceAssignment, updateClientServiceAssignment, getClientServiceAssignment, getTherapistEmployeeRecords, postTherapistEmployeeRecord,} from "../controllers/admin/admin";

import { addWellness, deleteWellness, getWellness } from "../controllers/admin/wellness"
import { addUser, deleteUser, getUsers } from "../controllers/admin/user"
import { getAppointments, updateAssignmentStatus, getAllAppointmentsForAdmin, updateAppointmentStatus, assignAppointmentToClient } from "../controllers/appointments/appointments";
import { getAllPaymentRequests, updatePaymentRequestStatus } from "../controllers/payment-request/payment-request";
import { checkAuth } from "src/middleware/check-auth";
import { postTherapistNotes, getTherapistNotes, postClientNotes, getClientNotes } from "src/controllers/notes/notes-controllers";
import { getTherapistTasks, postTherapistTasks, deleteATask, postUserTask } from "src/controllers/tasks/tasks-controllers";
import { getClientAttachments, getTherapistAttachments, postClientAttachments, postTherapistAttachments } from "src/controllers/attachments/attachment-controllers";
import { getAdminQueryAlerts, getAlerts, updateAlert, deleteAdminAlert, markAllNotificationsForAdminAsRead } from "src/controllers/alerts/alerts-controllers";
import { getTickets, updateTicketStatus } from "src/controllers/tickets/ticket-controllers";

const router = Router();

router.get("/dashboard", checkAuth, getDashboardStats)
router.route("/notifications").get(checkAuth, getAdminQueryAlerts).put(checkAuth, markAllNotificationsForAdminAsRead)
router.delete("/notifications/:id", checkAuth, deleteAdminAlert)
router.get("/assignments", checkAuth, getAppointments)
router.patch("/assignments/:id", checkAuth, updateAssignmentStatus)
router.route('/alerts').get(checkAuth, getAlerts)
router.patch("/alerts/:id", checkAuth, updateAlert)

//Appointments
router.route("/appointments").get(checkAuth, getAllAppointmentsForAdmin).post(checkAuth, assignAppointmentToClient)
router.put("/appointments/:id", checkAuth, updateAppointmentStatus)

//Client
router.route("/clients").get(checkAuth, getClients).post(checkAuth, postAClient)
router.route("/clients/:id").delete(checkAuth, deleteClient).patch(checkAuth, updateClient).get(checkAuth, getAClient)

//Client billing
router.route("/client-billing/:id").get(checkAuth, getClientBillings).post(checkAuth, addClientBilling)

// Client Service Assignment
router.route("/client-service-assignment/:id").get(checkAuth, getClientServiceAssignment).post(checkAuth, addClientServiceAssignment).put(checkAuth, updateClientServiceAssignment)
router.route("/client/notes/:id").post(checkAuth, postClientNotes).get(checkAuth, getClientNotes)
router.route("/client/attachments/:id").post(checkAuth, postClientAttachments).get(checkAuth, getClientAttachments)

//Therapist
router.route("/therapists").get(getTherapists).post(checkAuth, postATherapist)
router.route("/therapists/:id").delete(checkAuth, deleteTherapist).put(checkAuth, updateTherapist)
router.route("/thrapists/notes/:id").post(checkAuth, postTherapistNotes).get(checkAuth, getTherapistNotes)  // ✅
router.route("/therapists/employee-records/:id").get(checkAuth, getTherapistEmployeeRecords).post(checkAuth, postTherapistEmployeeRecord)
router.route("/therapists/attachments/:id").post(checkAuth, postTherapistAttachments).get(checkAuth, getTherapistAttachments)
//Wellness
router.route("/wellness").get(checkAuth, getWellness).post(checkAuth, addWellness)
router.delete("/delete-wellness/:id", checkAuth, deleteWellness)

//Users
router.route("/users").get(checkAuth, getUsers).post(checkAuth, addUser)
router.route("/users/:id").delete(checkAuth, deleteUser).post(checkAuth, postUserTask)

//Payment Requests
router.get("/payment-requests", checkAuth, getAllPaymentRequests)
router.patch("/payment-requests/:id", checkAuth, updatePaymentRequestStatus)

//Tasks
router.route("/therapists/tasks/:id").post(checkAuth, postTherapistTasks).delete(checkAuth, deleteATask)
router.get("/therapists/tasks", checkAuth, getTherapistTasks)

//Tickets
router.route("/tickets").get(checkAuth, getTickets)
router.route("/tickets/:id").patch(checkAuth, updateTicketStatus)

export { router }
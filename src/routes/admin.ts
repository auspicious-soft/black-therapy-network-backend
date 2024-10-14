import { Router } from "express";
import {
    login,
    //  getAdminInfo, editAdminInfo, 
    // verifySession,
    //  passwordReset, forgotPassword, newPassswordAfterEmailSent, 
    getDashboardStats,
    getClientBillings,
    addClientBilling,
    getClients,
    getTherapists,
    deleteClient,
    deleteTherapist,
    updateClient,
    getAClient,
    updateTherapist,
    addClientServiceAssignment,
    getClientServiceAssignment

    //  updateDashboardStats
} from "../controllers/admin/admin";
// import { checkAdminAuth } from "../middleware/check-auth";
import { upload } from "../configF/multer";
import { checkMulter } from "../lib/errors/error-response-handler"
import { addWellness, deleteWellness, getWellness } from "../controllers/admin/wellness"
import { addUser, deleteUser, getUsers } from "../controllers/admin/user"
import { getAppointments, updateAppointmentStatus } from "../controllers/appointments/appointments";
import { getAllPaymentRequests, updatePaymentRequestStatus } from "../controllers/payment-request/payment-request";
import { checkAuth } from "src/middleware/check-auth";
import { postTherapistNotes, getTherapistNotes } from "src/controllers/notes/notes-controllers";
import { getTherapistTasks, postTherapistTasks } from "src/controllers/tasks/tasks-controllers";

const router = Router();

router.post("/login", login)
router.get("/dashboard", checkAuth, getDashboardStats)
router.get("/appointments", checkAuth, getAppointments)
router.patch("/appointments/:id", checkAuth, updateAppointmentStatus)


//Client
router.get("/clients", checkAuth, getClients)
router.route("/clients/:id").delete(checkAuth, deleteClient).patch(checkAuth, updateClient).get(checkAuth, getAClient)

//Client billing
router.route("/client-billing/:id").post(checkAuth, addClientBilling)
router.route("/client-billing/:id").get(checkAuth, getClientBillings)

// Client Service Assignment
router.route("/client-service-assignment/:id").post(checkAuth, addClientServiceAssignment)
router.route("/client-service-assignment/:id").get(checkAuth, getClientServiceAssignment)

//Therapist
router.get("/therapists", checkAuth, getTherapists)
router.route("/therapists/:id").delete(checkAuth, deleteTherapist).put(checkAuth, updateTherapist)
router.route("/thrapists/notes/:id").post(checkAuth, postTherapistNotes).get(checkAuth, getTherapistNotes)

//Wellness
router.route("/wellness").get(checkAuth, getWellness).post(checkAuth, addWellness)
router.delete("/delete-wellness/:id", checkAuth, deleteWellness)

//Users
router.route("/users").get(checkAuth, getUsers).post(checkAuth, addUser)
router.delete("/users/:id", checkAuth, deleteUser)

//Payment Requests
router.get("/payment-requests", checkAuth, getAllPaymentRequests)
router.patch("/payment-requests/:id", checkAuth, updatePaymentRequestStatus)

//Tasks
router.route("/therapists/tasks/:id").post(checkAuth, postTherapistTasks)
router.get("/therapists/tasks", checkAuth, getTherapistTasks)
// router.get("/verify-session", verifySession);
// router.patch("/update-password", passwordReset)
// router.patch("/forgot-password", forgotPassword)
// router.patch("/new-password-email-sent", newPassswordAfterEmailSent)
// router.put("/edit-info", upload.single("profilePic"), checkMulter, editAdminInfo)
// router.get("/info", getAdminInfo)

// Protected routes
// router.route("/dashboard").get(getDashboardStats).put(updateDashboardStats);
// router.route("/card").post(upload.single("image"), checkMulter, createCard).get(getCards)
// router.route("/card/:id").delete(deleteACard).patch(changeCardStatus)
// router.route("/cards-per-spinner").get(getCardsPerSpinner).patch(updateCardsPerSpinner)


export { router }
import { Router } from "express";
import {
    // login,
    //  getAdminInfo, editAdminInfo, 
    // verifySession,
    //  passwordReset, forgotPassword, newPassswordAfterEmailSent, 
    getDashboardStats,
    getClientBillings,
    addClientBilling,
    getClients,
    getTherapists,
    postATherapist,
    postAClient,
    deleteClient,
    deleteTherapist,
    updateClient,
    getAClient,
    updateTherapist,
    addClientServiceAssignment,
    updateClientServiceAssignment,
    getClientServiceAssignment,
    getTherapistEmployeeRecords,
    postTherapistEmployeeRecord

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
import { postTherapistNotes, getTherapistNotes, postClientNotes, getClientNotes } from "src/controllers/notes/notes-controllers";
import { getTherapistTasks, postTherapistTasks, deleteATask, postUserTask } from "src/controllers/tasks/tasks-controllers";
import { getClientAttachments, postClientAttachments } from "src/controllers/client-attachments/attachment-controllers";
import { addAlert, getAlerts } from "src/controllers/alerts/alerts-controllers";

const router = Router();

// router.post("/login", login)                                             // ✅
router.get("/dashboard", checkAuth, getDashboardStats)                  // ✅
router.get("/appointments", checkAuth, getAppointments)                 // ✅
router.patch("/appointments/:id", checkAuth, updateAppointmentStatus)   // ✅
router.route('/alerts').post(checkAuth, addAlert).get(checkAuth, getAlerts)                             // ✅ 

//Client
router.route("/clients").get(checkAuth, getClients).post(checkAuth, postAClient)                                                                                // ✅
router.route("/clients/:id").delete(checkAuth, deleteClient).patch(checkAuth, updateClient).get(checkAuth, getAClient)              // ✅            

//Client billing
router.route("/client-billing/:id").get(checkAuth, getClientBillings).post(checkAuth, addClientBilling)                               // ✅

// Client Service Assignment
router.route("/client-service-assignment/:id").get(checkAuth, getClientServiceAssignment).post(checkAuth, addClientServiceAssignment).put(checkAuth, updateClientServiceAssignment) // ✅
router.route("/client/notes/:id").post(checkAuth, postClientNotes).get(checkAuth, getClientNotes)                                     // ✅
router.route("/client/attachments/:id").post(checkAuth, postClientAttachments).get(checkAuth, getClientAttachments)                   // ✅

//Therapist
router.route("/therapists").get(checkAuth, getTherapists).post(checkAuth, postATherapist)                   // ✅
router.route("/therapists/:id").delete(checkAuth, deleteTherapist).put(checkAuth, updateTherapist).post(checkAuth, postTherapistTasks)          // ✅
router.route("/thrapists/notes/:id").post(checkAuth, postTherapistNotes).get(checkAuth, getTherapistNotes)  // ✅
router.route("/therapists/employee-records/:id").get(checkAuth, getTherapistEmployeeRecords).post(checkAuth, postTherapistEmployeeRecord)             // ✅
//Wellness
router.route("/wellness").get(checkAuth, getWellness).post(checkAuth, addWellness)
router.delete("/delete-wellness/:id", checkAuth, deleteWellness)

//Users
router.route("/users").get(checkAuth, getUsers).post(checkAuth, addUser)
router.route("/users/:id").delete(checkAuth, deleteUser).post(checkAuth, postUserTask)

//Payment Requests
router.get("/payment-requests", checkAuth, getAllPaymentRequests)              // ✅
router.patch("/payment-requests/:id", checkAuth, updatePaymentRequestStatus)  // ✅

//Tasks
router.route("/therapists/tasks/:id").post(checkAuth, postTherapistTasks).delete(checkAuth, deleteATask)  // ✅
router.get("/therapists/tasks", checkAuth, getTherapistTasks)                                             // ✅
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
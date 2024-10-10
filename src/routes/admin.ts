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

const router = Router();

router.post("/login", login)
router.get("/dashboard", getDashboardStats)
router.get("/appointments", getAppointments)
router.patch("/appointments/:id", updateAppointmentStatus)


//Client
router.get("/clients", getClients)
router.route("/clients/:id").delete(deleteClient).patch(updateClient).get(getAClient)

//Client billing
router.route("/client-billing/:id").post(addClientBilling)
router.route("/client-billing/:id").get(getClientBillings)

// Client Service Assignment
router.route("/client-service-assignment/:id").post(addClientServiceAssignment)
router.route("/client-service-assignment/:id").get(getClientServiceAssignment)

//Therapist
router.get("/therapists", getTherapists)
router.route("/therapists/:id").delete(deleteTherapist).put(updateTherapist)


//Wellness
router.route("/wellness").get(getWellness).post(addWellness)
router.delete("/delete-wellness/:id", deleteWellness)

//Users
router.route("/users").get(getUsers).post(addUser)
router.delete("/users/:id", deleteUser)

router.get("/payment-requests", getAllPaymentRequests)
router.patch("/payment-requests/:id", updatePaymentRequestStatus)
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
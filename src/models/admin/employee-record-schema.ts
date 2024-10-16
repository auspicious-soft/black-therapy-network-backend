import mongoose from "mongoose"
import { therapist } from "src/routes"

const employeeRecordsSchema = new mongoose.Schema({
    therapistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'therapists',
        required: true
    },
    assignedEmployeeId: { type: String, required: true },
    tsgEmployeeName: { type: String, required: true },    
    tsgEmployeeOwner: { type: String, required: false }, 
    assignedOffice: { type: String, required: false },    
    companyAssignedTo: { type: String, required: false }, 
    position: { type: String, required: false },          
    ringCentralExtension: { type: String, required: false }, 
    supervisor: { type: String, required: false },        
    officeNumberOther: { type: String, required: false }, 
    medicaidChecksAllowed: { type: Boolean, required: false }, 
    officeAssignedOther: { type: String, required: false }, 
    companyEmailAddress: { type: String, required: false }, 
    zohoCRM: { type: String, required: false },          
    axisCare: { type: String, required: false },         
    simplePractice: { type: String, required: false },  
    employeeEmail: { type: String, required: false }      
})

export const employeeRecordsModel = mongoose.model("employeeRecords", employeeRecordsSchema)
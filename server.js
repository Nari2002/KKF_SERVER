// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const bodyParser = require("body-parser");
const path = require("path");
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const Joi = require("joi");

// Multer setup for image uploading
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });



// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

// Receipt Schema
const receiptSchema = new mongoose.Schema({
  name: String,
  email: String,
  amount: Number,
  date: Date,
  pan: String,
  orderid: Number,
});

const Receipt = mongoose.model('Receipt', receiptSchema);

// Generate Receipt
app.post('/api/receipts', async (req, res) => {
  const { name, email, amount, date, pan, orderid } = req.body;
  const receipt = new Receipt({ name, email, amount, date, pan, orderid });
  await receipt.save();
  res.status(201).json(receipt);
});

// View Receipts
app.get('/api/receipts', async (req, res) => {
  const receipts = await Receipt.find();
  res.json(receipts);
});

// Delete Receipt
app.delete('/api/receipts/:id', async (req, res) => {
  const { id } = req.params;
  try {
      await Receipt.findByIdAndDelete(id);
      res.status(200).send({ message: 'Receipt deleted successfully' });
  } catch (error) {
      res.status(500).send({ message: 'Error deleting receipt' });
  }
});


// Employee Schema with PF and ESI Number
const employeeSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  address: String,
  position: String,
  dateOfJoining: String,
  pan: String,
  aadhar: String,
  salary: Number,
  pfNumber: String,
  esiNumber: String,
  accountNumber: Number, // New field
    bankName: String,// New field
  image: String,
});

// Employee Model
const Employee = mongoose.model("Employee", employeeSchema);

// API to add an employee
app.post("/api/employees", upload.single("image"), async (req, res) => {
  try {
    const newEmployee = new Employee({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      position: req.body.position,
      dateOfJoining: req.body.dateOfJoining,
      pan: req.body.pan,
      aadhar: req.body.aadhar,
      salary: req.body.salary,
      pfNumber: req.body.pfNumber,      // Added PF Number
      esiNumber: req.body.esiNumber,  
        // Added ESI Number
        accountNumber: req.body.accountNumber, // New field
    bankName:req.body.bankName,
      image: req.file ? req.file.filename : null,
    });

    await newEmployee.save();
    res.status(201).json({ message: "Employee added successfully!" });
  } catch (error) {
    res.status(400).json({ message: "Error adding employee!", error });
  }
});

// Serve uploads folder
app.use("/uploads", express.static("uploads"));

// Fetch all employees
app.get("/api/employees", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(400).json({ message: "Error fetching employees!", error });
  }
});

// Fetch individual employee by ID
app.get("/api/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found!" });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(400).json({ message: "Error fetching employee!", error });
  }
});

// Update employee by ID
app.put('/api/employees/:id', upload.single('image'), async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      position: req.body.position,
      dateOfJoining: req.body.dateOfJoining,
      pan: req.body.pan,
      aadhar: req.body.aadhar,
      salary: req.body.salary,
      pfNumber: req.body.pfNumber,
      esiNumber: req.body.esiNumber,
    };
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const employee = await Employee.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found!" });
    }
    res.status(200).json({ message: "Employee updated successfully", employee });
  } catch (error) {
    res.status(400).json({ message: "Error updating employee!", error });
  }
});

// Delete employee by ID
app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Beneficiary Schema
const beneficiarySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  aadhar: { type: String, required: true },
  address: { type: String, required: true },
  problemDescription: { type: String, required: true },
  amountDonated: { type: Number, required: true },
  image: { type: String, required: true },
  dateOfDonation: { type: Date, default: Date.now },
});

const Beneficiary = mongoose.model("Beneficiary", beneficiarySchema);

// Add Beneficiary route
app.post("/api/beneficiaries", upload.single("image"), async (req, res) => {
  try {
    const { name, phone, aadhar, address, problemDescription, amountDonated } = req.body;
    const image = req.file.filename; // Use filename to save path correctly

    const newBeneficiary = new Beneficiary({
      name,
      phone,
      aadhar,
      address,
      problemDescription,
      amountDonated,
      image,
      dateOfDonation: new Date(),
    });

    await newBeneficiary.save();
    res.status(201).json({ message: "Beneficiary added successfully", beneficiary: newBeneficiary });
  } catch (error) {
    console.error("Error adding beneficiary:", error);
    res.status(500).json({ message: "Error adding beneficiary", error: error.message });
  }
});

// Get all Beneficiaries route
app.get("/api/beneficiaries", async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.find();
    res.json(beneficiaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET route to fetch beneficiary by ID
app.get("/api/beneficiaries/:id", async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findById(req.params.id);
    if (!beneficiary) return res.status(404).json({ message: "Beneficiary not found" });
    res.json(beneficiary);
  } catch (error) {
    res.status(500).json({ message: "Error fetching beneficiary details" });
  }
});

// Delete Beneficiary route
app.delete("/api/beneficiaries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBeneficiary = await Beneficiary.findByIdAndDelete(id);
    
    if (!deletedBeneficiary) {
      return res.status(404).json({ message: "Beneficiary not found" });
    }

    res.json({ message: "Beneficiary deleted successfully", beneficiary: deletedBeneficiary });
  } catch (error) {
    console.error("Error deleting beneficiary:", error);
    res.status(500).json({ message: "Error deleting beneficiary", error: error.message });
  }
});




// Define Payslip Schema
const payslipSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  empid:String,
  name: String,
  dateOfJoining: Date,
  position: String,
  phone: String,
  email: String,
  accountNumber:Number,
  bankName:String,
  pan: String,
  aadhar: String,
  salary: Number,
  basicSalary: Number,
  hra: Number,
  transportAllowance: Number,
  pf: Number,
  esiNumber: String,
  tax: Number,
  netSalary: Number,
  grossSalary: Number, // New field for gross salary
  workingDays: Number, // New field for working days
  presentDays: Number, // New field for present days
  pfAmount: Number,
  incentives: Number, // New field for incentives
  overtimePay: Number, // New field for overtime pay
  otherAllowances: Number, // New field for other allowances
  dateOfIssuing: { type: Date, required: true }, // Date of issuing
});

const Payslip = mongoose.model("Payslip", payslipSchema);


app.post("/api/payslips", async (req, res) => {
  try {
    const {
      employeeId,
      empid,
      name,
      dateOfJoining,
      position,
      phone,
      email,
      accountNumber,
      bankName,
      pan,
      aadhar,
      salary,
      basicSalary,
      hra,
      transportAllowance,
      pf,
      esiNumber,
      tax,
      netSalary,
      grossSalary,       // New field for gross salary
      workingDays,       // New field for working days
      presentDays,       // New field for present days
      incentives,        // New field for incentives
      pfAmount,
      overtimePay,       // New field for overtime pay
      otherAllowances,   // New field for other allowances
      dateOfIssuing,
    } = req.body;

    const payslip = new Payslip({
      
      employeeId,
      empid,
      name,
      dateOfJoining,
      position,
      phone,
      email,
      accountNumber,
      bankName,
      pan,
      aadhar,
      salary,
      basicSalary,
      hra,
      transportAllowance,
      pf,
      esiNumber,
      tax,
      netSalary,
      grossSalary,
      workingDays,
      presentDays,
      incentives,
      pfAmount,
      overtimePay,
      otherAllowances,
      dateOfIssuing,
    });

    await payslip.save();
    res.status(201).json({ message: "Payslip added successfully!", payslip });
  } catch (error) {
    console.error("Error adding payslip:", error);
    res.status(500).json({ message: "Error adding payslip." });
  }
});


// Get all payslips
app.get("/api/payslips", async (req, res) => {
  try {
    // Populate employeeId with name and position
    const payslips = await Payslip.find().populate("employeeId", "name position");
    res.json(payslips);
  } catch (error) {
    console.error("Error fetching payslips:", error);
    res.status(500).json({ message: "Error fetching payslips." });
  }
});


app.delete('/api/payslips/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPayslip = await Payslip.findByIdAndDelete(id);
    if (!deletedPayslip) {
      return res.status(404).json({ message: "Payslip not found" });
    }
    res.status(200).json({ message: "Payslip deleted successfully", deletedPayslip });
  } catch (error) {
    console.error("Error deleting payslip:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Offer Letter Schema
const offerLetterSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },  // Use String if including country code
  position: { type: String, required: true },
  salary: { type: Number, required: true },
  startDate: { type: Date, required: true },
  details: { type: String, required: true },
  dateOfIssuing: { type: Date, default: Date.now },
});

const OfferLetter = mongoose.model("OfferLetter", offerLetterSchema);

// Get all offer letters
app.get("/api/offerletters", async (req, res) => {
  try {
    const offerLetters = await OfferLetter.find();
    res.json(offerLetters);
  } catch (error) {
    res.status(500).json({ message: "Error fetching offer letters" });
  }
});

// Create a new offer letter
app.post("/api/offerletters", async (req, res) => {
  const { employeeId, name, phone, position, salary, startDate, details } = req.body;

  const newOfferLetter = new OfferLetter({
    employeeId,
    name,
    phone,
    position,
    salary,
    startDate,
    details,
  });

  try {
    const savedOfferLetter = await newOfferLetter.save();
    res.status(201).json(savedOfferLetter);
  } catch (error) {
    res.status(400).json({ message: "Error creating offer letter" });
  }
});

// Delete an offer letter
app.delete("/api/offerletters/:id", async (req, res) => {
  try {
    const result = await OfferLetter.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Offer letter not found" });
    }
    res.json({ message: "Offer letter deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting offer letter" });
  }
});

// Define the termination letter schema
const terminationLetterSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: Number, required: true },
  reason: { type: String, required: true },
  comments: { type: String, required: true },
  position: { type: String, required: true },
  dateOfIssuing: { type: Date, required: true },
  terminationDate: { type: Date, required: true },
});

const TerminationLetter = mongoose.model("TerminationLetter", terminationLetterSchema);

// GET all termination letters
app.get("/api/terminationletters", async (req, res) => {
  try {
    const terminationLetters = await TerminationLetter.find();
    res.json(terminationLetters);
  } catch (err) {
    console.error("Error fetching termination letters:", err);
    res.status(500).json({ message: err.message });
  }
});

// POST a new termination letter
app.post("/api/terminationletters", async (req, res) => {
  const { employeeId, name,phone, reason, comments, position, dateOfIssuing, terminationDate } = req.body;

  const terminationLetter = new TerminationLetter({
    employeeId,
    name,
    phone,
    reason,
    comments,
    position,
    dateOfIssuing,
    terminationDate,
  });

  try {
    const savedLetter = await terminationLetter.save();
    res.status(201).json(savedLetter);
  } catch (err) {
    console.error("Error saving the termination letter:", err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE a termination letter by ID
app.delete("/api/terminationletters/:id", async (req, res) => {
  try {
    const letter = await TerminationLetter.findByIdAndDelete(req.params.id); // Combined find and delete

    if (!letter) {
      return res.status(404).json({ message: "Termination letter not found" });
    }

    res.json({ message: "Termination letter deleted" });
  } catch (err) {
    console.error("Error deleting the termination letter:", err);
    res.status(500).json({ message: "Error deleting the termination letter" });
  }
});

// Experience Letter Schema
const ExperienceLetterSchema = new mongoose.Schema({
  employeeId: { type: String, required: true }, // Added employeeId to the schema
  name: { type: String, required: true },
  position: { type: String, required: true },
  phone: { type: String, required: true },
  dateOfJoining: { type: Date, required: true },
  leavingDate: { type: Date, required: true },
  dateOfIssuing: { type: Date, default: Date.now },
}, { timestamps: true });

const ExperienceLetter = mongoose.model('ExperienceLetter', ExperienceLetterSchema);

// Get all experience letters
app.get('/api/experienceletters', async (req, res) => {
  try {
    const letters = await ExperienceLetter.find();
    res.json(letters);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching experience letters' });
  }
});

// Create a new experience letter
app.post('/api/experienceletters', async (req, res) => {
  try {
    const { employeeId, name, position, phone, dateOfJoining, leavingDate } = req.body; // Included phone
    const newLetter = new ExperienceLetter({
      employeeId,
      name,
      position,
      phone, // Save phone number to the database
      dateOfJoining,
      leavingDate,
    });
    await newLetter.save();
    res.status(201).json(newLetter);
  } catch (error) {
    res.status(400).json({ message: 'Error creating experience letter', error });
  }
});

// Delete an experience letter by ID
app.delete('/api/experienceletters/:id', async (req, res) => {
  try {
    const result = await ExperienceLetter.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Experience letter not found' });
    }
    res.json({ message: 'Experience letter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting experience letter' });
  }
});






// NIRVIN PVT LTD DB 

// Nirvin Employee Schema with PF and ESI Number
const nirvinEmployeeSchema = new mongoose.Schema({
  nirvinName: { type: String, required: true },
  nirvinPhone: { type: String, required: true },
  nirvinEmail: { type: String, required: true },
  nirvinAddress: { type: String, required: true },
  nirvinPosition: { type: String, required: true },
  nirvinDateOfJoining: { type: Date, required: true },
  nirvinPan: { type: String, required: true },
  nirvinAadhar: { type: String, required: true },
  nirvinSalary: { type: Number, required: true },
  nirvinImage: { type: String }, // URL or path to the image
  nirvinPfNumber: { type: String, required: true },
  nirvinEsiNumber: { type: String, required: true },
  nirvinAccountNumber: { type: String, required: true }, // New field
  nirvinBankName: { type: String, required: true } // New field
});

const NirvinEmployee = mongoose.model('NirvinEmployee', nirvinEmployeeSchema);


// API to add a Nirvin employee
// Add new employee
app.post('/api/nirvin-employees', upload.single('nirvinImage'), async (req, res) => {
  const { nirvinName, nirvinPhone, nirvinEmail, nirvinAddress, nirvinPosition, nirvinDateOfJoining, nirvinPan, nirvinAadhar, nirvinSalary, nirvinPfNumber, nirvinEsiNumber, nirvinAccountNumber, nirvinBankName } = req.body;
  
  const newEmployee = new NirvinEmployee({
    nirvinName,
    nirvinPhone,
    nirvinEmail,
    nirvinAddress,
    nirvinPosition,
    nirvinDateOfJoining,
    nirvinPan,
    nirvinAadhar,
    nirvinSalary,
    nirvinImage: req.file ? req.file.path : null, // Save the image path
    nirvinPfNumber,
    nirvinEsiNumber,
    nirvinAccountNumber,
    nirvinBankName
  });

  try {
    await newEmployee.save();
    res.status(201).json({ message: 'Employee added successfully!', employee: newEmployee });
  } catch (error) {
    res.status(400).json({ message: 'Error adding employee', error });
  }
});




// Fetch all employees
app.get('/api/nirvin-employees', async (req, res) => {
  try {
    const employees = await NirvinEmployee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees', error });
  }
});

// Update employee by ID
app.put('/api/nirvin-employees/:id', upload.single('nirvinImage'), async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (req.file) {
    updates.nirvinImage = req.file.path; // Update image path if a new image is uploaded
  }

  try {
    const updatedEmployee = await NirvinEmployee.findByIdAndUpdate(id, updates, { new: true });
    res.json(updatedEmployee);
  } catch (error) {
    res.status(400).json({ message: 'Error updating employee', error });
  }
});

// Delete employee by ID
app.delete('/api/nirvin-employees/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await NirvinEmployee.findByIdAndDelete(id);
    res.json({ message: 'Employee deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting employee', error });
  }
});

// Define Payslip Schema
const payslipSchemaa = new mongoose.Schema({
  nirvinEmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: "NirvinEmployee" }, // Changed to reference NirvinEmployee
  nirvinEmpid: String, // Changed to nirvinEmpid
  nirvinName: String, // Changed to nirvinName
  nirvinDateOfJoining: Date, // Changed to nirvinDateOfJoining
  nirvinPosition: String, // Changed to nirvinPosition
  nirvinPhone: String, // Changed to nirvinPhone
  nirvinEmail: String, // Changed to nirvinEmail
  nirvinAccountNumber: Number, // Changed to nirvinAccountNumber
  nirvinBankName: String, // Changed to nirvinBankName
  nirvinPan: String, // Changed to nirvinPan
  nirvinAadhar: String, // Changed to nirvinAadhar
  nirvinSalary: Number, // Changed to nirvinSalary
  nirvinBasicSalary: Number, // Changed to nirvinBasicSalary
  nirvinHra: Number, // Changed to nirvinHra
  nirvinTransportAllowance: Number, // Changed to nirvinTransportAllowance
  nirvinPf: Number, // Changed to nirvinPf
  nirvinEsiNumber: String, // Changed to nirvinEsiNumber
  nirvinTax: Number, // Changed to nirvinTax
  nirvinNetSalary: Number, // Changed to nirvinNetSalary
  nirvinGrossSalary: Number, // Changed to nirvinGrossSalary
  nirvinWorkingDays: Number, // Changed to nirvinWorkingDays
  nirvinPresentDays: Number, // Changed to nirvinPresentDays
  nirvinPfAmount: Number, // Changed to nirvinPfAmount
  nirvinIncentives: Number, // Changed to nirvinIncentives
  nirvinOvertimePay: Number, // Changed to nirvinOvertimePay
  nirvinOtherAllowances: Number, // Changed to nirvinOtherAllowances
  nirvinDateOfIssuing: { type: Date, required: true }, // Changed to nirvinDateOfIssuing
});

const Payslipp = mongoose.model("NirvinPayslip", payslipSchemaa); // Changed model name

app.post("/api/nirvin-payslips", async (req, res) => { // Changed endpoint
  try {
    const {
      nirvinEmployeeId,
      nirvinEmpid,
      nirvinName,
      nirvinDateOfJoining,
      nirvinPosition,
      nirvinPhone,
      nirvinEmail,
      nirvinAccountNumber,
      nirvinBankName,
      nirvinPan,
      nirvinAadhar,
      nirvinSalary,
      nirvinBasicSalary,
      nirvinHra,
      nirvinTransportAllowance,
      nirvinPf,
      nirvinEsiNumber,
      nirvinTax,
      nirvinNetSalary,
      nirvinGrossSalary,
      nirvinWorkingDays,
      nirvinPresentDays,
      nirvinIncentives,
      nirvinPfAmount,
      nirvinOvertimePay,
      nirvinOtherAllowances,
      nirvinDateOfIssuing,
    } = req.body;

    const payslip = new Payslipp({
      nirvinEmployeeId,
      nirvinEmpid,
      nirvinName,
      nirvinDateOfJoining,
      nirvinPosition,
      nirvinPhone,
      nirvinEmail,
      nirvinAccountNumber,
      nirvinBankName,
      nirvinPan,
      nirvinAadhar,
      nirvinSalary,
      nirvinBasicSalary,
      nirvinHra,
      nirvinTransportAllowance,
      nirvinPf,
      nirvinEsiNumber,
      nirvinTax,
      nirvinNetSalary,
      nirvinGrossSalary,
      nirvinWorkingDays,
      nirvinPresentDays,
      nirvinIncentives,
      nirvinPfAmount,
      nirvinOvertimePay,
      nirvinOtherAllowances,
      nirvinDateOfIssuing,
    });

    await payslip.save();
    res.status(201).json({ message: "Nirvin Payslip added successfully!", payslip }); // Changed message
  } catch (error) {
    console.error("Error adding nirvin payslip:", error); // Changed error message
    res.status(500).json({ message: "Error adding nirvin payslip." }); // Changed error message
  }
});

// Get all payslips
app.get("/api/nirvin-payslips", async (req, res) => { // Changed endpoint
  try {
    const payslips = await Payslipp.find().populate("nirvinEmployeeId", "nirvinName nirvinPosition"); // Changed fields
    res.json(payslips);
  } catch (error) {
    console.error("Error fetching nirvin payslips:", error); // Changed error message
    res.status(500).json({ message: "Error fetching nirvin payslips." }); // Changed error message
  }
});

app.delete('/api/nirvin-payslips/:id', async (req, res) => { // Changed endpoint
  const { id } = req.params;
  try {
    const deletedPayslip = await Payslipp.findByIdAndDelete(id);
    if (!deletedPayslip) {
      return res.status(404).json({ message: "Nirvin Payslip not found" }); // Changed message
    }
    res.status(200).json({ message: "Nirvin Payslip deleted successfully", deletedPayslip }); // Changed message
  } catch (error) {
    console.error("Error deleting nirvin payslip:", error); // Changed error message
    res.status(500).json({ message: "Server error" });
  }
});


// Offer Letter Schema
const nirvinOfferLetterSchema = new mongoose.Schema({
  nirvinEmployeeId: { type: String, required: true },
  nirvinEmpid: { type: String, required: true }, // New field for Employee ID
  nirvinName: { type: String, required: true },
  nirvinPhone: { type: String, required: true }, // Use String if including country code
  nirvinEmail: { type: String, required: true }, // Added Email field
  nirvinPosition: { type: String, required: true },
  nirvinSalary: { type: Number, required: true },
  nirvinStartDate: { type: Date, required: true },
  nirvinDetails: { type: String, required: true },
  nirvinDateOfIssuing: { type: Date, default: Date.now },
});

const NirvinOfferLetter = mongoose.model("NirvinOfferLetter", nirvinOfferLetterSchema);

// Get all offer letters
app.get("/api/nirvin-offer-letters", async (req, res) => {
  try {
    const offerLetters = await NirvinOfferLetter.find();
    res.json(offerLetters);
  } catch (error) {
    res.status(500).json({ message: "Error fetching offer letters" });
  }
});

// Create a new offer letter
app.post("/api/nirvin-offer-letters", async (req, res) => {
  const { 
    nirvinEmployeeId, 
    nirvinEmpid, 
    nirvinName, 
    nirvinPhone, 
    nirvinEmail,  // Added Email field
    nirvinPosition, 
    nirvinSalary, 
    nirvinStartDate, 
    nirvinDetails 
  } = req.body;

  const newOfferLetter = new NirvinOfferLetter({
    nirvinEmployeeId,
    nirvinEmpid,  // Include Emp ID
    nirvinName,
    nirvinPhone,
    nirvinEmail,  // Include Email
    nirvinPosition,
    nirvinSalary,
    nirvinStartDate,
    nirvinDetails,
  });

  try {
    const savedOfferLetter = await newOfferLetter.save();
    res.status(201).json(savedOfferLetter);
  } catch (error) {
    res.status(400).json({ message: "Error creating offer letter" });
  }
});

// Delete an offer letter
app.delete("/api/nirvin-offer-letters/:id", async (req, res) => {
  try {
    const result = await NirvinOfferLetter.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Offer letter not found" });
    }
    res.json({ message: "Offer letter deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting offer letter" });
  }
});


// Define the Nirvin termination letter schema
const nirvinTerminationLetterSchema = new mongoose.Schema({
  nirvinEmployeeId: { type: String, required: true },
  nirvinName: { type: String, required: true },
  nirvinPhone: { type: Number, required: true },
  nirvinReason: { type: String, required: true },
  nirvinComments: { type: String },
  nirvinPosition: { type: String, required: true },
  nirvinDateOfIssuing: { type: Date, required: true },
  nirvinTerminationDate: { type: Date, required: true }
}, { timestamps: true });

const NirvinTerminationLetter = mongoose.model('NirvinTerminationLetter', nirvinTerminationLetterSchema);

// GET all termination letters
app.get('/api/nirvin-terminationletters', async (req, res) => {
  try {
    const terminationLetters = await NirvinTerminationLetter.find();
    res.json(terminationLetters);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching termination letters' });
  }
});

// POST a new termination letter
app.post('/api/nirvin-terminationletters', async (req, res) => {
  const {
    nirvinEmployeeId,
    nirvinName,
    nirvinPhone,
    nirvinReason,
    nirvinComments,
    nirvinPosition,
    nirvinDateOfIssuing,
    nirvinTerminationDate,
  } = req.body;

  const newTerminationLetter = new NirvinTerminationLetter({
    nirvinEmployeeId,
    nirvinName,
    nirvinPhone,
    nirvinReason,
    nirvinComments,
    nirvinPosition,
    nirvinDateOfIssuing,
    nirvinTerminationDate,
  });

  try {
    const savedLetter = await newTerminationLetter.save();
    res.status(201).json(savedLetter);
  } catch (error) {
    res.status(400).json({ message: 'Error creating termination letter' });
  }
});

// DELETE a termination letter by ID
app.delete('/api/nirvin-terminationletters/:id', async (req, res) => {
  try {
    const deletedLetter = await NirvinTerminationLetter.findByIdAndDelete(req.params.id);
    if (!deletedLetter) {
      return res.status(404).json({ message: 'Termination letter not found' });
    }
    res.json({ message: 'Termination letter deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting termination letter' });
  }
});


// Define Experience Letter Schema
const experienceLetterSchema = new mongoose.Schema({
  nirvinEmployeeId: String,
  nirvinName: String,
  nirvinPosition: String,
  nirvinPhone: String,
  nirvinDateOfJoining: Date,
  nirvinLeavingDate: Date,
  nirvinDateOfIssuing: Date,
  nirvinComments: String,
});

// Create Experience Letter Model
const ExperienceLetterr = mongoose.model('ExperienceLetterr', experienceLetterSchema);

// API Routes

// Get all experience letters
app.get('/api/nirvin-experience-letters', async (req, res) => {
  try {
    const letters = await ExperienceLetterr.find();
    res.json(letters);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching experience letters' });
  }
});

// Create a new experience letter
app.post('/api/nirvin-experience-letters', async (req, res) => {
  try {
    const newLetter = new ExperienceLetterr(req.body);
    await newLetter.save();
    res.status(201).json(newLetter);
  } catch (error) {
    res.status(400).json({ message: 'Error creating experience letter' });
  }
});

// Delete an experience letter
app.delete('/api/nirvin-experience-letters/:id', async (req, res) => {
  try {
    await ExperienceLetterr.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting experience letter' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

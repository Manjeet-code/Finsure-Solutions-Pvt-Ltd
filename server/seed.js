import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './src/models/User.js';
import Branch from './src/models/Branch.js';
import LoanProduct from './src/models/LoanProduct.js';
import LoanApplication from './src/models/LoanApplication.js';
import Payment from './src/models/Payment.js';
import Document from './src/models/Document.js';
import Notification from './src/models/Notification.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected for Seeding'))
  .catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });

const importData = async () => {
  try {
    // Clear all existing data
    await User.deleteMany();
    await Branch.deleteMany();
    await LoanProduct.deleteMany();
    await LoanApplication.deleteMany();
    await Payment.deleteMany();
    await Document.deleteMany();
    await Notification.deleteMany();

    console.log('Old Data Destroyed!');

    // 1. Create Users (1 Admin, 3 Managers, 5 Citizens)
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);

    const usersToCreate = [
      { name: 'Super Admin', email: 'admin@finsure.in', phone: '9876543210', password, role: 'Admin' },
      { name: 'Rohit Mathur', email: 'branchmanager.lucknow@finsure.in', phone: '9876543211', password, role: 'Branch Manager' },
      { name: 'Priya Nair', email: 'branchmanager.delhi@finsure.in', phone: '9876543212', password, role: 'Branch Manager' },
      { name: 'Rajesh Kumar', email: 'rajesh@finsure.com', phone: '9876543213', password, role: 'Branch Manager' },
      { name: 'Ananya Gupta', email: 'user@finsure.in', phone: '9876543214', password, role: 'Citizen' },
      { name: 'Pooja K', email: 'pooja@gmail.com', phone: '9876543215', password, role: 'Citizen' },
      { name: 'Anil Das', email: 'anil@gmail.com', phone: '9876543216', password, role: 'Citizen' },
    ];

    // Using insertMany directly avoids pre('save') hooks, but we already hashed the password above
    const createdUsers = await User.insertMany(usersToCreate);
    const managers = createdUsers.filter(u => u.role === 'Branch Manager');
    const citizens = createdUsers.filter(u => u.role === 'Citizen');

    // 2. Create Branches (Assign Managers with complete schema fields)
    const branchesToCreate = [
      {
        branchCode: 'BR-LKO-01',
        branchName: 'Lucknow Gomti Nagar',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        address: '123, Vibhuti Khand, Gomti Nagar, Lucknow',
        pincodeRanges: ['226010', '226012', '226016'],
        managerId: managers[0]._id,
        isActive: true,
      },
      {
        branchCode: 'BR-DEL-01',
        branchName: 'Delhi Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        address: '45, Inner Circle, Connaught Place, New Delhi',
        pincodeRanges: ['110001', '110002', '110003'],
        managerId: managers[1]._id,
        isActive: true,
      },
      {
        branchCode: 'BR-MUM-01',
        branchName: 'Mumbai Central',
        city: 'Mumbai',
        state: 'Maharashtra',
        address: '78, Fort Road, Mumbai',
        pincodeRanges: ['400001', '400002', '400003'],
        managerId: managers[2]._id,
        isActive: true,
      },
    ];
    
    const createdBranches = await Branch.insertMany(branchesToCreate);

    // Update Managers with their assigned branch
    await User.findByIdAndUpdate(managers[0]._id, { branchId: createdBranches[0]._id });
    await User.findByIdAndUpdate(managers[1]._id, { branchId: createdBranches[1]._id });
    await User.findByIdAndUpdate(managers[2]._id, { branchId: createdBranches[2]._id });

    // 3. Create Loan Products
    const productsToCreate = [
      {
        productCode: 'HL-201',
        name: 'Home Loan',
        interestRate: 8.5,
        minAmount: 500000,
        maxAmount: 50000000,
        tenureOptionsMonths: [60, 120, 180, 240, 360],
        eligibilityCriteria: 'Minimum monthly income ₹35,000, property title verified.',
        requiredDocuments: ['PAN', 'AADHAAR', 'SALARY_SLIP', 'BANK_STATEMENT', 'ITR', 'ADDRESS_PROOF'],
        description: 'Affordable home loans with flexible repayment options.',
        isActive: true,
      },
      {
        productCode: 'PL-101',
        name: 'Personal Loan',
        interestRate: 12.5,
        minAmount: 50000,
        maxAmount: 2000000,
        tenureOptionsMonths: [12, 24, 36, 48, 60],
        eligibilityCriteria: 'Minimum monthly income ₹25,000, 1 yr employment history.',
        requiredDocuments: ['PAN', 'AADHAAR', 'SALARY_SLIP', 'BANK_STATEMENT'],
        description: 'Instant personal loans for urgent financial needs.',
        isActive: true,
      },
      {
        productCode: 'VL-301',
        name: 'Auto Loan',
        interestRate: 9.5,
        minAmount: 100000,
        maxAmount: 5000000,
        tenureOptionsMonths: [12, 24, 36, 48, 60, 72, 84],
        eligibilityCriteria: 'Proforma invoice required from authorized vehicle dealership.',
        requiredDocuments: ['PAN', 'AADHAAR', 'BANK_STATEMENT', 'ADDRESS_PROOF'],
        description: 'Easy car loans with competitive interest rates.',
        isActive: true,
      },
      {
        productCode: 'BL-401',
        name: 'Business Loan',
        interestRate: 11.0,
        minAmount: 1000000,
        maxAmount: 100000000,
        tenureOptionsMonths: [12, 24, 36, 60, 120],
        eligibilityCriteria: '2 years active GST registration & audited P&L statement.',
        requiredDocuments: ['PAN', 'GST_CERTIFICATE', 'BANK_STATEMENT', 'ITR'],
        description: 'Working capital & business expansion finance.',
        isActive: true,
      },
    ];

    const createdProducts = await LoanProduct.insertMany(productsToCreate);

    // 4. Create Loan Applications
    const applicationsToCreate = [
      { citizenId: citizens[0]._id, loanProductId: createdProducts[1]._id, amount: 500000, tenureMonths: 36, purpose: 'Medical Emergency', status: 'Approved', branchId: createdBranches[0]._id, creditScorePrediction: 750, eligibilityPrediction: 'Eligible' },
      { citizenId: citizens[1]._id, loanProductId: createdProducts[0]._id, amount: 2500000, tenureMonths: 180, purpose: 'New Flat', status: 'Pending', branchId: createdBranches[0]._id, creditScorePrediction: 680, eligibilityPrediction: 'Eligible' },
      { citizenId: citizens[2]._id, loanProductId: createdProducts[2]._id, amount: 800000, tenureMonths: 60, purpose: 'Buy a Sedan', status: 'Rejected', branchId: createdBranches[1]._id, creditScorePrediction: 550, eligibilityPrediction: 'Not Eligible', remarks: 'Low CIBIL' },
      { citizenId: citizens[0]._id, loanProductId: createdProducts[3]._id, amount: 1500000, tenureMonths: 60, purpose: 'Machinery', status: 'Verified', branchId: createdBranches[2]._id, creditScorePrediction: 820, eligibilityPrediction: 'Eligible' },
      { citizenId: citizens[1]._id, loanProductId: createdProducts[1]._id, amount: 200000, tenureMonths: 24, purpose: 'Wedding', status: 'Pending', branchId: createdBranches[1]._id, creditScorePrediction: 710, eligibilityPrediction: 'Eligible' },
      { citizenId: citizens[2]._id, loanProductId: createdProducts[0]._id, amount: 3500000, tenureMonths: 240, purpose: 'Villa', status: 'Approved', branchId: createdBranches[2]._id, creditScorePrediction: 760, eligibilityPrediction: 'Eligible' },
    ];

    const createdApplications = await LoanApplication.insertMany(applicationsToCreate);

    // 5. Create some dummy Payments for revenue
    const paymentsToCreate = [
      { loanId: createdApplications[0]._id, amount: 15000, paymentMethod: 'UPI', status: 'Success', transactionId: 'TXN12345' },
      { loanId: createdApplications[1]._id, amount: 25000, paymentMethod: 'Net Banking', status: 'Success', transactionId: 'TXN12346' },
      { loanId: createdApplications[3]._id, amount: 45000, paymentMethod: 'Card', status: 'Success', transactionId: 'TXN12347' },
    ];
    
    // Total dummy revenue = 15000 + 25000 + 45000 = 85000
    await Payment.insertMany(paymentsToCreate);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Branch.deleteMany();
    await LoanProduct.deleteMany();
    await LoanApplication.deleteMany();
    await Payment.deleteMany();
    await Document.deleteMany();
    await Notification.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error with data destroy: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}

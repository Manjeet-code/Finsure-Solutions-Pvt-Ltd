import LoanProduct from '../models/LoanProduct.js';

// @desc    Get all loan products
// @route   GET /api/loan-products
// @access  Public / Private
export const getLoanProducts = async (req, res) => {
  try {
    const { isActive, search } = req.query;
    let query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { productCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await LoanProduct.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single loan product by ID
// @route   GET /api/loan-products/:id
// @access  Public / Private
export const getLoanProductById = async (req, res) => {
  try {
    const product = await LoanProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Loan product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new loan product (Admin)
// @route   POST /api/loan-products
// @access  Private/Admin
export const createLoanProduct = async (req, res) => {
  const {
    productCode,
    name,
    interestRate,
    minAmount,
    maxAmount,
    tenureOptionsMonths,
    eligibilityCriteria,
    requiredDocuments,
    description,
  } = req.body;

  try {
    const code = productCode || `LP-${name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const productExists = await LoanProduct.findOne({ $or: [{ name }, { productCode: code }] });

    if (productExists) {
      return res.status(400).json({ message: 'Loan product with this name or code already exists' });
    }

    // Process tenure options array
    let tenures = [12, 24, 36, 48, 60];
    if (Array.isArray(tenureOptionsMonths) && tenureOptionsMonths.length > 0) {
      tenures = tenureOptionsMonths.map(Number);
    } else if (typeof tenureOptionsMonths === 'string') {
      tenures = tenureOptionsMonths.split(',').map((t) => Number(t.trim())).filter((n) => !isNaN(n));
    }

    // Process required documents array
    let docs = ['PAN', 'AADHAAR', 'SALARY_SLIP', 'BANK_STATEMENT'];
    if (Array.isArray(requiredDocuments) && requiredDocuments.length > 0) {
      docs = requiredDocuments.map((d) => d.trim().toUpperCase());
    } else if (typeof requiredDocuments === 'string') {
      docs = requiredDocuments.split(',').map((d) => d.trim().toUpperCase()).filter(Boolean);
    }

    const product = await LoanProduct.create({
      productCode: code,
      name,
      interestRate: Number(interestRate),
      minAmount: Number(minAmount),
      maxAmount: Number(maxAmount),
      tenureOptionsMonths: tenures,
      eligibilityCriteria: eligibilityCriteria || 'Minimum age 21, regular income proof required.',
      requiredDocuments: docs,
      description: description || '',
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a loan product (Admin)
// @route   PUT /api/loan-products/:id
// @access  Private/Admin
export const updateLoanProduct = async (req, res) => {
  const {
    name,
    interestRate,
    minAmount,
    maxAmount,
    tenureOptionsMonths,
    eligibilityCriteria,
    requiredDocuments,
    description,
    isActive,
  } = req.body;

  try {
    const product = await LoanProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Loan product not found' });
    }

    product.name = name || product.name;
    if (interestRate !== undefined) product.interestRate = Number(interestRate);
    if (minAmount !== undefined) product.minAmount = Number(minAmount);
    if (maxAmount !== undefined) product.maxAmount = Number(maxAmount);
    if (eligibilityCriteria !== undefined) product.eligibilityCriteria = eligibilityCriteria;
    if (description !== undefined) product.description = description;
    if (isActive !== undefined) product.isActive = isActive;

    if (tenureOptionsMonths !== undefined) {
      if (Array.isArray(tenureOptionsMonths)) {
        product.tenureOptionsMonths = tenureOptionsMonths.map(Number);
      } else if (typeof tenureOptionsMonths === 'string') {
        product.tenureOptionsMonths = tenureOptionsMonths.split(',').map((t) => Number(t.trim())).filter((n) => !isNaN(n));
      }
    }

    if (requiredDocuments !== undefined) {
      if (Array.isArray(requiredDocuments)) {
        product.requiredDocuments = requiredDocuments.map((d) => d.trim().toUpperCase());
      } else if (typeof requiredDocuments === 'string') {
        product.requiredDocuments = requiredDocuments.split(',').map((d) => d.trim().toUpperCase()).filter(Boolean);
      }
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle loan product active status (Admin)
// @route   PUT /api/loan-products/:id/toggle-status
// @access  Private/Admin
export const toggleLoanProductStatus = async (req, res) => {
  try {
    const product = await LoanProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Loan product not found' });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      message: `Product successfully ${product.isActive ? 'activated' : 'deactivated'}`,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import Medicine from "../models/Medicine.js";

// Get All Medicines (with Search, Filters, Sorting, and Pagination)
export const getMedicines = async (req, res) => {
  try {
    const { search, category, brand, form, minPrice, maxPrice, sort, page, limit } = req.query;
    let query = {};

    // 1. Search Query (name or generic)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { generic: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    // 2. Category Filter
    if (category && category !== "All" && category !== "All Categories") {
      query.category = category;
    }

    // 3. Brand Filter
    if (brand && brand !== "All") {
      query.brand = brand;
    }

    // 4. Form Filter (Tablet, Capsule, Syrup, etc.)
    if (form && form !== "All") {
      query.form = form;
    }

    // 5. Price Range Filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting options
    let sortOption = {};
    if (sort) {
      if (sort === "price-asc") {
        sortOption.price = 1;
      } else if (sort === "price-desc") {
        sortOption.price = -1;
      } else if (sort === "popular") {
        sortOption.rating = -1;
        sortOption.reviewsCount = -1;
      } else if (sort === "newest") {
        sortOption.createdAt = -1;
      }
    } else {
      // Default: Sort by rating/reviews count
      sortOption.rating = -1;
    }

    // Pagination
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12;
    const skipNum = (pageNum - 1) * limitNum;

    const total = await Medicine.countDocuments(query);
    const medicines = await Medicine.find(query)
      .sort(sortOption)
      .skip(skipNum)
      .limit(limitNum);

    res.json({
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      medicines,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Single Medicine by ID
export const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create Medicine (Admin)
export const createMedicine = async (req, res) => {
  try {
    const {
      name,
      generic,
      category,
      brand,
      price,
      originalPrice,
      discount,
      form,
      image,
      description,
      stock,
    } = req.body;

    const medicine = await Medicine.create({
      name,
      generic,
      category,
      brand,
      price: Number(price),
      originalPrice: Number(originalPrice),
      discount: Number(discount) || 0,
      form,
      image,
      description,
      stock: Number(stock) || 100,
    });

    res.status(201).json(medicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Medicine (Admin)
export const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    // Update fields if provided
    medicine.name = req.body.name || medicine.name;
    medicine.generic = req.body.generic || medicine.generic;
    medicine.category = req.body.category || medicine.category;
    medicine.brand = req.body.brand || medicine.brand;
    medicine.price = req.body.price !== undefined ? Number(req.body.price) : medicine.price;
    medicine.originalPrice = req.body.originalPrice !== undefined ? Number(req.body.originalPrice) : medicine.originalPrice;
    medicine.discount = req.body.discount !== undefined ? Number(req.body.discount) : medicine.discount;
    medicine.form = req.body.form || medicine.form;
    medicine.image = req.body.image || medicine.image;
    medicine.description = req.body.description || medicine.description;
    medicine.stock = req.body.stock !== undefined ? Number(req.body.stock) : medicine.stock;
    medicine.available = req.body.available !== undefined ? req.body.available : medicine.available;

    const updated = await medicine.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Medicine (Admin)
export const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    await medicine.deleteOne();
    res.json({ message: "Medicine deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

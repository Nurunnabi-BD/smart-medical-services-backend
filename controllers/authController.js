import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};


// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (
      user &&
      (await bcrypt.compare(password, user.password))
    ) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image || "",
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.location = req.body.location !== undefined ? req.body.location : user.location;
      user.dob = req.body.dob !== undefined ? req.body.dob : user.dob;
      user.blood = req.body.blood !== undefined ? req.body.blood : user.blood;
      user.gender = req.body.gender !== undefined ? req.body.gender : user.gender;
      user.weight = req.body.weight !== undefined ? req.body.weight : user.weight;
      user.height = req.body.height !== undefined ? req.body.height : user.height;
      user.emergency = req.body.emergency !== undefined ? req.body.emergency : user.emergency;
      user.occupation = req.body.occupation !== undefined ? req.body.occupation : user.occupation;
      user.about = req.body.about !== undefined ? req.body.about : user.about;
      user.image = req.body.image !== undefined ? req.body.image : user.image;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        location: updatedUser.location,
        dob: updatedUser.dob,
        blood: updatedUser.blood,
        gender: updatedUser.gender,
        weight: updatedUser.weight,
        height: updatedUser.height,
        emergency: updatedUser.emergency,
        occupation: updatedUser.occupation,
        about: updatedUser.about,
        image: updatedUser.image || "",
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
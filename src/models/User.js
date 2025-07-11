const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: "https://example.com/default-avatar.png",
    },
    birthDate: {
      type: Date,
      default: Date.now,
    },
    gender: {
      type: String,
      require: false,
    },
    address: {
      type: String,
      require: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    progress: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
        progress: {
          type: Number,
          default: 0, // Bắt đầu từ 0%, tối đa 100%
          min: 0,
          max: 100,
        },
      },
    ],
    refreshTokens: [String],
  },
  { timestamps: true }
);

// Hash password trước khi lưu
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("User", UserSchema);

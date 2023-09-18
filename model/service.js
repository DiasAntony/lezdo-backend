const mongoose = require("mongoose");

const serviceSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    services: [{ name: { type: String, required: true } }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Service", serviceSchema);

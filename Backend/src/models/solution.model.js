const mongoose = require("mongoose");

const solutionSchema = new mongoose.Schema(
  {
    instruction: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    // No strict enum — dataset has raw values like 'beginner', 'intermediate'
    difficulty: {
      type: String,
      trim: true,
    },
    output: {
      type: String,
      required: true,
    },
    dataset_source: {
      type: String,
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    problem_number: {
      type: Number,
    },
    url: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "dataset", // Use 'dataset' collection directly
  }
);

// Virtuals to map legacy field names — ONLY for fields NOT already real fields
solutionSchema.virtual("title").get(function () {
  if (this.problem_number) {
    return `Solution #${this.problem_number}`;
  }
  return `Solution: ${(this.instruction || "").substring(0, 50)}...`;
});

solutionSchema.virtual("source").get(function () {
  return this.dataset_source;
});

solutionSchema.virtual("code").get(function () {
  return this.output;
});

solutionSchema.virtual("explanation").get(function () {
  return this.instruction;
});

solutionSchema.set("toJSON", { virtuals: true });
solutionSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Solution", solutionSchema);
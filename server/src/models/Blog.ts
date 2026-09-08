import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, models, model } = mongoose;

const BlogCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: String,
  },
  { timestamps: true }
);

const BlogPostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    featuredImage: { type: String, default: "" },
    category: { type: String, required: true, index: true },
    tags: [{ type: String }],
    authorName: { type: String, default: "HMC Mobile" },
    seoTitle: String,
    seoDescription: String,
    status: {
      type: String,
      enum: ["draft", "published", "scheduled", "archived"],
      default: "draft",
      index: true,
    },
    publishedAt: { type: Date, index: true },
    readingMinutes: { type: Number, default: 4 },
  },
  { timestamps: true }
);

BlogPostSchema.index({ status: 1, publishedAt: -1 });

export type IBlogCategory = InferSchemaType<typeof BlogCategorySchema> & {
  _id: mongoose.Types.ObjectId;
};
export type IBlogPost = InferSchemaType<typeof BlogPostSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const BlogCategory =
  models.BlogCategory || model("BlogCategory", BlogCategorySchema);
export const BlogPost = models.BlogPost || model("BlogPost", BlogPostSchema);

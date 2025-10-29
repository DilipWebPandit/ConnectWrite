import express from "express";
import {
  showAllArticles,
  uploadArticles,
} from "../controller/uploadArticlesController.js";
import articleModel from "../models/uploadArticlesModels.js";
import { verifyUser } from "../middlewares/checkUserAuthentication.js";
import upload from "../config/multerConfig.js";
import cloudinary from "../config/cloudinaryConfig.js";

const articleRuter = express.Router();

articleRuter.post(
  "/upload",
  verifyUser,
  upload.single("articleImage"),
  uploadArticles
);

articleRuter.get("/showAllArticles", verifyUser, showAllArticles);

articleRuter.get("/upload", verifyUser, (req, res) => {
  const message = req.session.message;
  req.session.message = null;
  res.render("writeArticle", { message });
});

articleRuter.get("/readCard/:id", async (req, res) => {
  try {
    const article = await articleModel.findById(req.params.id);
    if (!article) return res.status(404).send("Article not found");
    res.render("readCard", { articles: [article] }); // ✅ wrap in array
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

articleRuter.get("/update/:id", async (req, res) => {
  const article = await articleModel.findById(req.params.id);
  res.render("updateForm", { article });
});

articleRuter.put(
  "/update/:id",
  upload.single("articleImage"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { writerName, title, content } = req.body;
      const article = await articleModel.findById(id);

      const updateData = {
        writerName,
        title,
        content,
        updated_at: new Date(Date.now() + 5.5 * 60 * 60 * 1000),
      };

      if (req.file) {
        if (article.imagePublicId) {
          await cloudinary.uploader.destroy(article.imagePublicId);
        }
        updateData.imageUrl = req.file.path;
        updateData.imagePublicId = req.file.filename;
      } else {
        updateData.imageUrl = "/images/article.png";
      }

      const updateArticle = await articleModel.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
        }
      );

      req.session.message = `The article "${article.title}" has been refreshed with the latest updates.`;
      res.render("readCard", { articles: [updateArticle] }); // ✅ wrap in array
    } catch (error) {
      res.send("Error: Can not update the article", error.message);
    }
  }
);

articleRuter.get("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const article = await articleModel.findById(id);
    console.log(article);
    if (!article) {
      return res.status(404).send("Article not found");
    }

    // Delete image from Cloudinary
    if (article.imagePublicId) {
      await cloudinary.uploader.destroy(article.imagePublicId);
    }

    await articleModel.findByIdAndDelete(id);

    req.session.message = `You’ve successfully deleted "${article.title}" article`;

    res.redirect("/article/showAllArticles");
  } catch (error) {
    res
      .status(500)
      .send(`Error: Not able to delete the article ${error.message}`);
  }
});

export default articleRuter;

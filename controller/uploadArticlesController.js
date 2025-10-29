import articleModel from "../models/uploadArticlesModels.js";

export const uploadArticles = async (req, res) => {
  const { writerName, title, content } = req.body;

  if (!writerName || !title || !content) {
    req.session.message = "⚠️ Missing Details!";
    return res.redirect("/article/upload");
  }

  try {
    const articleData = {
      userId: req.userId,
      writerName,
      title,
      content,
      imagePublicId: req.file.filename,
    };

    if (req.file) {
      articleData.imageUrl = req.file.path;
      articleData.imagePublicId = req.file.filename;
    }

    const newArticle = new articleModel(articleData);

    await newArticle.save();

    req.session.message = "✅ Uploaded article Successfully";
    res.redirect("/");
  } catch (error) {
    req.session.message = `❌ Error: ${error.message}`;
    res.redirect("/");
  }
};

export const showAllArticles = async (req, res) => {
  try {
    const articles = await articleModel.find({ userId: req.userId });
    // Directly render with articles
    res.render("showAllArticles", {
      message: req.session.message || null,
      articles,
    });
    req.session.message = null;
  } catch (error) {
    req.session.message = `❌ Error: ${error.message}`;
    res.redirect("/");
  }
};

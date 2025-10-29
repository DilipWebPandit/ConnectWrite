import express from "express";
import connectDB from "./config/mongodb.js";
import "dotenv/config";
import { fileURLToPath } from "url";
import path from "path";
import session from "express-session";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import methodOverride from "method-override";

import authRouter from "./routers/authRouter.js";
import articleRuter from "./routers/articlesRouter.js";
import articleModel from "./models/uploadArticlesModels.js";

const app = express();
const port = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    req.user = null;
    return next();
  }
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    req.user = err ? null : decoded;
    next();
  });
});

app.use((req, res, next) => {
  res.locals.user = req.user || null; // available in all EJS templates
  next();
});

app.get("/", async (req, res) => {
  try {
    // const token = req.cookies.token;
    const articles = await articleModel.find();
    const message = req.session.message || null;
    req.session.message = null;
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.render("index", { message, articles });
  } catch (error) {
    res.render("index", {
      message: `❌ Error: ${error.message}`,
      articles: [],
    });
  }
});

// ✅ Auth Routes
app.use("/", authRouter);
app.use("/article", articleRuter);

app.listen(port, () => console.log(`Server is listening on port ${port}`));

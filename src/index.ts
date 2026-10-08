import express, { type Request, type Response } from "express"
import mongoose from "mongoose"
import cors from "cors"
import AuthRouter from "./routes/auth.routers"
import ArticleRouter from "./routes/article.routers"
import dotenv from "dotenv"
dotenv.config()

const MONGO_URL = process.env.MONGO_LOCAL_URL || ""
const PORT = process.env.PORT || 3000

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/v1/auth", AuthRouter)
app.use("/api/v1/articles", ArticleRouter)

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("DB connected..!")

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`)
    })
  })
  .catch((err) => console.error("Fail to connect DB..!"))

import { Request, Response } from "express"
import mongoose from "mongoose"
import { Article } from "../models/article.model"
import { UserModel } from "../models/user.model"
import { generateArticleDescription } from "../services/ai.service"
import { uploadImage } from "../services/storage.service"
import { AuthRequest } from "../middleware/auth"

export const createArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, tags } = req.body
    const userId = req.user?.sub
    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const user = await UserModel.findById(userId).select("-password")
    if (!user) return res.status(404).json({ message: "User not found" })

    const imageURL = req.file ? await uploadImage(req.file, "articles") : ""

    const article = await Article.create({
      title,
      content,
      author: user._id,
      imageURL,
      tags: tags ? JSON.parse(tags) : []
    })

    res.status(201).json(article)
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" })
  }
}

export const getAllArticles = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const articles = await Article.find({ isVisible: true })
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Article.countDocuments({ isVisible: true })

    res.status(200).json({
      data: articles,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" })
  }
}

export const getAdminArticles = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const articles = await Article.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Article.countDocuments()

    res.status(200).json({
      data: articles,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" })
  }
}

export const getMyArticles = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub
    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const articles = await Article.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.status(200).json(articles)
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" })
  }
}

export const getAIDescription = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body
    if (!title || !content)
      return res.status(400).json({ error: "Title and content required" })

    const description = await generateArticleDescription(title, content)
    res.status(200).json({ description })
  } catch (error) {
    res.status(500).json({ error: "AI generation failed" })
  }
}

export const getArticleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ error: "Invalid Article ID" })

    const article = await Article.findById(id).populate("author", "name email")
    if (!article) return res.status(404).json({ error: "Article not found" })

    res.status(200).json(article)
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" })
  }
}

export const toggleVisibility = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ error: "Invalid Article ID" })

    const article = await Article.findById(id)
    if (!article) return res.status(404).json({ error: "Article not found" })

    article.isVisible = !article.isVisible
    await article.save()

    res.status(200).json(article)
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" })
  }
}

export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.sub
    if (!userId || !mongoose.isValidObjectId(id))
      return res.status(400).json({ error: "Invalid request" })

    const article = await Article.findById(id)
    if (!article) return res.status(404).json({ error: "Article not found" })

    const index = article.favorites.indexOf(userId as any)
    if (index === -1) {
      article.favorites.push(userId as any)
    } else {
      article.favorites.splice(index, 1)
    }

    await article.save()
    res.status(200).json(article)
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" })
  }
}

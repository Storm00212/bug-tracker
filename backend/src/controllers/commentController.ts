import { Request, Response } from "express";
import { addComment, getCommentsByBug } from "../repositories/commentRepository.js";
import { commentSchema } from "../models/Comment.js";

export const addBugComment = async (req: Request, res: Response) => {
  try {
    const parse = commentSchema.safeParse(req.body);
    if (!parse.success) {
      const errors = parse.error.errors.map(e => e.message).join(", ");
      return res.status(400).json({ message: errors });
    }

    const comment = await addComment(req.body);
    res.status(201).json({ message: "Comment added successfully", comment });
  } catch (err: any) {
    console.error("Add Comment Error:", err.message);
    res.status(500).json({ message: "Server error adding comment" });
  }
};

export const listBugComments = async (req: Request, res: Response) => {
  try {
    const bugId = Number(req.params.bugId);
    const comments = await getCommentsByBug(bugId);
    res.json({ comments });
  } catch (err: any) {
    console.error("Fetch Comments Error:", err.message);
    res.status(500).json({ message: "Server error fetching comments" });
  }
};

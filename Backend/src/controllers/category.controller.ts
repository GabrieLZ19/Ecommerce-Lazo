import { Request, Response } from "express";
import { CategoryService } from "../services/supabase.service";

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await CategoryService.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error fetching categories" });
  }
};

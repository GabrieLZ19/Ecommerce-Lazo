import { Request, Response } from "express";
import { ProductService } from "../services/supabase.service";

export class ProductController {
  /**
   * Obtener todos los productos con filtros
   */
  static async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 12,
        category,
        minPrice,
        maxPrice,
        search,
        brand,
        sizes,
        colors,
        sortBy = "created_at",
        sortOrder = "desc",
        featured,
      } = req.query;

      const filters: any = {
        category: category as string,
        search: search as string,
        brand: brand as string,
        sizes: sizes ? (sizes as string).split(",") : undefined,
        colors: colors ? (colors as string).split(",") : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
        featured: featured === "true",
      };

      // Solo agregar minPrice y maxPrice si tienen valores válidos
      if (minPrice) {
        filters.minPrice = parseFloat(minPrice as string);
      }
      if (maxPrice) {
        filters.maxPrice = parseFloat(maxPrice as string);
      }

      const result = await ProductService.getProducts(
        parseInt(page as string),
        parseInt(limit as string),
        filters
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting products:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener productos",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Obtener un producto por ID
   */
  static async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "ID de producto es requerido",
        });
        return;
      }

      const product = await ProductService.getProductById(id);

      if (!product) {
        res.status(404).json({
          success: false,
          message: "Producto no encontrado",
        });
        return;
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error("Error getting product:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener producto",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Obtener un producto por slug
   */
  static async getProductBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      if (!slug) {
        res.status(400).json({
          success: false,
          message: "Slug de producto es requerido",
        });
        return;
      }

      const product = await ProductService.getProductBySlug(slug);

      if (!product) {
        res.status(404).json({
          success: false,
          message: "Producto no encontrado",
        });
        return;
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error("Error getting product by slug:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener producto",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Crear un nuevo producto (admin)
   */
  static async createProduct(req: Request, res: Response) {
    try {
      const productData = req.body;
      const product = await ProductService.createProduct(productData);

      res.status(201).json({
        success: true,
        data: product,
        message: "Producto creado exitosamente",
      });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear producto",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Actualizar un producto (admin)
   */
  static async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "ID de producto es requerido",
        });
        return;
      }

      const updateData = req.body;
      const product = await ProductService.updateProduct(id, updateData);

      if (!product) {
        res.status(404).json({
          success: false,
          message: "Producto no encontrado",
        });
        return;
      }

      res.json({
        success: true,
        data: product,
        message: "Producto actualizado exitosamente",
      });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar producto",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Eliminar un producto (admin)
   */
  static async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "ID de producto es requerido",
        });
        return;
      }

      await ProductService.deleteProduct(id);

      res.json({
        success: true,
        message: "Producto eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar producto",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Obtener productos relacionados
   */
  static async getRelatedProducts(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "ID de producto es requerido",
        });
        return;
      }

      const { limit = 4 } = req.query;

      const products = await ProductService.getRelatedProducts(
        id,
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error("Error getting related products:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener productos relacionados",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Obtener productos destacados
   */
  static async getFeaturedProducts(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 8 } = req.query;
      const products = await ProductService.getFeaturedProducts(
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error("Error getting featured products:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener productos destacados",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Actualizar stock de un producto
   */
  static async updateStock(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "ID de producto es requerido",
        });
        return;
      }

      const { quantity, operation } = req.body;

      if (!["add", "subtract", "set"].includes(operation)) {
        res.status(400).json({
          success: false,
          message: "Operación no válida. Use: add, subtract, o set",
        });
        return;
      }

      const product = await ProductService.updateStock(id, quantity, operation);

      if (!product) {
        res.status(404).json({
          success: false,
          message: "Producto no encontrado",
        });
        return;
      }

      res.json({
        success: true,
        data: product,
        message: "Stock actualizado exitosamente",
      });
    } catch (error) {
      console.error("Error updating stock:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar stock",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

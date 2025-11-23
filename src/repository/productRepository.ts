import sql from "../db/config"; //  config.ts default-exports `sql` from 'mssql'
import { Product } from "../types/productTypes";

/**
 * NOTE:
 * - Ensure src/config.ts exports the mssql instance:
 *   import sql from 'mssql'; export default sql;
 *   or export a poolPromise and adjust code to use poolPromise.request()
 */

export const getAllProducts = async (): Promise<Product[]> => {
  const result = await new sql.Request().query("SELECT * FROM Product");
  return result.recordset;
};

export const getProduct = async (id: number): Promise<Product | null> => {
  if (typeof id !== "number" || !Number.isInteger(id)) {
    throw new Error(`Invalid product ID: ${JSON.stringify(id)}`);
  }

  const request = new sql.Request();
  request.input("id", sql.Int, id);
  const result = await request.query("SELECT * FROM Product WHERE product_id = @id");
  return result.recordset[0] ?? null;
};

export const createProduct = async (product: Product): Promise<Product> => {
  const request = new sql.Request();
  request.input("farmer_id", sql.Int, product.farmer_id);
  request.input("product_name", sql.NVarChar(200), product.product_name);
  request.input("category", sql.NVarChar(100), product.category ?? null);
  request.input("stock_quantity", sql.Int, product.stock_quantity);
  request.input("price", sql.Decimal(18, 2), product.price);
  request.input("description", sql.NVarChar(1000), product.description ?? null);

  const insertQuery = `
    INSERT INTO Product (farmer_id, product_name, category, stock_quantity, price, description)
    OUTPUT INSERTED.*
    VALUES (@farmer_id, @product_name, @category, @stock_quantity, @price, @description)
  `;

  const result = await request.query(insertQuery);
  return result.recordset[0];
};

export const updateProduct = async (id: number, product: Partial<Product>): Promise<Product | null> => {
  const request = new sql.Request();
  request.input("id", sql.Int, id);
  request.input("product_name", sql.NVarChar(200), product.product_name ?? null);
  request.input("category", sql.NVarChar(100), product.category ?? null);
  request.input("stock_quantity", sql.Int, product.stock_quantity ?? null);
  request.input("price", sql.Decimal(18, 2), product.price ?? null);
  request.input("description", sql.NVarChar(1000), product.description ?? null);

  const updateQuery = `
    UPDATE Product
    SET 
      product_name = COALESCE(@product_name, product_name),
      category = COALESCE(@category, category),
<<<<<<< HEAD
      quantity = COALESCE(@quantity, quantity),
      price = COALESCE(@price, price),
      image_url = COALESCE(@image_url, image_url),
=======
      stock_quantity = COALESCE(@stock_quantity, stock_quantity),
      price = COALESCE(@price, price),
>>>>>>> f8891ecc3bb2f3f8888ff3709f73bdac584364a1
      description = COALESCE(@description, description)
    OUTPUT INSERTED.*
    WHERE product_id = @id
  `;

  const result = await request.query(updateQuery);
  return result.recordset[0] ?? null;
};

export const deleteProduct = async (id: number): Promise<boolean> => {
  const request = new sql.Request();
  request.input("id", sql.Int, id);
  const result = await request.query("DELETE FROM Product WHERE product_id = @id");
  return result.rowsAffected[0] > 0;
};

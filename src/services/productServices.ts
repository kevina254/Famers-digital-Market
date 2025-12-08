import * as productRepo from "../repository/productRepository";

export const addProduct = async (product: any) => {
  if (!product.product_name || !product.price) {
    throw new Error("Product name and price are required.");
  }

  await productRepo.createProduct(product);
  return { message: "Product added successfully" };
};

export const getAllProducts = async () => {
  return await productRepo.getAllProducts();
};

export const getProductById = async (id: number) => {
  if (isNaN(id)) {
    throw new Error(`Invalid product ID: ${id}`);
  }

  const product = await productRepo.getProduct(id);
  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};
export const updateProduct = async (id: number, updatedData: any) => {
  if (isNaN(id)) {
    throw new Error(`Invalid product ID: ${id}`);
  }

  const existingProduct = await productRepo.getProduct(id);
  if (!existingProduct) {
    throw new Error("Product not found");
  }
  if (updatedData.price !== undefined && updatedData.price <= 0) {
    throw new Error("Price must be greater than zero.");
  }

  await productRepo.updateProduct(id, updatedData);
  return { message: "Product updated successfully" };
};
export const deleteProduct = async (id: number) => {
  if (isNaN(id)) throw new Error(`Invalid product ID: ${id}`);

  const existingProduct = await productRepo.getProduct(id);
  if (!existingProduct) return null; // Not found

  await productRepo.deleteProduct(id);
  return { message: "Product deleted successfully" };
};

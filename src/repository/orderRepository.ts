import { getPool } from "../db/config";

export interface NewOrder {
  user_id: number;
  product_id: number;
  market_id: number;
  quantity: number;
  total_amount: number;
  order_date: string;
  status: string;
}

// CREATE
export const createOrder = async (order: NewOrder) => {
  const pool = await getPool();
  const request = pool.request();
  request
    .input("user_id", order.user_id)
    .input("product_id", order.product_id)
    .input("market_id", order.market_id)
    .input("quantity", order.quantity)
    .input("total_amount", order.total_amount)
    .input("order_date", order.order_date)
    .input("status", order.status);
  const result = await request.query(`
    INSERT INTO OrderTable (user_id, product_id, market_id, quantity, total_amount, order_date, status)
    OUTPUT INSERTED.order_id
    VALUES (@user_id, @product_id, @market_id, @quantity, @total_amount, @order_date, @status)
  `);
  const order_id = result.recordset[0].order_id;
  return { message: "Order created successfully", order_id };
};

// READ ALL
export const getOrders = async (userId: number) => {
  const pool = await getPool();
  const result = await pool.request()
    .input("userId", userId)
    .query("SELECT * FROM OrderTable WHERE user_id = @userId");
  return result.recordset;
};

// READ ORDERS FOR FARMER'S PRODUCTS
export const getOrdersByFarmer = async (farmerId: number) => {
  const pool = await getPool();
  const result = await pool.request()
    .input("farmerId", farmerId)
    .query(`
      SELECT o.*, p.product_name
      FROM OrderTable o
      JOIN Product p ON o.product_id = p.product_id
      WHERE p.farmer_id = @farmerId
    `);
  return result.recordset;
};

// READ ONE
export const getOrderById = async (id: number) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("id", id)
    .query("SELECT * FROM OrderTable WHERE order_id = @id");
  return result.recordset[0];
};

// UPDATE
export const updateOrder = async (id: number, order: Partial<NewOrder>) => {
  const pool = await getPool();
  await pool
    .request()
    .input("id", id)
    .input("status", order.status)
    .input("quantity", order.quantity)
    .input("total_amount", order.total_amount)
    .query(`
      UPDATE OrderTable 
      SET status = @status, quantity = @quantity, total_amount = @total_amount
      WHERE order_id = @id
    `);
  return { message: "Order updated successfully" };
};

// DELETE
export const deleteOrder = async (id: number) => {
  const pool = await getPool();
  await pool.request().input("id", id).query("DELETE FROM OrderTable WHERE order_id = @id");
  return { message: "Order deleted successfully" };
};

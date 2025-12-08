import { Request, Response } from "express";
import sql from "../db/config";
import { PaymentService } from "../services/paymentServices";

// ========================
//      GET ALL ORDERS
// ========================
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const result = await sql.query(`
      SELECT o.*, p.product_name, u.full_name AS customer_name
      FROM OrderTable o
      JOIN Product p ON o.product_id = p.product_id
      JOIN UserAccount u ON o.user_id = u.user_id
      ORDER BY o.order_date DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err });
  }
};

// ========================
//   GET PENDING ORDERS FOR PAYMENT APPROVAL
// ========================
export const getPendingOrdersForPayment = async (req: Request, res: Response) => {
  try {
    const result = await sql.query(`
      SELECT o.*, p.product_name, u.full_name AS customer_name
      FROM OrderTable o
      JOIN Product p ON o.product_id = p.product_id
      JOIN UserAccount u ON o.user_id = u.user_id
      WHERE o.status = 'pending'
      ORDER BY o.order_date DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending orders", error: err });
  }
};

// ========================
//   UPDATE ORDER STATUS
// ========================
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await sql.query`
      UPDATE OrderTable
      SET status = ${status}
      WHERE order_id = ${id}
    `;

    res.json({ message: "Order status updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update order status", error: err });
  }
};

// ========================
//   APPROVE PAYMENT
// ========================
export const approvePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Update order status to Paid
    await sql.query`
      UPDATE OrderTable
      SET status = 'Paid'
      WHERE order_id = ${id}
    `;

    // Create payment record
    await PaymentService.create({
      order_id: parseInt(id),
      payment_method: "Admin Approved",
      reference: "",
      payment_date: new Date().toISOString(),
      payment_status: "completed",
    });

    res.json({ message: "Payment approved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to approve payment", error: err });
  }
};

// ========================
//     ASSIGN DRIVER
// ========================
export const assignDriver = async (req: Request, res: Response) => {
  try {
    const { id: order_id } = req.params;
    const { vehicle_number_plate, transport_mode, pickup_location, dropoff_location } = req.body;

    // Create logistics entry
    const result = await sql.query`
      INSERT INTO Logistics (order_id, vehicle_number_plate, transport_mode, pickup_location, dropoff_location, delivered)
      VALUES (${order_id}, ${vehicle_number_plate}, ${transport_mode}, ${pickup_location}, ${dropoff_location}, 0)
    `;

    // Update order status → Shipped
    await sql.query`
      UPDATE OrderTable 
      SET status = 'Shipped'
      WHERE order_id = ${order_id}
    `;

    res.json({ message: "Driver assigned successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to assign driver", error: err });
  }
};

// ========================
//   LOGISTICS BY ORDER
// ========================
export const getLogisticsByOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await sql.query`
      SELECT l.*
      FROM Logistics l
      WHERE order_id = ${id}
    `;

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to get logistics", error: err });
  }
};

// ========================
//    GET ALL LOGISTICS
// ========================
export const getAllLogistics = async (req: Request, res: Response) => {
  try {
    const result = await sql.query(`
      SELECT l.*, o.status AS order_status
      FROM Logistics l
      JOIN OrderTable o ON l.order_id = o.order_id
      ORDER BY l.logistics_id DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch logistics", error: err });
  }
};

// ========================
//       GET DRIVERS
// ========================
export const getAllDrivers = async (req: Request, res: Response) => {
  try {
    const result = await sql.query`
      SELECT * FROM UserAccount WHERE role = 'driver'
    `;

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch drivers", error: err });
  }
};

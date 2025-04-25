import Order from "../models/order.model.js";

export const createOrder = async (req, res) => {
    try {
        const { items, pickupCode, pickupTime } = req.body;
        const order = new Order({ items, pickupCode, pickupTime });
        await order.save();
        res.status(201).json({ message: "Order created", order });
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
};

export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.status = status;
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getOrderByPickupCode = async (req, res) => {
    try {
        const { pickupCode } = req.params;
        
        if (!pickupCode) {
            return res.status(400).json({ message: "Pickup code is required" });
        }
        
        const order = await Order.findOne({ pickupCode });
        
        if (!order) {
            return res.status(404).json({ message: "Order not found with this pickup code" });
        }
        
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
};
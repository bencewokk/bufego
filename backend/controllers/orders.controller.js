import Order from "../models/order.model.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import Buffet from "../models/buffet.model.js";
import { Users } from "../models/user.model.js";

const ENCRYPTION_KEY = process.env.EMAIL_ENCRYPTION_KEY || 'default_key_32_bytes_long_123456'; // Must be 32 bytes for aes-256
const IV_LENGTH = 16;

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

export const createOrder = async (req, res) => {
    try {
        const { items, pickupCode, pickupTime, email, buffetId } = req.body;

        if (!buffetId) {
            return res.status(400).json({ message: "buffetId is required for order creation." });
        }

        // LOGGING: Incoming order details
        console.log('--- Incoming Order ---');
        console.log('Email:', email);
        console.log('req.user:', req.user);

        // Check if email belongs to a registered user or buffet
        if (email) {
            const user = await Users.findOne({ email: email.toLowerCase() });
            const buffet = await Buffet.findOne({ email: email.toLowerCase() });
            // LOGGING: Lookup results
            console.log('User found:', !!user);
            console.log('Buffet found:', !!buffet);
            // If email is registered and request is unauthenticated, reject
            if ((user || buffet) && !req.user) {
                console.log('Order rejected: Registered email used while unauthenticated');
                return res.status(403).json({ message: "Registered users/buffets must log in to order with this email." });
            }
        }

        const encryptedEmail = email ? encrypt(email) : undefined;
        const order = new Order({ items, pickupCode, pickupTime, email: encryptedEmail, buffetId });
        await order.save();

        // Send receipt email
        if (email) {
            // Configure your SMTP transport (replace with your real credentials)
            const transporter = nodemailer.createTransport({
                service: 'gmail', // or your SMTP provider
                auth: {
                    user: process.env.SMTP_USER || 'your@email.com',
                    pass: process.env.SMTP_PASS || 'yourpassword',
                },
            });

            const itemList = items.map(item => `<li>${item}</li>`).join('');
            const total = items.reduce((sum, item) => {
                const match = item.match(/\((\d+) Ft\)/);
                return sum + (match ? parseInt(match[1], 10) : 0);
            }, 0);
            const html = `
                <h2>Köszönjük a rendelésed!</h2>
                <p><b>Átvételi kód:</b> <span style='color:#888'>(Ne mutasd meg ezt a kódot, csak mondd be az átvételkor!)</span></p>
                <p><b>Átvételi idő:</b> ${new Date(pickupTime).toLocaleString('hu-HU')}</p>
                <p><b>Tételek:</b></p>
                <ul>${itemList}</ul>
                <p><b>Összesen:</b> ${total} Ft</p>
                <p>Kérjük, <b>ne mutasd meg ezt a kódot</b>, csak <b>mondd be az átvételkor</b>.</p>
            `;

            await transporter.sendMail({
                from: process.env.SMTP_FROM || 'no-reply@bufego.hu',
                to: email,
                subject: 'BüféGO rendelés visszaigazolás',
                html,
            });
        }

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

        const prevStatus = order.status;
        order.status = status;
        await order.save();

        // Send ready-for-pickup email if status changed to 'ready' and email exists
        if (status === 'ready' && prevStatus !== 'ready' && order.email) {
            const decryptedEmail = decrypt(order.email);
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER || 'your@email.com',
                    pass: process.env.SMTP_PASS || 'yourpassword',
                },
            });
            const totalReady = order.items.reduce((sum, item) => {
                const match = item.match(/\((\d+) Ft\)/);
                return sum + (match ? parseInt(match[1], 10) : 0);
            }, 0);
            const html = `
                <h2>Rendelésed elkészült!</h2>
                <p><b>Átvételi kód:</b> <span style='color:#888'>(Ne mutasd meg ezt a kódot, csak mondd be az átvételkor!)</span></p>
                <p><b>Átvételi idő:</b> ${new Date(order.pickupTime).toLocaleString('hu-HU')}</p>
                <p><b>Tételek:</b></p>
                <ul>${order.items.map(item => `<li>${item}</li>`).join('')}</ul>
                <p><b>Összesen:</b> ${totalReady} Ft</p>
                <p>Rendelésed elkészült, átveheted a pultnál. <b>Ne mutasd meg ezt a kódot, csak mondd be az átvételkor.</b></p>
            `;
            await transporter.sendMail({
                from: process.env.SMTP_FROM || 'no-reply@bufego.hu',
                to: decryptedEmail,
                subject: 'BüféGO rendelésed elkészült! Átvételre kész',
                html,
            });
        }

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

export const getMyOrders = async (req, res) => {
    try {
        const userEmail = req.user?.email?.toLowerCase();
        if (!userEmail) {
            return res.status(400).json({ message: "No user email found in token." });
        }
        // Get all orders, decrypt email, and filter by user email
        const orders = await Order.find();
        const decryptedOrders = orders
            .map(order => {
                let decryptedEmail = null;
                try {
                    decryptedEmail = order.email ? decrypt(order.email) : null;
                } catch {
                    decryptedEmail = null;
                }
                return { ...order.toObject(), decryptedEmail };
            })
            .filter(order => order.decryptedEmail && order.decryptedEmail.toLowerCase() === userEmail);
        res.status(200).json(decryptedOrders);
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
};

export const getBuffetOrders = async (req, res) => {
    try {
        const buffetId = req.user?.id;
        if (!buffetId) {
            return res.status(400).json({ message: "No buffet id found in token." });
        }
        const orders = await Order.find({ buffetId }).sort({ createdAt: -1 });
        // Optionally, decrypt email for display
        const ordersWithDecryptedEmail = orders.map(order => {
            let decryptedEmail = null;
            try {
                decryptedEmail = order.email ? decrypt(order.email) : null;
            } catch {
                decryptedEmail = null;
            }
            return { ...order.toObject(), decryptedEmail };
        });
        res.status(200).json(ordersWithDecryptedEmail);
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
};
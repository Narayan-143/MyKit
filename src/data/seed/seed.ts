import { connectToDatabase } from "../../lib/db/mongodb";
import MenuItem from "../../models/MenuItem";
import Order from "../../models/Order";
import { SEED_MENU_ITEMS } from "./menuItems";

async function runSeed() {
  console.log("🌱 Starting MyKit database seed...");

  try {
    await connectToDatabase();
    console.log(" Connected to MongoDB");

    // 1. Seed Menu Items
    await MenuItem.deleteMany({});
    console.log(" Cleared existing menu items");

    const insertedItems = await MenuItem.insertMany(SEED_MENU_ITEMS);
    console.log(` Inserted ${insertedItems.length} menu items`);

    // 2. Seed Sample Orders for Admin Demonstration
    await Order.deleteMany({});
    console.log(" Cleared existing orders");

    const pizza = insertedItems.find((i) => i.category === "Pizza") || insertedItems[0];
    const burger = insertedItems.find((i) => i.category === "Burgers") || insertedItems[1];
    const drink = insertedItems.find((i) => i.category === "Beverages") || insertedItems[2];
    const dessert = insertedItems.find((i) => i.category === "Desserts") || insertedItems[3];
    const indian = insertedItems.find((i) => i.category === "Indian") || insertedItems[4];

    const sampleOrders = [
      {
        orderNumber: "ORD-1001",
        customer: {
          name: "Aarav Sharma",
          mobile: "9876543210",
          email: "aarav.sharma@example.com",
          address: "Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103",
        },
        items: [
          {
            menuItemId: pizza._id.toString(),
            name: pizza.name,
            price: pizza.price,
            quantity: 2,
            image: pizza.image,
          },
          {
            menuItemId: drink._id.toString(),
            name: drink.name,
            price: drink.price,
            quantity: 2,
            image: drink.image,
          },
        ],
        subtotal: pizza.price * 2 + drink.price * 2,
        tax: Math.round((pizza.price * 2 + drink.price * 2) * 0.05),
        total: Math.round((pizza.price * 2 + drink.price * 2) * 1.05),
        paymentMethod: "Demo UPI" as const,
        paymentStatus: "Paid" as const,
        orderStatus: "Completed" as const,
      },
      {
        orderNumber: "ORD-1002",
        customer: {
          name: "Priya Patel",
          mobile: "9823456789",
          email: "priya.patel@example.com",
          address: "B-12, Silver Oaks Society, Kalyani Nagar, Pune - 411006",
        },
        items: [
          {
            menuItemId: burger._id.toString(),
            name: burger.name,
            price: burger.price,
            quantity: 1,
            image: burger.image,
          },
          {
            menuItemId: dessert._id.toString(),
            name: dessert.name,
            price: dessert.price,
            quantity: 1,
            image: dessert.image,
          },
        ],
        subtotal: burger.price + dessert.price,
        tax: Math.round((burger.price + dessert.price) * 0.05),
        total: Math.round((burger.price + dessert.price) * 1.05),
        paymentMethod: "Demo Card" as const,
        paymentStatus: "Paid" as const,
        orderStatus: "Preparing" as const,
      },
      {
        orderNumber: "ORD-1003",
        customer: {
          name: "Rohan Verma",
          mobile: "9988776655",
          email: "rohan.v@example.com",
          address: "14B Tower 2, DLF Phase 5, Golf Course Road, Gurugram - 122002",
        },
        items: [
          {
            menuItemId: indian._id.toString(),
            name: indian.name,
            price: indian.price,
            quantity: 2,
            image: indian.image,
          },
        ],
        subtotal: indian.price * 2,
        tax: Math.round(indian.price * 2 * 0.05),
        total: Math.round(indian.price * 2 * 1.05),
        paymentMethod: "Cash on Delivery" as const,
        paymentStatus: "Pending" as const,
        orderStatus: "Accepted" as const,
      },
      {
        orderNumber: "ORD-1004",
        customer: {
          name: "Sneha Mukherjee",
          mobile: "9711223344",
          email: "sneha.m@example.com",
          address: "7A Lake View Enclave, Salt Lake Sector 5, Kolkata - 700091",
        },
        items: [
          {
            menuItemId: pizza._id.toString(),
            name: pizza.name,
            price: pizza.price,
            quantity: 1,
            image: pizza.image,
          },
          {
            menuItemId: burger._id.toString(),
            name: burger.name,
            price: burger.price,
            quantity: 1,
            image: burger.image,
          },
        ],
        subtotal: pizza.price + burger.price,
        tax: Math.round((pizza.price + burger.price) * 0.05),
        total: Math.round((pizza.price + burger.price) * 1.05),
        paymentMethod: "Demo UPI" as const,
        paymentStatus: "Paid" as const,
        orderStatus: "Pending" as const,
      },
    ];

    await Order.insertMany(sampleOrders);
    console.log(` Inserted ${sampleOrders.length} initial sample orders`);

    console.log(" Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed with error:", error);
    process.exit(1);
  }
}

runSeed();

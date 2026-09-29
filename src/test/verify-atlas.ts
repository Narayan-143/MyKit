import { connectToDatabase } from "@/lib/db/mongodb";
import MenuItem from "@/models/MenuItem";
import Order from "@/models/Order";
import { SEED_MENU_ITEMS } from "@/data/seed/menuItems";

async function verifyAtlasConnection() {
  console.log("🔍 Checking MongoDB Atlas connection and data...");

  try {
    await connectToDatabase();
    console.log("✅ Successfully connected to MongoDB Atlas (database ready)");

    // Check menu count
    const menuCount = await MenuItem.countDocuments();
    console.log(`📊 Current Menu Item Count: ${menuCount}`);

    if (menuCount === 0) {
      console.log("🌱 Database is empty. Seeding production menu items...");
      await MenuItem.insertMany(SEED_MENU_ITEMS);
      const newCount = await MenuItem.countDocuments();
      console.log(`✅ Seeded ${newCount} menu items to MongoDB Atlas`);
    } else {
      console.log(`✅ Menu data already exists with ${menuCount} items. Skipping duplicate seed.`);
    }

    // Verify query
    const sampleDishes = await MenuItem.find({ category: "Pizza" }).limit(2).lean();
    if (sampleDishes.length > 0) {
      console.log(`✅ Successfully queried category 'Pizza' (${sampleDishes[0].name})`);
    }

    // Check orders count
    const orderCount = await Order.countDocuments();
    console.log(`📊 Current Orders Count: ${orderCount}`);

    if (orderCount === 0) {
      console.log("🌱 Seeding initial sample orders for admin dashboard demonstration...");
      const pizza = await MenuItem.findOne({ category: "Pizza" }).lean();
      const burger = await MenuItem.findOne({ category: "Burgers" }).lean();

      if (pizza && burger) {
        await Order.insertMany([
          {
            orderNumber: "ORD-1001",
            customer: {
              name: "Aarav Sharma",
              mobile: "9876543210",
              email: "aarav@example.com",
              address: "Flat 402, Green Glen Layout, Bengaluru",
            },
            items: [
              {
                menuItemId: pizza._id.toString(),
                name: pizza.name,
                price: pizza.price,
                quantity: 1,
                image: pizza.image,
              },
            ],
            subtotal: pizza.price,
            tax: Math.round(pizza.price * 0.05),
            total: Math.round(pizza.price * 1.05),
            paymentMethod: "Demo UPI",
            paymentStatus: "Paid",
            orderStatus: "Completed",
          },
          {
            orderNumber: "ORD-1002",
            customer: {
              name: "Priya Patel",
              mobile: "9823456789",
              email: "priya@example.com",
              address: "B-12, Silver Oaks Society, Pune",
            },
            items: [
              {
                menuItemId: burger._id.toString(),
                name: burger.name,
                price: burger.price,
                quantity: 2,
                image: burger.image,
              },
            ],
            subtotal: burger.price * 2,
            tax: Math.round(burger.price * 2 * 0.05),
            total: Math.round(burger.price * 2 * 1.05),
            paymentMethod: "Demo Card",
            paymentStatus: "Paid",
            orderStatus: "Preparing",
          },
        ]);
        console.log("✅ Seeded initial demonstration orders");
      }
    }

    // Verify Order Creation and Status Updates
    const testOrder = await Order.create({
      orderNumber: "ORD-VERIFY-TEST",
      customer: {
        name: "Verification Probe",
        mobile: "9876543210",
        email: "probe@mykit.internal",
        address: "Cloud Verification Route, Bengaluru",
      },
      items: [
        {
          menuItemId: "test-item-id",
          name: "Verification Item",
          price: 199,
          quantity: 1,
          image: "https://images.unsplash.com/test",
        },
      ],
      subtotal: 199,
      tax: 10,
      total: 209,
      paymentMethod: "Demo UPI",
      paymentStatus: "Paid",
      orderStatus: "Pending",
    });

    console.log(`✅ Successfully created test order: ${testOrder.orderNumber}`);

    // Update status
    testOrder.orderStatus = "Accepted";
    await testOrder.save();
    console.log("✅ Successfully tested status update Pending -> Accepted");

    // Clean up test order
    await Order.deleteOne({ _id: testOrder._id });
    console.log("✅ Safely removed temporary test order from production database");

    console.log("\n🎉 MongoDB Atlas verification completed successfully!\n");
    process.exit(0);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("❌ MongoDB Atlas verification error:", errorMsg);
    process.exit(1);
  }
}

verifyAtlasConnection();

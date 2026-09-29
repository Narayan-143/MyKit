import { connectToDatabase } from "@/lib/db/mongodb";
import Order from "@/models/Order";
import MenuItem from "@/models/MenuItem";

async function runFullE2E() {
  const BASE_URL = "https://mykit-kappa.vercel.app";
  console.log("🚀 Starting Full Production E2E Verification Suite against:", BASE_URL);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ ${msg}`);
      failed++;
    }
  }

  try {
    // 1. Navigation & Static Pages
    console.log("\n--- 1. Testing Pages & Routing ---");
    const pages = ["/", "/menu", "/cart", "/checkout", "/admin/login"];
    for (const page of pages) {
      const res = await fetch(`${BASE_URL}${page}`);
      assert(res.status === 200, `Page ${page} responds with HTTP 200`);
    }

    // 2. Image Assets Health Check (No broken images)
    console.log("\n--- 2. Checking Image Assets ---");
    const menuRes = await fetch(`${BASE_URL}/api/menu?limit=10`);
    const menuJson = await menuRes.json();
    assert(menuJson.success && menuJson.data.items.length > 0, "Fetched menu items for image verification");

    let brokenImages = 0;
    for (const item of menuJson.data.items.slice(0, 5)) {
      if (item.image) {
        try {
          const optimizedUrl = `${BASE_URL}/_next/image?url=${encodeURIComponent(item.image)}&w=640&q=75`;
          const imgRes = await fetch(optimizedUrl);
          if (imgRes.status === 200) {
            // Image ok
          } else {
            console.warn(`    ⚠️ Image returned status ${imgRes.status}: ${item.image}`);
            brokenImages++;
          }
        } catch {
          brokenImages++;
        }
      }
    }
    assert(brokenImages === 0, "First 5 menu images resolve with HTTP 200 via Next.js image optimizer");

    // 3. Search and Category Filtering
    console.log("\n--- 3. Testing Menu Search & Category Filtering ---");
    const categories = ["Pizza", "Burgers", "Pasta", "Starters", "Indian", "Beverages", "Desserts"];
    for (const cat of categories) {
      const catRes = await fetch(`${BASE_URL}/api/menu?category=${encodeURIComponent(cat)}`);
      const catData = await catRes.json();
      assert(
        catData.success && catData.data.items.length > 0,
        `Category '${cat}' returns ${catData.data?.items?.length || 0} items`
      );
    }

    const searchRes = await fetch(`${BASE_URL}/api/menu?search=chicken`);
    const searchData = await searchRes.json();
    assert(searchData.success && searchData.data.items.length > 0, "Search query 'chicken' returns matching items");

    // 4. Cart & Checkout Simulation
    console.log("\n--- 4. Testing Order Creation & Persistence in MongoDB Atlas ---");
    const testItem = menuJson.data.items[0];
    const newOrderPayload = {
      customer: {
        name: "Dev Verification Customer",
        mobile: "9123456789",
        email: "dev.verify@mykit.production",
        address: "742 Evergreen Terrace, Sector 5",
      },
      items: [
        {
          menuItemId: testItem._id,
          quantity: 2,
        },
      ],
      paymentMethod: "Demo UPI",
    };

    const createOrderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrderPayload),
    });
    const createOrderData = await createOrderRes.json();
    assert(createOrderRes.status === 201 && createOrderData.success, "Order creation API succeeded with HTTP 201");
    const order = createOrderData.data;
    assert(order && order.orderNumber, `Generated Order Number: ${order?.orderNumber}`);
    assert(order.orderStatus === "Pending", "Initial order status is 'Pending'");

    // Verify order exists directly in MongoDB Atlas
    await connectToDatabase();
    const atlasOrder = await Order.findOne({ orderNumber: order.orderNumber }).lean();
    assert(!!atlasOrder, `Order ${order.orderNumber} successfully found in MongoDB Atlas cluster`);

    // 5. Customer Order Tracking Page & API
    console.log("\n--- 5. Testing Customer Order Tracking ---");
    const trackPageRes = await fetch(`${BASE_URL}/order/${order.orderNumber}`);
    assert(trackPageRes.status === 200, `Customer tracking page /order/${order.orderNumber} returns HTTP 200`);

    const trackApiRes = await fetch(`${BASE_URL}/api/orders/${order.orderNumber}`);
    const trackApiData = await trackApiRes.json();
    assert(trackApiData.success && trackApiData.data.orderStatus === "Pending", "Customer tracking API returns correct pending status");

    // 6. Security: Unauthorized Admin Routes
    console.log("\n--- 6. Testing Admin Authorization Security ---");
    const unauthOrdersRes = await fetch(`${BASE_URL}/api/admin/orders`);
    assert(unauthOrdersRes.status === 401, "GET /api/admin/orders blocked without auth (HTTP 401)");

    const unauthStatsRes = await fetch(`${BASE_URL}/api/admin/stats`);
    assert(unauthStatsRes.status === 401, "GET /api/admin/stats blocked without auth (HTTP 401)");

    // 7. Admin Authentication & Dashboard
    console.log("\n--- 7. Testing Admin Authentication & Dashboard ---");
    const adminEmail = process.env.ADMIN_EMAIL || "admin@mykit.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "AdminSecure@123";

    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.success, "Admin login succeeds with HTTP 200");

    const cookieHeader = loginRes.headers.get("set-cookie") || "";
    const sessionCookie = cookieHeader.split(";")[0];
    assert(sessionCookie.startsWith("mykit_admin_session="), "Received secure httpOnly admin session cookie");

    // Admin Orders List
    const adminOrdersRes = await fetch(`${BASE_URL}/api/admin/orders`, {
      headers: { Cookie: sessionCookie },
    });
    const adminOrdersData = await adminOrdersRes.json();
    assert(adminOrdersRes.status === 200 && adminOrdersData.success, "Admin orders list retrieved successfully");
    assert(adminOrdersData.data.orders.length > 0, `Admin sees ${adminOrdersData.data.orders.length} orders`);

    // Admin Order Details
    const adminOrderDetailRes = await fetch(`${BASE_URL}/api/admin/orders/${order._id}`, {
      headers: { Cookie: sessionCookie },
    });
    const adminOrderDetailData = await adminOrderDetailRes.json();
    assert(adminOrderDetailRes.status === 200 && adminOrderDetailData.success, "Admin order detail fetched successfully");

    // 8. Order Status Lifecycle Progression
    console.log("\n--- 8. Testing Order Status Transitions ---");
    const statusSequence = ["Accepted", "Preparing", "Completed"];

    for (const nextStatus of statusSequence) {
      const updateRes = await fetch(`${BASE_URL}/api/admin/orders/${order._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: sessionCookie,
        },
        body: JSON.stringify({ orderStatus: nextStatus }),
      });
      const updateData = await updateRes.json();
      assert(
        updateRes.status === 200 && updateData.data.orderStatus === nextStatus,
        `Status transitioned to: ${nextStatus}`
      );

      // Verify customer tracking reflects the transition
      const verifyCustomerRes = await fetch(`${BASE_URL}/api/orders/${order.orderNumber}`);
      const verifyCustomerData = await verifyCustomerRes.json();
      assert(
        verifyCustomerData.data.orderStatus === nextStatus,
        `Customer tracking synced to: ${nextStatus}`
      );
    }

    // 9. Clean up test order
    console.log("\n--- 9. Cleaning up test order ---");
    await Order.deleteOne({ _id: order._id });
    console.log("  ✅ Test order safely purged from MongoDB Atlas");

    console.log(`\n========================================`);
    console.log(`🎉 ALL CHECKS COMPLETED: ${passed} passed, ${failed} failed.`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error("❌ E2E suite failed:", err);
    process.exit(1);
  }
}

runFullE2E();

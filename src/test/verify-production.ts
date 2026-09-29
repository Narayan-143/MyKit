import { connectToDatabase } from "@/lib/db/mongodb";
import Order from "@/models/Order";

async function verifyProduction() {
  const BASE_URL = "https://mykit-kappa.vercel.app";
  console.log("🌐 Verifying Production Deployment on Vercel at:", BASE_URL);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Home Page Verification
    const homeRes = await fetch(`${BASE_URL}/`);
    assert(homeRes.status === 200, "Production Home page returns HTTP 200");
    const homeHtml = await homeRes.text();
    assert(homeHtml.includes("MyKit"), "Production Home contains 'MyKit' brand");
    assert(homeHtml.includes("Good Food. Your Way."), "Production Home contains tagline");

    // 2. Menu Page Verification
    const menuPageRes = await fetch(`${BASE_URL}/menu`);
    assert(menuPageRes.status === 200, "Production /menu page returns HTTP 200");

    // 3. Menu API & Atlas Database Verification
    const menuApiRes = await fetch(`${BASE_URL}/api/menu`);
    const menuApiData = await menuApiRes.json();
    assert(menuApiRes.status === 200 && menuApiData.success, "Production GET /api/menu returns success");
    assert(menuApiData.data.items.length >= 25, `Production Atlas Menu contains ${menuApiData.data.items.length} items`);

    // 4. Category and Search Filtering
    const pizzaRes = await fetch(`${BASE_URL}/api/menu?category=Pizza`);
    const pizzaData = await pizzaRes.json();
    assert(
      pizzaData.data.items.length > 0 &&
      pizzaData.data.items.every((i: { category: string }) => i.category === "Pizza"),
      "Production category filtering works for Pizza"
    );

    const searchRes = await fetch(`${BASE_URL}/api/menu?search=burger`);
    const searchData = await searchRes.json();
    assert(searchData.data.items.length > 0, "Production search filtering works for 'burger'");

    // 5. Unauthorized Admin Access Blocked
    const unauthRes = await fetch(`${BASE_URL}/api/admin/orders`);
    assert(unauthRes.status === 401, "Production /api/admin/orders rejects unauthenticated requests (HTTP 401)");

    // 6. Admin Authentication on Production
    const adminEmail = process.env.ADMIN_EMAIL || "admin@mykit.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "AdminSecure@123";
    const adminLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminLoginData.success, "Production admin login succeeds (HTTP 200)");

    const setCookieHeader = adminLoginRes.headers.get("set-cookie") || "";
    const sessionCookie = setCookieHeader.split(";")[0];
    assert(sessionCookie.includes("mykit_admin_session="), "Production received secure admin session cookie");

    // 7. Admin Live Stats from MongoDB Atlas
    const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Cookie: sessionCookie },
    });
    const statsData = await statsRes.json();
    assert(statsRes.status === 200 && statsData.success, "Production GET /api/admin/stats returns 200");
    assert(statsData.data.stats.totalOrders > 0, `Production Atlas stats: ${statsData.data.stats.totalOrders} total orders`);
    assert(statsData.data.stats.totalRevenue > 0, `Production Atlas revenue: ₹${statsData.data.stats.totalRevenue}`);

    // 8. Production Order Creation
    const sampleItem = menuApiData.data.items[0];
    const orderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          name: "Vercel Production Verifier",
          mobile: "9876543210",
          email: "verifier@mykit.production",
          address: "Production Edge Route, Cloud Datacenter",
        },
        items: [{ menuItemId: sampleItem._id, quantity: 2 }],
        paymentMethod: "Demo UPI",
      }),
    });
    const orderData = await orderRes.json();
    assert(orderRes.status === 201 && orderData.success, "Production order creation succeeds (HTTP 201)");
    const placedOrder = orderData.data;
    assert(placedOrder.orderNumber.startsWith("ORD-"), `Production generated orderNumber: ${placedOrder.orderNumber}`);

    // 9. Production Customer Order Tracking
    const trackingRes = await fetch(`${BASE_URL}/api/orders/${placedOrder.orderNumber}`);
    const trackingData = await trackingRes.json();
    assert(trackingRes.status === 200 && trackingData.data.orderStatus === "Pending", "Production tracking returns 'Pending' status");

    // 10. Production Status Transition
    const patchRes = await fetch(`${BASE_URL}/api/admin/orders/${placedOrder._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ orderStatus: "Accepted" }),
    });
    const patchData = await patchRes.json();
    assert(patchRes.status === 200 && patchData.data.orderStatus === "Accepted", "Production admin transitions status: Pending -> Accepted");

    // 11. Customer Tracking Sync
    const updatedTrackingRes = await fetch(`${BASE_URL}/api/orders/${placedOrder.orderNumber}`);
    const updatedTrackingData = await updatedTrackingRes.json();
    assert(updatedTrackingData.data.orderStatus === "Accepted", "Production customer tracking synced to 'Accepted'");

    // 12. Cleanup Test Order in MongoDB Atlas
    await connectToDatabase();
    await Order.deleteOne({ _id: placedOrder._id });
    console.log("  ✅ Cleaned up temporary production test order from MongoDB Atlas");

    console.log(`\n🎉 Production Verification Complete: ${passed} passed, ${failed} failed.\n`);
    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error("❌ Production verification encountered error:", err);
    process.exit(1);
  }
}

verifyProduction();

async function runE2ETests() {
  const BASE_URL = "http://localhost:3000";
  console.log("🧪 Starting End-to-End API and Flow Validation on", BASE_URL);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ${testName}`);
      passed++;
    } else {
      console.error(`❌ ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Home page check
    const homeRes = await fetch(`${BASE_URL}/`);
    assert(homeRes.status === 200, "Home page returns HTTP 200");
    const homeHtml = await homeRes.text();
    assert(homeHtml.includes("MyKit"), "Home page contains MyKit branding");
    assert(homeHtml.includes("Good Food. Your Way."), "Home page contains tagline");

    // 2. Menu API check
    const menuRes = await fetch(`${BASE_URL}/api/menu`);
    const menuData = await menuRes.json();
    assert(menuRes.status === 200 && menuData.success, "GET /api/menu returns success");
    assert(menuData.data.items.length >= 25, `Menu contains ${menuData.data.items.length} items (>= 25)`);

    // 3. Category & Search filtering
    const pizzaRes = await fetch(`${BASE_URL}/api/menu?category=Pizza`);
    const pizzaData = await pizzaRes.json();
    assert(
      pizzaData.data.items.every((i: { category: string }) => i.category === "Pizza"),
      "GET /api/menu?category=Pizza filters only Pizza items"
    );

    const searchRes = await fetch(`${BASE_URL}/api/menu?search=Burger`);
    const searchData = await searchRes.json();
    assert(searchData.data.items.length > 0, "GET /api/menu?search=Burger returns matching items");

    // 4. Server-Side Validation on Order Creation
    const invalidOrderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: { name: "", mobile: "123", email: "not-an-email", address: "short" },
        items: [],
        paymentMethod: "Demo UPI",
      }),
    });
    assert(
      invalidOrderRes.status === 422,
      "POST /api/orders rejects invalid payload with 422 Unprocessable Entity"
    );

    // 5. Valid Order Placement
    const firstItem = menuData.data.items[0];
    const secondItem = menuData.data.items[1];

    const validOrderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          name: "Aarav Sharma",
          mobile: "9876543210",
          email: "aarav.sharma@example.com",
          address: "Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103",
        },
        items: [
          { menuItemId: firstItem._id, quantity: 2 },
          { menuItemId: secondItem._id, quantity: 1 },
        ],
        paymentMethod: "Demo UPI",
      }),
    });

    const validOrderData = await validOrderRes.json();
    assert(validOrderRes.status === 201 && validOrderData.success, "POST /api/orders creates order successfully (201)");
    const placedOrder = validOrderData.data;
    assert(placedOrder.orderNumber.startsWith("ORD-"), `Generated order number: ${placedOrder.orderNumber}`);

    // Verify calculated totals
    const expectedSubtotal = firstItem.price * 2 + secondItem.price * 1;
    const expectedTax = Math.round(expectedSubtotal * 0.05);
    const expectedTotal = expectedSubtotal + expectedTax;
    assert(placedOrder.subtotal === expectedSubtotal, `Server recalculated subtotal matches: ₹${placedOrder.subtotal}`);
    assert(placedOrder.tax === expectedTax, `Server calculated 5% tax matches: ₹${placedOrder.tax}`);
    assert(placedOrder.total === expectedTotal, `Server grand total matches: ₹${placedOrder.total}`);

    // 6. Customer Order Tracking
    const trackingRes = await fetch(`${BASE_URL}/api/orders/${placedOrder.orderNumber}`);
    const trackingData = await trackingRes.json();
    assert(trackingRes.status === 200 && trackingData.success, "GET /api/orders/[orderNumber] returns tracking info");
    assert(trackingData.data.orderStatus === "Pending", "Initial order status is Pending");

    // 7. Admin Authentication
    const badLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@mykit.com", password: "WrongPassword" }),
    });
    assert(badLoginRes.status === 401, "POST /api/admin/login rejects wrong credentials with 401");

    const goodLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@mykit.com", password: "AdminSecure@123" }),
    });
    assert(goodLoginRes.status === 200, "POST /api/admin/login authenticates valid admin credentials");

    // Extract cookie
    const setCookieHeader = goodLoginRes.headers.get("set-cookie") || "";
    const sessionCookie = setCookieHeader.split(";")[0];
    assert(sessionCookie.includes("mykit_admin_session="), "Received secure HTTP-only admin session cookie");

    // 8. Admin Protected Stats
    const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Cookie: sessionCookie },
    });
    const statsData = await statsRes.json();
    assert(statsRes.status === 200 && statsData.success, "GET /api/admin/stats returns 200 with admin cookie");
    assert(statsData.data.stats.totalOrders > 0, `Stats show total orders: ${statsData.data.stats.totalOrders}`);
    assert(statsData.data.stats.totalRevenue > 0, `Stats show live revenue: ₹${statsData.data.stats.totalRevenue}`);

    // 9. Admin Order Status Update
    const patchRes = await fetch(`${BASE_URL}/api/admin/orders/${placedOrder._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ orderStatus: "Accepted" }),
    });
    const patchData = await patchRes.json();
    assert(patchRes.status === 200 && patchData.data.orderStatus === "Accepted", "PATCH order status changed Pending -> Accepted");

    // Test illegal backward status change
    const illegalPatchRes = await fetch(`${BASE_URL}/api/admin/orders/${placedOrder._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ orderStatus: "Pending" }),
    });
    assert(illegalPatchRes.status === 400, "Admin status updater rejects illegal backwards transition Accepted -> Pending");

    // 10. Customer Tracking Reflects Updated Status
    const updatedTrackingRes = await fetch(`${BASE_URL}/api/orders/${placedOrder.orderNumber}`);
    const updatedTrackingData = await updatedTrackingRes.json();
    assert(
      updatedTrackingData.data.orderStatus === "Accepted",
      "Customer tracking immediately reflects new Accepted status"
    );

    console.log(`\n🎉 E2E Verification Complete: ${passed} passed, ${failed} failed.\n`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error("❌ E2E Script error:", err);
    process.exit(1);
  }
}

runE2ETests();

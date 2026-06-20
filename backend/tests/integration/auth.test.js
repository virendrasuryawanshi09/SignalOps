const request = require("supertest");
const app = require("../../src/app");
require("../testSetup");

describe("Authentication Integration Lifecycle", () => {
  const userData = {
    name: "Triage SRE",
    email: "triage.sre@signalops.io",
    password: "SecurePassword123!",
  };

  test("should register, login, refresh, and logout successfully", async () => {

    const regRes = await request(app)
      .post("/api/auth/register")
      .send(userData);
      
    expect(regRes.statusCode).toBe(201);
    expect(regRes.body.success).toBe(true);
    expect(regRes.body.data.email).toBe(userData.email);
    expect(regRes.body.data.id).toBeDefined();


    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: userData.email,
        password: userData.password,
      });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.accessToken).toBeDefined();
    

    const cookies = loginRes.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain("refreshToken");


    const refreshRes = await request(app)
      .post("/api/auth/refresh-token")
      .set("Cookie", cookies);

    expect(refreshRes.statusCode).toBe(200);
    expect(refreshRes.body.success).toBe(true);
    expect(refreshRes.body.data.accessToken).toBeDefined();

    const logoutRes = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${loginRes.body.data.accessToken}`)
      .set("Cookie", cookies);

    expect(logoutRes.statusCode).toBe(200);
    expect(logoutRes.body.success).toBe(true);
  });

  test("should block authenticated paths if token is missing or malformed", async () => {
    const res = await request(app)
      .get("/api/incidents");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Missing or malformed");
  });
});

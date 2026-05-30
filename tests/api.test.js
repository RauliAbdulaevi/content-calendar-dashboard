import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { after, before, test } from "node:test";

const dataPath = new URL("../server/data/db.json", import.meta.url);
let originalData;
let server;
let baseUrl;
let adminToken;
let userToken;
let createdIdeaId;

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });
  const body = response.status === 204 ? null : await response.json();
  return { response, body };
}

async function login(email, password) {
  const { response, body } = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

  assert.equal(response.status, 200);
  return body.token;
}

before(async () => {
  originalData = await readFile(dataPath, "utf8");
  const { default: app } = await import("../server/app.js");
  server = createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  adminToken = await login("admin@example.com", "admin123");
  userToken = await login("user@example.com", "user123");
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }

  await writeFile(dataPath, originalData);
});

test("health endpoint responds", async () => {
  const { response, body } = await request("/api/health");

  assert.equal(response.status, 200);
  assert.deepEqual(body, { ok: true });
});

test("admin can list users and activity logs", async () => {
  const usersResult = await request("/api/users", {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const activityResult = await request("/api/users/activity", {
    headers: { Authorization: `Bearer ${adminToken}` }
  });

  assert.equal(usersResult.response.status, 200);
  assert.ok(usersResult.body.some((user) => user.email === "admin@example.com"));
  assert.equal(activityResult.response.status, 200);
  assert.ok(Array.isArray(activityResult.body));
  assert.ok(activityResult.body.some((log) => log.action === "user.login"));
});

test("regular users cannot access admin endpoints", async () => {
  const { response, body } = await request("/api/users", {
    headers: { Authorization: `Bearer ${userToken}` }
  });

  assert.equal(response.status, 403);
  assert.equal(body.error.message, "Admin access required.");
});

test("users can update their own profile name and avatar but not role", async () => {
  const avatarUrl = "data:image/png;base64,iVBORw0KGgo=";
  const updated = await request("/api/auth/me", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ name: "Updated Demo User", avatarUrl, role: "admin" })
  });

  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.user.name, "Updated Demo User");
  assert.equal(updated.body.user.avatarUrl, avatarUrl);
  assert.equal(updated.body.user.role, "user");

  const me = await request("/api/auth/me", {
    headers: { Authorization: `Bearer ${userToken}` }
  });

  assert.equal(me.response.status, 200);
  assert.equal(me.body.user.name, "Updated Demo User");
  assert.equal(me.body.user.avatarUrl, avatarUrl);
  assert.equal(me.body.user.role, "user");
});

test("users can create, update, and delete their own ideas", async () => {
  const payload = {
    title: "Automated test idea",
    platform: "Instagram",
    contentType: "Post",
    script: "Draft the announcement.",
    caption: "Testing the calendar API.",
    scheduledDate: "2026-06-01",
    scheduledTime: "10:00",
    imageUrl: "",
    status: "Draft",
    stats: { impressions: 0, likes: 0, comments: 0, shares: 0 }
  };

  const created = await request("/api/ideas", {
    method: "POST",
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify(payload)
  });

  assert.equal(created.response.status, 201);
  assert.equal(created.body.title, payload.title);
  createdIdeaId = created.body.id;

  const updated = await request(`/api/ideas/${createdIdeaId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ ...payload, status: "Scheduled" })
  });

  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.status, "Scheduled");

  const deleted = await request(`/api/ideas/${createdIdeaId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${userToken}` }
  });

  assert.equal(deleted.response.status, 204);
});

test("workflow roles, comments, and notifications are enforced", async () => {
  const payload = {
    title: "Approval workflow idea",
    platform: "LinkedIn",
    contentType: "Post",
    script: "Ask for review.",
    caption: "Ready for approval.",
    scheduledDate: "2026-06-05",
    scheduledTime: "09:00",
    imageUrl: "",
    campaign: "Workflow",
    status: "In Review",
    stats: { impressions: 0, likes: 0, comments: 0, shares: 0 }
  };

  const created = await request("/api/ideas", {
    method: "POST",
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify(payload)
  });

  assert.equal(created.response.status, 201);
  assert.equal(created.body.campaign, "Workflow");
  assert.equal(created.body.ownerEmail, "user@example.com");

  const blockedApproval = await request(`/api/ideas/${created.body.id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ ...payload, status: "Approved" })
  });

  assert.equal(blockedApproval.response.status, 403);
  assert.equal(blockedApproval.body.error.message, "Only admins and managers can approve or publish content.");

  const commentResult = await request(`/api/ideas/${created.body.id}/comments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ message: "Please review the hook." })
  });

  assert.equal(commentResult.response.status, 201);
  assert.equal(commentResult.body.comments.length, 1);
  assert.equal(commentResult.body.comments[0].message, "Please review the hook.");

  const managerAccount = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "Manager User", email: "manager@example.com", password: "manager123" })
  });
  assert.equal(managerAccount.response.status, 201);

  const promoted = await request(`/api/users/${managerAccount.body.user.id}/role`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ role: "manager" })
  });
  assert.equal(promoted.response.status, 200);
  assert.equal(promoted.body.role, "manager");

  const managerToken = await login("manager@example.com", "manager123");
  const notifications = await request("/api/ideas/notifications", {
    headers: { Authorization: `Bearer ${managerToken}` }
  });

  assert.equal(notifications.response.status, 200);
  assert.ok(notifications.body.some((item) => item.type === "approval"));

  const approved = await request(`/api/ideas/${created.body.id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ ...payload, status: "Approved" })
  });

  assert.equal(approved.response.status, 200);
  assert.equal(approved.body.status, "Approved");
});

test("users cannot update another user's ideas", async () => {
  const { response, body } = await request("/api/ideas/1", {
    method: "PUT",
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      title: "Blocked update",
      platform: "Instagram",
      contentType: "Post",
      script: "",
      caption: "",
      scheduledDate: "2026-06-02",
      scheduledTime: "11:00",
      imageUrl: "",
      status: "Draft",
      stats: { impressions: 0, likes: 0, comments: 0, shares: 0 }
    })
  });

  assert.equal(response.status, 403);
  assert.equal(body.error.message, "You can only update your own content ideas.");
});

test("admins can recover users from delete activity", async () => {
  const registered = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "Recover Me", email: "recover@example.com", password: "recover123" })
  });

  assert.equal(registered.response.status, 201);

  const deleted = await request(`/api/users/${registered.body.user.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken}` }
  });

  assert.equal(deleted.response.status, 204);

  const activityResult = await request("/api/users/activity", {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const deleteLog = activityResult.body.find((log) => log.action === "user.deleted" && log.message.includes("recover@example.com"));

  assert.ok(deleteLog);
  assert.equal(deleteLog.canRecover, true);

  const recovered = await request(`/api/users/activity/${deleteLog.id}/recover`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${adminToken}` }
  });

  assert.equal(recovered.response.status, 200);
  assert.equal(recovered.body.email, "recover@example.com");

  const usersResult = await request("/api/users", {
    headers: { Authorization: `Bearer ${adminToken}` }
  });

  assert.ok(usersResult.body.some((user) => user.email === "recover@example.com"));
});

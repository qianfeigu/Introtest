const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const { Client } = require("@notionhq/client");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3000;

// Notion
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const notionDatabaseId = process.env.NOTION_DATABASE_ID;

// Notion property names (必须和你的 database 对应)
const notionPropEvent = process.env.NOTION_PROP_EVENT || "Event";
const notionPropTimestamp = process.env.NOTION_PROP_TIMESTAMP || "Timestamp";

// Middlewares
app.use(cors());
app.use(express.json());

/**
 * SINGLE SOURCE OF TRUTH ROUTE
 */
app.post("/api/portfolio-event", async (req, res) => {
  try {
    const { event, timestamp, test } = req.body || {};

    const normalizedEvent =
      event || (typeof test !== "undefined" ? "test-click" : null);

    const normalizedTimestamp =
      timestamp || new Date().toISOString();

    const allowedEvents = new Set([
      "request-to-view-project",
      "send-email",
      "test-click",
    ]);

    if (!normalizedEvent || !allowedEvents.has(normalizedEvent)) {
      return res.status(400).json({ error: "Invalid event" });
    }

    const parsedTime = new Date(normalizedTimestamp);
    if (Number.isNaN(parsedTime.getTime())) {
      return res.status(400).json({ error: "Invalid timestamp" });
    }

    if (!process.env.NOTION_API_KEY || !notionDatabaseId) {
      return res.status(500).json({
        error: "Missing NOTION_API_KEY or NOTION_DATABASE_ID",
      });
    }

    await notion.pages.create({
      parent: { database_id: notionDatabaseId },
      properties: {
        [notionPropEvent]: {
          title: [{ text: { content: normalizedEvent } }],
        },
        [notionPropTimestamp]: {
          date: { start: parsedTime.toISOString() },
        },
      },
    });

    return res.status(200).json({
      ok: true,
      event: normalizedEvent,
    });
  } catch (error) {
    console.error("portfolio-event failed:", error);

    return res.status(500).json({
      error: "Failed to track event",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

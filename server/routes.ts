import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.items.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const items = await storage.getItems(search);
    res.json(items);
  });

  app.get(api.items.getByBarcode.path, async (req, res) => {
    const item = await storage.getItemByBarcode(req.params.barcode);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  });

  app.get(api.items.get.path, async (req, res) => {
    const item = await storage.getItem(Number(req.params.id));
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  });

  app.post(api.items.create.path, async (req, res) => {
    try {
      const input = api.items.create.input.parse(req.body);
      
      // Check for existing barcode
      const existing = await storage.getItemByBarcode(input.barcode);
      if (existing) {
        return res.status(409).json({ message: 'Item with this barcode already exists' });
      }

      const item = await storage.createItem(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.items.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.items.update.input.parse(req.body);
      
      const existing = await storage.getItem(id);
      if (!existing) {
        return res.status(404).json({ message: 'Item not found' });
      }

      // If updating barcode, check for conflicts
      if (input.barcode && input.barcode !== existing.barcode) {
        const conflict = await storage.getItemByBarcode(input.barcode);
        if (conflict) {
          return res.status(409).json({ message: 'Barcode already in use' });
        }
      }

      const updated = await storage.updateItem(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.items.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getItem(id);
    if (!existing) {
      return res.status(404).json({ message: 'Item not found' });
    }
    await storage.deleteItem(id);
    res.status(204).send();
  });

  return httpServer;
}

// Helper to seed database with some initial data
async function seedDatabase() {
  const existingItems = await storage.getItems();
  if (existingItems.length === 0) {
    await storage.createItem({
      barcode: "12345678",
      name: "Wireless Mouse",
      description: "Ergonomic wireless mouse with 2.4GHz receiver",
      quantity: 15,
      category: "Electronics"
    });
    await storage.createItem({
      barcode: "87654321",
      name: "Mechanical Keyboard",
      description: "RGB Mechanical Gaming Keyboard, Blue Switches",
      quantity: 5,
      category: "Electronics"
    });
    await storage.createItem({
      barcode: "11223344",
      name: "USB-C Cable",
      description: "2m Braided USB-C Charging Cable",
      quantity: 50,
      category: "Accessories"
    });
    console.log("Database seeded with initial items");
  }
}

// Run seed on startup (non-blocking)
seedDatabase().catch(console.error);

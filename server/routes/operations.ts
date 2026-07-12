import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getMongoDatabase } from "../lib/mongodb";

const collections = {
  vehicles: "vehicles",
  drivers: "drivers",
  trips: "trips",
  maintenance: "maintenanceLogs",
  fuel: "fuelLogs",
  expenses: "expenses",
} as const;
type Resource = keyof typeof collections;

function resourceName(value: string): Resource | undefined {
  return value in collections ? (value as Resource) : undefined;
}

function id(value: string) {
  return ObjectId.isValid(value) ? new ObjectId(value) : undefined;
}

function cleanBody(body: Record<string, unknown>) {
  const { _id, createdAt, updatedAt, ...data } = body;
  return data;
}

export const listResource: RequestHandler = async (req, res) => {
  const resource = resourceName(req.params.resource);
  if (!resource) return res.status(404).json({ error: "Unknown resource" });

  try {
    const database = await getMongoDatabase();
    const documents = await database.collection(collections[resource]).find({}).sort({ createdAt: -1 }).toArray();
    res.json(documents);
  } catch (error) {
    console.error(`Failed to list ${resource}`, error);
    res.status(500).json({ error: "Unable to load records" });
  }
};

export const createResource: RequestHandler = async (req, res) => {
  const resource = resourceName(req.params.resource);
  if (!resource) return res.status(404).json({ error: "Unknown resource" });

  const data = cleanBody(req.body ?? {});
  if (!Object.keys(data).length) return res.status(400).json({ error: "Record data is required" });

  try {
    const database = await getMongoDatabase();
    const collection = database.collection(collections[resource]);

    if (resource === "vehicles" && data.registrationNumber) {
      const duplicate = await collection.findOne({ registrationNumber: data.registrationNumber });
      if (duplicate) return res.status(409).json({ error: "Registration number already exists" });
    }

    const document = { ...data, createdAt: new Date(), updatedAt: new Date() };
    const result = await collection.insertOne(document);
    res.status(201).json({ ...document, _id: result.insertedId });
  } catch (error) {
    console.error(`Failed to create ${resource}`, error);
    res.status(500).json({ error: "Unable to save record" });
  }
};

export const updateResource: RequestHandler = async (req, res) => {
  const resource = resourceName(req.params.resource);
  const recordId = id(req.params.id);
  if (!resource || !recordId) return res.status(400).json({ error: "Invalid resource or record id" });

  try {
    const database = await getMongoDatabase();
    const result = await database.collection(collections[resource]).findOneAndUpdate(
      { _id: recordId },
      { $set: { ...cleanBody(req.body ?? {}), updatedAt: new Date() } },
      { returnDocument: "after" },
    );
    if (!result) return res.status(404).json({ error: "Record not found" });
    res.json(result);
  } catch (error) {
    console.error(`Failed to update ${resource}`, error);
    res.status(500).json({ error: "Unable to update record" });
  }
};

export const deleteResource: RequestHandler = async (req, res) => {
  const resource = resourceName(req.params.resource);
  const recordId = id(req.params.id);
  if (!resource || !recordId) return res.status(400).json({ error: "Invalid resource or record id" });

  try {
    const database = await getMongoDatabase();
    const result = await database.collection(collections[resource]).deleteOne({ _id: recordId });
    if (!result.deletedCount) return res.status(404).json({ error: "Record not found" });
    res.status(204).end();
  } catch (error) {
    console.error(`Failed to delete ${resource}`, error);
    res.status(500).json({ error: "Unable to delete record" });
  }
};

export const createTrip: RequestHandler = async (req, res) => {
  const { vehicleId, driverId, cargoWeight, status = "Draft" } = req.body ?? {};
  const vehicleObjectId = id(vehicleId);
  const driverObjectId = id(driverId);
  if (!vehicleObjectId || !driverObjectId) return res.status(400).json({ error: "A valid vehicle and driver are required" });

  try {
    const database = await getMongoDatabase();
    const vehicles = database.collection("vehicles");
    const drivers = database.collection("drivers");
    const [vehicle, driver] = await Promise.all([vehicles.findOne({ _id: vehicleObjectId }), drivers.findOne({ _id: driverObjectId })]);
    if (!vehicle || !driver) return res.status(404).json({ error: "Vehicle or driver not found" });
    if (vehicle.status !== "Available" || driver.status !== "Available") return res.status(409).json({ error: "Vehicle and driver must be available" });
    if (Number(cargoWeight) > Number(vehicle.maximumLoadCapacity)) return res.status(400).json({ error: "Cargo weight exceeds vehicle capacity" });
    if (status === "Dispatched") {
      if (driver.licenseExpiryDate && new Date(String(driver.licenseExpiryDate)) < new Date()) return res.status(400).json({ error: "Driver license has expired" });
      if (driver.status === "Suspended") return res.status(400).json({ error: "Suspended drivers cannot be dispatched" });
      await Promise.all([vehicles.updateOne({ _id: vehicleObjectId }, { $set: { status: "On Trip", updatedAt: new Date() } }), drivers.updateOne({ _id: driverObjectId }, { $set: { status: "On Trip", updatedAt: new Date() } })]);
    }
    const trip = { ...cleanBody(req.body), vehicleId: vehicleObjectId, driverId: driverObjectId, status, createdAt: new Date(), updatedAt: new Date() };
    const result = await database.collection("trips").insertOne(trip);
    res.status(201).json({ ...trip, _id: result.insertedId });
  } catch (error) {
    console.error("Failed to create trip", error);
    res.status(500).json({ error: "Unable to save trip" });
  }
};

function passwordHash(password: string, salt = randomBytes(16).toString("hex")) {
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

function passwordMatches(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = scryptSync(password, salt, 64);
  return timingSafeEqual(expected, Buffer.from(hash, "hex"));
}

export const registerUser: RequestHandler = async (req, res) => {
  const { email, password, organization, role } = req.body ?? {};
  if (!email || !password || !organization || !role) return res.status(400).json({ error: "Email, password, organization and role are required" });
  try {
    const database = await getMongoDatabase();
    const users = database.collection("users");
    if (await users.findOne({ email: String(email).toLowerCase() })) return res.status(409).json({ error: "An account with this email already exists" });
    const user = { email: String(email).toLowerCase(), organization, role, passwordHash: passwordHash(String(password)), createdAt: new Date() };
    const result = await users.insertOne(user);
    res.status(201).json({ user: { id: result.insertedId, email: user.email, organization, role } });
  } catch (error) {
    console.error("Failed to register user", error);
    res.status(500).json({ error: "Unable to create account" });
  }
};

export const loginUser: RequestHandler = async (req, res) => {
  const { email, password, role } = req.body ?? {};
  try {
    const database = await getMongoDatabase();
    const user = await database.collection("users").findOne({ email: String(email).toLowerCase() });
    if (!user || !passwordMatches(String(password), String(user.passwordHash)) || (role && user.role !== role)) return res.status(401).json({ error: "Invalid email, password, or role" });
    res.json({ user: { id: user._id, email: user.email, organization: user.organization, role: user.role } });
  } catch (error) {
    console.error("Failed to login user", error);
    res.status(500).json({ error: "Unable to sign in" });
  }
};

export const dashboardSummary: RequestHandler = async (_req, res) => {
  try {
    const database = await getMongoDatabase();
    const [vehicles, drivers, trips] = await Promise.all([database.collection("vehicles").find({}).toArray(), database.collection("drivers").find({}).toArray(), database.collection("trips").find({}).toArray()]);
    res.json({ activeVehicles: vehicles.filter((item) => item.status === "On Trip").length, availableVehicles: vehicles.filter((item) => item.status === "Available").length, maintenanceVehicles: vehicles.filter((item) => item.status === "In Shop").length, activeTrips: trips.filter((item) => ["Dispatched", "On Trip"].includes(String(item.status))).length, driversOnDuty: drivers.filter((item) => item.status === "On Trip").length, utilization: vehicles.length ? Math.round((vehicles.filter((item) => item.status === "On Trip").length / vehicles.length) * 100) : 0 });
  } catch (error) {
    console.error("Failed to load dashboard summary", error);
    res.status(500).json({ error: "Unable to load dashboard" });
  }
};

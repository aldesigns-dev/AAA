import fs from "node:fs/promises";

import bodyParser from "body-parser";
import express from "express";

const app = express();

app.use(bodyParser.json());

// CORS

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all domains
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  next();
});

const readFile = async (filePath) => {
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    throw new Error("Could not read data file.");
  }
};

const writeFile = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing file ${filePath}:`, err);
    throw new Error("Could not write to data file.");
  }
};

// Get all breakdowns
app.get("/breakdowns", async (req, res) => {
  try {
    const breakdownsData = await readFile("./data/breakdowns.json");
    res.status(200).json({ breakdowns: breakdownsData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new breakdown
app.post("/breakdowns", async (req, res) => {
  console.log("POST /breakdowns route aangeroepen");
  try {
    const newBreakdown = req.body;
    
    // Genereer uniek breakdown_id.
    const breakdownId = Math.floor(Math.random() * 10000);
    newBreakdown.breakdown_id = breakdownId;

    // Controle breakdowngegevens.
    console.log("Nieuwe breakdown voor opslaan:", newBreakdown);

    const breakdowns = await readFile("./data/breakdowns.json");
    breakdowns.push(newBreakdown);
    
    // Breakdowndata die opgeslagen gaat worden.
    console.log("Te schrijven breakdowndata:", breakdowns);

    await writeFile("./data/breakdowns.json", breakdowns);
    res.status(201).json({ breakdown: newBreakdown });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a breakdown
app.put("/breakdowns/:id", async (req, res) => {
  try {
    const breakdownId = parseInt(req.params.id);
    const updatedBreakdown = req.body;
    const breakdowns = await readFile("./data/breakdowns.json");
    const index = breakdowns.findIndex((b) => b.breakdown_id === breakdownId);

    if (index === -1) {
      return res.status(404).json({ message: "Breakdown not found" });
    }

    breakdowns[index] = { ...breakdowns[index], ...updatedBreakdown };
    await writeFile("./data/breakdowns.json", breakdowns);
    res.status(200).json({ breakdown: breakdowns[index] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a breakdown
app.delete('/breakdowns/:breakdownId', async (req, res) => {
  try {
    const { breakdownId } = req.params;
    const breakdowns = await readFile('./data/breakdowns.json');
    const updatedBreakdowns = breakdowns.filter(breakdown => breakdown.breakdown_id !== parseInt(breakdownId));
    if (breakdowns.length === updatedBreakdowns.length) {
      return res.status(404).json({ message: 'Breakdown not found' });
    }
    await writeFile('./data/breakdowns.json', updatedBreakdowns);
    res.status(200).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all customers
app.get("/customers", async (req, res) => {
  try {
    const customersData = await readFile("./data/customers.json");
    res.status(200).json({ customers: customersData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new customer
app.post("/customers", async (req, res) => {
  console.log("POST /customers route aangeroepen");
  try {
    const newCustomer = req.body;

    // Genereer uniek customer_id.
    const customerId = Math.floor(Math.random() * 10000);
    newCustomer.customer_id = customerId;

    // Controle klantgegevens.
    console.log("Nieuwe klant voor opslaan:", newCustomer);

    const customers = await readFile("./data/customers.json");
    customers.push(newCustomer);

    // Klantendata die opgeslagen gaat worden.
    console.log("Te schrijven klantendata:", customers);

    await writeFile("./data/customers.json", customers);
    res.status(201).json({ customer: newCustomer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a customer
app.put("/customers/:id", async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    const updatedCustomer = req.body;
    const customers = await readFile("./data/customers.json");
    const index = customers.findIndex((c) => c.customer_id === customerId);

    if (index === -1) {
      return res.status(404).json({ message: "Customer not found" });
    }

    customers[index] = { ...customers[index], ...updatedCustomer };
    await writeFile("./data/customers.json", customers);
    res.status(200).json({ customer: customers[index] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a customer
app.delete('/customers/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const customers = await readFile('./data/customers.json');
    const updatedCustomers = customers.filter(customer => customer.customer_id !== parseInt(customerId));
    if (customers.length === updatedCustomers.length) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    await writeFile('./data/customers.json', updatedCustomers);
    res.status(200).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a customer + breakdowns
app.delete('/customers/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const customers = await readFile('./data/customers.json');
    const updatedCustomers = customers.filter(customer => customer.customer_id !== parseInt(customerId));
    if (customers.length === updatedCustomers.length) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    await writeFile('./data/customers.json', updatedCustomers);

    const breakdowns = await readFile('./data/breakdowns.json');
    const updatedBreakdowns = breakdowns.filter(breakdown => breakdown.customer_id !== parseInt(customerId));
    await writeFile('./data/breakdowns.json', updatedBreakdowns);
    res.status(200).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 404
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  res.status(404).json({ message: "404 - Not Found" });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

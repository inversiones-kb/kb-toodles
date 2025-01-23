const ORDERS_MOCK = [
  {
    id: 1,
    name: "Order 1",
    provider_id: 1,
    products: [
      {
        id: 1,
        name: "Product A",
        price: 10.99,
        quantity: 2,
      },
      {
        id: 2,
        name: "Product B",
        price: 5.5,
        quantity: 1,
      },
    ],
    created_at: new Date("2024-07-04T23:59:59Z"),
  },
  {
    id: 2,
    name: "Order 2",
    provider_id: 1, // Assuming provider 1 for simplicity
    products: [
      {
        id: 3,
        name: "Product C",
        price: 29.99,
        quantity: 1,
      },
    ],
    created_at: new Date("2024-06-15T10:30:00Z"),
  },
  {
    id: 3,
    name: "Order 3",
    provider_id: 2, // Different provider
    products: [
      {
        id: 4,
        name: "Product D",
        price: 15.0,
        quantity: 3,
      },
      {
        id: 5,
        name: "Product E",
        price: 7.25,
        quantity: 2,
      },
    ],
    created_at: new Date("2024-08-20T16:45:00Z"),
  },
  {
    id: 4,
    name: "Order 4",
    provider_id: 2, // Assuming provider 2 for simplicity
    products: [], // Empty order
    created_at: new Date("2024-07-28T08:00:00Z"),
  },
];

export default ORDERS_MOCK;

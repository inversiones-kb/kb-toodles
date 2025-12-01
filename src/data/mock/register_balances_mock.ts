const MOCK_REGISTER_BALANCES: RegisterBalance[] = [
  {
    id: "1",
    cashier_id: "cashierid", // relation for the employee ID
    checkout_number: 1,
    is_fiscal: false,
    fiscal_money: 0, // default to 0, is used to store value only if is_fiscal is true
    money: {
      cop: {
        cash: 1345000,
        system: 1345000,
      },
      usd: {
        cash: 20,
        system: 20,
      },
      bs: {
        cash: 345.21,
        system: 345.21,
        batch_number: 234, // reference taked from the physical invoice
      },
    },
    expenses: [
      {
        amount: 500000,
        currency: "COP",
        reason: "Pago señor Cheo",
      },
    ],
  },
];

export default MOCK_REGISTER_BALANCES;

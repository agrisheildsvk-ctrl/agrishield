const axios = require('axios');

async function run() {
  try {
    const res = await axios.post('http://localhost:5000/api/orders', {
      orderId: "ORD-1234",
      items: [
        { id: 1, name: "Test", price: "₹1", quantity: 1 }
      ],
      totals: { subtotal: 1, discount: 0, codFee: 0, total: 1 },
      shippingAddress: { firstName: "Test" },
      paymentMethod: "online",
      paymentId: "pay_123"
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
run();

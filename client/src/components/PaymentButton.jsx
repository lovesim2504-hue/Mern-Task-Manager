import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("YOUR_PUBLISHABLE_KEY");

const PaymentButton = () => {
  const handlePayment = async () => {
    const stripe = await stripePromise;

    const res = await fetch(
      "http://localhost:8000/api/v1/payment/create-checkout-session",
      {
        method: "POST",
      }
    );

    const data = await res.json();

    await stripe.redirectToCheckout({
      sessionId: data.id,
    });
  };

  return <button onClick={handlePayment}>Buy Premium</button>;
};

export default PaymentButton;
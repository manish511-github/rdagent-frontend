import { useEffect, useRef } from "react";
import { initializePaddle, Paddle } from "@paddle/paddle-js";

export function usePaddleCheckout() {
  const paddleRef = useRef<Paddle | null>(null);

  useEffect(() => {
    initializePaddle({
      environment: "sandbox",
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
    }).then((paddle) => {
      paddleRef.current = paddle ?? null;
    });
  }, []);

  const openCheckout = (data: { txn_id: string; auth_token?: string }, email?: string) => {
    if (!paddleRef.current) {
      alert("Paddle not initialized");
      return;
    }

    const checkoutOptions: any = {
      transactionId: data.txn_id,
      settings: {
        allowLogout: false,
        theme: "light",
        variant: "one-page",
        successUrl: `https://beta-zooptics.com/payment/success?txn_id=${data.txn_id}`,
      },
    };

    if (data.auth_token) {
      checkoutOptions.customerAuthToken = data.auth_token;
    } else if (email) {
      checkoutOptions.customer = { email };
    }

    paddleRef.current.Checkout.open(checkoutOptions);
  };

  return { openCheckout };
}
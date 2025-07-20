import { useEffect, useRef } from "react";
import { initializePaddle, Paddle } from "@paddle/paddle-js";

export function usePaddleCheckout() {
  const paddleRef = useRef<Paddle | null>(null);

  useEffect(() => {
    initializePaddle({
      environment: "sandbox", // or "production"
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
    }).then((paddle) => {
      paddleRef.current = paddle ?? null;
    });
  }, []);

  const openCheckout = (txnId: string) => {
    debugger
    if (!paddleRef.current) {
      alert("Paddle not initialized");
      return;
    }
    paddleRef.current.Checkout.open({
      transactionId: txnId,
      settings: {
        theme: "light",
        successUrl: "http://localhost:3000/success",
      },
    });
  };

  return { openCheckout };
}
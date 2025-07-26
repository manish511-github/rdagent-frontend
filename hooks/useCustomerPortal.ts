import Cookies from "js-cookie";

export function useCustomerPortal() {
  const openCustomerPortal = async (userId: number) => {
    try {
      const accessToken = Cookies.get("access_token");
      const response = await fetch("http://localhost:8000/subscription/create-customer-portal-session", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create customer portal session");
      }

      const data = await response.json();
      
      if (data.success && data.portal_session_url) {
        // Redirect to the customer portal URL
        window.location.href = data.portal_session_url;
      } else {
        throw new Error("No portal session URL received");
      }
    } catch (error) {
      console.error("Customer portal error:", error);
      alert("Failed to open customer portal. Please try again.");
    }
  };

  return { openCustomerPortal };
} 
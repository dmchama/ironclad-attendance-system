
export interface EmailData {
  to_email: string;
  to_name: string;
  username: string;
  password: string;
  gym_name: string;
}

/**
 * Sends a welcome email to the gym member using Supabase Edge function and Resend.
 * Returns { success, message }.
 */
export const sendMemberEmail = async (
  emailData: EmailData
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log("Sending email via Edge Function to:", emailData.to_email);

    const response = await fetch(
      "/functions/send-member-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: emailData.to_email,
          memberName: emailData.to_name,
          username: emailData.username,
          password: emailData.password,
          gymName: emailData.gym_name
        })
      }
    );

    const result = await response.json();

    console.log("Edge Function response:", result);

    if (result.success) {
      console.log("Email sent successfully via Edge Function");
      return {
        success: true,
        message: `Email sent successfully to ${emailData.to_email}. Please check spam/junk folder if not received.`,
      };
    } else {
      console.error("Edge Function returned success: false", result);
      throw new Error(result.error || result.message || "Edge Function returned failure status");
    }
  } catch (error: any) {
    console.error("Edge Function email error details:", {
      error: error.message,
      email: emailData.to_email,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      message:
        `Email delivery failed: ${error.message}. Please provide login details manually or try a different email service.`,
    };
  }
};

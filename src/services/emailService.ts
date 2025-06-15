
// Web3Forms configuration
const WEB3FORMS_ACCESS_KEY = '35bb2793-fbe8-4a07-a968-01dd3179dacf'; // Get this from https://web3forms.com

export interface EmailData {
  to_email: string;
  to_name: string;
  username: string;
  password: string;
  gym_name: string;
}

export const sendMemberEmail = async (emailData: EmailData): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Sending email via Web3Forms to:', emailData.to_email);

    const formData = new FormData();
    formData.append('access_key', WEB3FORMS_ACCESS_KEY);
    formData.append('subject', `Welcome to ${emailData.gym_name} - Your Login Details`);
    formData.append('email', emailData.to_email);
    formData.append('name', emailData.to_name);
    
    // Add reply-to and from name for better deliverability
    formData.append('from_name', `${emailData.gym_name} Team`);
    formData.append('replyto', 'noreply@web3forms.com');
    
    // Add message content
    formData.append('message', `
Hello ${emailData.to_name},

Welcome to ${emailData.gym_name}! Your membership has been successfully created.

Here are your login details:
Username: ${emailData.username}
Password: ${emailData.password}

Please keep these credentials safe. You can use them to access member features and check in at the gym.

Welcome to your fitness journey at ${emailData.gym_name}!

Best regards,
${emailData.gym_name} Team

---
Note: This email was sent via Web3Forms. If you didn't receive this email, please check your spam/junk folder or contact the gym directly.
    `);

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    console.log('Web3Forms response:', result);
    console.log('Response status:', response.status);

    if (result.success) {
      console.log('Email sent successfully via Web3Forms');
      return {
        success: true,
        message: `Email sent successfully to ${emailData.to_email}. Please check spam/junk folder if not received.`
      };
    } else {
      console.error('Web3Forms returned success: false', result);
      throw new Error(result.message || 'Web3Forms returned failure status');
    }
  } catch (error: any) {
    console.error('Web3Forms error details:', {
      error: error.message,
      email: emailData.to_email,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: false,
      message: `Email delivery failed: ${error.message}. Please provide login details manually or try a different email service.`
    };
  }
};

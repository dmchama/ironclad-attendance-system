
import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // User needs to replace this
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // User needs to replace this
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // User needs to replace this

export interface EmailData {
  to_email: string;
  to_name: string;
  username: string;
  password: string;
  gym_name: string;
}

export const sendMemberEmail = async (emailData: EmailData): Promise<{ success: boolean; message: string }> => {
  try {
    // Initialize EmailJS with public key
    emailjs.init(EMAILJS_PUBLIC_KEY);
    
    const templateParams = {
      to_email: emailData.to_email,
      to_name: emailData.to_name,
      username: emailData.username,
      password: emailData.password,
      gym_name: emailData.gym_name,
      from_name: emailData.gym_name
    };

    console.log('Sending email via EmailJS with params:', templateParams);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('EmailJS response:', response);

    if (response.status === 200) {
      return {
        success: true,
        message: 'Email sent successfully'
      };
    } else {
      throw new Error(`EmailJS failed with status: ${response.status}`);
    }
  } catch (error: any) {
    console.error('EmailJS error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send email'
    };
  }
};

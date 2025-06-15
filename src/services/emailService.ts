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
    console.log('Sending email via Web3Forms...');

    const formData = new FormData();
    formData.append('access_key', WEB3FORMS_ACCESS_KEY);
    formData.append('subject', `Welcome to ${emailData.gym_name} - Your Login Details`);
    formData.append('email', emailData.to_email);
    formData.append('name', emailData.to_name);
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
    `);

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    console.log('Web3Forms response:', result);

    if (result.success) {
      return {
        success: true,
        message: 'Email sent successfully'
      };
    } else {
      throw new Error(result.message || 'Failed to send email');
    }
  } catch (error: any) {
    console.error('Web3Forms error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send email'
    };
  }
};

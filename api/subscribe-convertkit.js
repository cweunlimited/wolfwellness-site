export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, firstName } = req.body;

  // Validate input
  if (!email || !firstName) {
    return res.status(400).json({ error: 'Email and first name are required' });
  }

  try {
    // Subscribe to ConvertKit
    const response = await fetch(
      `https://api.convertkit.com/v3/forms/${process.env.CONVERTKIT_FORM_ID}/subscribe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: process.env.CONVERTKIT_API_KEY,
          email: email,
          first_name: firstName,
        }),
      }
    );

    const data = await response.json();

    console.log('ConvertKit API response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('ConvertKit API error:', data);
      return res.status(response.status).json({
        error: 'Subscription failed',
        details: data
      });
    }

    // Success - subscriber should now be on the form
    console.log('Subscriber added successfully:', data.subscription);

    return res.status(200).json({
      success: true,
      message: 'Successfully subscribed',
      subscriber: data.subscription
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

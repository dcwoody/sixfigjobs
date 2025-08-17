export async function triggerWeeklyNewsletter() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/newsletter/schedule`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NEWSLETTER_API_SECRET}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action: 'auto-send' })
  });

  return response.json();
}
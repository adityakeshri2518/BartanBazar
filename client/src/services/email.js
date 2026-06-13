const emailConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  contactTemplateId: import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID,
  newsletterTemplateId: import.meta.env.VITE_EMAILJS_NEWSLETTER_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY
};

export const isEmailConfigured = () =>
  Boolean(emailConfig.serviceId && emailConfig.publicKey && (emailConfig.contactTemplateId || emailConfig.newsletterTemplateId));

const sendEmail = async (templateId, templateParams) => {
  if (!emailConfig.serviceId || !templateId || !emailConfig.publicKey) {
    return { skipped: true };
  }

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: emailConfig.serviceId,
      template_id: templateId,
      user_id: emailConfig.publicKey,
      template_params: templateParams
    })
  });

  if (!response.ok) {
    throw new Error("EmailJS request failed");
  }

  return { success: true };
};

export const sendContactEmail = (values) =>
  sendEmail(emailConfig.contactTemplateId, {
    from_name: values.name,
    from_email: values.email,
    phone: values.phone || "",
    message: values.message,
    subject: "New BartanBazaar contact message"
  });

export const sendNewsletterEmail = (email) =>
  sendEmail(emailConfig.newsletterTemplateId, {
    subscriber_email: email,
    subject: "New BartanBazaar newsletter subscriber"
  });

# WhatsApp Integration & Cloud API Architecture Guide

This document explains the WhatsApp capabilities in Farm2Market and provides the implementation blueprint for production Meta WhatsApp Cloud API / OTP integration.

---

## 1. Current Working Capabilities
Farm2Market currently includes direct WhatsApp integration via structured deep-links:
- **Crop Detail Inquiries**: Opens WhatsApp with pre-filled crop name, quantity, unit price, and listing link.
- **Listing Sharing**: Enables one-click viral sharing of produce cards to WhatsApp groups and contacts.
- **Support Helpline**: 24/7 direct helpline access via navbar, contact page, and footer.

---

## 2. Production WhatsApp OTP Authentication Blueprint

For production deployments requiring true OTP verification via WhatsApp:

### Architecture Flow
```mermaid
sequenceDiagram
    autonumber
    actor Farmer as Farmer / Buyer
    participant Client as React Client
    participant Server as Express Server
    participant Meta as Meta WhatsApp Cloud API
    participant WhatsApp as WhatsApp Application

    Farmer->>Client: Enter Phone Number (+91...)
    Client->>Server: POST /api/auth/whatsapp/send-otp
    Server->>Server: Generate secure 6-digit OTP & TTL (5 mins)
    Server->>Meta: POST https://graph.facebook.com/v18.0/{phone-id}/messages
    Meta->>WhatsApp: Deliver Template Message with OTP
    WhatsApp-->>Farmer: Notification: "Your Farm2Market OTP is 839201"
    Farmer->>Client: Enter 6-digit OTP
    Client->>Server: POST /api/auth/whatsapp/verify-otp { phone, otp, role }
    Server->>Server: Validate OTP, create/find user in DB, sign JWT
    Server-->>Client: HTTP 200 OK + JWT Token + User Object
```

### Environment Variables Required
```env
WHATSAPP_CLOUD_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id
WHATSAPP_ACCESS_TOKEN=EAAB...your_permanent_system_token
WHATSAPP_TEMPLATE_NAME=farm2market_login_otp
```

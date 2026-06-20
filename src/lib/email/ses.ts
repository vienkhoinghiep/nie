/**
 * AWS SES Email Client
 * Singleton SESv2 client và các hàm gửi email qua Amazon SES
 */

import {
  SESv2Client,
  SendEmailCommand,
} from "@aws-sdk/client-sesv2";
import { siteConfig } from "../site-config";
import type {
  SendEmailParams,
  BulkEmailEntry,
  SendResult,
  BulkSendResult,
} from "./types";

// ─── SES Client Singleton ────────────────────────────────────

let sesClient: SESv2Client | null = null;

/** Lấy SES client singleton — khởi tạo 1 lần duy nhất */
export function getSESClient(): SESv2Client {
  if (!sesClient) {
    const region = process.env.AWS_SES_REGION;
    const accessKeyId = process.env.AWS_SES_ACCESS_KEY;
    const secretAccessKey = process.env.AWS_SES_SECRET_KEY;

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "Missing AWS SES credentials. Cần có AWS_SES_REGION, AWS_SES_ACCESS_KEY, AWS_SES_SECRET_KEY trong env."
      );
    }

    sesClient = new SESv2Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  return sesClient;
}

// ─── Sender Address ──────────────────────────────────────────

/** Lấy địa chỉ From đầy đủ: "Tên <email>" */
function getFromAddress(): string {
  const email = process.env.EMAIL_FROM || `no-reply@${siteConfig.domain}`;
  const name = process.env.EMAIL_FROM_NAME || siteConfig.name;
  return `${name} <${email}>`;
}

// ─── Resend transport (fallback when Resend env is configured) ───
// Resend API mirrors the same sendEmail signature. When RESEND_API_KEY is set
// we prefer it over SES so the platform works without AWS credentials.

async function sendViaResend(
  to: string,
  subject: string,
  htmlBody: string,
  options?: { text?: string; replyTo?: string; fromName?: string; fromEmail?: string; tags?: Record<string, string>; headers?: Record<string, string> }
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: "RESEND_API_KEY missing" };
  }
  const fromEmail = options?.fromEmail || process.env.EMAIL_FROM || `no-reply@${siteConfig.domain}`;
  const fromName = options?.fromName || process.env.EMAIL_FROM_NAME || siteConfig.name;
  const payload: Record<string, unknown> = {
    from: `${fromName} <${fromEmail}>`,
    to: [to],
    subject,
    html: htmlBody,
  };
  if (options?.text) payload.text = options.text;
  if (options?.replyTo) payload.reply_to = options.replyTo;
  if (options?.tags) {
    payload.tags = Object.entries(options.tags).map(([name, value]) => ({ name, value }));
  }
  if (options?.headers) payload.headers = options.headers;

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await resp.json().catch(() => null);
    if (!resp.ok) {
      const errMsg = (data && typeof data === "object" && "message" in data ? String((data as { message: unknown }).message) : `HTTP ${resp.status}`);
      console.error(`[Resend] Send to ${to} failed:`, errMsg);
      return { success: false, error: errMsg };
    }
    const id = data && typeof data === "object" && "id" in data ? String((data as { id: unknown }).id) : undefined;
    return { success: true, messageId: id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Resend send failed";
    console.error(`[Resend] Network error sending to ${to}:`, message);
    return { success: false, error: message };
  }
}

/** True when Resend should be used instead of SES. */
function resendEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

// ─── Send Single Email ───────────────────────────────────────

/**
 * Gửi 1 email qua SES
 * @returns SES Message ID nếu thành công
 */
export async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string,
  textBody?: string,
  replyTo?: string
): Promise<SendResult> {
  if (resendEnabled()) {
    return sendViaResend(to, subject, htmlBody, { text: textBody, replyTo });
  }
  try {
    const client = getSESClient();
    const toAddresses = [to];

    const command = new SendEmailCommand({
      FromEmailAddress: getFromAddress(),
      Destination: {
        ToAddresses: toAddresses,
      },
      ReplyToAddresses: replyTo ? [replyTo] : undefined,
      Content: {
        Simple: {
          Subject: {
            Data: subject,
            Charset: "UTF-8",
          },
          Body: {
            Html: {
              Data: htmlBody,
              Charset: "UTF-8",
            },
            ...(textBody
              ? {
                  Text: {
                    Data: textBody,
                    Charset: "UTF-8",
                  },
                }
              : {}),
          },
        },
      },
    });

    const response = await client.send(command);

    return {
      success: true,
      messageId: response.MessageId,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Lỗi không xác định khi gửi email";
    console.error(`[SES] Gửi email thất bại đến ${to}:`, message);
    return {
      success: false,
      error: message,
    };
  }
}

// ─── Send with Full Params ───────────────────────────────────

/**
 * Gửi email với đầy đủ tham số (dùng cho các trường hợp nâng cao)
 * Hỗ trợ custom from name/email và SES tags
 */
export async function sendEmailWithParams(
  params: SendEmailParams
): Promise<SendResult> {
  if (resendEnabled()) {
    return sendViaResend(params.to, params.subject, params.html, {
      text: params.text,
      replyTo: params.replyTo,
      fromName: params.fromName,
      fromEmail: params.fromEmail,
      tags: params.tags,
      headers: params.headers,
    });
  }
  try {
    const client = getSESClient();

    const fromEmail = params.fromEmail || process.env.EMAIL_FROM || `no-reply@${siteConfig.domain}`;
    const fromName = params.fromName || process.env.EMAIL_FROM_NAME || siteConfig.name;
    const fromAddress = `${fromName} <${fromEmail}>`;

    const command = new SendEmailCommand({
      FromEmailAddress: fromAddress,
      Destination: {
        ToAddresses: [params.to],
      },
      ReplyToAddresses: params.replyTo ? [params.replyTo] : undefined,
      Content: {
        Simple: {
          Subject: { Data: params.subject, Charset: "UTF-8" },
          Body: {
            Html: { Data: params.html, Charset: "UTF-8" },
            ...(params.text ? { Text: { Data: params.text, Charset: "UTF-8" } } : {}),
          },
          Headers: params.headers
            ? Object.entries(params.headers).map(([Name, Value]) => ({ Name, Value }))
            : undefined,
        },
      },
      EmailTags: params.tags
        ? Object.entries(params.tags).map(([Name, Value]) => ({ Name, Value }))
        : undefined,
    });

    const response = await client.send(command);

    return { success: true, messageId: response.MessageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi gửi email";
    console.error(`[SES] sendEmailWithParams thất bại đến ${params.to}:`, message);
    return { success: false, error: message };
  }
}

// ─── Send Bulk Emails ────────────────────────────────────────

/**
 * Gửi email hàng loạt — mỗi email có nội dung riêng
 * Gửi tuần tự với delay để tránh vượt rate limit SES (14 emails/giây)
 *
 * @param emails - Mảng email cần gửi
 * @param delayMs - Delay giữa mỗi email (mặc định 100ms ~ 10 emails/giây, an toàn cho rate limit 14/s)
 */
export async function sendBulkEmails(
  emails: BulkEmailEntry[],
  delayMs: number = 100
): Promise<BulkSendResult> {
  const results: BulkSendResult["results"] = [];
  let sent = 0;
  let failed = 0;

  for (const email of emails) {
    const result = await sendEmail(
      email.to,
      email.subject,
      email.html,
      email.text
    );

    results.push({
      to: email.to,
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    });

    if (result.success) {
      sent++;
    } else {
      failed++;
    }

    // Delay giữa mỗi email để tránh vượt SES rate limit
    if (delayMs > 0) {
      await sleep(delayMs);
    }
  }

  return {
    total: emails.length,
    sent,
    failed,
    results,
  };
}

// ─── Send Templated Email (SES Template) ─────────────────────

/**
 * Gửi email sử dụng SES Template đã tạo sẵn trên AWS
 * Lưu ý: Cần tạo template trên SES console/API trước khi dùng
 *
 * @param to - Email người nhận
 * @param templateName - Tên template trên SES
 * @param templateData - Dữ liệu thay thế vào template
 */
export async function sendTemplatedEmail(
  to: string,
  templateName: string,
  templateData: Record<string, string>
): Promise<SendResult> {
  try {
    const client = getSESClient();

    const command = new SendEmailCommand({
      FromEmailAddress: getFromAddress(),
      Destination: {
        ToAddresses: [to],
      },
      Content: {
        Template: {
          TemplateName: templateName,
          TemplateData: JSON.stringify(templateData),
        },
      },
    });

    const response = await client.send(command);

    return {
      success: true,
      messageId: response.MessageId,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Lỗi gửi templated email";
    console.error(`[SES] Gửi templated email thất bại đến ${to}:`, message);
    return {
      success: false,
      error: message,
    };
  }
}

// ─── Helpers ─────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

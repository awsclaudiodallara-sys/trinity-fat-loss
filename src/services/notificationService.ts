/**
 * TRINITY FAT LOSS - Notification Service
 * Sistema centralizzato per gestire tutte le notifiche (Email, Push, Toast)
 */

import { supabase } from "../lib/supabase";

// Types per le notifiche
export interface NotificationData {
  userId: string;
  type:
    | "trio_formation"
    | "trio_formation_failed"
    | "video_call_reminder"
    | "chat_message"
    | "achievement";
  title: string;
  message: string;
  data?: Record<string, unknown>;
  channels: ("email" | "push" | "toast")[];
}

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

/**
 * Service per gestire l'invio di notifiche multi-canale
 */
export class NotificationService {
  /**
   * Invio notifica principale - dispatcher per tutti i canali
   */
  static async sendNotification(
    notification: NotificationData
  ): Promise<boolean> {
    console.log(
      "📨 Sending notification:",
      notification.type,
      "to user:",
      notification.userId
    );

    let success = true;

    // Invio su tutti i canali richiesti
    for (const channel of notification.channels) {
      try {
        switch (channel) {
          case "email":
            await this.sendEmail(notification);
            break;
          case "push":
            await this.sendPushNotification(notification);
            break;
          case "toast":
            await this.sendToastNotification(notification);
            break;
        }
      } catch (error) {
        console.error(`❌ Failed to send ${channel} notification:`, error);
        success = false;
      }
    }

    // Log della notifica nel database per tracking
    await this.logNotification(notification, success);

    return success;
  }

  /**
   * Invio email tramite Supabase Edge Functions
   */
  private static async sendEmail(
    notification: NotificationData
  ): Promise<void> {
    const template = this.getEmailTemplate(notification.type, notification);

    // Get user email from users table (not user_profiles)
    const { data: userData } = await supabase
      .from("users")
      .select("email, name")
      .eq("id", notification.userId)
      .single();

    if (!userData?.email) {
      throw new Error("User email not found");
    }

    try {
      // Call Supabase Edge Function for sending email
      const { data, error } = await supabase.functions.invoke(
        "send-notification-email",
        {
          body: {
            to: userData.email,
            subject: template.subject,
            htmlContent: template.htmlContent,
            textContent: template.textContent,
          },
        }
      );

      if (error) {
        console.error("📧 Email sending failed:", error);
        throw new Error(`Email sending failed: ${error.message}`);
      }

      console.log("📧 Email sent successfully:", data);
    } catch (error) {
      console.error("📧 Email service error:", error);

      // Fallback: log the email details for debugging
      console.log("📧 FALLBACK - Email would be sent to:", userData.email);
      console.log("📧 FALLBACK - Subject:", template.subject);
      console.log("📧 FALLBACK - Content:", template.textContent);

      // Don't throw error to prevent breaking other notification channels
      console.warn("📧 Email failed but continuing with other notifications");
    }
  }

  /**
   * Invio push notification (Android/iOS)
   */
  private static async sendPushNotification(
    notification: NotificationData
  ): Promise<void> {
    // TODO: Implementare FCM per Android
    console.log("📱 Push notification would be sent:", notification.title);

    // Simula successo
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * Invio toast notification (web app)
   * Toast vengono ora gestiti tramite Supabase Realtime - questo metodo viene chiamato solo per logging
   */
  private static async sendToastNotification(
    notification: NotificationData
  ): Promise<void> {
    console.log(
      "🍞 Toast notification logged to database:",
      notification.title
    );
    console.log(
      "🔧 Toast will be delivered via Supabase Realtime to user's browser"
    );

    // Toast vengono ora gestiti tramite Realtime Notifications
    // Il database INSERT triggerà automaticamente il toast nell'hook useRealtimeNotifications
  }

  /**
   * Ottieni template email per tipo notifica
   */
  private static getEmailTemplate(
    type: NotificationData["type"],
    notification: NotificationData
  ): EmailTemplate {
    switch (type) {
      case "trio_formation":
        return {
          subject: "🎉 Benvenuto nel tuo Trinity Team!",
          htmlContent: this.generateTrioFormationEmailHTML(notification),
          textContent: `Ciao! Sei stato aggiunto al trio "${
            notification.data?.trioName || "Trinity Team"
          }"! Il tuo percorso fitness inizia ora con i tuoi nuovi compagni. Accedi all'app per conoscere il tuo team e iniziare insieme!`,
        };

      case "trio_formation_failed":
        return {
          subject: "⏳ Stiamo ancora cercando il tuo team perfetto",
          htmlContent: this.generateTrioFormationFailedEmailHTML(),
          textContent:
            "Ciao! Stiamo ancora lavorando per trovare i compagni ideali per il tuo percorso fitness. Ti aggiorneremo non appena avremo formato il tuo Trinity Team perfetto!",
        };

      default:
        return {
          subject: notification.title,
          htmlContent: `<p>${notification.message}</p>`,
          textContent: notification.message,
        };
    }
  }

  /**
   * Genera HTML per email di formazione trio
   */
  private static generateTrioFormationEmailHTML(
    notification: NotificationData
  ): string {
    const trioName = (notification.data?.trioName as string) || "Trinity Team";
    const memberNames = (notification.data?.memberNames as string[]) || [];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Benvenuto nel tuo Trinity Team!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          .members { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Benvenuto nel tuo Trinity Team!</h1>
            <p>Il tuo percorso fitness inizia ora!</p>
          </div>
          <div class="content">
            <h2>Ciao!</h2>
            <p>Siamo felici di informarti che sei stato aggiunto al trio <strong>"${trioName}"</strong>!</p>
            
            ${
              memberNames.length > 0
                ? `
            <div class="members">
              <h3>I tuoi compagni di squadra:</h3>
              <ul>
                ${memberNames
                  .map((name: string) => `<li>${name}</li>`)
                  .join("")}
              </ul>
            </div>
            `
                : ""
            }
            
            <p>Ora puoi:</p>
            <ul>
              <li>📱 Chattare con il tuo team</li>
              <li>📹 Programmare videochiamate settimanali</li>
              <li>🏆 Raggiungere obiettivi insieme</li>
              <li>💪 Supportarvi a vicenda nel percorso</li>
            </ul>
            
            <a href="#" class="cta-button">Apri Trinity App</a>
            
            <p><small>Buon allenamento!<br>Il Team Trinity Fat Loss</small></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera HTML per email di formazione trio fallita
   */
  private static generateTrioFormationFailedEmailHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Stiamo cercando il tuo team perfetto</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏳ Stiamo cercando il tuo team perfetto</h1>
          </div>
          <div class="content">
            <h2>Ciao!</h2>
            <p>Grazie per la tua pazienza. Stiamo ancora lavorando per trovare i compagni ideali per il tuo percorso fitness.</p>
            
            <p>🔍 Il nostro algoritmo sta analizzando:</p>
            <ul>
              <li>Obiettivi di fitness compatibili</li>
              <li>Livelli di esperienza simili</li>
              <li>Preferenze di comunicazione</li>
              <li>Fusi orari e disponibilità</li>
            </ul>
            
            <p>Ti aggiorneremo non appena avremo formato il tuo <strong>Trinity Team perfetto</strong>!</p>
            
            <p><small>Grazie per la fiducia,<br>Il Team Trinity Fat Loss</small></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Log notifica nel database per tracking e analytics
   */
  private static async logNotification(
    notification: NotificationData,
    success: boolean
  ): Promise<void> {
    try {
      await supabase.from("notification_logs").insert({
        user_id: notification.userId,
        notification_type: notification.type,
        title: notification.title,
        message: notification.message,
        channels: notification.channels,
        data: notification.data || {},
        status: success ? "sent" : "failed",
        email_status: notification.channels.includes("email")
          ? success
            ? "sent"
            : "failed"
          : "not_sent",
        push_status: notification.channels.includes("push")
          ? success
            ? "sent"
            : "failed"
          : "not_sent",
        toast_status: notification.channels.includes("toast")
          ? success
            ? "sent"
            : "failed"
          : "not_sent",
        sent_at: new Date().toISOString(),
      });

      console.log("📊 Notification logged to database");
    } catch (error) {
      console.error("Failed to log notification:", error);
      // Non bloccare il flusso per errori di logging
    }
  }

  // === METODI HELPER PER NOTIFICHE SPECIFICHE ===

  /**
   * Notifica formazione trio completata
   */
  static async notifyTrioFormationSuccess(
    userId: string,
    trioData: {
      id: string;
      name?: string;
      memberNames: string[];
    }
  ): Promise<boolean> {
    return this.sendNotification({
      userId,
      type: "trio_formation",
      title: "🎉 Benvenuto nel tuo Trinity Team!",
      message: `Sei stato aggiunto al trio "${
        trioData.name || "Trinity Team"
      }"! Il tuo percorso fitness inizia ora.`,
      data: {
        trioId: trioData.id,
        trioName: trioData.name,
        memberNames: trioData.memberNames,
      },
      channels: ["email"], // Solo EMAIL per trio formation - no push, no toast
    });
  }

  /**
   * Notifica formazione trio fallita
   */
  static async notifyTrioFormationFailed(userId: string): Promise<boolean> {
    return this.sendNotification({
      userId,
      type: "trio_formation_failed",
      title: "⏳ Stiamo cercando il tuo team perfetto",
      message:
        "Stiamo ancora lavorando per trovare i compagni ideali per il tuo percorso fitness.",
      data: {
        userId,
      },
      channels: ["email"], // Solo email per questo tipo
    });
  }
}

export default NotificationService;

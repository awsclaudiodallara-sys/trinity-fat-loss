Trinity Fat Loss - Database Schema Documentation

Panoramica
Database PostgreSQL con 19 tabelle, 2 funzioni personalizzate e sistema completo di vincoli per app fitness social basata su trio di utenti.

Tabelle e Struttura

1. USERS
   Tabella principale utenti

   - id (UUID, PRIMARY KEY)
   - email (UNIQUE)
   - age (CHECK: 18-65 anni)
   - referral_code (UNIQUE)
   - referred_by (FK → users.id)
   - stripe_customer_id (UNIQUE)
   - current_trio_id (FK → trios.id)
     Vincoli:
   - users_age_check: età tra 18 e 65 anni
   - users_email_key: email unica
   - users_referral_code_key: codice referral unico
   - users_stripe_customer_id_key: ID Stripe unico

2. TRIOS
   Gruppi di tre utenti

   - id (UUID, PRIMARY KEY)
   - user1_id (FK → users.id ON DELETE CASCADE)
   - user2_id (FK → users.id ON DELETE CASCADE)
   - user3_id (FK → users.id ON DELETE CASCADE)
   - start_date, end_date
   - age_range_min, age_range_max
   - compatibility_score (0-100)
     Vincoli:
   - unique_trio_members: combinazione user1_id, user2_id, user3_id unica
   - valid_age_range: age_range_max ≥ age_range_min
   - valid_compatibility: compatibility_score tra 0 e 100
   - valid_date_range: end_date > start_date

3. MATCHING_QUEUE
   Coda per il matching

   - id (UUID, PRIMARY KEY)
   - user_id (FK → users.id ON DELETE CASCADE)

4. DAILY_TASKS
   Compiti giornalieri

   - id (UUID, PRIMARY KEY)
   - user_id (FK → users.id ON DELETE CASCADE)
   - trio_id (FK → trios.id ON DELETE CASCADE)
   - task_date
   - task_type
   - completed BOOLEAN
   - completed_at TIMESTAMP
   - target_value NUMERIC
   - actual_value NUMERIC
   - target_unit VARCHAR
   - notes VARCHAR
   - reminder_sent BOOLEAN
   - celebration_notification_sent BOOLEAN

   Vincoli:

   - daily_tasks_user_id_task_date_task_type_key: combinazione user_id, task_date, task_type unica

5. WEEKLY_TASKS
   Compiti settimanali

   - id (UUID, PRIMARY KEY)
   - user_id (FK → users.id ON DELETE CASCADE)
   - trio_id (FK → trios.id ON DELETE CASCADE)
   - week_start
   - task_type
     Vincoli:
   - weekly_tasks_user_id_week_start_task_type_key: combinazione user_id, week_start, task_type unica

6. CHAT_MESSAGES
   Messaggi chat trio

   - id (UUID, PRIMARY KEY)
   - sender_id (FK → users.id ON DELETE CASCADE)
   - trio_id (FK → trios.id ON DELETE CASCADE)
   - reply_to_id (FK → chat_messages.id)

7. VIDEO_CALL_SCHEDULES
   Programmazione videochiamate

   - id (UUID, PRIMARY KEY)
   - trio_id (FK → trios.id ON DELETE CASCADE)
   - proposed_by (FK → users.id)

8. SUBSCRIPTIONS
   Abbonamenti utenti

   - id (UUID, PRIMARY KEY)
   - user_id (FK → users.id ON DELETE CASCADE)
   - stripe_subscription_id (UNIQUE)
     Vincoli:
   - subscriptions_stripe_subscription_id_key: ID Stripe subscription unico

9. PAYMENTS
   Pagamenti

   - id (UUID, PRIMARY KEY)
   - user_id (FK → users.id ON DELETE CASCADE)
   - subscription_id (FK → subscriptions.id ON DELETE SET NULL)

10. STRIPE_WEBHOOKS
    Webhook Stripe

    - id (UUID, PRIMARY KEY)
    - stripe_event_id (UNIQUE)
    - affected_user_id (FK → users.id)
    - affected_subscription_id (FK → subscriptions.id)
      Vincoli:
    - stripe_webhooks_stripe_event_id_key: stripe_event_id unico

11. TRIO_GIFTS
    Regali tra trio

    - id (UUID, PRIMARY KEY)
    - gifter_id (FK → users.id ON DELETE CASCADE)
    - recipient_id (FK → users.id ON DELETE CASCADE)
    - trio_id (FK → trios.id ON DELETE CASCADE)
    - payment_id (FK → payments.id)

12. AD_EVENTS
    Eventi pubblicitari

    - id (UUID, PRIMARY KEY)
    - user_id (FK → users.id ON DELETE CASCADE)
    - trio_id (FK → trios.id)

13. AD_REWARDS
    Ricompense pubblicitarie

    - id (UUID, PRIMARY KEY)
    - user_id (FK → users.id ON DELETE CASCADE)
    - ad_event_id (FK → ad_events.id)

14. ACHIEVEMENTS
    Achievement/Badge disponibili

    - id (UUID, PRIMARY KEY)
    - name (UNIQUE)
      Vincoli:
    - achievements_name_key: nome achievement unico

15. USER_ACHIEVEMENTS
    Achievement ottenuti da utenti

    - id (UUID, PRIMARY KEY)
    - user_id (FK → users.id ON DELETE CASCADE)
    - achievement_id (FK → achievements.id)
    - trio_id (FK → trios.id)
      Vincoli:
    - user_achievements_user_id_achievement_id_key: combinazione user_id, achievement_id unica

16. BADGE_PROGRESS
    Progresso verso badge

    - id (UUID, PRIMARY KEY)
    - user_id (FK → users.id ON DELETE CASCADE)
    - achievement_id (FK → achievements.id)
    - trio_id (FK → trios.id)
      Vincoli:
    - badge_progress_user_id_achievement_id_key: combinazione user_id, achievement_id unica

17. REVENUE_ANALYTICS
    Analytics ricavi

    - id (UUID, PRIMARY KEY)
    - date
    - platform
      Vincoli:
    - revenue_analytics_date_platform_key: combinazione date, platform unica

18. USER_SESSIONS
    Sessioni utente

    - id (UUID, PRIMARY KEY)
    - user_id (FK → users.id ON DELETE CASCADE)

19. USER_CONSENTS
    Consensi privacy
    - id (UUID, PRIMARY KEY)
    - user_id (FK → users.id ON DELETE CASCADE)

Funzioni Personalizzate

1. freeze_daily_tasks()
   ```sql
   freeze_daily_tasks()
   RETURNS: void
   ARGUMENTS: nessuno
   Scopo: Congelare/finalizzare i task giornalieri
   ```

# Handoff: business and event sign-up changes (branch `signup-v2`)

Written 2026-11-21. Not live. The user approves on the demo before anything goes to `main`.

## Where things are

- **Site repo:** `ammangogym/wegogym-site` (GitHub Pages: a push to `main` is live). Read its `CLAUDE.md`
  (ad-blocker class names, run `node tools/check-adblock.mjs`, bump `?v=` on changed CSS/JS).
- **Branch:** `signup-v2`, pushed to GitHub. All work below is on it. `main` already has the first
  change of the session (commit `b72153b`, live): an off-peak pricing tip on the events price box and a
  line on the business "done" screen.
- **Demo (private artifact):** https://claude.ai/artifact/5Jji45PhTGb8K6FfkXnc6a
  Built from the branch by `build.py` in `Claude outputs/signup-demo/` in the WGG2 folder. It copies the
  real pages and adds `demo.js`: fake network replies, Continue skips checks, Stripe stand-in screens,
  a step bar. To rebuild: clone the branch to `/home/claude/wegogym-site`, put `demo.js`, `demo.css`,
  `index.html`, `build.py` in `/home/claude/demo-src`, run `python3 build.py` (outputs
  `/home/claude/demo`), then republish with `publish_files` to slug
  `22de84b2-d168-483b-84b4-4959d4dec577` (read the live version with `get_artifact` first).
  `t3.mjs`, `t4.mjs`, `t9.mjs` there are the Playwright click-through tests (serve `/home/claude/demo`
  on port 8767).

## What the branch changes

**Business sign-up** (`business-register/`): after "Getting paid" there are two new steps, then a
"Waiting for approval" screen with a checklist.
- *Prices.* Choice of day passes or classes at set times.
  - Day passes: 1-day price, optional multi-day passes, and a "Fill your quieter times" box (tick to add;
    "% off" prefilled 50, link to type the discounted price instead; days and from/until times).
  - Classes: one class form on the left (type of class with suggestions, days, start, end, spaces, price,
    "Discount this class" with the same % / price switch) and a day-by-day calendar on the right with
    arrows. "Add to calendar" adds and clears the form; clicking a class loads it for Save / Cancel /
    Delete. A class on several days is ONE class: editing it changes every day (user not yet asked
    whether that is right).
- *Front-desk logins.* Optional. Name, email, date of birth, password typed twice. Calls the existing
  `create-venue-operator` function, so this already works live.

**Event sign-up** (`partnerships/`):
- Weekly or fortnightly events on 2+ days get "Some days are different (price, time or place)": per day,
  start, end, place, and "Discount on this day" (% off, link to type the ticket price instead). Shown on
  the review screen.
- Day-by-day calendar beside the events (real dates, arrows, jumps to a date when one is set, click to
  scroll to the event).
- Tip copy: "...running discounts on their quieter sessions to fill spaces..."
- Done screen is "Waiting for approval" with a checklist (sent, identity, payouts if paid, review).

**Bugs fixed on the branch (both are live on `main` today):** the £ sign overlaps typed prices on the
events form; hidden business fields (e.g. "Tell us what kind of place it is") show anyway.

## Added later on 2026-11-21 (also on the branch and in the demo)

- **Events, About you:** Website and Instagram are two separate boxes (`y-site`, `y-ig`). Instagram accepts
  `@name`, `name` or an instagram.com link and is stored as `@name`. Review screen and admin show both.
- **Events, step 2:** note that an event in a new location is a new event, and that a regularly changing
  place should be typed as TBA (callout under the intro and in the "Where is it?" hint).
- **Admin editing while awaiting approval** (`admin/admin.js`, `admin.css`): "Edit this listing" on a
  business whose status is draft, pending or changes_requested; "Edit this application" on an event
  application that is new or contacted. Live, rejected, approved and declined ones are read-only.
  Demo has an Admin page with made-up data (`admin-demo.js`).
- Admin edit is not saved on the live database yet (see go-live item 5).

## Added on 2026-11-22 (branch and demo)

- Business "Register your facility" intro paragraph removed.
- Classes: Spaces is a list (Unlimited first, then 1 to 100). Unlimited is stored as `spaces: null`, so the
  go-live save must decide what `slot_templates.capacity` holds for unlimited (check whether the column
  allows null). A start before 18:00 shows "Discounting off-peak classes through WeGoGym will help boost
  attendance" until Discount this class is ticked.
- One-sentence hints, errors and empty states no longer end in a full stop (both sign-up pages).
- Both calendars: plain left and right triangles beside the day name (CSS triangles, no circles).
- Day boxes (Mon to Sun) keep their size when ticked (no tick mark; colour shows the choice).
- New `/time-field.js` (loaded by both pages, `?v=1`): every time box is a 24-hour HH:MM box. The part being
  typed in is highlighted yellow; two digits move hours to minutes; backspace in empty minutes goes back to
  hours; arrows, Tab and ":" switch part; up/down change the value. Its `.value` is "HH:MM" or "".
- Cache versions now: `business-register.js?v=5`, `business-register.css?v=2`, `partnerships.js?v=20261122a`.

## Added on 2026-11-22 (second round)

- **Day-pass quieter-times discounts:** now a list. Each discount has its own amount (% or typed price),
  days and from/until times; "Add a discount for other days or times" adds another (up to 8), each can be
  removed. Two discounts that cover the same day at overlapping times are refused with a message.
  `state.prices.quiet` is now an array of `{ percent, price, days, from, to }` (it used to be one object).
  Go-live save: one `promotions` row per discount.
- **Off-peak line:** small line under the Starts box for any class starting before 18:00 (stays when the
  class is discounted).
- **Spaces:** starts blank, then Unlimited, then 1 to 100; must be chosen before a class is added.
- **Front-desk logins:** name and date of birth removed. The page now sends only `venue_id`, `email`,
  `password` to `create-venue-operator`. **That function (and the profile trigger from migration 0034 that
  refuses an email sign-up without a date of birth) still require full_name and date_of_birth, so this step
  will fail on the live site until the server is changed.** Also needed: the operator's email must receive
  booking alert emails. Both are server work, not done.
- Cache versions: `business-register.js?v=6`, `business-register.css?v=3`.

## User decisions this session

- Discounts are the easy default: a percentage, prefilled at 50%, with an option to type the discounted
  price. No "would cost" example line; only problems show there.
- Classes are entered one at a time into a calendar, each with its own start and end time.
- Business sign-up includes front-desk logins.
- Paid-event organisers must reach Stripe payouts (live page does this after the ID check; the server's
  `needsPayouts` decides).

## To go live (after the user says "approved")

1. **Save business prices.** Not saved yet (`savePrices` only stores in page state). Tables exist in the
   WGG2 migrations: `day_pass_prices` (days 1-7), `slot_templates` (day_of_week 0-6, start, end,
   capacity, price), `promotions` (percent or fixed amount off, `days_of_week`, `slot_time_start/end`,
   `starts_on`/`ends_on` required). Check before writing:
   - `slot_templates` has no class name column: needs a migration.
   - The app's `publishDayPassPrices` order rule (narrow `max_pass_days` before writing prices, widen
     after) and `venues.booking_mode`.
   - A typed discounted price becomes a fixed amount off (price minus discounted price).
   - Promotion dates: pick a start and end (ask the user how long a standing discount lasts).
   - Day-number conventions (ISO 1-7 in the form vs 0-6 in the tables).
   - That venue owners' database permissions allow these writes from the website.
2. **Save per-day event details.** Needs a migration (e.g. `partnership_events.day_details` jsonb:
   weekday, start/end time, area, price_pence, discount_percent), the `submit_partnership_application`
   function, the `partnerships` edge function's checks, and the admin screen's display.
5. **Admin edit and Instagram need database work.** New functions `admin_update_venue(p_venue_id uuid,
   p_fields jsonb)` (whitelist: name, description, address lines, city, region, postcode, maps links,
   contact name/email/phone, legal_name, company_number; only while status is draft, pending or
   changes_requested; add a history note kind `edited`) and `admin_update_partnership(p_id uuid, p_fields jsonb)`
   (contact + per-event fields, keyed by event id; only while status is new or contacted). Both need
   `app.is_admin()` like the other admin functions. Add `instagram` to the partnership application table,
   `submit_partnership_application`, the `partnerships` edge function's checks, and `admin_list_partnerships`.
   The admin page expects each event in the list to carry its `id`.
3. Bump `?v=` on `business-register.js` (now `v=4`), add one to `business-register.css`, bump
   `partnerships.css` / `partnerships.js` (done on the branch: `20261121c` / `20261121e`) and `admin.css` / `admin.js` (`20261121a`).
4. Run the ad-blocker check and the click-through tests against the real pages, merge `signup-v2` into
   `main`, push, check the live pages.

## Went live 2026-11-22

Backend applied to the production database (migration `signup_v2_backend`) and two edge functions redeployed
(`partnerships` v5, `create-venue-operator` v2). Done: business prices, classes (with class name) and
discounts are saved from the Prices step; Instagram handle and per-day event details are stored; admin
edit functions `admin_update_venue` and `admin_update_partnership` exist; front-desk logins need only an
email and password (`app_metadata.front_desk_login`, service-role only, lets `handle_new_user` skip the date
of birth rule). Not done:
- Quieter-times discounts on day passes are saved as `scheduled` (not applied): the price calculator only
  matches time windows on timetable classes, never on day passes.
- A class discount applies to any class in the same day and time window (promotions carry no class link).
- Unlimited spaces is stored as 10000. Standing discounts run 12 months from the day they are saved.
- Booking emails to front-desk addresses: the `notify-venue-booking` function is not deployed on production.
  The local change (WGG2 `functions/notify-venue-booking/handler.ts`) is ready for when it is.
- WGG2 repo: `0074_front_desk_login_no_dob.sql` and the `create-venue-operator` and `venue-operators.test.ts`
  edits are local and uncommitted; production has the same logic under migration name `signup_v2_backend`.

## Fixes on 2026-11-22 (afternoon, live)

Production migration `signup_v2_fixes`, `create-venue-operator` v3, site `business-register.js?v=8`
(`.css?v=4`), `business/business.js?v=2` (`.css?v=2`).
- **Prices save in one call:** `save_venue_prices(p_venue_id, p_prices jsonb)` (runs as the owner; any problem
  undoes the whole save). Refuses repeated pass lengths, a missing 1-day price, and replacing prices once the
  venue has bookings. The page also refuses repeated pass lengths before sending.
- **Daily capacity:** day-pass venues must give "Most people who can come in one day" (1 to 10,000), saved to
  `venues.day_capacity`.
- **Class discounts belong to their class:** `promotions.slot_template_ids`; `calc_price` only applies such a
  promotion to those classes.
- **Quieter-times discounts work as off-peak passes:** active promotions with hours. `calc_price`,
  `preview_price` and `create_booking` take `p_off_peak boolean default false`; with it, a 1-day pass gets the
  discount and the booking stores `valid_from_time` / `valid_until_time`. `preview_price` returns those hours.
  `check_in_booking` refuses the pass outside them (`outside_hours`, WGG35). Without `p_off_peak` the member pays
  full price for a full day. Error `off_peak_unavailable` (WGG17) when there is no off-peak pass that day.
  **The member app (WGG2) still needs an "off-peak pass" choice that sends `p_off_peak: true` and shows the hours.**
- **Front-desk logins:** no name or date of birth anywhere (dashboard form too). `venue_members.booking_alerts`;
  owner-only `list_front_desk_logins` and `set_front_desk_alerts`; `create-venue-operator` takes `booking_alerts`.
  Switches on the sign-up Front-desk step and the dashboard team list.
  `app.venue_booking_alert_recipients(venue_id)` (service role only) lists who to email: owners and staff with
  `profiles.notify_bookings`, and front-desk logins with alerts on.
  **The booking-alert email sender (`notify-venue-booking`) is still not deployed on production**: it must read
  its recipients from `app.venue_booking_alert_recipients`.
- **WGG2 repo is behind production:** copy `signup_v2_fixes` into `supabase/migrations`, and the
  `booking_alerts` line into `functions/create-venue-operator/handler.ts`, before the next deploy from WGG2,
  or that deploy will undo them.

# TutorConnect

TutorConnect is a decentralized, zero-commission tutor marketplace platform designed to connect students and parents directly with local and online tutors. By removing intermediaries and commission fees, the platform facilitates transparent communication, direct contact details sharing, and rate comparisons for educational services across various boards, subjects, and levels.

---

## Core Product Philosophy

Existing tutoring platforms act as middleman agencies, charging commission fees (often up to 30%) or hiding contact details behind premium paywalls. TutorConnect addresses this by providing:
* **0% Commission Marketplace**: Tutors keep 100% of their earnings, and parents/students pay nothing to connect.
* **Direct Contact Access**: Once a connection request is accepted, contact numbers are unlocked for direct communication.
* **Decentralized Profiles**: Tutors write and control their own listings, pricing, and scheduling availability.

---

## Detailed Features

### 1. Interactive Search and Discovery Directory
The browse tutors page features a filter console designed to pinpoint specific educational requirements:
* **Keyword Search**: Performs textual match queries across names, teacher bios, and titles.
* **Location Filtering**: Filters tutors by city and neighborhood/area for physical, in-person classes.
* **Mode of Instruction**: Toggle between Online classes, In-Person home tuitions, or both modes.
* **Subject & Level Taxonomy**: Filter listings across primary subjects (Mathematics, Physics, Chemistry, Biology, English, Coding, Accountancy, Economics) mapped to grade levels (Class 1-5, Class 6-8, Class 9-10, Class 11-12, Undergraduate, Postgraduate, Adult learner).
* **Language Matcher**: Search for tutors fluent in specific languages (e.g. English, Hindi, Malayalam).
* **Budget Controls**: Interactive slider limits maximum hourly rates up to ₹5000/hr.
* **Quality Matcher**: Minimum rating buttons (Any, 3★+, 4★+, 4.5★+) to filter tutors based on aggregated parent and student reviews.

### 2. Comprehensive Profile Pages
Each tutor is represented by a detailed public profile detailing:
* **Experience & Rates**: Years of teaching experience and clear hourly rate configurations.
* **Subjects Grid**: Detailed lists showing subject, grade levels, and educational boards covered.
* **Reviews and Ratings**: Average rating summaries, counts, and individual textual feedback entries from parents and students.
* **Contact Trigger**: Request Contact button initiates a request flow to exchange numbers.

### 3. Connection Request System
* **Request Dispatch**: When a learner requests contact, a `contact_events` record is created with a `pending` status.
* **Tutor Action**: Tutors receive notifications in their dashboard requests inbox to accept or decline the request.
* **Number Unlocking**: Once accepted, the database reveals the verified phone number from the secure `user_phones` table to the student.
* **Status Updates**: Students can track request states (Pending, Accepted, Declined, Cancelled) and see when contact details are available.

### 4. Authenticated Learner Dashboard
Learners (Students/Parents) have access to a dedicated panel including:
* **Browse Directory Tab**: Search, filter, and save favorite tutors.
* **Favorites Tab**: View and quick-access saved/bookmarked tutor cards.
* **Requests Tab**: Interactive status log tracking all sent requests.
* **Profile Tab**: Manage grade level preferences and general profile information.

### 5. Authenticated Teacher Dashboard
Tutors configure and manage their teaching practices:
* **Incoming Requests Tab**: Review, accept, or decline pending requests from parents.
* **Availability & Hours Tab**: Customize hours, rates, and active teaching statuses.
* **Subject Portfolio Tab**: Update lists of subjects, grades, and boards taught.
* **Profile Configuration Tab**: Manage personal bios, qualifications, and profile photos.

### 6. Admin Panel
System administrators have a centralized control console to:
* **User Management**: Search and list profiles across the platform.
* **Verification Controls**: Add/remove verified badges on tutor listings to indicate credentials check completion.
* **System Log Review**: Access audit information and database records.

---

## Technical Architecture

TutorConnect is built as a client-side single page application powered by a serverless backend.

```
+-------------------------------------------------------------+
|                       React Frontend                        |
|                                                             |
|   +-------------------+    +----------------------------+   |
|   |  TanStack Router  |    |       TanStack Query       |   |
|   |                   |    |                            |   |
|   |  Type-safe query  |    |   Cache management, sync,  |   |
|   |   params parsing  |    |    optimistic updates      |   |
|   +---------+---------+    +-------------+--------------+   |
|             |                            |                  |
+-------------v----------------------------v------------------+
                                           |
                                           | Database Queries
                                           | (auth, select, insert)
+------------------------------------------v------------------+
|                      Supabase Backend                       |
|                                                             |
|   +-------------------+    +----------------------------+   |
|   |   Supabase Auth   |    |    PostgreSQL Database     |   |
|   |                   |    |                            |   |
|   |   Session sync,   |    |   RLS rules, migrations,   |   |
|   |    social signin  |    |    tables, auto-triggers   |   |
|   +-------------------+    +----------------------------+   |
|                                                             |
|   +-----------------------------------------------------+   |
|   |                  Supabase Storage                   |   |
|   |   Profile picture avatar buckets                    |   |
|   +-----------------------------------------------------+   |
+-------------------------------------------------------------+
```

### Frontend State and Routing
* **File-Based Routing**: Powered by TanStack Router. Protected routes are grouped under the `_authenticated` layout.
* **Route Guards**: `beforeLoad` redirects automatically route logged-in users to dashboards and logged-out users to `/auth`.
* **State Management**: TanStack Query manages cache, invalidations (e.g. invalidating requests lists upon acceptance), and background fetches.
* **Styling & Components**: Styled with Tailwind CSS. Design elements use shadcn/ui primitives built on top of Radix UI.

### Backend and Database
* **Database Engine**: PostgreSQL managed by Supabase.
* **Authentication**: Email/Password authentication flow with session states synchronizing directly with the app header.
* **Row Level Security (RLS)**: PostgreSQL policy rules enforce that users can only read accepted contact details, delete their own saves, or modify their own profiles.
* **File Storage**: Storage buckets hold user profile avatars, automatically configured with public-read permissions.

---

## Database Schema Design

The PostgreSQL database consists of 8 primary tables:

### 1. `profiles`
Holds general identity fields common to all users.
* `id` (uuid, primary key): References `auth.users.id`.
* `full_name` (text): User's legal name.
* `city` (text): Primary city.
* `area` (text): Neighborhood location.
* `avatar_url` (text): Storage bucket file key.
* `updated_at` (timestamp).

### 2. `user_roles`
Maps profiles to system roles.
* `id` (uuid, primary key).
* `user_id` (uuid, foreign key to `profiles.id`).
* `role` (text): ENUM (`student`, `parent`, `teacher`, `admin`).

### 3. `teacher_profiles`
Maintains teaching credentials and configurations.
* `user_id` (uuid, primary key): References `profiles.id`.
* `bio` (text): Detailed description of qualifications.
* `years_experience` (integer): Experience count.
* `fee_min` / `fee_max` (integer): Pricing configurations.
* `mode` (text): Teaching format ENUM (`online`, `offline`, `both`).
* `is_active` (boolean): Directory publishing toggle.
* `rating_avg` / `rating_count` (numeric): Computed rating values.
* `is_verified` (boolean): Admin verification flag.

### 4. `teacher_subjects`
Enables indexing teachers by their classes and syllabus.
* `id` (uuid, primary key).
* `teacher_id` (uuid, foreign key to `teacher_profiles.user_id`).
* `subject` (text): Teaching subject.
* `level` (text): Student grade tier.
* `board` (text): Board coverage.

### 5. `student_profiles`
Holds student information.
* `user_id` (uuid, primary key): References `profiles.id`.
* `grade_level` (text): Grade tier.
* `subjects_interest` (text[]): Array of subjects searching.

### 6. `contact_events`
Manages connections and lifecycle states.
* `id` (uuid, primary key).
* `viewer_id` (uuid, foreign key to `profiles.id`): Initiating student.
* `teacher_id` (uuid, foreign key to `teacher_profiles.user_id`): Tutor.
* `status` (text): ENUM (`pending`, `accepted`, `declined`, `cancelled`).
* `created_at` (timestamp).

### 7. `saved_tutors`
Learner bookmarks.
* `id` (uuid, primary key).
* `user_id` (uuid, foreign key to `profiles.id`).
* `teacher_id` (uuid, foreign key to `teacher_profiles.user_id`).

### 8. `user_phones`
Stores verified phone numbers. Unlocked upon request acceptance.
* `id` (uuid, primary key).
* `user_id` (uuid, foreign key to `profiles.id`).
* `phone` (text): Verified contact number.

---

## Detailed Data Flows

### Onboarding Flow
```
Signup form filled
  |
  +--> user_roles record created (role = student | teacher)
        |
        +--> Redirect to Onboarding
              |
              +--> Onboarding form submitted
                    |
                    +--> Profiles & Learner/Teacher Profiles updated
```

### Connection Request Flow
```
Learner clicks "Request Details"
  |
  +--> contact_events record inserted (status = 'pending')
        |
        +--> Notification record created for Teacher
              |
              +--> Teacher views dashboard
                    |
                    +--> Teacher clicks "Accept"
                          |
                          +--> contact_events status updated to 'accepted'
                                |
                                +--> RLS rule unlocks user_phones entry
                                |
                                +--> Learner dashboard updates to show phone
```

---

## Installation and Local Development

### Configuration Setup
1. Clone the project repository code locally.
2. Install all dependencies using Bun or npm:
   ```bash
   npm install
   ```
3. Establish your environment configuration file. Create a `.env` file in the root folder of the project:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Running the App
* **Local Development Server**:
  Launch the Vite compiler locally:
  ```bash
  npm run dev
  ```
  The app will run at `http://localhost:3000`.

* **Build Configuration**:
  Build static assets for deployment:
  ```bash
  npm run build
  ```

* **Database Migrations Application**:
  Supabase migrations are located inside the `/supabase/migrations` folder. They will automatically be applied upon linking your Supabase account and executing:
  ```bash
  supabase db push
  ```

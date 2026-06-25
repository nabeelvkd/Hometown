# Location Hierarchy

Current hierarchy:

State
→ District
→ Block / Municipality
→ Village / Town

Example:

Kerala
→ Kozhikode
→ Koduvally Block
→ Omassery

Another example:

Kerala
→ Ernakulam
→ Muvattupuzha Block
→ Arakuzha

Every piece of information in the system belongs to a specific village or town.

Users select:

1. District
2. Block / Municipality
3. Village or Town

All content displayed inside the app is filtered based on the selected village.

---

# Database Collections

districts
blocks
villages
users
categories
businesses
serviceProviders
emergencyContacts
announcements
favorites
reviews
reports

---

# Village Collection

Each village belongs to a block.

Example:

{
"_id": "omassery",
"nameEnglish": "Omassery",
"nameMalayalam": "ഓമശ്ശേരി",
"districtId": "kozhikode",
"blockId": "koduvally"
}

---

# User Roles

## Super Admin

Controls the entire platform.

Responsibilities:

* Add districts
* Add blocks
* Add villages
* Approve local admins
* Manage categories
* Manage global settings

## Local Admin

Every village or town has one dedicated admin.

Example:

Omassery Admin

This admin has complete control over their locality.

Responsibilities:

* Add businesses
* Edit businesses
* Verify service providers
* Add emergency contacts
* Publish announcements
* Manage reports
* Remove incorrect information
* Feature businesses
* Moderate reviews

Local admins can only access and modify information belonging to their own village.

## Business Owner

Can manage only their own business profile.

## Service Provider

Can manage only their own profile.

## User

Can browse information and submit corrections.

---

# Ownership Model

One village or town = One Local Admin

Example:

Omassery → Admin A

Kodenchery → Admin B

Mukkam → Admin C

Each admin independently manages their locality, making the platform scalable across Kerala.

---

# Onboarding Flow

Splash Screen
→ Language Selection
→ Select District
→ Select Block
→ Select Village / Town
→ Confirm Location
→ Home Screen

The selected village is stored locally and reused during future launches.

---

# API Filtering

All APIs should filter data using:

districtId
blockId
villageId

Example:

GET /api/home?villageId=omassery

Only information belonging to Omassery should be returned.

---

# Future Expansion

Current:

State
→ District
→ Block
→ Village / Town

Future:

State
→ District
→ Block
→ Village
→ Ward

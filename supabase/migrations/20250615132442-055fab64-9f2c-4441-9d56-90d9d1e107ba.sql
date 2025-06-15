
-- Remove all rows from attendance, payments, and members tables first to avoid foreign key issues.
TRUNCATE TABLE
  attendance,
  payments,
  members,
  membership_plans,
  gyms,
  super_admin_roles
RESTART IDENTITY CASCADE;

# Usage Guide: Schema Validator Node

This documentation explains how to configure and use the **Schema Validator** node in your n8n workflows.

## 1. Node Overview

The **Schema Validator** node validates incoming JSON data against a defined set of rules. Items are automatically routed based on the result:

- **Valid (Output 0):** Items that pass all validation rules.
- **Invalid (Output 1):** Items that fail one or more validation rules.

---

## 2. Global Node Settings

### Validation Mode

| Mode | Behavior |
| :--- | :------- |
| **Abort Early** | Stops at the first failing rule and returns only that error. |
| **Collect All Errors** | Validates all rules across all fields and returns every error found. |

### Include Original Input in Output

When enabled (default), the output item retains its original JSON fields alongside the `__validationStatus` and `__validationErrors` metadata.

---

## 3. Defining the Schema

You define the validation schema by adding **Fields**. Each field targets a property in your input JSON.

### Field Name

Enter the path to the property. Use dot-notation for nested properties.

```
email                        → { "email": "..." }
user.profile.age             → { "user": { "profile": { "age": 25 } } }
```

### Field Type

| Type    | Accepts                                  |
| :------ | :--------------------------------------- |
| String  | Text values (email, uuid, regex, etc.)   |
| Number  | Numeric values                           |
| Boolean | `true` or `false`                        |
| Array   | Lists of any items                       |
| Date    | ISO date strings or timestamps (coerced) |

---

## 4. Adding Validation Rules

Inside each Field, you can add multiple **Rules** that execute sequentially.

### Rule Name

The identifier for the validation rule (e.g. `required`, `min`, `email`, `regex`).

> **Important:** If a field is optional, the `optional` rule must be the **first** rule in the list.

### Rule Parameters (JSON)

Some rules require extra parameters provided as a valid JSON object.

| Rule | Example Parameters |
| :--- | :--- |
| `min` / `max` | `{"value": 18}` |
| `regex` | `{"pattern": "^[A-Z]+$", "flags": "i"}` |
| `in` / `notIn` | `{"values": ["active", "pending"]}` |
| `same` / `different` | `{"otherField": "email_repeat"}` |
| `datetime` | `{"offset": true, "precision": 3}` |

Leave as `{}` for rules that have no parameters (e.g. `email`, `required`, `uuid`).

### Custom Error Message (Optional)

Overrides the default error message for a specific rule.

---

## 5. Understanding the Output

### When Validation Passes

The item is routed to **Output 0 (Valid)**.

```json
{
  "email": "user@example.com",
  "age": 25,
  "__validationStatus": "passed"
}
```

### When Validation Fails

The item is routed to **Output 1 (Invalid)**. The `__validationErrors` array lists every failing rule.

```json
{
  "email": "not-an-email",
  "age": 12,
  "__validationStatus": "failed",
  "__validationErrors": [
    {
      "field": "email",
      "rule": "email",
      "message": "Invalid email"
    },
    {
      "field": "age",
      "rule": "min",
      "message": "Too small: expected number to be greater than or equal to 18"
    }
  ]
}
```

---

## 6. Examples

### Example 1: Validating a User Registration Form

**Schema:**

| Field Name | Field Type | Rules |
| :--------- | :--------- | :---- |
| `name` | String | `required` |
| `email` | String | `required`, `email` |
| `age` | Number | `required`, `gte` → `{"value": 18}` |
| `role` | String | `required`, `in` → `{"values": ["admin", "editor", "viewer"]}` |

### Example 2: Validating an IP Address

Use the specific IP rule matching the version you need:

| Field Name | Field Type | Rules |
| :--------- | :--------- | :---- |
| `server_ip` | String | `required`, `ipv4` |
| `network_range` | String | `optional`, `cidrv4` |

> Use `ipv6` and `cidrv6` for IPv6 addresses.

### Example 3: Validating an Array

| Field Name | Field Type | Rules |
| :--------- | :--------- | :---- |
| `tags` | Array | `min` → `{"value": 1}`, `max` → `{"value": 10}`, `unique` |

### Example 4: Cross-Field Validation (Password Confirmation)

Use the `confirmed` rule to ensure `password` and `password_confirmation` match.

**Field 1:**

| Setting | Value |
| :------ | :---- |
| Field Name | `password` |
| Field Type | String |
| Rules | `min` → `{"value": 8}`, `confirmed` → `{}` |

**Field 2:**

| Setting | Value |
| :------ | :---- |
| Field Name | `password_confirmation` |
| Field Type | String |
| Rules | *(leave empty — it only needs to be present)* |

### Example 5: ISO Datetime with Timezone Offset

| Field Name | Field Type | Rules |
| :--------- | :--------- | :---- |
| `created_at` | String | `required`, `datetime` → `{"offset": true}` |

Valid input: `"2024-06-15T08:30:00+07:00"`

### Example 6: Cross-Field Matching (Same Value)

Use `same` to ensure two fields have identical values:

| Field Name | Field Type | Rules |
| :--------- | :--------- | :---- |
| `new_email` | String | `required`, `email`, `same` → `{"otherField": "confirm_email"}` |
| `confirm_email` | String | `required`, `email` |

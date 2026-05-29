# Validation Rules Reference

This is a quick reference guide for all the validation rules available in the **Schema Validator** node, grouped by Field Type.

## String Rules

| Rule Name      | Description                                           | JSON Parameters (`ruleParams`)             |
| :------------- | :---------------------------------------------------- | :----------------------------------------- |
| `required`     | Field must be present and non-empty.                  | `{}`                                       |
| `optional`     | Field is optional. Must be the FIRST rule if used.    | `{}`                                       |
| `min`          | Minimum character length.                             | `{"value": 5}`                             |
| `max`          | Maximum character length.                             | `{"value": 255}`                           |
| `length`       | Exact character count.                                | `{"value": 10}`                            |
| `email`        | Must be a valid email address.                        | `{}`                                       |
| `url`          | Must be a valid URL.                                  | `{}`                                       |
| `uuid`         | Must be a valid UUID (any version).                   | `{}`                                       |
| `cuid2`        | Must be a valid CUID2 identifier.                     | `{}`                                       |
| `startsWith`   | Must start with a specific string.                    | `{"value": "admin_"}`                      |
| `endsWith`     | Must end with a specific string.                      | `{"value": "@company.com"}`                |
| `includes`     | Must contain a specific substring.                    | `{"value": "keyword"}`                     |
| `regex`        | Must match a regular expression.                      | `{"pattern": "^[0-9]+$", "flags": "g"}`   |
| `lowercase`    | Must be entirely lowercase.                           | `{}`                                       |
| `uppercase`    | Must be entirely uppercase.                           | `{}`                                       |
| `trim`         | Trims leading and trailing whitespace.                | `{}`                                       |
| `alpha`        | Only alphabetic characters (a–z, A–Z).                | `{}`                                       |
| `alphanumeric` | Only letters and digits.                              | `{}`                                       |
| `numeric`      | Only numeric characters (e.g. `"123"`).              | `{}`                                       |
| `ipv4`         | Valid IPv4 address (e.g. `"192.168.0.1"`).            | `{}`                                       |
| `ipv6`         | Valid IPv6 address.                                   | `{}`                                       |
| `cidrv4`       | Valid IPv4 CIDR notation (e.g. `"192.168.0.0/24"`).  | `{}`                                       |
| `cidrv6`       | Valid IPv6 CIDR notation.                             | `{}`                                       |
| `datetime`     | Valid ISO 8601 datetime string.                       | `{"offset": true, "precision": 3}`         |
| `date`         | Valid ISO date string (`YYYY-MM-DD`).                 | `{}`                                       |
| `time`         | Valid ISO time string.                                | `{"precision": 3}`                         |
| `base64`       | Valid base64 encoded string.                          | `{}`                                       |
| `in`           | Must be one of the provided values.                   | `{"values": ["yes", "no"]}`                |
| `notIn`        | Must NOT be one of the provided values.               | `{"values": ["admin", "root"]}`            |
| `same`         | Must exactly match another field in the input.        | `{"otherField": "email_repeat"}`           |
| `different`    | Must be different from another field.                 | `{"otherField": "old_password"}`           |
| `confirmed`    | Requires a matching `[fieldname]_confirmation` field. | `{}`                                       |
| `nullable`     | Allows the value to be `null`.                        | `{}`                                       |

---

## Number Rules

| Rule Name     | Description                                        | JSON Parameters (`ruleParams`) |
| :------------ | :------------------------------------------------- | :----------------------------- |
| `required`    | Field must be present and a number.                | `{}`                           |
| `optional`    | Field is optional. Must be the FIRST rule if used. | `{}`                           |
| `min`         | Minimum value (inclusive).                         | `{"value": 1}`                 |
| `max`         | Maximum value (inclusive).                         | `{"value": 100}`               |
| `gt`          | Strictly greater than value.                       | `{"value": 0}`                 |
| `gte`         | Greater than or equal to value.                    | `{"value": 18}`                |
| `lt`          | Strictly less than value.                          | `{"value": 10}`                |
| `lte`         | Less than or equal to value.                       | `{"value": 100}`               |
| `int`         | Must be a whole number (integer).                  | `{}`                           |
| `positive`    | Must be > 0.                                       | `{}`                           |
| `nonnegative` | Must be >= 0.                                      | `{}`                           |
| `negative`    | Must be < 0.                                       | `{}`                           |
| `nonpositive` | Must be <= 0.                                      | `{}`                           |
| `safe`        | Must be within JavaScript's safe integer range.    | `{}`                           |
| `multipleOf`  | Must be a multiple of a given number.              | `{"value": 5}`                 |
| `in`          | Must be one of the allowed numbers.                | `{"values": [1, 2, 3]}`        |
| `nullable`    | Allows the value to be `null`.                     | `{}`                           |

---

## Boolean Rules

| Rule Name  | Description                                        | JSON Parameters (`ruleParams`) |
| :--------- | :------------------------------------------------- | :----------------------------- |
| `required` | Field must be present and a boolean.               | `{}`                           |
| `optional` | Field is optional. Must be the FIRST rule if used. | `{}`                           |
| `isTrue`   | Must be strictly `true`.                           | `{}`                           |
| `isFalse`  | Must be strictly `false`.                          | `{}`                           |
| `nullable` | Allows the value to be `null`.                     | `{}`                           |

---

## Array Rules

| Rule Name  | Description                                        | JSON Parameters (`ruleParams`) |
| :--------- | :------------------------------------------------- | :----------------------------- |
| `required` | Field must be present and an array.                | `{}`                           |
| `optional` | Field is optional. Must be the FIRST rule if used. | `{}`                           |
| `min`      | Minimum number of items in the array.              | `{"value": 1}`                 |
| `max`      | Maximum number of items in the array.              | `{"value": 5}`                 |
| `length`   | Exact number of items required.                    | `{"value": 3}`                 |
| `nonempty` | Must contain at least one item.                    | `{}`                           |
| `unique`   | All items must be completely unique.               | `{}`                           |
| `nullable` | Allows the value to be `null`.                     | `{}`                           |

---

## Date Rules

> Strings matching ISO date formats are coerced into `Date` objects automatically.

| Rule Name       | Description                                        | JSON Parameters (`ruleParams`) |
| :-------------- | :------------------------------------------------- | :----------------------------- |
| `required`      | Field must be present and a valid date.            | `{}`                           |
| `optional`      | Field is optional. Must be the FIRST rule if used. | `{}`                           |
| `before`        | Must be strictly before the given date.            | `{"value": "2025-01-01"}`      |
| `after`         | Must be strictly after the given date.             | `{"value": "2024-01-01"}`      |
| `beforeOrEqual` | Must be on or before the given date.               | `{"value": "2025-12-31"}`      |
| `afterOrEqual`  | Must be on or after the given date.                | `{"value": "2024-01-01"}`      |
| `nullable`      | Allows the value to be `null`.                     | `{}`                           |

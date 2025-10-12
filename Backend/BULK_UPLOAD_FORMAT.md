# Bulk User Upload - Excel Format Guide

## Excel File Format

When uploading users in bulk, you'll be prompted to select a course for ALL users in the file.

### Column Structure

| Column | Field | Required | Description | Example |
|--------|-------|----------|-------------|---------|
| A (1) | ID | Yes | 9-digit Israeli ID (or 8 digits for auto-padding) | 123456782 |
| B (2) | Email | Yes | Valid email address | student@example.com |
| C (3) | Name | Yes | Full name (Hebrew or English letters) | יוסי כהן |

### Header Row

The first row should contain headers (they will be skipped):
```
ID | Email | Name
```

### Important Notes

1. **ID Field:**
   - Must be 9 digits with valid Israeli ID checksum
   - 8-digit IDs will be automatically padded with a leading zero
   - Invalid IDs will be reported in the error PDF

2. **Course Assignment (NEW!):**
   - **Before uploading**, a popup will ask you to select a course for ALL users
   - You can:
     - Select an existing course from the dropdown
     - Create a new course on the fly
     - Leave blank (no course assignment)
   - Default course is "Math" if it exists
   - All users in the Excel file will be assigned to the selected course

3. **Automatic Features:**
   - Password is automatically set to the user's ID
   - Role is automatically set to "Examinee"
   - Email invitations are sent automatically
   - Error reports are generated as PDF if issues occur

### Example Excel File

```
ID          | Email                | Name        
123456782   | yossi@example.com   | יוסי כהן   
987654321   | sara@example.com    | שרה לוי    
12345678    | david@example.com   | דוד ישראלי 
234567890   | rachel@example.com  | רחל כהן    
```

**When you upload this file:**
1. A popup will appear asking "לאיזה קורס תרצה להקצות את התלמידים מקובץ ה-Excel?"
2. You select a course (or create a new one)
3. All 4 users will be assigned to that course
4. If you select "No Course", all users will have CourseID = NULL

### Error Handling

If there are any errors or warnings during upload:
- A detailed PDF report will be generated
- The report includes:
  - Table 1: Rows that failed validation (not added)
  - Table 2: Rows where ID was auto-padded (added successfully, but verify with student)
  - Summary statistics

### API Endpoint

**POST** `/api/user/upload`
- Content-Type: `multipart/form-data`
- Fields:
  - `file`: Excel file (.xlsx)
  - `courseId`: (Optional) The CourseID to assign to all users


# Course Cascade Delete Implementation

## Problem
When deleting a course that has topics, the database throws a foreign key constraint error:
```
ER_ROW_IS_REFERENCED_2: Cannot delete or update a parent row: a foreign key constraint fails
```

## Solution
Added `ON DELETE CASCADE` to the `topic->course` foreign key constraint. This ensures that when a course is deleted, all related topics (and their nested content) are automatically deleted.

## Changes Made

### 1. SQL Migration Files
Two SQL migration files were created:

- **`add-course-cascade-delete.sql`** - Dynamic version that finds the constraint name automatically
- **`add-course-cascade-delete-simple.sql`** - Simple version assuming default constraint name `topic_ibfk_1`

### 2. Backend Code Updates
Updated `Backend/controllers/coursesDataController.js`:
- Added course existence check before deletion
- Added topic count reporting for informational purposes
- Improved error handling with specific messages for foreign key constraint errors
- Better logging for debugging

## How to Apply

### Option 1: Use the Simple Script (Recommended if constraint name is `topic_ibfk_1`)
```bash
mysql -u your_username -p your_database_name < Backend/sql/add-course-cascade-delete-simple.sql
```

### Option 2: Use the Dynamic Script (If constraint name is different)
```bash
mysql -u your_username -p your_database_name < Backend/sql/add-course-cascade-delete.sql
```

### Option 3: Manual Application
1. Find your constraint name:
   ```sql
   SELECT CONSTRAINT_NAME 
   FROM information_schema.KEY_COLUMN_USAGE 
   WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'topic' 
     AND COLUMN_NAME = 'CourseID' 
     AND REFERENCED_TABLE_NAME = 'course';
   ```

2. Drop and recreate the constraint:
   ```sql
   ALTER TABLE topic DROP FOREIGN KEY <constraint_name>;
   ALTER TABLE topic 
   ADD CONSTRAINT fk_topic_course 
   FOREIGN KEY (CourseID) REFERENCES course(CourseID) 
   ON DELETE CASCADE;
   ```

## Verification

After applying the migration, verify it worked:

```sql
SHOW CREATE TABLE topic;
```

You should see `ON DELETE CASCADE` in the foreign key definition.

## Cascade Chain

With this change, deleting a course will cascade delete:
1. **Course** → All **Topics** in that course
2. **Topics** → All **practice_exercise** records (already has CASCADE)
3. **Topics** → All **practice_video** records (already has CASCADE)
4. **Topics** → All **exam_question** records (already has CASCADE)

## Testing

After applying the migration, test by:
1. Creating a course with topics
2. Adding practice exercises/videos to those topics
3. Deleting the course
4. Verifying all related data was deleted

## Notes

- The `Users` table also has a `CourseID` column, but it's nullable and likely doesn't have a foreign key constraint. If it does, you may want to set it to `ON DELETE SET NULL` instead of `CASCADE` to preserve user records.
- The backend code now provides better error messages if the cascade isn't working properly.


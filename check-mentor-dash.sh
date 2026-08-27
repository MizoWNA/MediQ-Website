#!/usr/bin/env bash

FILE="components/mentorship/mentor-dashboard.tsx"

if [[ ! -f "$FILE" ]]; then
  echo "❌ Could not find $FILE"
  echo "Run this script from the project root."
  exit 1
fi

echo
echo "============================================================"
echo "   MediQ Mentor Dashboard — Schema Reference Check"
echo "============================================================"
echo
echo "File: $FILE"
echo

check_pattern() {
  local label="$1"
  local pattern="$2"

  echo "------------------------------------------------------------"
  echo "$label"
  echo "------------------------------------------------------------"

  if grep -nE "$pattern" "$FILE"; then
    echo
  else
    echo "✓ None found"
    echo
  fi
}

echo "OLD TASK COLUMNS"
echo

check_pattern \
  "tasks.subject / .subject references" \
  '\b(subject|tasks\.subject)\b'

check_pattern \
  "tasks.type / .type references" \
  '\b(type|tasks\.type)\b'

echo "OLD TASK FORM FIELDS"
echo

check_pattern \
  "taskForm.subject" \
  'taskForm\.subject([^_]|\b)'

check_pattern \
  "taskForm.type" \
  'taskForm\.type([^_]|\b)'

echo "OLD DATABASE SELECT COLUMNS"
echo

check_pattern \
  "select() containing subject" \
  '\.select\([^)]*subject'

check_pattern \
  "select() containing type" \
  '\.select\([^)]*type'

echo "OLD DATABASE WRITE FIELDS"
echo

check_pattern \
  "database writes using subject:" \
  '^[[:space:]]*subject[[:space:]]*:'

check_pattern \
  "database writes using type:" \
  '^[[:space:]]*type[[:space:]]*:'

echo "CORRECT NEW SCHEMA REFERENCES"
echo

check_pattern \
  "subject_id references" \
  'subject_id'

check_pattern \
  "task_type_id references" \
  'task_type_id'

echo "RELATIONSHIP QUERIES"
echo

check_pattern \
  "subjects relationship" \
  'subjects'

check_pattern \
  "task_types relationship" \
  'task_types'

echo
echo "============================================================"
echo "   FULL TASK-RELATED LINES"
echo "============================================================"
echo

grep -nEi \
  'tasks|taskForm|subject|type|task_type' \
  "$FILE" \
  | sed -n '1,240p'

echo
echo "============================================================"
echo "   DONE"
echo "============================================================"
echo
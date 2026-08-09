def generate_schedule(subjects: list, hours_per_day: int, weaknesses: list = None):

    if not subjects:
        return {
            "message": "No subjects available to generate schedule"
        }

    if weaknesses is None:
        weaknesses = []

    schedule = []

    # -------------------------
    # Split subjects
    # -------------------------
    strong_subjects = [s for s in subjects if s not in weaknesses]

    # 60% time for weak subjects
    weak_hours = int(hours_per_day * 0.6)
    strong_hours = hours_per_day - weak_hours

    weak_each = weak_hours // max(len(weaknesses), 1)
    strong_each = strong_hours // max(len(strong_subjects), 1)

    # -------------------------
    # Time slots
    # -------------------------
    start_hour = 8
    current_hour = start_hour

    # -------------------------
    # Weak subjects first
    # -------------------------
    for subject in weaknesses:

        schedule.append({
            "subject": subject,
            "start_time": f"{current_hour}:00",
            "duration_hours": weak_each,
            "focus": "Improve weak topic"
        })

        current_hour += weak_each

    # -------------------------
    # Strong subjects
    # -------------------------
    for subject in strong_subjects:

        schedule.append({
            "subject": subject,
            "start_time": f"{current_hour}:00",
            "duration_hours": strong_each,
            "focus": "Practice / revision"
        })

        current_hour += strong_each

    # -------------------------
    # Add revision session
    # -------------------------
    if weaknesses:

        revision_subject = weaknesses[0]

        schedule.append({
            "subject": revision_subject,
            "start_time": f"{current_hour}:00",
            "duration_hours": 1,
            "focus": "Revision session"
        })

    return schedule

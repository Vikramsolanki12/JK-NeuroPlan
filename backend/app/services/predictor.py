from collections import defaultdict


def analyze_study_data(tasks, timetable):

    strengths = []
    weaknesses = []
    topics_to_improve = []
    study_plan = []
    revision_plan = []
    insights = []

    heatmap = defaultdict(int)
    best_time = None

    if not tasks:
        return {
            "focus_score": 0,
            "strengths": [],
            "weaknesses": [],
            "topics_to_improve": [],
            "study_plan": ["Add tasks to generate insights"],
            "revision_plan": [],
            "study_heatmap": {},
            "best_study_hour": None,
            "insights": ["No study data available yet"]
        }

    subject_completion = defaultdict(lambda: {"done": 0, "total": 0})
    completed_tasks = 0

    # -------------------------
    # Analyze tasks
    # -------------------------
    for task in tasks:

        subject = (task.get("subject") or "general").lower()
        date = task.get("date")

        subject_completion[subject]["total"] += 1

        if task.get("done"):
            subject_completion[subject]["done"] += 1
            completed_tasks += 1

            if date:
                heatmap[str(date)] += 1

    total_tasks = max(len(tasks), 1)

    # -------------------------
    # Focus score
    # -------------------------
    focus_score = round((completed_tasks / total_tasks) * 100, 2)

    # -------------------------
    # Strengths / weaknesses
    # -------------------------
    for subject, stats in subject_completion.items():

        completion_rate = stats["done"] / stats["total"]

        if completion_rate >= 0.7:
            strengths.append(subject)

        elif completion_rate <= 0.4:
            weaknesses.append(subject)
            topics_to_improve.append(subject)

    # -------------------------
    # AI Study Plan
    # -------------------------
    for subject in weaknesses:

        study_plan.extend([
            f"Revise fundamentals of {subject}",
            f"Solve practice problems for {subject}",
            f"Schedule a focused revision session for {subject}"
        ])

    # -------------------------
    # AI Revision Planner
    # -------------------------
    day = 1

    for topic in topics_to_improve:

        revision_plan.append({
            "day": f"Day {day}",
            "task": f"Revise core concepts of {topic}"
        })

        revision_plan.append({
            "day": f"Day {day}",
            "task": f"Practice exercises for {topic}"
        })

        day += 1

    # -------------------------
    # Analyze timetable
    # -------------------------
    if timetable:

        daily = timetable.get("daily", [])

        if daily:

            hour_count = defaultdict(int)

            for session in daily:

                time = session.get("time")

                if time and ":" in time:

                    hour = int(time.split(":")[0])
                    hour_count[hour] += 1

            if hour_count:
                best_time = max(hour_count, key=hour_count.get)

    # -------------------------
    # AI Insights
    # -------------------------
    if strengths:
        insights.append(
            f"You are performing well in {', '.join(strengths)}."
        )

    if weaknesses:
        insights.append(
            f"Spend more time practicing {', '.join(weaknesses)}."
        )

    if best_time is not None:
        insights.append(
            f"Your most active study time appears around {best_time}:00."
        )

    if len(tasks) < 5:
        insights.append(
            "Add more study data to improve AI accuracy."
        )

    if focus_score >= 80:
        insights.append(f"Excellent focus score ({focus_score}%). Keep it up!")
    elif focus_score >= 60:
        insights.append(f"Good focus score ({focus_score}%). Maintain consistency.")
    elif focus_score >= 40:
        insights.append(f"Moderate focus score ({focus_score}%). Completing more tasks will help.")
    else:
        insights.append(f"Low focus score ({focus_score}%). Consider restructuring your study plan.")

    # -------------------------
    # Final result
    # -------------------------
    return {
        "focus_score": focus_score,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "topics_to_improve": topics_to_improve,
        "study_plan": study_plan,
        "revision_plan": revision_plan,
        "study_heatmap": dict(heatmap),
        "best_study_hour": best_time,
        "insights": insights
    }
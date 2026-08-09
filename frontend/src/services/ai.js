export async function getAISolutions(tasks) {

  const res = await fetch("http://localhost:8000/recommendations", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      tasks
    })

  });

  return await res.json();

}

export async function getAITimetable(tasks) {

  const res = await fetch("http://localhost:8000/ai-schedule", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      tasks
    })

  });

  return await res.json();

}

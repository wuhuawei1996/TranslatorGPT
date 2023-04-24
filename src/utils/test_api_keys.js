import axios from "axios";

const gpt3 = async (key) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };

  const data = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: "Say this is a test!" }],
    temperature: 0.7,
  };
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      data,
      { headers }
    );
    const reply = response.data.choices[0].message;
    if (reply) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error(err);
    return false;
  }
};

export default { gpt3 };

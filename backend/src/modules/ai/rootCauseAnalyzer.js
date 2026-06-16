class RootCauseAnalyzer {
  constructor() {
    this.geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    this.openAiUrl = "https://api.openai.com/v1/chat/completions";
  }


  async analyze(prompt) {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    if (!geminiKey && !openAiKey) {
      throw new Error("AI analysis failed: Neither GEMINI_API_KEY nor OPENAI_API_KEY is configured in the environment");
    }

    let rawResponseText = "";

    try {
      if (geminiKey) {
        rawResponseText = await this._callGemini(prompt, geminiKey);
      } else if (openAiKey) {
        rawResponseText = await this._callOpenAi(prompt, openAiKey);
      }

      return this._parseJson(rawResponseText);
    } catch (error) {
      throw new Error(`AI Analysis API call failed: ${error.message}`);
    }
  }

  async _callGemini(prompt, apiKey) {
    const endpoint = `${this.geminiUrl}?key=${apiKey}`;
    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {

        responseMimeType: "application/json",
        temperature: 0.1
      }
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      throw new Error(`Gemini API returned status ${response.status}: ${errorDetail}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async _callOpenAi(prompt, apiKey) {
    const payload = {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],

      response_format: { type: "json_object" },
      temperature: 0.1
    };

    const response = await fetch(this.openAiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      throw new Error(`OpenAI API returned status ${response.status}: ${errorDetail}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  _parseJson(text) {
    if (!text) {
      throw new Error("LLM output is empty");
    }

    let cleanText = text.trim();


    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanText = jsonMatch[0];
    }

    try {
      return JSON.parse(cleanText);
    } catch (err) {
      console.error("Failed to parse raw LLM JSON text: ", text);
      throw new Error(`LLM output was not valid JSON: ${err.message}`);
    }
  }
}

module.exports = new RootCauseAnalyzer();

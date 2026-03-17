const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function detectLanguage(text) {
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  return vietnamesePattern.test(text) ? "Vietnamese" : "English";
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (request.method !== "POST") {
      return new Response(null, { status: 405 });
    }

    try {
      const { chatContent } = await request.json();

      const detectedLanguage = detectLanguage(String(chatContent));

      const response = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
        messages: [
          {
            role: "system",
            content: `You are a CRM data extractor analyzing a sales chat. The chat language is ${detectedLanguage}. Extracted string values MUST be in ${detectedLanguage}.
Task: Extract structured data from the chat.
Return ONLY valid JSON with this exact schema:
{
  "customer_name": "string (the customer's name, or null if absolutely unknown)",
  "customer_phone": "string (the customer's phone number as digits only, or null if not mentioned)",
  "customer_email": "string (the customer's email address, or null if not mentioned)",
  "customer_address": "string (the customer's physical or shipping address, or null if not mentioned)",
  "job_title": "string (the customer's profession or title, or null)",
  "company": "string (the customer's company or business name, or null)",
  "source": "string (the platform or social network they are messaging from, or null)",
  "intent": "string (the customer's main goal or what they want to buy)",
  "pain_points": "string (the specific problems or challenges the customer is facing, or null)",
  "budget": "integer (estimated budget, 0 if unknown)",
  "ai_summary": "string (max 2 sentences summarizing the key points)",
  "sentiment": "string (strictly 'POSITIVE', 'NEGATIVE', or 'NEUTRAL')",
  "sales_score": "integer 1-10 (rating the sales rep's performance based on politeness and communication)"
}
Do not use markdown wrappers like \`\`\`json. Only output raw JSON data.`,
          },
          {
            role: "user",
            content: String(chatContent),
          },
        ],
      });

      let rawOutput = response.response.trim();
      
      // Strip markdown code blocks if the AI stubbornly adds them
      if (rawOutput.startsWith("```json")) {
        rawOutput = rawOutput.replace(/^```json\\n?/i, "");
      }
      if (rawOutput.startsWith("```")) {
        rawOutput = rawOutput.replace(/^```\\n?/i, "");
      }
      if (rawOutput.endsWith("```")) {
        rawOutput = rawOutput.replace(/\\n?```$/i, "");
      }
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(rawOutput.trim());
      } catch (parseError) {
        // Fallback if the AI utterly failed to return valid JSON
        parsedResponse = {
          error_parsing: true,
          raw_response: response.response,
          note: "Hệ thống AI trả về dữ liệu không chuẩn JSON. Vui lòng tự điều chỉnh bên dưới."
        };
      }

      return new Response(JSON.stringify(parsedResponse), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }
  },
};

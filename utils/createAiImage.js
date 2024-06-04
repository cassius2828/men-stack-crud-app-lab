const axios = require("axios");
// env setup
const dotenv = require("dotenv");
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// returns image_url
async function createAiImage(
  style,
  mainColor,
  dimensions,
  medium,
  title,
  description
) {
  const prompt = `Generate an image in the style of ${style}. The main color of the image should be ${mainColor}. The dimensions of the image should be ${dimensions} orientation. The medium used should be ${medium}. The image should be titled "${title}" and described as "${description}". Ensure the image captures the essence of the specified style, medium, and color while adhering to the given title and description.`;
  const payload = {
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
  };
  const headers = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
  };
  let isLoading = false;
  try {
    isLoading = true;
    const response = await axios.post(
      "https://api.openai.com/v1/images/generations",
      payload,
      headers
    );
    // ! review this
    if (response.data && response.data.data && response.data.data.length > 0) {
      const imageUrl = response.data.data[0].url;
      return imageUrl.toString();
    } else {
      console.error("No image URL found in the response");
      return null;
    }
  } catch (error) {
    console.error(
      `Error trying to generate image: `,
      error.response ? error.response.data : error.message, OPENAI_API_KEY
    );
    return null;
  } finally {
    isLoading = false;
  }
}

module.exports = createAiImage;

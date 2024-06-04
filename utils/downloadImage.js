const axios = require("axios");

// download image to server
async function downloadImage(url, dest) {
  const response = await axios({
    url,
    responseType: "stream",
  });
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(dest);
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

module.exports = downloadImage;

const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const CanvasModel = require("../models/canvas");
const downloadImage = require('../utils/downloadImage')
// env setup
const dotenv = require("dotenv");
dotenv.config();

// AWS S3 BUCKET
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

// NEW S3CLIENT INSTANCE
const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// action to replace the tempUrl with a permanent url from s3 bucket
async function replaceTempUrlWithS3Url(req, res, id) {
  const { tempUrl } = req.body;
  const fileName = `image_${Date.now()}.png`;
  const filePath = path.join(__dirname, "uploads", fileName);
  try {
    await downloadImage(tempUrl, filePath);
    const uploadParams = {
      Bucket: S3_BUCKET_NAME,
      Key: fileName,
      Body: fs.createReadStream(filePath),
      ACL: "public-read",
    };
    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    console.log(data);
    const newImageUrl = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;
    await CanvasModel.findByIdAndUpdate({ _id: id, img: newImageUrl });
    console.log("Updated canvas with new URL:", newImageUrl);
    fs.unlinkSync(filePath); // Clean up local file
  } catch (error) {
    console.error(
      `Error updating document with permanent link from S3 bucket: ${error}`
    );
  }
}

module.exports = replaceTempUrlWithS3Url;

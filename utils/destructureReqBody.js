const createAiImage = require("./createAiImage");
const CanvasModel = require("../models/canvas");

async function destructureReqBody(reqBody) {
  const { style, mainColor, dimensions, title, description, medium } = reqBody;
  const selectedCanvas = await CanvasModel.findOne({
    description: description,
  });
  // if there is an img present and the length of it is more than
  //  0 then do NOT create a new img, use the original one
  if (selectedCanvas?.img && selectedCanvas?.img.length > 0) {
    const newCanvasData = {
      style,
      img: selectedCanvas.img,
      mainColor,
      dimensions,
      title,
      description,
      medium,
    };
    return newCanvasData;
  }
  // otherwise create a new img
  else {
    const img = await createAiImage(
      style,
      mainColor,
      dimensions,
      medium,
      title,
      description
    );
    const newCanvasData = {
      style,
      img,
      mainColor,
      dimensions,
      title,
      description,
      medium,
    };
    return newCanvasData;
  }
}

module.exports = destructureReqBody;
/*
A modern 2022 cube styled luxury home with a tesla cybertruck styled vehicle in front of the garage. The setting is dusk with the faint porch lights on
*/
const client = require('../config/openaiConfig');
const fs = require('fs');

const generateAnswer = async (req, res) => {

  //Sets up the Variables to pass the AI the Message
  let system = "a " + req.body.system + " shower system ";
  let glass = "with " + req.body.glass + " glass, ";
  let handle = "a " + req.body.handle + " handle, ";
  let hinge = "a " + req.body.hinge + " door hinge design, ";
  let bracket = "a " + req.body.bracket + " clamp and bracket design, ";
  let finish = "and the hardware with a " + req.body.finish + " finish.";

  let prompt = "Default";

  //Adjust if it is a sliding door to remove Door Hinge
  if(req.body.system == "Sliding")
  {
      prompt = "Edit the image to use " + system + glass + handle + hinge + bracket + finish + " Remove any bottles in the shower enclosure. Do not add any new hardware not requested.";
  }
  else {

      prompt = "Edit the image to use " + system + glass + handle + bracket + finish + " Remove any bottles in the shower enclosure. Do not add any new hardware not requested.";
  }


  let image = req.body.image;

  let base64Image1 = image;
  let imageIndex = req.body.imageIndex;

  console.log(prompt);

  //Message Sent off to the AI
  let response = await client.responses.create({
    model: "gpt-5.6-luna",
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: prompt},
          {
            type: "input_image",
            image_url: `data:image/png;base64,${base64Image1}`,
            detail: "auto",
          }
        ],
      },
    ],
    tools: [{ type: "image_generation", action: "edit", quality: "low" }],
  });

  //Parse AI response
  let imageData = response.output
    .filter((output) => output.type === "image_generation_call")
    .map((output) => output.result);

  //Send back Finished Image and data to Server
  if (imageData.length > 0) {

    let imageBase64 = imageData[0];
    fs.writeFileSync("public/FinishedExample" + imageIndex + ".png", Buffer.from(imageBase64, "base64"))
    res.json({
      imgPath: "/FinishedExample" + imageIndex + ".png"
    })

  } else {
    console.log(response.output_text);
  }
}
  
module.exports = { generateAnswer }
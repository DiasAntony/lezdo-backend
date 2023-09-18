const Service = require("../model/service");

exports.createService = async (req, res) => {
  const { services } = req.body;

  //   Validation
  if (!services) {
    res.status(400);
    throw new Error("Please select the services");
  }

  try {
    const service = await Service.create({
      services,
    });

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: "service required!!" });
  }
};

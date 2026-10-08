import Marquee from "../models/Marquee.js";

/*
|--------------------------------------------------------------------------
| Get Public Marquee
|--------------------------------------------------------------------------
| Returns only the active marquee.
*/

export const getMarquee = async (req, res) => {
  try {
    const marquee = await Marquee.findOne({
      isActive: true,
    })
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: marquee || null,
    });
  } catch (error) {
    console.error("Get Marquee Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch marquee.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Admin Marquee
|--------------------------------------------------------------------------
| Returns the latest marquee whether active or inactive.
*/

export const getAdminMarquee = async (req, res) => {
  try {
    const marquee = await Marquee.findOne()
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: marquee || null,
    });
  } catch (error) {
    console.error(
      "Get Admin Marquee Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin marquee.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Create Marquee
|--------------------------------------------------------------------------
| Only one marquee is maintained.
*/

export const createMarquee = async (req, res) => {
  try {
    const {
      text,
      link = "",
      isActive = true,
    } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Marquee text is required.",
      });
    }

    const existingMarquee =
      await Marquee.findOne();

    if (existingMarquee) {
      return res.status(409).json({
        success: false,
        message:
          "Marquee already exists. Please update the existing marquee.",
        data: existingMarquee,
      });
    }

    const marquee = await Marquee.create({
      text: text.trim(),
      link: link?.trim() || "",
      isActive: Boolean(isActive),
    });

    return res.status(201).json({
      success: true,
      message: "Marquee created successfully.",
      data: marquee,
    });
  } catch (error) {
    console.error(
      "Create Marquee Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create marquee.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update Marquee
|--------------------------------------------------------------------------
*/

export const updateMarquee = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      text,
      link = "",
      isActive,
    } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Marquee text is required.",
      });
    }

    const marquee =
      await Marquee.findByIdAndUpdate(
        id,
        {
          text: text.trim(),
          link: link?.trim() || "",
          isActive: Boolean(isActive),
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!marquee) {
      return res.status(404).json({
        success: false,
        message: "Marquee not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Marquee updated successfully.",
      data: marquee,
    });
  } catch (error) {
    console.error(
      "Update Marquee Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update marquee.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Delete Marquee
|--------------------------------------------------------------------------
*/

export const deleteMarquee = async (req, res) => {
  try {
    const { id } = req.params;

    const marquee =
      await Marquee.findByIdAndDelete(id);

    if (!marquee) {
      return res.status(404).json({
        success: false,
        message: "Marquee not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Marquee deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Marquee Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete marquee.",
    });
  }
};
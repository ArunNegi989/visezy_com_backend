import Slider from "../models/Slider.js";
import fs from "fs";

// ===================================================
// CREATE SLIDER
// ===================================================

export const createSlider = async (req, res) => {

    try {

        const {

            badge,

            title,

            highlightText,

            remainingTitle,

            description,

            primaryButtonText,

            primaryButtonLink,

            secondaryButtonText,

            secondaryButtonLink,

            features,

            status,

        } = req.body;

        if (
            !badge ||
            !title ||
            !highlightText ||
            !remainingTitle ||
            !description
        ) {

            return res.status(400).json({

                success: false,

                message: "Please fill all required fields."

            });

        }

        if (!req.file && !req.body.image) {
            return res.status(400).json({
                success: false,
                message: "Please upload image or enter image URL."
            });
        }
        const total = await Slider.countDocuments();

        const slider = await Slider.create({

            badge,

            title,

            highlightText,

            remainingTitle,

            description,

            primaryButtonText,

            primaryButtonLink,

            secondaryButtonText,

            secondaryButtonLink,

            features: features
                ? features
                    .split(",")
                    .map((item) => item.trim())
                : [],

            image: req.file
                ? req.file.path.replace(/\\/g, "/").replace("src/", "")
                : req.body.image,

            order: total + 1,

            status,

        });

        return res.status(201).json({

            success: true,

            message: "Slider created successfully.",

            slider,

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};

// ===================================================
// GET ALL SLIDERS
// ===================================================

export const getSliders = async (req, res) => {

    try {

        const sliders = await Slider
            .find()
            .sort({
                order: 1
            });

        return res.json({

            success: true,

            total: sliders.length,

            sliders,

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};

// ===================================================
// GET SINGLE SLIDER
// ===================================================

export const getSliderById = async (req, res) => {

    try {

        const slider = await Slider.findById(req.params.id);

        if (!slider) {

            return res.status(404).json({

                success: false,

                message: "Slider not found."

            });

        }

        return res.json({

            success: true,

            slider,

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};

// ===================================================
// UPDATE SLIDER
// ===================================================

export const updateSlider = async (req, res) => {

    try {

        const slider = await Slider.findById(req.params.id);

        if (!slider) {

            return res.status(404).json({
                success: false,
                message: "Slider not found."
            });

        }

        const {
            badge,
            title,
            highlightText,
            remainingTitle,
            description,
            primaryButtonText,
            primaryButtonLink,
            secondaryButtonText,
            secondaryButtonLink,
            features,
            status,
        } = req.body;

        slider.badge = badge;
        slider.title = title;
        slider.highlightText = highlightText;
        slider.remainingTitle = remainingTitle;
        slider.description = description;
        slider.primaryButtonText = primaryButtonText;
        slider.primaryButtonLink = primaryButtonLink;
        slider.secondaryButtonText = secondaryButtonText;
        slider.secondaryButtonLink = secondaryButtonLink;
        slider.status = status;

        slider.features = features
            ? features
                .split(",")
                .map((item) => item.trim())
            : [];

        const { image: imageUrl, removeImage } = req.body;

        if (removeImage === "true") {

            if (
                slider.image &&
                !slider.image.startsWith("http") &&
                fs.existsSync(slider.image)
            ) {
                fs.unlinkSync(slider.image);
            }

            slider.image = "";
        }

        if (req.file) {

            if (
                slider.image &&
                !slider.image.startsWith("http") &&
                fs.existsSync(slider.image)
            ) {
                fs.unlinkSync(slider.image);
            }

            slider.image = req.file.path
                .replace(/\\/g, "/")
                .replace("src/", "");

        } else if (imageUrl?.trim()) {

            if (
                slider.image &&
                !slider.image.startsWith("http") &&
                fs.existsSync(slider.image)
            ) {
                fs.unlinkSync(slider.image);
            }

            slider.image = imageUrl.trim();
        }
        await slider.save();

        return res.json({

            success: true,

            message: "Slider updated successfully.",

            slider,

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};

// ===================================================
// DELETE SLIDER
// ===================================================

export const deleteSlider = async (req, res) => {

    try {

        const slider = await Slider.findById(req.params.id);

        if (!slider) {

            return res.status(404).json({

                success: false,

                message: "Slider not found."

            });

        }

        if (
            slider.image &&
            fs.existsSync(slider.image)
        ) {

            fs.unlinkSync(slider.image);

        }

        await slider.deleteOne();

        // Reorder Remaining Sliders

        const sliders = await Slider
            .find()
            .sort({ order: 1 });

        for (let i = 0; i < sliders.length; i++) {

            sliders[i].order = i + 1;

            await sliders[i].save();

        }

        return res.json({

            success: true,

            message: "Slider deleted successfully."

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};

export const moveSliderDown = async (req, res) => {

    try {

        const slider = await Slider.findById(req.params.id);

        if (!slider) {
            return res.status(404).json({
                success: false,
                message: "Slider not found",
            });
        }

        const next = await Slider.findOne({
            order: slider.order + 1,
        });

        if (!next) {
            return res.status(404).json({
                success: false,
                message: "Next slider not found",
            });
        }

        const currentOrder = slider.order;

        // Step 1
        slider.order = -1;
        await slider.save();

        // Step 2
        next.order = currentOrder;
        await next.save();

        // Step 3
        slider.order = currentOrder + 1;
        await slider.save();

        return res.json({
            success: true,
            message: "Moved Down",
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};
export const moveSliderUp = async (req, res) => {

    try {

        const slider = await Slider.findById(req.params.id);

        if (!slider) {
            return res.status(404).json({
                success: false,
                message: "Slider not found",
            });
        }

        const previous = await Slider.findOne({
            order: slider.order - 1,
        });

        if (!previous) {
            return res.status(404).json({
                success: false,
                message: "Previous slider not found",
            });
        }

        const currentOrder = slider.order;

        slider.order = -1;
        await slider.save();

        previous.order = currentOrder;
        await previous.save();

        slider.order = currentOrder - 1;
        await slider.save();

        return res.json({
            success: true,
            message: "Moved Up",
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};
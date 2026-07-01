import Blog from "../models/Blog.js";
import Slider from "../models/Slider.js";
import Contact from "../models/Contact.js";
import Career from "../models/career.js";

export const getDashboard = async (req, res) => {
    try {


        const now = new Date();

        const startOfMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        const startOfLastMonth = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1
        );

        const endOfLastMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            0
        );

        const [
            totalBlogs,
            totalSlides,
            totalContacts,
            totalCareers,
            unreadContacts,

            totalViews,

            publishedBlogs,
            draftBlogs,

            thisMonthBlogs,
            lastMonthBlogs,

            recentBlogs,
            recentContacts,
            recentSliders,

        ] = await Promise.all([

            Blog.countDocuments(),

            Slider.countDocuments(),

            Contact.countDocuments(),

            Career.countDocuments(),

            Contact.countDocuments({
                isRead: false,
            }),

            Blog.aggregate([
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$views",
                        },
                    },
                },
            ]),

            Blog.countDocuments({
                status: "Published",
            }),

            Blog.countDocuments({
                status: "Draft",
            }),

            Blog.countDocuments({
                createdAt: {
                    $gte: startOfMonth,
                },
            }),

            Blog.countDocuments({
                createdAt: {
                    $gte: startOfLastMonth,
                    $lte: endOfLastMonth,
                },
            }),

            Blog.find()
                .sort({
                    createdAt: -1,
                })
                .limit(5)
                .select(
                    "title category status createdAt"
                )
                .lean(),

            Contact.find()
                .sort({
                    createdAt: -1,
                })
                .limit(5)
                .select(
                    "fullName createdAt"
                )
                .lean(),

            Slider.find()
                .sort({
                    createdAt: -1,
                })
                .limit(5)
                .select(
                    "title createdAt"
                )
                .lean(),

        ]);

        let growth = 0;

        if (lastMonthBlogs === 0) {

            growth =
                thisMonthBlogs > 0
                    ? 100
                    : 0;

        } else {

            growth = Math.round(

                ((thisMonthBlogs - lastMonthBlogs) /
                    lastMonthBlogs) *
                100

            );

        }
        const activities = [

            ...recentBlogs.map((blog) => ({
                type: "blog",
                title: "New Blog Published",
                description: blog.title,
                createdAt: blog.createdAt,
            })),

            ...recentContacts.map((contact) => ({
                type: "contact",
                title: "New Contact Lead",
                description: `${contact.fullName} submitted contact form`,
                createdAt: contact.createdAt,
            })),

            ...recentSliders.map((slider) => ({
                type: "slider",
                title: "Hero Banner Updated",
                description: slider.title,
                createdAt: slider.createdAt,
            })),

        ]

            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )
            .slice(0, 3);

        return res.status(200).json({

            success: true,

            stats: {

                blogs: totalBlogs,

                slides: totalSlides,

                contacts: totalContacts,

                careers: totalCareers,

                unreadContacts,

                publishedBlogs,

                draftBlogs,

                growth,

                views:
                    totalViews.length
                        ? totalViews[0].total
                        : 0,

            },

            recentBlogs,

            activities,
            analytics: {

                blogs: {

                    published: publishedBlogs,

                    draft: draftBlogs,

                },

                contacts: {

                    total: totalContacts,

                    unread: unreadContacts,

                },

                careers: totalCareers,

            }
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }
};
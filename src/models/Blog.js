import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {

    title:{
      type:String,
      required:true,
      trim:true
    },

    slug:{
      type:String,
      required:true,
      unique:true,
      lowercase:true
    },

    shortDescription:{
      type:String,
      required:true
    },

    content:{
      type:String,
      required:true
    },

    thumbnail:{
      type:String,
      default:""
    },

   
    category:{
      type:String,
      default:"General"
    },

    tags:[String],

    author:{
      type:String,
      default:"Admin"
    },

    readingTime:{
      type:String,
      default:""
    },

    seoTitle:String,

    seoDescription:String,

    featured:{
      type:Boolean,
      default:false
    },

    views:{
      type:Number,
      default:0
    },

    status:{
      type:String,
      enum:["Draft","Published"],
      default:"Draft"
    }

  },
  {
    timestamps:true
  }
);

export default mongoose.model(
    "Blog",
    BlogSchema
);
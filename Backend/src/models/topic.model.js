const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
    {
        name : {
            type : String,
            required : true,
            unique : true,
            trim : true,
        },

        category : {
            type : String,
            required : true,
            trim : true,
        },

        description : {
            type : String,
            required : true,
            trim : true,
        },
        views: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps : true,
    }
);


module.exports = mongoose.model("Topic", topicSchema)
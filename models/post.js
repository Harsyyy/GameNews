const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const URLSlugs = require('mongoose-url-slugs');
const tr = require('transliter');

const schema = new Schema(
{
    title: {
        type: String,
        required: true
    },
    body:{
        type: String,
    },
    owner: { //идентифицируем пользователя для поста
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
},  
    {
        timestamps: true,
    }
);

schema.plugin(
    URLSlugs('title', {
        field: 'url',
        generator: text => tr.slugify(text) //этот плагин уже создаёт уникальный url, поэтому прописывать уник не нужно
    })
);
schema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model('Post', schema);
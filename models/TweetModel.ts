import {model, Schema, Document} from 'mongoose'

export interface TweetSchemaInterface {
    _id?: string,
    text: string,
    user: any
}

export type TweetSchemaType = TweetSchemaInterface & Document

 const TweetSchema = new Schema<TweetSchemaInterface>({
     text: {
         required: true,
         type: String,
         maxlength: 280
     },
     user: {
         required: true,
         ref: 'User',
         type: Schema.Types.ObjectId
     }
 }, {
     timestamps: true
 })


export const TweetModel = model<TweetSchemaType>('Tweet', TweetSchema)
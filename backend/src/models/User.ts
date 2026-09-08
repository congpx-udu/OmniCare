import { Schema, model, type InferSchemaType } from 'mongoose'

const userSchema = new Schema(
  {
    // Số điện thoại là định danh đăng nhập chính (chuẩn hóa về dạng 0xxxxxxxxx)
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, lowercase: true, trim: true, sparse: true, unique: true },
    password: { type: String, required: true, select: false },
    fullName: { type: String, required: true, trim: true },
  },
  { timestamps: true },
)

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: Schema.Types.ObjectId }
export const User = model('User', userSchema)
